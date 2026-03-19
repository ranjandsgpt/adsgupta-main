"""
Dashboard Routes - KPIs and Metrics
"""
from fastapi import APIRouter, HTTPException, Request, Query
from datetime import datetime, timezone, timedelta
from typing import Optional
import logging

from models.database import DashboardKPIs, ConnectionStatus
from routes.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])
logger = logging.getLogger(__name__)

# Database reference
db = None

def set_db(database):
    global db
    db = database


@router.get("/kpis")
async def get_dashboard_kpis(
    request: Request,
    period: str = Query("7d", description="Period: 7d, 30d, 90d, ytd")
):
    """Get aggregated KPIs for the dashboard"""
    user = await get_current_user(request)
    
    # Check if user has connected Amazon
    seller = await db.amazon_sellers.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not seller:
        # Return empty KPIs with guidance
        return {
            "connected": False,
            "message": "Connect your Amazon account to see real data",
            "kpis": DashboardKPIs().model_dump()
        }
    
    # Calculate date range
    now = datetime.now(timezone.utc)
    if period == "7d":
        start_date = now - timedelta(days=7)
    elif period == "30d":
        start_date = now - timedelta(days=30)
    elif period == "90d":
        start_date = now - timedelta(days=90)
    elif period == "ytd":
        start_date = datetime(now.year, 1, 1, tzinfo=timezone.utc)
    else:
        start_date = now - timedelta(days=7)
    
    seller_id = seller["seller_id"]
    
    # Aggregate Sales & Traffic Metrics
    sales_traffic_pipeline = [
        {
            "$match": {
                "seller_id": seller_id,
                "date": {"$gte": start_date.isoformat(), "$lte": now.isoformat()}
            }
        },
        {
            "$group": {
                "_id": None,
                "total_sessions": {"$sum": "$sessions"},
                "total_page_views": {"$sum": "$page_views"},
                "total_units": {"$sum": "$units_ordered"},
                "total_sales": {"$sum": "$ordered_product_sales"},
                "total_orders": {"$sum": "$total_order_items"},
                "avg_conversion": {"$avg": "$unit_session_percentage"},
                "avg_buy_box": {"$avg": "$buy_box_percentage"}
            }
        }
    ]
    
    sales_traffic_result = await db.sales_traffic_metrics.aggregate(sales_traffic_pipeline).to_list(1)
    
    # Aggregate PPC Metrics
    ppc_pipeline = [
        {
            "$match": {
                "seller_id": seller_id,
                "date": {"$gte": start_date.isoformat(), "$lte": now.isoformat()}
            }
        },
        {
            "$group": {
                "_id": None,
                "total_spend": {"$sum": "$spend"},
                "total_ppc_sales": {"$sum": "$sales"},
                "total_clicks": {"$sum": "$clicks"},
                "total_impressions": {"$sum": "$impressions"},
                "avg_acos": {"$avg": "$acos"},
                "avg_roas": {"$avg": "$roas"}
            }
        }
    ]
    
    ppc_result = await db.sponsored_products_metrics.aggregate(ppc_pipeline).to_list(1)
    
    # Aggregate Settlement Metrics
    settlement_pipeline = [
        {
            "$match": {
                "seller_id": seller_id,
                "settlement_end_date": {"$gte": start_date.isoformat(), "$lte": now.isoformat()}
            }
        },
        {
            "$group": {
                "_id": None,
                "total_revenue": {"$sum": "$total_amount"},
                "total_fees": {"$sum": {"$add": ["$selling_fees", "$fba_fees", "$other_transaction_fees"]}},
                "total_refunds": {"$sum": "$refund_amount"},
                "avg_refund_rate": {"$avg": "$refund_rate"}
            }
        }
    ]
    
    settlement_result = await db.settlement_metrics.aggregate(settlement_pipeline).to_list(1)
    
    # Build KPIs response
    st = sales_traffic_result[0] if sales_traffic_result else {}
    ppc = ppc_result[0] if ppc_result else {}
    settle = settlement_result[0] if settlement_result else {}
    
    total_sales = st.get("total_sales", 0) or 0
    total_ppc_spend = ppc.get("total_spend", 0) or 0
    
    # Calculate TACOS (Total ACOS)
    tacos = (total_ppc_spend / total_sales * 100) if total_sales > 0 else 0
    
    kpis = DashboardKPIs(
        # Traffic
        total_sessions=st.get("total_sessions", 0) or 0,
        total_page_views=st.get("total_page_views", 0) or 0,
        avg_conversion_rate=round(st.get("avg_conversion", 0) or 0, 2),
        avg_buy_box_percentage=round(st.get("avg_buy_box", 0) or 0, 2),
        
        # Sales
        total_sales=round(total_sales, 2),
        total_units=st.get("total_units", 0) or 0,
        total_orders=st.get("total_orders", 0) or 0,
        
        # PPC
        total_ppc_spend=round(total_ppc_spend, 2),
        total_ppc_sales=round(ppc.get("total_ppc_sales", 0) or 0, 2),
        avg_acos=round(ppc.get("avg_acos", 0) or 0, 2),
        avg_tacos=round(tacos, 2),
        avg_roas=round(ppc.get("avg_roas", 0) or 0, 2),
        
        # Financials
        total_revenue=round(settle.get("total_revenue", 0) or 0, 2),
        total_fees=round(settle.get("total_fees", 0) or 0, 2),
        total_refunds=round(settle.get("total_refunds", 0) or 0, 2),
        refund_rate=round(settle.get("avg_refund_rate", 0) or 0, 2),
        net_profit=round((settle.get("total_revenue", 0) or 0) - (settle.get("total_fees", 0) or 0) - (settle.get("total_refunds", 0) or 0), 2),
        
        # Period
        period_start=start_date,
        period_end=now
    )
    
    return {
        "connected": seller.get("connection_status") == ConnectionStatus.CONNECTED.value,
        "period": period,
        "kpis": kpis.model_dump()
    }


