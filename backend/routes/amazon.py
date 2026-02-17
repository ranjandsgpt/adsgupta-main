"""
Amazon SP-API Routes - OAuth and API Integration
"""
from fastapi import APIRouter, HTTPException, Request, Query
from datetime import datetime, timezone, timedelta
from typing import Optional
import httpx
import os
import logging
import json
from urllib.parse import urlencode

from models.database import (
    AmazonSeller, ConnectionStatus, ReportRequest, ReportType, ReportStatus,
    generate_id
)
from routes.auth import get_current_user

router = APIRouter(prefix="/amazon", tags=["Amazon SP-API"])
logger = logging.getLogger(__name__)

# Database reference
db = None

def set_db(database):
    global db
    db = database


# Amazon LWA Endpoints
AMAZON_AUTH_URL = "https://sellercentral.amazon.com/apps/authorize/consent"
AMAZON_TOKEN_URL = "https://api.amazon.com/auth/o2/token"
AMAZON_SP_API_BASE = "https://sellingpartnerapi-na.amazon.com"

# Marketplace IDs
MARKETPLACE_IDS = {
    "US": "ATVPDKIKX0DER",
    "CA": "A2EUQ1WTGCTBG2",
    "MX": "A1AM78C64UM0Y8",
    "UK": "A1F83G8C2ARO7P",
    "DE": "A1PA6795UKMFR9",
    "FR": "A13V1IB3VIYBER",
    "IT": "APJ6JRA9NG5V4",
    "ES": "A1RKKUPIHCS9HS",
    "IN": "A21TJRUUN4KGV",
}


def get_lwa_credentials():
    """Get LWA credentials from environment or database"""
    client_id = os.environ.get("LWA_CLIENT_ID")
    client_secret = os.environ.get("LWA_CLIENT_SECRET")
    return client_id, client_secret


def get_redirect_uri():
    """Get the OAuth redirect URI"""
    backend_url = os.environ.get("BACKEND_URL", "https://showcase-center.preview.emergentagent.com")
    return f"{backend_url}/api/amazon/callback"


