"""
TalentOS Payment Routes - Razorpay Integration
Handles Pro subscriptions and credit purchases
"""
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import razorpay
import hmac
import hashlib
import os
import logging

from models.database import generate_id

router = APIRouter(prefix="/payments", tags=["Payments"])
logger = logging.getLogger(__name__)

# Razorpay client
RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET", "")
RAZORPAY_WEBHOOK_SECRET = os.environ.get("RAZORPAY_WEBHOOK_SECRET", "")

if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
    razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    HAS_RAZORPAY = True
    logger.info("Razorpay initialized successfully")
else:
    razorpay_client = None
    HAS_RAZORPAY = False
    logger.warning("Razorpay credentials not configured")

# Database reference
db = None

def set_db(database):
    global db
    db = database

# Pricing configuration
PRICING = {
    "pro_monthly": {
        "amount": 99900,  # ₹999 in paise
        "currency": "INR",
        "name": "TalentOS Pro Monthly",
        "description": "Unlimited interviews, premium AI analysis, job discovery"
    },
    "pro_yearly": {
        "amount": 799900,  # ₹7999 in paise (2 months free)
        "currency": "INR",
        "name": "TalentOS Pro Yearly",
        "description": "Best value - 2 months free!"
    },
    "credits_10": {
        "amount": 29900,  # ₹299 in paise
        "currency": "INR",
        "name": "10 Credits Pack",
        "description": "10 additional analysis credits"
    },
    "pro_trial": {
        "amount": 100,  # ₹1 in paise for testing
        "currency": "INR",
        "name": "Pro Trial",
        "description": "Try TalentOS Pro for just ₹1"
    }
}


# Request/Response Models
class CreateOrderRequest(BaseModel):
    plan_type: str  # pro_monthly, pro_yearly, credits_10, pro_trial
    user_id: str


class CreateOrderResponse(BaseModel):
    order_id: str
    amount: int
    currency: str
    key_id: str
    name: str
    description: str
    prefill: dict


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    user_id: str


# Helper to get current user from auth
async def get_user_from_request(request: Request):
    """Extract user from JWT token"""
    from routes.auth import get_current_user
    return await get_current_user(request)


@router.get("/config")
async def get_payment_config():
    """Get payment configuration and pricing"""
    return {
        "enabled": HAS_RAZORPAY,
        "key_id": RAZORPAY_KEY_ID if HAS_RAZORPAY else None,
        "pricing": {k: {**v, "amount_display": f"₹{v['amount']/100:.0f}"} for k, v in PRICING.items()}
    }