@router.get("/sales-by-date")
async def get_sales_by_date(
    request: Request,
    period: str = Query("30d", description="Period: 7d, 30d, 90d")
):
    """Get daily sales data for charts"""
    user = await get_current_user(request)
    
    seller = await db.amazon_sellers.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not seller:
        return {"data": []}
    
    now = datetime.now(timezone.utc)
    if period == "7d":
        start_date = now - timedelta(days=7)
    elif period == "30d":
        start_date = now - timedelta(days=30)
    else:
        start_date = now - timedelta(days=90)
    
    pipeline = [
        {
            "$match": {
                "seller_id": seller["seller_id"],
                "date": {"$gte": start_date.isoformat(), "$lte": now.isoformat()}
            }
        },
        {
            "$group": {
                "_id": {"$substr": ["$date", 0, 10]},  # Group by date (YYYY-MM-DD)
                "sales": {"$sum": "$ordered_product_sales"},
                "units": {"$sum": "$units_ordered"},
                "sessions": {"$sum": "$sessions"},
                "orders": {"$sum": "$total_order_items"}
            }
        },
        {"$sort": {"_id": 1}}
    ]
    
    results = await db.sales_traffic_metrics.aggregate(pipeline).to_list(100)
    
    data = [
        {
            "date": r["_id"],
            "sales": round(r["sales"], 2),
            "units": r["units"],
            "sessions": r["sessions"],
            "orders": r["orders"]
        }
        for r in results
    ]
    
    return {"data": data, "period": period}


@router.get("/ppc-by-date")
async def get_ppc_by_date(
    request: Request,
    period: str = Query("30d", description="Period: 7d, 30d, 90d")
):
    """Get daily PPC data for charts"""
    user = await get_current_user(request)
    
    seller = await db.amazon_sellers.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not seller:
        return {"data": []}
    
    now = datetime.now(timezone.utc)
    if period == "7d":
        start_date = now - timedelta(days=7)
    elif period == "30d":
        start_date = now - timedelta(days=30)
    else:
        start_date = now - timedelta(days=90)
    
    pipeline = [
        {
            "$match": {
                "seller_id": seller["seller_id"],
                "date": {"$gte": start_date.isoformat(), "$lte": now.isoformat()}
            }
        },
        {
            "$group": {
                "_id": {"$substr": ["$date", 0, 10]},
                "spend": {"$sum": "$spend"},
                "sales": {"$sum": "$sales"},
                "clicks": {"$sum": "$clicks"},
                "impressions": {"$sum": "$impressions"}
            }
        },
        {"$sort": {"_id": 1}}
    ]
    
    results = await db.sponsored_products_metrics.aggregate(pipeline).to_list(100)
    
    data = []
    for r in results:
        acos = (r["spend"] / r["sales"] * 100) if r["sales"] > 0 else 0
        roas = (r["sales"] / r["spend"]) if r["spend"] > 0 else 0
        data.append({
            "date": r["_id"],
            "spend": round(r["spend"], 2),
            "sales": round(r["sales"], 2),
            "acos": round(acos, 2),
            "roas": round(roas, 2),
            "clicks": r["clicks"],
            "impressions": r["impressions"]
        })
    
    return {"data": data, "period": period}


@router.get("/top-products")
async def get_top_products(
    request: Request,
    metric: str = Query("sales", description="Sort by: sales, units, sessions"),
    limit: int = Query(10, ge=1, le=50)
):
    """Get top performing products"""
    user = await get_current_user(request)
    
    seller = await db.amazon_sellers.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not seller:
        return {"products": []}
    
    sort_field = {
        "sales": "$ordered_product_sales",
        "units": "$units_ordered",
        "sessions": "$sessions"
    }.get(metric, "$ordered_product_sales")
    
    pipeline = [
        {"$match": {"seller_id": seller["seller_id"], "asin": {"$ne": None}}},
        {
            "$group": {
                "_id": "$asin",
                "sku": {"$first": "$sku"},
                "sales": {"$sum": "$ordered_product_sales"},
                "units": {"$sum": "$units_ordered"},
                "sessions": {"$sum": "$sessions"},
                "conversion": {"$avg": "$unit_session_percentage"},
                "buy_box": {"$avg": "$buy_box_percentage"}
            }
        },
        {"$sort": {metric: -1}},
        {"$limit": limit}
    ]
    
    results = await db.sales_traffic_metrics.aggregate(pipeline).to_list(limit)
    
    products = [
        {
            "asin": r["_id"],
            "sku": r.get("sku"),
            "sales": round(r["sales"], 2),
            "units": r["units"],
            "sessions": r["sessions"],
            "conversion": round(r.get("conversion", 0), 2),
            "buy_box": round(r.get("buy_box", 0), 2)
        }
        for r in results
    ]
    
    return {"products": products, "metric": metric}
