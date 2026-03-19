"""
Database Models and Schema for AdsGupta Dashboard
Uses MongoDB with structured collections mimicking relational design
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from enum import Enum
import uuid


def generate_id(prefix: str = "") -> str:
    """Generate a unique ID with optional prefix"""
    return f"{prefix}_{uuid.uuid4().hex[:12]}" if prefix else uuid.uuid4().hex[:12]


class ConnectionStatus(str, Enum):
    CONNECTED = "connected"
    NEEDS_REAUTH = "needs_reauth"
    PENDING = "pending"
    ERROR = "error"


class ReportType(str, Enum):
    SALES_TRAFFIC = "GET_SALES_AND_TRAFFIC_REPORT"
    SETTLEMENT = "GET_V2_SETTLEMENT_REPORT"
    SPONSORED_PRODUCTS = "GET_SPONSORED_PRODUCTS_REPORT"


class ReportStatus(str, Enum):
    PENDING = "pending"
    IN_QUEUE = "in_queue"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    FAILED = "failed"


# User Models
class UserBase(BaseModel):
    email: str
    name: str
    picture: Optional[str] = None


class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    
    user_id: str = Field(default_factory=lambda: generate_id("user"))
    auth_provider: str = "google"  # google or jwt
    password_hash: Optional[str] = None  # Only for JWT auth
    # TalentOS Pro fields
    is_pro: bool = False
    credits: int = 3  # Free users get 3 credits
    razorpay_customer_id: Optional[str] = None
    razorpay_sub_id: Optional[str] = None
    # LinkedIn integration
    linkedin_data: Optional[Dict[str, Any]] = None
    linkedin_in_sync: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    session_id: str = Field(default_factory=lambda: generate_id("sess"))
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Amazon Seller Models
class AmazonSeller(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    seller_id: str = Field(default_factory=lambda: generate_id("seller"))
    user_id: str  # Foreign key to User
    selling_partner_id: Optional[str] = None  # Amazon's seller ID
    marketplace_id: str = "ATVPDKIKX0DER"  # Default to US marketplace
    refresh_token: str  # Encrypted refresh token
    access_token: Optional[str] = None  # Current access token (expires in 1hr)
    access_token_expires_at: Optional[datetime] = None
    connection_status: ConnectionStatus = ConnectionStatus.PENDING
    last_sync_at: Optional[datetime] = None
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Report Models
class ReportRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    request_id: str = Field(default_factory=lambda: generate_id("req"))
    seller_id: str  # Foreign key to AmazonSeller
    report_type: ReportType
    amazon_report_id: Optional[str] = None  # Amazon's report ID
    amazon_document_id: Optional[str] = None  # Amazon's document ID
    status: ReportStatus = ReportStatus.PENDING
    data_start_time: datetime
    data_end_time: datetime
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None


class SalesTrafficMetrics(BaseModel):
    """Metrics from GET_SALES_AND_TRAFFIC_REPORT"""
    model_config = ConfigDict(extra="ignore")
    
    metric_id: str = Field(default_factory=lambda: generate_id("metric"))
    seller_id: str
    report_request_id: str
    date: datetime
    asin: Optional[str] = None
    sku: Optional[str] = None
    parent_asin: Optional[str] = None
    child_asin: Optional[str] = None
    
    # Traffic Metrics
    sessions: int = 0
    session_percentage: float = 0.0
    page_views: int = 0
    page_views_percentage: float = 0.0
    buy_box_percentage: float = 0.0
    
    # Sales Metrics
    units_ordered: int = 0
    units_ordered_b2b: int = 0
    unit_session_percentage: float = 0.0  # Conversion rate
    unit_session_percentage_b2b: float = 0.0
    ordered_product_sales: float = 0.0
    ordered_product_sales_b2b: float = 0.0
    total_order_items: int = 0
    total_order_items_b2b: int = 0
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SettlementMetrics(BaseModel):
    """Metrics from GET_V2_SETTLEMENT_REPORT"""
    model_config = ConfigDict(extra="ignore")
    
    metric_id: str = Field(default_factory=lambda: generate_id("settle"))
    seller_id: str
    report_request_id: str
    settlement_id: str
    settlement_start_date: datetime
    settlement_end_date: datetime
    
    # Financial Metrics
    total_amount: float = 0.0
    product_sales: float = 0.0
    product_sales_tax: float = 0.0
    shipping_credits: float = 0.0
    shipping_credits_tax: float = 0.0
    gift_wrap_credits: float = 0.0
    promotional_rebates: float = 0.0
    sales_tax_collected: float = 0.0
    selling_fees: float = 0.0
    fba_fees: float = 0.0
    other_transaction_fees: float = 0.0
    other_amount: float = 0.0
    
    # Refunds
    refund_amount: float = 0.0
    refund_rate: float = 0.0
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SponsoredProductsMetrics(BaseModel):
    """Metrics from GET_SPONSORED_PRODUCTS_REPORT"""
    model_config = ConfigDict(extra="ignore")
    
    metric_id: str = Field(default_factory=lambda: generate_id("sp"))
    seller_id: str
    report_request_id: str
    date: datetime
    campaign_id: Optional[str] = None
    campaign_name: Optional[str] = None
    ad_group_id: Optional[str] = None
    ad_group_name: Optional[str] = None
    targeting: Optional[str] = None
    match_type: Optional[str] = None
    
    # PPC Metrics
    impressions: int = 0
    clicks: int = 0
    ctr: float = 0.0  # Click-through rate
    spend: float = 0.0
    sales: float = 0.0
    orders: int = 0
    units: int = 0
    acos: float = 0.0  # Advertising Cost of Sales
    roas: float = 0.0  # Return on Ad Spend
    cpc: float = 0.0  # Cost per click
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Dashboard Aggregated Metrics
class DashboardKPIs(BaseModel):
    """Aggregated KPIs for the dashboard"""
    model_config = ConfigDict(extra="ignore")
    
    # Traffic & Conversion
    total_sessions: int = 0
    total_page_views: int = 0
    avg_conversion_rate: float = 0.0
    avg_buy_box_percentage: float = 0.0
    
    # Sales
    total_sales: float = 0.0
    total_units: int = 0
    total_orders: int = 0
    
    # PPC
    total_ppc_spend: float = 0.0
    total_ppc_sales: float = 0.0
    avg_acos: float = 0.0
    avg_tacos: float = 0.0  # Total ACOS (PPC spend / total sales)
    avg_roas: float = 0.0
    
    # Financials
    total_revenue: float = 0.0
    total_fees: float = 0.0
    total_refunds: float = 0.0
    refund_rate: float = 0.0
    net_profit: float = 0.0
    
    # Period
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None


# API Request/Response Models
class AmazonOAuthStart(BaseModel):
    redirect_uri: str


class AmazonOAuthCallback(BaseModel):
    spapi_oauth_code: str
    state: str
    selling_partner_id: Optional[str] = None


class UserRegister(BaseModel):
    email: str
    password: str
    name: str


class UserLogin(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 3600
    user: Dict[str, Any]


class SettingsUpdate(BaseModel):
    lwa_client_id: Optional[str] = None
    lwa_client_secret: Optional[str] = None
    aws_iam_arn: Optional[str] = None


class AIInsightRequest(BaseModel):
    metrics: Dict[str, Any]
    period: str = "last_7_days"


# ============================================
# TalentOS Models (Career OS)
# ============================================

class Resume(BaseModel):
    """User's uploaded resume with parsed content and embedding"""
    model_config = ConfigDict(extra="ignore")
    
    resume_id: str = Field(default_factory=lambda: generate_id("resume"))
    user_id: str
    filename: str
    raw_content: str  # Original text content
    parsed_data: Optional[Dict[str, Any]] = None  # Skills, experience, education
    embedding: Optional[List[float]] = None  # Vector embedding for RAG
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class JobMatch(BaseModel):
    """Job match analysis between resume and job description"""
    model_config = ConfigDict(extra="ignore")
    
    match_id: str = Field(default_factory=lambda: generate_id("match"))
    user_id: str
    resume_id: Optional[str] = None
    jd_url: Optional[str] = None
    jd_text: str
    company_name: str
    job_title: str
    match_score: int  # 0-100
    skill_gaps: List[Dict[str, Any]] = []
    resume_brief: Optional[str] = None  # AI-generated advice
    high_impact_swaps: List[str] = []  # 3 specific resume changes
    missing_keywords: List[str] = []  # Keywords to add
    interview_questions: List[Dict[str, Any]] = []
    action_items: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class InterviewSession(BaseModel):
    """Mock interview session with AI"""
    model_config = ConfigDict(extra="ignore")
    
    session_id: str = Field(default_factory=lambda: generate_id("interview"))
    user_id: str
    job_match_id: Optional[str] = None
    mode: str = "adtech"  # adtech, general, behavioral
    status: str = "active"  # active, completed, abandoned
    transcript: List[Dict[str, Any]] = []  # [{role, content, timestamp}]
    feedback: Optional[Dict[str, Any]] = None  # STAR scores, filler words, etc
    overall_score: Optional[int] = None
    video_url: Optional[str] = None  # For AI persona video
    duration_seconds: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None


class Payment(BaseModel):
    """Razorpay payment record"""
    model_config = ConfigDict(extra="ignore")
    
    payment_id: str = Field(default_factory=lambda: generate_id("pay"))
    user_id: str
    razorpay_order_id: str
    razorpay_payment_id: Optional[str] = None
    razorpay_signature: Optional[str] = None
    amount: int  # In paise
    currency: str = "INR"
    status: str = "created"  # created, authorized, captured, failed, refunded
    plan_type: str = "pro_monthly"  # pro_monthly, pro_yearly, credits_10
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class JobListing(BaseModel):
    """Job listing from Adzuna or scraped sources"""
    model_config = ConfigDict(extra="ignore")
    
    job_id: str = Field(default_factory=lambda: generate_id("job"))
    user_id: Optional[str] = None  # If saved by user
    source: str = "adzuna"  # adzuna, linkedin, naukri
    external_id: Optional[str] = None
    title: str
    company: str
    location: str
    description: str
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    url: str
    skills: List[str] = []  # Extracted skills
    is_adtech: bool = False  # Programmatic/adtech role flag
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