@router.get("/connect")
async def start_amazon_oauth(request: Request):
    """
    Initiate Amazon SP-API OAuth flow (Website Authorization Workflow)
    Returns the Amazon authorization URL to redirect the user to
    """
    user = await get_current_user(request)
    
    lwa_client_id, _ = get_lwa_credentials()
    
    if not lwa_client_id:
        raise HTTPException(
            status_code=400,
            detail="Amazon LWA credentials not configured. Please add LWA_CLIENT_ID to environment."
        )
    
    # Generate state parameter for CSRF protection
    state = f"{user['user_id']}:{generate_id('state')}"
    
    # Store state in database for verification
    await db.oauth_states.insert_one({
        "state": state,
        "user_id": user["user_id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()
    })
    
    # Build Amazon authorization URL
    params = {
        "application_id": lwa_client_id,
        "state": state,
        "version": "beta",
        "redirect_uri": get_redirect_uri()
    }
    
    auth_url = f"{AMAZON_AUTH_URL}?{urlencode(params)}"
    
    return {
        "authorization_url": auth_url,
        "redirect_uri": get_redirect_uri(),
        "message": "Redirect user to authorization_url to connect Amazon account"
    }


@router.get("/callback")
async def amazon_oauth_callback(
    spapi_oauth_code: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    selling_partner_id: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
    error_description: Optional[str] = Query(None)
):
    """
    Handle Amazon OAuth callback
    Exchange authorization code for refresh token
    """
    frontend_url = os.environ.get("FRONTEND_URL", "https://showcase-center.preview.emergentagent.com")
    
    if error:
        logger.error(f"Amazon OAuth error: {error} - {error_description}")
        return {"redirect": f"{frontend_url}/dashboard?error={error}&message={error_description}"}
    
    if not spapi_oauth_code or not state:
        raise HTTPException(status_code=400, detail="Missing required parameters")
    
    # Verify state
    oauth_state = await db.oauth_states.find_one({"state": state}, {"_id": 0})
    if not oauth_state:
        raise HTTPException(status_code=400, detail="Invalid state parameter")
    
    # Check expiry
    expires_at = oauth_state.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="State expired, please try again")
    
    user_id = oauth_state["user_id"]
    
    # Delete used state
    await db.oauth_states.delete_one({"state": state})
    
    # Exchange code for tokens
    lwa_client_id, lwa_client_secret = get_lwa_credentials()
    
    if not lwa_client_id or not lwa_client_secret:
        raise HTTPException(status_code=500, detail="LWA credentials not configured")
    
    async with httpx.AsyncClient() as client:
        try:
            token_response = await client.post(
                AMAZON_TOKEN_URL,
                data={
                    "grant_type": "authorization_code",
                    "code": spapi_oauth_code,
                    "client_id": lwa_client_id,
                    "client_secret": lwa_client_secret,
                    "redirect_uri": get_redirect_uri()
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=30.0
            )
            
            if token_response.status_code != 200:
                logger.error(f"Token exchange failed: {token_response.text}")
                raise HTTPException(status_code=400, detail="Failed to exchange authorization code")
            
            tokens = token_response.json()
        except httpx.RequestError as e:
            logger.error(f"Token exchange request error: {e}")
            raise HTTPException(status_code=500, detail="Failed to connect to Amazon")
    
    refresh_token = tokens.get("refresh_token")
    access_token = tokens.get("access_token")
    expires_in = tokens.get("expires_in", 3600)
    
    if not refresh_token:
        raise HTTPException(status_code=400, detail="No refresh token received")
    
    # Check if seller already exists for this user
    existing_seller = await db.amazon_sellers.find_one(
        {"user_id": user_id},
        {"_id": 0}
    )
    
    now = datetime.now(timezone.utc)
    
    if existing_seller:
        # Update existing seller
        await db.amazon_sellers.update_one(
            {"user_id": user_id},
            {"$set": {
                "refresh_token": refresh_token,
                "access_token": access_token,
                "access_token_expires_at": (now + timedelta(seconds=expires_in)).isoformat(),
                "selling_partner_id": selling_partner_id,
                "connection_status": ConnectionStatus.CONNECTED.value,
                "error_message": None,
                "updated_at": now.isoformat()
            }}
        )
        seller_id = existing_seller["seller_id"]
    else:
        # Create new seller record
        seller_id = generate_id("seller")
        seller_doc = {
            "seller_id": seller_id,
            "user_id": user_id,
            "selling_partner_id": selling_partner_id,
            "marketplace_id": MARKETPLACE_IDS["US"],
            "refresh_token": refresh_token,
            "access_token": access_token,
            "access_token_expires_at": (now + timedelta(seconds=expires_in)).isoformat(),
            "connection_status": ConnectionStatus.CONNECTED.value,
            "last_sync_at": None,
            "error_message": None,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        }
        await db.amazon_sellers.insert_one(seller_doc)
    
    logger.info(f"Amazon account connected for user {user_id}, seller {seller_id}")
    
    # Redirect back to frontend
    return {"redirect": f"{frontend_url}/dashboard?amazon_connected=true"}


@router.get("/status")
async def get_amazon_status(request: Request):
    """Get Amazon connection status for current user"""
    user = await get_current_user(request)
    
    seller = await db.amazon_sellers.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0, "refresh_token": 0, "access_token": 0}  # Don't expose tokens
    )
    
    if not seller:
        return {
            "connected": False,
            "status": ConnectionStatus.PENDING.value,
            "message": "No Amazon account connected",
            "redirect_uri": get_redirect_uri()
        }
    
    return {
        "connected": seller.get("connection_status") == ConnectionStatus.CONNECTED.value,
        "status": seller.get("connection_status"),
        "selling_partner_id": seller.get("selling_partner_id"),
        "marketplace_id": seller.get("marketplace_id"),
        "last_sync_at": seller.get("last_sync_at"),
        "error_message": seller.get("error_message"),
        "redirect_uri": get_redirect_uri()
    }


