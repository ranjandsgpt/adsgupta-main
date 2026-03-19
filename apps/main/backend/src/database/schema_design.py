"""
Database Schema - Differentiates file_upload_data vs api_sync_data
This shows the logical separation even when using MongoDB
"""

# Schema for file_upload_data (temporary, browser-side backup)
FILE_UPLOAD_SCHEMA = {
    "collection": "file_uploads",
    "description": "Stores temporary file upload metadata for session recovery",
    "fields": {
        "_id": "ObjectId - Auto-generated",
        "session_id": "String - Browser session identifier",
        "user_id": "ObjectId - Optional, if user is logged in",
        "file_name": "String - Original filename",
        "file_type": "String - csv, xlsx, etc.",
        "report_type": "String - business_report, search_term_report, etc.",
        "row_count": "Integer - Number of rows",
        "headers": "Array<String> - Column headers",
        "checksum": "String - MD5 hash for deduplication",
        "uploaded_at": "DateTime - Upload timestamp",
        "expires_at": "DateTime - Auto-delete after 24 hours",
        "is_processed": "Boolean - Whether analysis was run",
        "source": "String - 'browser' for file uploads"
    },
    "indexes": [
        {"session_id": 1, "uploaded_at": -1},
        {"expires_at": 1},  # TTL index for auto-deletion
        {"user_id": 1, "uploaded_at": -1}
    ]
}

# Schema for api_sync_data (permanent, server-side)
API_SYNC_SCHEMA = {
    "collection": "api_sync_data",
    "description": "Stores permanent data from Amazon SP-API",
    "fields": {
        "_id": "ObjectId - Auto-generated",
        "user_id": "ObjectId - Required, linked to users collection",
        "seller_id": "String - Amazon Seller ID",
        "marketplace_id": "String - e.g., ATVPDKIKX0DER for US",
        "report_type": "String - Type of SP-API report",
        "report_id": "String - Amazon's report ID",
        "data_date": "DateTime - Date the data represents",
        "data": "Object - The actual report data (aggregated)",
        "raw_s3_key": "String - S3 key for raw report storage",
        "synced_at": "DateTime - When data was synced",
        "next_sync": "DateTime - Scheduled next sync",
        "status": "String - active, paused, error",
        "source": "String - 'sp-api' for API synced data"
    },
    "indexes": [
        {"user_id": 1, "report_type": 1, "data_date": -1},
        {"seller_id": 1},
        {"next_sync": 1},
        {"status": 1}
    ]
}

# Schema for amazon_credentials (SP-API connection)
AMAZON_CREDENTIALS_SCHEMA = {
    "collection": "amazon_credentials",
    "description": "Encrypted SP-API credentials for connected sellers",
    "fields": {
        "_id": "ObjectId - Auto-generated",
        "user_id": "ObjectId - Required, unique per user",
        "seller_id": "String - Amazon Seller ID",
        "marketplace_ids": "Array<String> - Connected marketplaces",
        "refresh_token": "String - Encrypted LWA refresh token",
        "aws_access_key": "String - Encrypted AWS IAM access key (optional)",
        "aws_secret_key": "String - Encrypted AWS IAM secret key (optional)",
        "connected_at": "DateTime - Connection timestamp",
        "last_sync": "DateTime - Last successful sync",
        "sync_status": "String - connected, syncing, error, paused",
        "sync_frequency": "Integer - Minutes between syncs (default: 240)",
        "enabled_reports": "Array<String> - Which reports to sync"
    },
    "indexes": [
        {"user_id": 1},
        {"seller_id": 1},
        {"sync_status": 1, "last_sync": 1}
    ]
}

# Aggregated KPIs collection (computed from api_sync_data)
SELLER_KPIS_SCHEMA = {
    "collection": "seller_kpis",
    "description": "Pre-computed KPIs for dashboard rendering",
    "fields": {
        "_id": "ObjectId - Auto-generated",
        "user_id": "ObjectId - Required",
        "seller_id": "String - Amazon Seller ID",
        "period": "String - daily, weekly, monthly",
        "period_start": "DateTime - Start of period",
        "period_end": "DateTime - End of period",
        "kpis": {
            "total_sales": "Number",
            "total_units": "Number",
            "sessions": "Number",
            "page_views": "Number",
            "conversion_rate": "Number",
            "buy_box_pct": "Number",
            "ad_spend": "Number",
            "acos": "Number",
            "tacos": "Number",
            "roas": "Number"
        },
        "computed_at": "DateTime",
        "source": "String - 'computed' for aggregated data"
    },
    "indexes": [
        {"user_id": 1, "period": 1, "period_start": -1},
        {"seller_id": 1, "period": 1}
    ]
}

# PostgreSQL equivalent (for future migration)
POSTGRESQL_SCHEMA = """
-- File Upload Data (temporary)
CREATE TABLE file_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id),
    file_name VARCHAR(500) NOT NULL,
    file_type VARCHAR(10) NOT NULL,
    report_type VARCHAR(50),
    row_count INTEGER,
    headers JSONB,
    checksum VARCHAR(32),
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
    is_processed BOOLEAN DEFAULT FALSE,
    source VARCHAR(20) DEFAULT 'browser'
);
CREATE INDEX idx_file_uploads_session ON file_uploads(session_id, uploaded_at DESC);
CREATE INDEX idx_file_uploads_expires ON file_uploads(expires_at);

-- API Sync Data (permanent)
CREATE TABLE api_sync_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    seller_id VARCHAR(100) NOT NULL,
    marketplace_id VARCHAR(50) NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    report_id VARCHAR(255),
    data_date DATE NOT NULL,
    data JSONB NOT NULL,
    raw_s3_key VARCHAR(500),
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    next_sync TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'active',
    source VARCHAR(20) DEFAULT 'sp-api'
);
CREATE INDEX idx_api_sync_user ON api_sync_data(user_id, report_type, data_date DESC);
CREATE INDEX idx_api_sync_seller ON api_sync_data(seller_id);

-- Amazon Credentials (encrypted)
CREATE TABLE amazon_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id),
    seller_id VARCHAR(100) NOT NULL,
    marketplace_ids VARCHAR(50)[] DEFAULT '{}',
    refresh_token_encrypted BYTEA NOT NULL,
    aws_access_key_encrypted BYTEA,
    aws_secret_key_encrypted BYTEA,
    connected_at TIMESTAMPTZ DEFAULT NOW(),
    last_sync TIMESTAMPTZ,
    sync_status VARCHAR(20) DEFAULT 'connected',
    sync_frequency INTEGER DEFAULT 240,
    enabled_reports VARCHAR(100)[] DEFAULT '{}'
);
CREATE INDEX idx_amazon_creds_user ON amazon_credentials(user_id);
CREATE INDEX idx_amazon_creds_status ON amazon_credentials(sync_status, last_sync);

-- Pre-computed KPIs
CREATE TABLE seller_kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    seller_id VARCHAR(100) NOT NULL,
    period VARCHAR(20) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_sales DECIMAL(12,2),
    total_units INTEGER,
    sessions INTEGER,
    page_views INTEGER,
    conversion_rate DECIMAL(5,2),
    buy_box_pct DECIMAL(5,2),
    ad_spend DECIMAL(12,2),
    acos DECIMAL(5,2),
    tacos DECIMAL(5,2),
    roas DECIMAL(5,2),
    computed_at TIMESTAMPTZ DEFAULT NOW(),
    source VARCHAR(20) DEFAULT 'computed',
    UNIQUE(user_id, period, period_start)
);
CREATE INDEX idx_seller_kpis_user ON seller_kpis(user_id, period, period_start DESC);
"""
