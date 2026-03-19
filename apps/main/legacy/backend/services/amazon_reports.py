"""
Amazon SP-API Report Service
Handles report creation, polling, downloading, and parsing
"""
import httpx
import gzip
import csv
import json
import io
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any, Optional
import os

from models.database import (
    ReportType, ReportStatus, ConnectionStatus,
    SalesTrafficMetrics, SettlementMetrics, SponsoredProductsMetrics,
    generate_id
)

logger = logging.getLogger(__name__)

# Amazon API Endpoints
AMAZON_TOKEN_URL = "https://api.amazon.com/auth/o2/token"
AMAZON_SP_API_BASE = "https://sellingpartnerapi-na.amazon.com"


class AmazonReportService:
    def __init__(self, db):
        self.db = db
    
    async def get_access_token(self, seller_id: str) -> Optional[str]:
        """Get valid access token, refreshing if necessary"""
        seller = await self.db.amazon_sellers.find_one(
            {"seller_id": seller_id},
            {"_id": 0}
        )
        
        if not seller:
            return None
        
        # Check if current token is still valid
        access_token = seller.get("access_token")
        expires_at = seller.get("access_token_expires_at")
        
        if access_token and expires_at:
            if isinstance(expires_at, str):
                expires_at = datetime.fromisoformat(expires_at)
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            
            # Token still valid (with 5 min buffer)
            if expires_at > datetime.now(timezone.utc) + timedelta(minutes=5):
                return access_token
        
        # Need to refresh token
        refresh_token = seller.get("refresh_token")
        if not refresh_token:
            return None
        
        lwa_client_id = os.environ.get("LWA_CLIENT_ID")
        lwa_client_secret = os.environ.get("LWA_CLIENT_SECRET")
        
        if not lwa_client_id or not lwa_client_secret:
            logger.error("LWA credentials not configured")
            return None
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    AMAZON_TOKEN_URL,
                    data={
                        "grant_type": "refresh_token",
                        "refresh_token": refresh_token,
                        "client_id": lwa_client_id,
                        "client_secret": lwa_client_secret
                    },
                    headers={"Content-Type": "application/x-www-form-urlencoded"},
                    timeout=30.0
                )
                
                if response.status_code != 200:
                    logger.error(f"Token refresh failed: {response.text}")
                    await self.db.amazon_sellers.update_one(
                        {"seller_id": seller_id},
                        {"$set": {
                            "connection_status": ConnectionStatus.NEEDS_REAUTH.value,
                            "error_message": "Token refresh failed"
                        }}
                    )
                    return None
                
                tokens = response.json()
                new_access_token = tokens.get("access_token")
                expires_in = tokens.get("expires_in", 3600)
                
                await self.db.amazon_sellers.update_one(
                    {"seller_id": seller_id},
                    {"$set": {
                        "access_token": new_access_token,
                        "access_token_expires_at": (datetime.now(timezone.utc) + timedelta(seconds=expires_in)).isoformat(),
                        "connection_status": ConnectionStatus.CONNECTED.value
                    }}
                )
                
                return new_access_token
                
            except Exception as e:
                logger.error(f"Token refresh error: {e}")
                return None
    
    async def create_report(
        self,
        seller_id: str,
        report_type: ReportType,
        start_date: datetime,
        end_date: datetime,
        marketplace_id: str = "ATVPDKIKX0DER"
    ) -> Optional[str]:
        """Create a report request with Amazon SP-API"""
        access_token = await self.get_access_token(seller_id)
        if not access_token:
            return None
        
        async with httpx.AsyncClient() as client:
            try:
                payload = {
                    "reportType": report_type.value,
                    "marketplaceIds": [marketplace_id],
                    "dataStartTime": start_date.isoformat(),
                    "dataEndTime": end_date.isoformat()
                }
                
                response = await client.post(
                    f"{AMAZON_SP_API_BASE}/reports/2021-06-30/reports",
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "Content-Type": "application/json",
                        "x-amz-access-token": access_token
                    },
                    timeout=30.0
                )
                
                if response.status_code in [200, 202]:
                    data = response.json()
                    return data.get("reportId")
                else:
                    logger.error(f"Create report failed: {response.status_code} - {response.text}")
                    return None
                    
            except Exception as e:
                logger.error(f"Create report error: {e}")
                return None
    
    async def get_report_status(self, seller_id: str, report_id: str) -> Dict[str, Any]:
        """Check the status of a report"""
        access_token = await self.get_access_token(seller_id)
        if not access_token:
            return {"status": "error", "message": "No access token"}
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{AMAZON_SP_API_BASE}/reports/2021-06-30/reports/{report_id}",
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "x-amz-access-token": access_token
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    return {"status": "error", "message": response.text}
                    
            except Exception as e:
                return {"status": "error", "message": str(e)}
    
    async def download_report(self, seller_id: str, document_id: str) -> Optional[bytes]:
        """Download the report document"""
        access_token = await self.get_access_token(seller_id)
        if not access_token:
            return None
        
        async with httpx.AsyncClient() as client:
            try:
                # First get the document details
                response = await client.get(
                    f"{AMAZON_SP_API_BASE}/reports/2021-06-30/documents/{document_id}",
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "x-amz-access-token": access_token
                    },
                    timeout=30.0
                )
                
                if response.status_code != 200:
                    logger.error(f"Get document failed: {response.text}")
                    return None
                
                doc_data = response.json()
                download_url = doc_data.get("url")
                
                if not download_url:
                    return None
                
                # Download the actual report
                download_response = await client.get(download_url, timeout=60.0)
                
                if download_response.status_code == 200:
                    content = download_response.content
                    
                    # Check if gzipped
                    compression = doc_data.get("compressionAlgorithm")
                    if compression == "GZIP":
                        content = gzip.decompress(content)
                    
                    return content
                else:
                    return None
                    
            except Exception as e:
                logger.error(f"Download report error: {e}")
                return None
    
    def parse_sales_traffic_report(
        self,
        content: bytes,
        seller_id: str,
        request_id: str
    ) -> List[Dict[str, Any]]:
        """Parse GET_SALES_AND_TRAFFIC_REPORT"""
        metrics = []
        
        try:
            # Try JSON first
            data = json.loads(content.decode('utf-8'))
            
            for record in data.get("salesAndTrafficByDate", []):
                date_str = record.get("date", "")
                traffic = record.get("trafficByDate", {})
                sales = record.get("salesByDate", {})
                
                metric = {
                    "metric_id": generate_id("metric"),
                    "seller_id": seller_id,
                    "report_request_id": request_id,
                    "date": date_str,
                    "asin": None,
                    "sku": None,
                    
                    # Traffic
                    "sessions": traffic.get("sessions", 0),
                    "session_percentage": traffic.get("sessionPercentage", 0),
                    "page_views": traffic.get("pageViews", 0),
                    "page_views_percentage": traffic.get("pageViewsPercentage", 0),
                    "buy_box_percentage": traffic.get("buyBoxPercentage", 0),
                    
                    # Sales
                    "units_ordered": sales.get("unitsOrdered", 0),
                    "units_ordered_b2b": sales.get("unitsOrderedB2B", 0),
                    "unit_session_percentage": sales.get("unitSessionPercentage", 0),
                    "ordered_product_sales": self._parse_currency(sales.get("orderedProductSales", {})),
                    "ordered_product_sales_b2b": self._parse_currency(sales.get("orderedProductSalesB2B", {})),
                    "total_order_items": sales.get("totalOrderItems", 0),
                    "total_order_items_b2b": sales.get("totalOrderItemsB2B", 0),
                    
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                metrics.append(metric)
            
            # Also parse by ASIN if available
            for record in data.get("salesAndTrafficByAsin", []):
                asin_data = record.get("parentAsin") or record.get("childAsin") or ""
                traffic = record.get("trafficByAsin", {})
                sales = record.get("salesByAsin", {})
                
                metric = {
                    "metric_id": generate_id("metric"),
                    "seller_id": seller_id,
                    "report_request_id": request_id,
                    "date": datetime.now(timezone.utc).isoformat()[:10],
                    "asin": asin_data,
                    "sku": record.get("sku"),
                    "parent_asin": record.get("parentAsin"),
                    "child_asin": record.get("childAsin"),
                    
                    "sessions": traffic.get("sessions", 0),
                    "session_percentage": traffic.get("sessionPercentage", 0),
                    "page_views": traffic.get("pageViews", 0),
                    "page_views_percentage": traffic.get("pageViewsPercentage", 0),
                    "buy_box_percentage": traffic.get("buyBoxPercentage", 0),
                    
                    "units_ordered": sales.get("unitsOrdered", 0),
                    "unit_session_percentage": sales.get("unitSessionPercentage", 0),
                    "ordered_product_sales": self._parse_currency(sales.get("orderedProductSales", {})),
                    "total_order_items": sales.get("totalOrderItems", 0),
                    
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                metrics.append(metric)
                
        except json.JSONDecodeError:
            # Try TSV format
            try:
                text = content.decode('utf-8')
                reader = csv.DictReader(io.StringIO(text), delimiter='\t')
                
                for row in reader:
                    metric = {
                        "metric_id": generate_id("metric"),
                        "seller_id": seller_id,
                        "report_request_id": request_id,
                        "date": row.get("date", ""),
                        "asin": row.get("(Parent) ASIN") or row.get("(Child) ASIN"),
                        "sku": row.get("SKU"),
                        
                        "sessions": int(row.get("Sessions", 0) or 0),
                        "session_percentage": float(row.get("Session Percentage", 0) or 0),
                        "page_views": int(row.get("Page Views", 0) or 0),
                        "buy_box_percentage": float(row.get("Buy Box Percentage", "0").replace("%", "") or 0),
                        
                        "units_ordered": int(row.get("Units Ordered", 0) or 0),
                        "unit_session_percentage": float(row.get("Unit Session Percentage", "0").replace("%", "") or 0),
                        "ordered_product_sales": float(row.get("Ordered Product Sales", "0").replace("$", "").replace(",", "") or 0),
                        "total_order_items": int(row.get("Total Order Items", 0) or 0),
                        
                        "created_at": datetime.now(timezone.utc).isoformat()
                    }
                    metrics.append(metric)
            except Exception as e:
                logger.error(f"Failed to parse TSV: {e}")
        
        return metrics
    
    def parse_settlement_report(
        self,
        content: bytes,
        seller_id: str,
        request_id: str
    ) -> List[Dict[str, Any]]:
        """Parse GET_V2_SETTLEMENT_REPORT"""
        metrics = []
        
        try:
            text = content.decode('utf-8')
            reader = csv.DictReader(io.StringIO(text), delimiter='\t')
            
            # Group by settlement ID
            settlements = {}
            
            for row in reader:
                settlement_id = row.get("settlement-id", "")
                
                if settlement_id not in settlements:
                    settlements[settlement_id] = {
                        "metric_id": generate_id("settle"),
                        "seller_id": seller_id,
                        "report_request_id": request_id,
                        "settlement_id": settlement_id,
                        "settlement_start_date": row.get("settlement-start-date", ""),
                        "settlement_end_date": row.get("settlement-end-date", ""),
                        "total_amount": 0,
                        "product_sales": 0,
                        "shipping_credits": 0,
                        "promotional_rebates": 0,
                        "selling_fees": 0,
                        "fba_fees": 0,
                        "other_transaction_fees": 0,
                        "refund_amount": 0,
                        "other_amount": 0,
                        "created_at": datetime.now(timezone.utc).isoformat()
                    }
                
                amount = float(row.get("amount", 0) or 0)
                amount_type = row.get("amount-type", "").lower()
                amount_desc = row.get("amount-description", "").lower()
                
                s = settlements[settlement_id]
                s["total_amount"] += amount
                
                if "product price" in amount_desc or "itemfees" in amount_type:
                    s["product_sales"] += amount
                elif "shipping" in amount_desc:
                    s["shipping_credits"] += amount
                elif "promotion" in amount_desc:
                    s["promotional_rebates"] += amount
                elif "commission" in amount_desc or "referral" in amount_desc:
                    s["selling_fees"] += abs(amount)
                elif "fba" in amount_desc or "fulfillment" in amount_desc:
                    s["fba_fees"] += abs(amount)
                elif "refund" in amount_desc or "return" in amount_desc:
                    s["refund_amount"] += abs(amount)
                else:
                    s["other_amount"] += amount
            
            metrics = list(settlements.values())
            
            # Calculate refund rate
            for m in metrics:
                if m["product_sales"] > 0:
                    m["refund_rate"] = (m["refund_amount"] / m["product_sales"]) * 100
                else:
                    m["refund_rate"] = 0
                    
        except Exception as e:
            logger.error(f"Failed to parse settlement report: {e}")
        
        return metrics
    
    def parse_sponsored_products_report(
        self,
        content: bytes,
        seller_id: str,
        request_id: str
    ) -> List[Dict[str, Any]]:
        """Parse GET_SPONSORED_PRODUCTS_REPORT"""
        metrics = []
        
        try:
            text = content.decode('utf-8')
            reader = csv.DictReader(io.StringIO(text), delimiter='\t')
            
            for row in reader:
                impressions = int(row.get("impressions", 0) or 0)
                clicks = int(row.get("clicks", 0) or 0)
                spend = float(row.get("spend", 0) or 0)
                sales = float(row.get("attributedSales14d", 0) or row.get("sales", 0) or 0)
                
                ctr = (clicks / impressions * 100) if impressions > 0 else 0
                acos = (spend / sales * 100) if sales > 0 else 0
                roas = (sales / spend) if spend > 0 else 0
                cpc = (spend / clicks) if clicks > 0 else 0
                
                metric = {
                    "metric_id": generate_id("sp"),
                    "seller_id": seller_id,
                    "report_request_id": request_id,
                    "date": row.get("date", datetime.now(timezone.utc).isoformat()[:10]),
                    "campaign_id": row.get("campaignId"),
                    "campaign_name": row.get("campaignName"),
                    "ad_group_id": row.get("adGroupId"),
                    "ad_group_name": row.get("adGroupName"),
                    "targeting": row.get("targeting"),
                    "match_type": row.get("matchType"),
                    
                    "impressions": impressions,
                    "clicks": clicks,
                    "ctr": round(ctr, 2),
                    "spend": round(spend, 2),
                    "sales": round(sales, 2),
                    "orders": int(row.get("attributedUnitsOrdered14d", 0) or row.get("orders", 0) or 0),
                    "units": int(row.get("attributedUnitsOrdered14d", 0) or 0),
                    "acos": round(acos, 2),
                    "roas": round(roas, 2),
                    "cpc": round(cpc, 2),
                    
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                metrics.append(metric)
                
        except Exception as e:
            logger.error(f"Failed to parse sponsored products report: {e}")
        
        return metrics
    
    def _parse_currency(self, value: Any) -> float:
        """Parse currency value from Amazon API response"""
        if isinstance(value, dict):
            return float(value.get("amount", 0) or 0)
        if isinstance(value, str):
            return float(value.replace("$", "").replace(",", "") or 0)
        if isinstance(value, (int, float)):
            return float(value)
        return 0.0
    
    async def process_pending_reports(self):
        """Process all pending report requests - called by background worker"""
        pending = await self.db.report_requests.find(
            {"status": {"$in": [ReportStatus.PENDING.value, ReportStatus.IN_QUEUE.value, ReportStatus.IN_PROGRESS.value]}}
        ).to_list(100)
        
        for request in pending:
            request_id = request["request_id"]
            seller_id = request["seller_id"]
            report_type = request["report_type"]
            
            try:
                # If pending, create the report
                if request["status"] == ReportStatus.PENDING.value:
                    start_date = datetime.fromisoformat(request["data_start_time"])
                    end_date = datetime.fromisoformat(request["data_end_time"])
                    
                    amazon_report_id = await self.create_report(
                        seller_id=seller_id,
                        report_type=ReportType(report_type),
                        start_date=start_date,
                        end_date=end_date
                    )
                    
                    if amazon_report_id:
                        await self.db.report_requests.update_one(
                            {"request_id": request_id},
                            {"$set": {
                                "amazon_report_id": amazon_report_id,
                                "status": ReportStatus.IN_QUEUE.value
                            }}
                        )
                    else:
                        await self.db.report_requests.update_one(
                            {"request_id": request_id},
                            {"$set": {
                                "status": ReportStatus.FAILED.value,
                                "error_message": "Failed to create report"
                            }}
                        )
                    continue
                
                # Check report status
                amazon_report_id = request.get("amazon_report_id")
                if not amazon_report_id:
                    continue
                
                status_response = await self.get_report_status(seller_id, amazon_report_id)
                processing_status = status_response.get("processingStatus", "").upper()
                
                if processing_status == "DONE":
                    document_id = status_response.get("reportDocumentId")
                    
                    if document_id:
                        # Download and parse report
                        content = await self.download_report(seller_id, document_id)
                        
                        if content:
                            # Parse based on report type
                            if report_type == ReportType.SALES_TRAFFIC.value:
                                metrics = self.parse_sales_traffic_report(content, seller_id, request_id)
                                if metrics:
                                    await self.db.sales_traffic_metrics.insert_many(metrics)
                            
                            elif report_type == ReportType.SETTLEMENT.value:
                                metrics = self.parse_settlement_report(content, seller_id, request_id)
                                if metrics:
                                    await self.db.settlement_metrics.insert_many(metrics)
                            
                            elif report_type == ReportType.SPONSORED_PRODUCTS.value:
                                metrics = self.parse_sponsored_products_report(content, seller_id, request_id)
                                if metrics:
                                    await self.db.sponsored_products_metrics.insert_many(metrics)
                            
                            # Mark as done
                            await self.db.report_requests.update_one(
                                {"request_id": request_id},
                                {"$set": {
                                    "amazon_document_id": document_id,
                                    "status": ReportStatus.DONE.value,
                                    "completed_at": datetime.now(timezone.utc).isoformat()
                                }}
                            )
                            
                            # Update seller last sync time
                            await self.db.amazon_sellers.update_one(
                                {"seller_id": seller_id},
                                {"$set": {"last_sync_at": datetime.now(timezone.utc).isoformat()}}
                            )
                        else:
                            await self.db.report_requests.update_one(
                                {"request_id": request_id},
                                {"$set": {
                                    "status": ReportStatus.FAILED.value,
                                    "error_message": "Failed to download report"
                                }}
                            )
                
                elif processing_status == "FATAL":
                    await self.db.report_requests.update_one(
                        {"request_id": request_id},
                        {"$set": {
                            "status": ReportStatus.FAILED.value,
                            "error_message": status_response.get("message", "Report generation failed")
                        }}
                    )
                
                elif processing_status in ["IN_QUEUE", "IN_PROGRESS"]:
                    await self.db.report_requests.update_one(
                        {"request_id": request_id},
                        {"$set": {"status": ReportStatus.IN_PROGRESS.value}}
                    )
                    
            except Exception as e:
                logger.error(f"Error processing report {request_id}: {e}")
                await self.db.report_requests.update_one(
                    {"request_id": request_id},
                    {"$set": {
                        "status": ReportStatus.FAILED.value,
                        "error_message": str(e)
                    }}
                )