@router.post("/disconnect")
async def disconnect_amazon(request: Request):
    """Disconnect Amazon account"""
    user = await get_current_user(request)
    
    result = await db.amazon_sellers.delete_one({"user_id": user["user_id"]})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="No Amazon account connected")
    
    return {"message": "Amazon account disconnected"}


@router.post("/refresh-token")
async def refresh_access_token(request: Request):
    """Refresh the Amazon access token using refresh token"""
    user = await get_current_user(request)
    
    seller = await db.amazon_sellers.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not seller:
        raise HTTPException(status_code=404, detail="No Amazon account connected")
    
    refresh_token = seller.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=400, detail="No refresh token available")
    
    lwa_client_id, lwa_client_secret = get_lwa_credentials()
    
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
                # Mark as needs re-authorization
                await db.amazon_sellers.update_one(
                    {"user_id": user["user_id"]},
                    {"$set": {
                        "connection_status": ConnectionStatus.NEEDS_REAUTH.value,
                        "error_message": "Token refresh failed, please re-authorize",
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
                raise HTTPException(status_code=401, detail="Token refresh failed, please re-authorize")
            
            tokens = response.json()
        except httpx.RequestError as e:
            logger.error(f"Token refresh request error: {e}")
            raise HTTPException(status_code=500, detail="Failed to refresh token")
    
    access_token = tokens.get("access_token")
    expires_in = tokens.get("expires_in", 3600)
    now = datetime.now(timezone.utc)
    
    await db.amazon_sellers.update_one(
        {"user_id": user["user_id"]},
        {"$set": {
            "access_token": access_token,
            "access_token_expires_at": (now + timedelta(seconds=expires_in)).isoformat(),
            "connection_status": ConnectionStatus.CONNECTED.value,
            "error_message": None,
            "updated_at": now.isoformat()
        }}
    )
    
    return {"message": "Access token refreshed", "expires_in": expires_in}


@router.post("/fetch-reports")
async def trigger_report_fetch(request: Request):
    """
    Manually trigger fetching of all report types
    Creates report requests for the background worker to process
    """
    user = await get_current_user(request)
    
    seller = await db.amazon_sellers.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not seller:
        raise HTTPException(status_code=404, detail="No Amazon account connected")
    
    if seller.get("connection_status") != ConnectionStatus.CONNECTED.value:
        raise HTTPException(status_code=400, detail="Amazon account not properly connected")
    
    # Create report requests for all report types
    now = datetime.now(timezone.utc)
    end_date = now
    start_date = now - timedelta(days=30)  # Last 30 days
    
    report_types = [
        ReportType.SALES_TRAFFIC,
        ReportType.SETTLEMENT,
        ReportType.SPONSORED_PRODUCTS
    ]
    
    created_requests = []
    
    for report_type in report_types:
        request_doc = {
            "request_id": generate_id("req"),
            "seller_id": seller["seller_id"],
            "report_type": report_type.value,
            "amazon_report_id": None,
            "amazon_document_id": None,
            "status": ReportStatus.PENDING.value,
            "data_start_time": start_date.isoformat(),
            "data_end_time": end_date.isoformat(),
            "error_message": None,
            "created_at": now.isoformat(),
            "completed_at": None
        }
        
        await db.report_requests.insert_one(request_doc)
        created_requests.append({
            "request_id": request_doc["request_id"],
            "report_type": report_type.value,
            "status": ReportStatus.PENDING.value
        })
    
    return {
        "message": f"Created {len(created_requests)} report requests",
        "requests": created_requests,
        "note": "Reports will be fetched by the background worker"
    }


@router.get("/reports")
async def get_report_requests(request: Request):
    """Get all report requests for the current user"""
    user = await get_current_user(request)
    
    seller = await db.amazon_sellers.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not seller:
        return {"reports": []}
    
    reports = await db.report_requests.find(
        {"seller_id": seller["seller_id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {"reports": reports}
