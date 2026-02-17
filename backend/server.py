"""
AdsGupta Dashboard Backend
FastAPI server with Amazon SP-API integration
"""
from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager
import asyncio

# Load environment
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Import routes
from routes import auth, amazon, dashboard, insights, leads
from services.amazon_reports import AmazonReportService

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize services
report_service = AmazonReportService(db)

# Background task for report polling
async def report_polling_task():
    """Background task to poll and process Amazon reports every 4 hours"""
    while True:
        try:
            logger.info("Running scheduled report processing...")
            await report_service.process_pending_reports()
            logger.info("Report processing completed")
        except Exception as e:
            logger.error(f"Report polling error: {e}")
        
        # Wait 4 hours before next poll
        await asyncio.sleep(4 * 60 * 60)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage app lifespan - startup and shutdown"""
    # Startup
    logger.info("Starting AdsGupta Dashboard Backend...")
    
    # Set database references for all route modules
    auth.set_db(db)
    amazon.set_db(db)
    dashboard.set_db(db)
    insights.set_db(db)
    leads.set_db(db)
    
    # Create indexes
    await create_indexes()
    
    # Start background report polling task
    polling_task = asyncio.create_task(report_polling_task())
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")
    polling_task.cancel()
    try:
        await polling_task
    except asyncio.CancelledError:
        pass
    client.close()


# Create the main app
app = FastAPI(
    title="AdsGupta Dashboard API",
    description="AI-powered Amazon Seller Analytics Dashboard",
    version="1.0.0",
    lifespan=lifespan
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Include all route modules
api_router.include_router(auth.router)
api_router.include_router(amazon.router)
api_router.include_router(dashboard.router)
api_router.include_router(insights.router)
api_router.include_router(leads.router)


# Health check endpoint
@api_router.get("/")
async def root():
    return {
        "message": "AdsGupta Dashboard API",
        "status": "healthy",
        "version": "1.0.0"
    }


@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check MongoDB connection
        await db.command("ping")
        db_status = "connected"
    except Exception:
        db_status = "disconnected"
    
    return {
        "status": "healthy",
        "database": db_status,
        "services": {
            "auth": "active",
            "amazon_sp_api": "active",
            "dashboard": "active",
            "ai_insights": "active"
        }
    }


# Settings endpoint to get redirect URI
@api_router.get("/settings/redirect-uri")
async def get_redirect_uri():
    """Get the Amazon OAuth redirect URI for configuration"""
    backend_url = os.environ.get("BACKEND_URL", "https://command-center-hub-1.preview.emergentagent.com")
    return {
        "redirect_uri": f"{backend_url}/api/amazon/callback",
        "note": "Add this URI to your Amazon Developer Console under 'Allowed Return URLs'"
    }


# Include the router in the main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def create_indexes():
    """Create MongoDB indexes for performance"""
    try:
        # Users
        await db.users.create_index("user_id", unique=True)
        await db.users.create_index("email", unique=True)
        
        # Sessions
        await db.user_sessions.create_index("session_token")
        await db.user_sessions.create_index("user_id")
        await db.user_sessions.create_index("expires_at")
        
        # Amazon Sellers
        await db.amazon_sellers.create_index("seller_id", unique=True)
        await db.amazon_sellers.create_index("user_id")
        
        # OAuth States
        await db.oauth_states.create_index("state", unique=True)
        await db.oauth_states.create_index("expires_at", expireAfterSeconds=0)
        
        # Report Requests
        await db.report_requests.create_index("request_id", unique=True)
        await db.report_requests.create_index("seller_id")
        await db.report_requests.create_index("status")
        
        # Metrics
        await db.sales_traffic_metrics.create_index([("seller_id", 1), ("date", -1)])
        await db.sales_traffic_metrics.create_index([("seller_id", 1), ("asin", 1)])
        
        await db.settlement_metrics.create_index([("seller_id", 1), ("settlement_end_date", -1)])
        
        await db.sponsored_products_metrics.create_index([("seller_id", 1), ("date", -1)])
        await db.sponsored_products_metrics.create_index([("seller_id", 1), ("campaign_id", 1)])
        
        # AI Insights
        await db.ai_insights.create_index([("user_id", 1), ("created_at", -1)])
        
        # Leads
        await db.leads.create_index("email", unique=True)
        await db.leads.create_index("created_at")
        
        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")