@router.post("/create-order", response_model=CreateOrderResponse)
async def create_order(request: CreateOrderRequest):
    """Create a Razorpay order for payment"""
    if not HAS_RAZORPAY:
        raise HTTPException(status_code=503, detail="Payment service not configured")
    
    if request.plan_type not in PRICING:
        raise HTTPException(status_code=400, detail=f"Invalid plan type. Available: {list(PRICING.keys())}")
    
    plan = PRICING[request.plan_type]
    
    # Get user info for prefill
    user = await db.users.find_one({"user_id": request.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        # Create Razorpay order
        order_data = {
            "amount": plan["amount"],
            "currency": plan["currency"],
            "receipt": f"talentos_{request.user_id}_{generate_id('ord')}",
            "notes": {
                "user_id": request.user_id,
                "plan_type": request.plan_type
            }
        }
        
        razorpay_order = razorpay_client.order.create(data=order_data)
        
        # Store order in database
        payment_doc = {
            "payment_id": generate_id("pay"),
            "user_id": request.user_id,
            "razorpay_order_id": razorpay_order["id"],
            "amount": plan["amount"],
            "currency": plan["currency"],
            "plan_type": request.plan_type,
            "status": "created",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.payments.insert_one(payment_doc)
        
        return CreateOrderResponse(
            order_id=razorpay_order["id"],
            amount=plan["amount"],
            currency=plan["currency"],
            key_id=RAZORPAY_KEY_ID,
            name=plan["name"],
            description=plan["description"],
            prefill={
                "name": user.get("name", ""),
                "email": user.get("email", ""),
                "contact": user.get("phone", "")
            }
        )
        
    except Exception as e:
        logger.error(f"Order creation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to create payment order")


@router.post("/verify")
async def verify_payment(request: VerifyPaymentRequest):
    """Verify payment signature and update user status"""
    if not HAS_RAZORPAY:
        raise HTTPException(status_code=503, detail="Payment service not configured")
    
    # Verify signature
    try:
        signature_payload = f"{request.razorpay_order_id}|{request.razorpay_payment_id}"
        expected_signature = hmac.new(
            RAZORPAY_KEY_SECRET.encode(),
            signature_payload.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if expected_signature != request.razorpay_signature:
            raise HTTPException(status_code=400, detail="Invalid payment signature")
            
    except Exception as e:
        logger.error(f"Signature verification failed: {e}")
        raise HTTPException(status_code=400, detail="Payment verification failed")
    
    # Get payment record
    payment = await db.payments.find_one(
        {"razorpay_order_id": request.razorpay_order_id},
        {"_id": 0}
    )
    
    if not payment:
        raise HTTPException(status_code=404, detail="Payment order not found")
    
    # Update payment record
    await db.payments.update_one(
        {"razorpay_order_id": request.razorpay_order_id},
        {"$set": {
            "razorpay_payment_id": request.razorpay_payment_id,
            "razorpay_signature": request.razorpay_signature,
            "status": "captured",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Update user based on plan type
    plan_type = payment.get("plan_type")
    update_fields = {"updated_at": datetime.now(timezone.utc).isoformat()}
    
    if plan_type in ["pro_monthly", "pro_yearly", "pro_trial"]:
        update_fields["is_pro"] = True
        update_fields["razorpay_sub_id"] = request.razorpay_payment_id
    elif plan_type == "credits_10":
        # Add 10 credits
        user = await db.users.find_one({"user_id": request.user_id}, {"_id": 0})
        current_credits = user.get("credits", 0)
        update_fields["credits"] = current_credits + 10
    
    await db.users.update_one(
        {"user_id": request.user_id},
        {"$set": update_fields}
    )
    
    # Get updated user
    updated_user = await db.users.find_one({"user_id": request.user_id}, {"_id": 0, "password_hash": 0})
    
    logger.info(f"Payment verified for user {request.user_id}, plan: {plan_type}")
    
    return {
        "success": True,
        "message": "Payment verified successfully",
        "plan_type": plan_type,
        "user": updated_user
    }


@router.post("/webhook")
async def razorpay_webhook(request: Request):
    """Handle Razorpay webhooks for payment events"""
    if not HAS_RAZORPAY:
        return {"status": "ignored", "reason": "Razorpay not configured"}
    
    # Get webhook signature
    signature = request.headers.get("X-Razorpay-Signature", "")
    payload = await request.body()
    
    # Verify webhook signature if secret is configured
    if RAZORPAY_WEBHOOK_SECRET:
        try:
            razorpay_client.utility.verify_webhook_signature(
                payload.decode(),
                signature,
                RAZORPAY_WEBHOOK_SECRET
            )
        except Exception as e:
            logger.error(f"Webhook signature verification failed: {e}")
            raise HTTPException(status_code=400, detail="Invalid webhook signature")
    
    # Parse payload
    import json
    event_data = json.loads(payload)
    event_type = event_data.get("event")
    
    logger.info(f"Received webhook: {event_type}")
    
    if event_type == "payment.captured":
        payment_entity = event_data.get("payload", {}).get("payment", {}).get("entity", {})
        order_id = payment_entity.get("order_id")
        payment_id = payment_entity.get("id")
        
        # Update payment status
        await db.payments.update_one(
            {"razorpay_order_id": order_id},
            {"$set": {
                "razorpay_payment_id": payment_id,
                "status": "captured",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
    elif event_type == "payment.failed":
        payment_entity = event_data.get("payload", {}).get("payment", {}).get("entity", {})
        order_id = payment_entity.get("order_id")
        
        await db.payments.update_one(
            {"razorpay_order_id": order_id},
            {"$set": {
                "status": "failed",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
    
    return {"status": "processed", "event": event_type}


@router.get("/history/{user_id}")
async def get_payment_history(user_id: str):
    """Get payment history for a user"""
    payments = await db.payments.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    return {"payments": payments}


@router.get("/status/{user_id}")
async def get_subscription_status(user_id: str):
    """Get user's subscription/credit status"""
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "is_pro": user.get("is_pro", False),
        "credits": user.get("credits", 3),
        "razorpay_sub_id": user.get("razorpay_sub_id")
    }
