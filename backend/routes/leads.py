"""
Lead Capture API Routes
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone
from ..database.database import get_database

router = APIRouter(prefix="/leads", tags=["Leads"])


class LeadCaptureRequest(BaseModel):
    email: EmailStr
    source: str = "unknown"
    insightCount: int = 0


class LeadCaptureResponse(BaseModel):
    success: bool
    message: str


@router.post("/capture", response_model=LeadCaptureResponse)
async def capture_lead(request: LeadCaptureRequest):
    """Capture lead email from Neural Map or other sources"""
    try:
        db = await get_database()
        leads_collection = db.leads
        
        # Check if email already exists
        existing = await leads_collection.find_one({"email": request.email})
        
        if existing:
            # Update last seen and increment visit count
            await leads_collection.update_one(
                {"email": request.email},
                {
                    "$set": {"last_seen": datetime.now(timezone.utc)},
                    "$inc": {"visit_count": 1},
                    "$push": {
                        "interactions": {
                            "source": request.source,
                            "insightCount": request.insightCount,
                            "timestamp": datetime.now(timezone.utc)
                        }
                    }
                }
            )
            return LeadCaptureResponse(success=True, message="Welcome back!")
        
        # Create new lead
        lead_doc = {
            "email": request.email,
            "source": request.source,
            "insightCount": request.insightCount,
            "created_at": datetime.now(timezone.utc),
            "last_seen": datetime.now(timezone.utc),
            "visit_count": 1,
            "interactions": [{
                "source": request.source,
                "insightCount": request.insightCount,
                "timestamp": datetime.now(timezone.utc)
            }],
            "status": "new"
        }
        
        await leads_collection.insert_one(lead_doc)
        
        return LeadCaptureResponse(success=True, message="Lead captured successfully")
        
    except Exception as e:
        print(f"Lead capture error: {e}")
        # Don't expose internal errors - just log and return success
        return LeadCaptureResponse(success=True, message="Thank you!")


@router.get("/count")
async def get_lead_count():
    """Get total lead count (admin use)"""
    try:
        db = await get_database()
        count = await db.leads.count_documents({})
        return {"count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
