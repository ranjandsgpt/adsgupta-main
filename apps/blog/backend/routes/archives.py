"""
Archives Routes - The Archives CMS (blog.adsgupta.com)
Content management with Google OAuth (Emergent Auth) and email whitelist
Features:
- Zero-auth public routes (/, /archives/**, /category/**)
- Whitelisted admin routes (/admin/**)
- 24-hour session with auto-purge
- RSS Blogspot sync
- OpenGraph meta generation
"""
from fastapi import APIRouter, HTTPException, Response, Request, Depends, BackgroundTasks
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, Field
from typing import Optional, List
import httpx
import os
import uuid
import re
import feedparser
import html

router = APIRouter(prefix="/archives", tags=["Archives CMS"])

# Database reference (will be set from main server)
db = None

# Whitelisted emails for admin access (case-insensitive check)
ADMIN_WHITELIST = [
    "ranjandsgpt@gmail.com",
    "poushalinandi93@gmail.com"
]

# Session duration: 24 hours (as per requirement)
SESSION_DURATION_HOURS = 24

def set_db(database):
    global db
    db = database


def is_whitelisted(email: str) -> bool:
    """Case-insensitive whitelist check"""
    if not email:
        return False
    return email.lower().strip() in [e.lower() for e in ADMIN_WHITELIST]


# Pydantic Models
class ArchiveArticle(BaseModel):
    article_id: str = Field(default_factory=lambda: f"article_{uuid.uuid4().hex[:12]}")
    title: str
    content: str
    slug: str
    source_tag: str  # "linkedin", "blogspot", "adsgupta-original"
    author: str = "Ranjan Das"
    publish_date: datetime
    external_url: Optional[str] = None
    category: str = "marketplace-protocols"  # "neural-philosophical", "marketplace-protocols", "ecosystem-updates"
    is_published: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ArticleCreate(BaseModel):
    title: str
    content: str
    source_tag: str
    publish_date: Optional[str] = None
    external_url: Optional[str] = None
    category: Optional[str] = "marketplace-protocols"
    is_published: Optional[bool] = False


class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    source_tag: Optional[str] = None
    publish_date: Optional[str] = None
    external_url: Optional[str] = None
    category: Optional[str] = None
    is_published: Optional[bool] = None


def generate_slug(title: str) -> str:
    """Generate URL-friendly slug from title"""
    slug = title.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_-]+', '-', slug)
    slug = re.sub(r'^-+|-+$', '', slug)
    return slug[:100]


def strip_html_tags(text: str) -> str:
    """Strip HTML tags and decode entities for meta descriptions"""
    clean = re.sub(r'<[^>]+>', '', text)
    clean = html.unescape(clean)
    return clean.strip()


def calculate_reading_time(content: str) -> int:
    """Calculate reading time in minutes"""
    text = strip_html_tags(content)
    words = len(text.split())
    return max(1, words // 200)


async def cleanup_expired_sessions():
    """
    Background task: Auto-purge expired sessions from database
    Keeps storage lean as per 24-hour session lifecycle requirement
    """
    try:
        now = datetime.now(timezone.utc)
        # Delete sessions older than 24 hours
        result = await db.user_sessions.delete_many({
            "expires_at": {"$lt": now.isoformat()}
        })
        if result.deleted_count > 0:
            print(f"[Archives] Purged {result.deleted_count} expired sessions")
    except Exception as e:
        print(f"[Archives] Session cleanup error: {e}")


async def verify_admin_access(request: Request) -> dict:
    """Verify the user is authenticated AND in the admin whitelist"""
    # Check cookie first
    session_token = request.cookies.get("session_token")
    
    # Fallback to Authorization header
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Find session
    session = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check expiry
    expires_at = session.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    # Get user
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Check whitelist (case-insensitive)
    if not is_whitelisted(user.get("email")):
        raise HTTPException(
            status_code=403, 
            detail="Access Denied: Neural Engine Clearance Required"
        )
    
    return user


# ============== ARCHIVES AUTH ENDPOINTS ==============

@router.post("/auth/session")
async def process_archives_session(request: Request, response: Response, background_tasks: BackgroundTasks):
    """
    Exchange Emergent session_id for user data
    Creates 24-hour session for whitelisted users only
    Triggers background cleanup of expired sessions
    """
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Trigger session cleanup in background
    background_tasks.add_task(cleanup_expired_sessions)
    
    # Call Emergent Auth to get user data
    async with httpx.AsyncClient() as client:
        try:
            print(f"[Archives Auth] Calling Emergent with session_id: {session_id[:20]}...")
            auth_response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id},
                timeout=10.0
            )
            
            print(f"[Archives Auth] Emergent response status: {auth_response.status_code}")
            
            if auth_response.status_code != 200:
                print(f"[Archives Auth] Error response: {auth_response.text}")
                raise HTTPException(status_code=401, detail="Invalid session from OAuth provider")
            
            user_data = auth_response.json()
            print(f"[Archives Auth] User data received: {user_data.get('email')}")
        except httpx.RequestError as e:
            print(f"[Archives Auth] Request error: {e}")
            raise HTTPException(status_code=500, detail="Authentication service unavailable")
    
    email = user_data.get("email")
    name = user_data.get("name")
    picture = user_data.get("picture")
    emergent_session_token = user_data.get("session_token")
    
    # Check whitelist BEFORE creating user/session (case-insensitive)
    if not is_whitelisted(email):
        raise HTTPException(
            status_code=403, 
            detail="Access Denied: Neural Engine Clearance Required. Your email is not authorized."
        )
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user info
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "name": name,
                "picture": picture,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
    else:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "auth_provider": "google",
            "is_archives_admin": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
    
    # Create session with 24-hour expiry
    session_doc = {
        "session_id": f"sess_{uuid.uuid4().hex[:12]}",
        "user_id": user_id,
        "session_token": emergent_session_token,
        "session_type": "archives_admin",
        "expires_at": (datetime.now(timezone.utc) + timedelta(hours=SESSION_DURATION_HOURS)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.user_sessions.insert_one(session_doc)
    
    # Set cookie (24 hours) with proper security settings
    # SameSite: Lax allows cookie to be sent on top-level navigations
    # Secure: true ensures cookie only sent over HTTPS
    response.set_cookie(
        key="session_token",
        value=emergent_session_token,
        httponly=True,
        secure=True,
        samesite="lax",  # Changed from "none" to "lax" for better security
        max_age=SESSION_DURATION_HOURS * 3600,  # Exactly 24 hours
        path="/"
    )
    
    return {
        "user_id": user_id,
        "email": email,
        "name": name,
        "picture": picture,
        "is_admin": True
    }


@router.get("/auth/me")
async def get_archives_admin(request: Request):
    """Get current authenticated admin user"""
    user = await verify_admin_access(request)
    return {
        "user_id": user.get("user_id"),
        "email": user.get("email"),
        "name": user.get("name"),
        "picture": user.get("picture"),
        "is_admin": True
    }


@router.post("/auth/dev-login")
async def dev_login(response: Response):
    """
    Dev-only endpoint to create a test admin session
    Only for development/testing - should be removed in production
    """
    # Use Ranjan's whitelisted email
    email = "ranjandsgpt@gmail.com"
    name = "Ranjan Das (Dev)"
    
    # Check/create user
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
    else:
        user_id = f"user_dev_{uuid.uuid4().hex[:8]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": None,
            "auth_provider": "dev",
            "is_archives_admin": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
    
    # Create session
    session_token = f"dev_session_{uuid.uuid4().hex[:12]}"
    session_doc = {
        "session_id": f"sess_dev_{uuid.uuid4().hex[:8]}",
        "user_id": user_id,
        "session_token": session_token,
        "session_type": "archives_admin_dev",
        "expires_at": (datetime.now(timezone.utc) + timedelta(hours=SESSION_DURATION_HOURS)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.user_sessions.insert_one(session_doc)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=SESSION_DURATION_HOURS * 3600,
        path="/"
    )
    
    return {
        "user_id": user_id,
        "email": email,
        "name": name,
        "picture": None,
        "is_admin": True
    }


@router.post("/auth/logout")
async def logout_archives(request: Request, response: Response):
    """Logout admin - clear session"""
    session_token = request.cookies.get("session_token")
    
    if session_token:
        # Delete session from database
        await db.user_sessions.delete_one({"session_token": session_token})
    
    # Clear cookie with matching security settings
    response.delete_cookie(
        key="session_token",
        path="/",
        secure=True,
        samesite="lax"
    )
    
    return {"message": "Logged out successfully"}


# ============== PUBLIC ARTICLE ENDPOINTS ==============
# These routes require ZERO authentication - fully indexable by search engines

@router.get("/articles")
async def get_published_articles(
    category: Optional[str] = None,
    source_tag: Optional[str] = None,
    limit: int = 50,
    skip: int = 0
):
    """
    Get all published articles (public endpoint - NO AUTH)
    Supports pagination for infinite scroll
    """
    query = {"is_published": True}
    
    if category:
        query["category"] = category
    if source_tag:
        query["source_tag"] = source_tag
    
    cursor = db.archives_content.find(query, {"_id": 0}).sort("publish_date", -1).skip(skip).limit(limit)
    articles = await cursor.to_list(length=limit)
    
    # Add reading time to each article
    for article in articles:
        article["reading_time"] = calculate_reading_time(article.get("content", ""))
    
    total = await db.archives_content.count_documents(query)
    
    return {
        "articles": articles,
        "total": total,
        "limit": limit,
        "skip": skip,
        "has_more": skip + len(articles) < total
    }


@router.get("/articles/{slug}")
async def get_article_by_slug(slug: str):
    """
    Get single article by slug (public endpoint - NO AUTH)
    Includes OpenGraph metadata for social sharing
    """
    article = await db.archives_content.find_one(
        {"slug": slug, "is_published": True},
        {"_id": 0}
    )
    
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Add reading time
    article["reading_time"] = calculate_reading_time(article.get("content", ""))
    
    # Generate OpenGraph metadata for social sharing
    description = strip_html_tags(article.get("content", ""))[:160]
    article["og_meta"] = {
        "title": article.get("title"),
        "description": description + "..." if len(description) == 160 else description,
        "type": "article",
        "author": article.get("author", "Ranjan Das"),
        "published_time": article.get("publish_date"),
        "section": article.get("category", "").replace("-", " ").title(),
        "site_name": "The Archives - AdsGupta",
        "url": f"https://blog.adsgupta.com/archives/{slug}"
    }
    
    return article


@router.get("/category/{category_name}")
async def get_articles_by_category(
    category_name: str,
    limit: int = 50,
    skip: int = 0
):
    """
    Get articles by category (public endpoint - NO AUTH)
    Category names: neural-philosophical, marketplace-protocols, ecosystem-updates
    """
    valid_categories = ["neural-philosophical", "marketplace-protocols", "ecosystem-updates"]
    
    if category_name not in valid_categories:
        raise HTTPException(status_code=404, detail="Category not found")
    
    query = {"is_published": True, "category": category_name}
    
    cursor = db.archives_content.find(query, {"_id": 0}).sort("publish_date", -1).skip(skip).limit(limit)
    articles = await cursor.to_list(length=limit)
    
    # Add reading time
    for article in articles:
        article["reading_time"] = calculate_reading_time(article.get("content", ""))
    
    total = await db.archives_content.count_documents(query)
    
    category_meta = {
        "neural-philosophical": {
            "label": "Neural Philosophical",
            "description": "Creative and visionary explorations of advertising, technology, and human behavior."
        },
        "marketplace-protocols": {
            "label": "Marketplace Protocols", 
            "description": "Strategic deep-dives on ad-tech optimization and data-driven decision making."
        },
        "ecosystem-updates": {
            "label": "Ecosystem Updates",
            "description": "Product announcements and updates from The Neural Engine ecosystem."
        }
    }
    
    return {
        "category": category_name,
        "meta": category_meta.get(category_name, {}),
        "articles": articles,
        "total": total,
        "limit": limit,
        "skip": skip
    }


@router.get("/categories")
async def get_categories():
    """Get all unique categories with counts"""
    pipeline = [
        {"$match": {"is_published": True}},
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    
    results = await db.archives_content.aggregate(pipeline).to_list(length=100)
    
    return [
        {"category": r["_id"], "count": r["count"]}
        for r in results
    ]


# ============== ADMIN ARTICLE ENDPOINTS ==============

@router.get("/admin/articles")
async def get_all_articles(request: Request, limit: int = 100, skip: int = 0):
    """Get all articles including drafts (admin only)"""
    await verify_admin_access(request)
    
    cursor = db.archives_content.find({}, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit)
    articles = await cursor.to_list(length=limit)
    
    total = await db.archives_content.count_documents({})
    
    return {
        "articles": articles,
        "total": total,
        "limit": limit,
        "skip": skip
    }


@router.post("/admin/articles")
async def create_article(request: Request, article_data: ArticleCreate):
    """Create a new article (admin only)"""
    await verify_admin_access(request)
    
    # Generate slug from title
    slug = generate_slug(article_data.title)
    
    # Check for duplicate slug
    existing = await db.archives_content.find_one({"slug": slug}, {"_id": 0})
    if existing:
        slug = f"{slug}-{uuid.uuid4().hex[:6]}"
    
    # Parse publish date or use now
    publish_date = datetime.now(timezone.utc)
    if article_data.publish_date:
        try:
            publish_date = datetime.fromisoformat(article_data.publish_date.replace('Z', '+00:00'))
        except ValueError:
            pass
    
    article_doc = {
        "article_id": f"article_{uuid.uuid4().hex[:12]}",
        "title": article_data.title,
        "content": article_data.content,
        "slug": slug,
        "source_tag": article_data.source_tag,
        "author": "Ranjan Das",
        "publish_date": publish_date.isoformat(),
        "external_url": article_data.external_url,
        "category": article_data.category or "marketplace-protocols",
        "is_published": article_data.is_published or False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.archives_content.insert_one(article_doc)
    
    # Return without _id
    return {k: v for k, v in article_doc.items() if k != "_id"}


@router.put("/admin/articles/{article_id}")
async def update_article(request: Request, article_id: str, article_data: ArticleUpdate):
    """Update an article (admin only)"""
    await verify_admin_access(request)
    
    existing = await db.archives_content.find_one({"article_id": article_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Article not found")
    
    update_fields = {"updated_at": datetime.now(timezone.utc).isoformat()}
    
    if article_data.title is not None:
        update_fields["title"] = article_data.title
        update_fields["slug"] = generate_slug(article_data.title)
    if article_data.content is not None:
        update_fields["content"] = article_data.content
    if article_data.source_tag is not None:
        update_fields["source_tag"] = article_data.source_tag
    if article_data.publish_date is not None:
        try:
            update_fields["publish_date"] = datetime.fromisoformat(
                article_data.publish_date.replace('Z', '+00:00')
            ).isoformat()
        except ValueError:
            pass
    if article_data.external_url is not None:
        update_fields["external_url"] = article_data.external_url
    if article_data.category is not None:
        update_fields["category"] = article_data.category
    if article_data.is_published is not None:
        update_fields["is_published"] = article_data.is_published
    
    await db.archives_content.update_one(
        {"article_id": article_id},
        {"$set": update_fields}
    )
    
    updated = await db.archives_content.find_one({"article_id": article_id}, {"_id": 0})
    return updated


@router.delete("/admin/articles/{article_id}")
async def delete_article(request: Request, article_id: str):
    """Delete an article (admin only)"""
    await verify_admin_access(request)
    
    result = await db.archives_content.delete_one({"article_id": article_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    
    return {"message": "Article deleted successfully"}


@router.post("/admin/articles/{article_id}/publish")
async def publish_article(request: Request, article_id: str):
    """Publish an article (admin only)"""
    await verify_admin_access(request)
    
    result = await db.archives_content.update_one(
        {"article_id": article_id},
        {"$set": {
            "is_published": True,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    
    return {"message": "Article published successfully"}


@router.post("/admin/articles/{article_id}/unpublish")
async def unpublish_article(request: Request, article_id: str):
    """Unpublish an article (admin only)"""
    await verify_admin_access(request)
    
    result = await db.archives_content.update_one(
        {"article_id": article_id},
        {"$set": {
            "is_published": False,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    
    return {"message": "Article unpublished successfully"}


# ============== BLOGSPOT SYNC ENGINE ==============

@router.post("/admin/sync-blogspot")
async def sync_blogspot(request: Request, background_tasks: BackgroundTasks):
    """
    Sync articles from Blogspot RSS feed (admin only)
    Source: ifiwasbornasanad.blogspot.com
    
    RSS Mapping:
    - Entry.Title -> Post.Title
    - Entry.Content -> Post.Content  
    - Entry.Published -> Post.Date
    - source_tag hardcoded to 'blogspot'
    """
    await verify_admin_access(request)
    
    # Use RSS format as specified
    blogspot_feed_url = "https://ifiwasbornasanad.blogspot.com/feeds/posts/default?alt=rss"
    
    try:
        # Fetch RSS feed
        async with httpx.AsyncClient() as client:
            response = await client.get(blogspot_feed_url, timeout=30.0)
            
            if response.status_code != 200:
                # Fallback to Atom feed if RSS fails
                blogspot_feed_url = "https://ifiwasbornasanad.blogspot.com/feeds/posts/default"
                response = await client.get(blogspot_feed_url, timeout=30.0)
                
                if response.status_code != 200:
                    raise HTTPException(status_code=500, detail="Failed to fetch Blogspot feed")
            
            # Parse the feed (works for both RSS and Atom)
            feed = feedparser.parse(response.text)
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Error fetching Blogspot feed: {str(e)}")
    
    synced_count = 0
    skipped_count = 0
    new_articles = []
    
    for entry in feed.entries:
        # Map RSS/Atom fields
        title = entry.get("title", "Untitled")
        
        # Handle content field (different between RSS and Atom)
        if hasattr(entry, 'content') and entry.content:
            content = entry.content[0].get("value", "") if isinstance(entry.content, list) else entry.content
        elif hasattr(entry, 'summary'):
            content = entry.summary
        elif hasattr(entry, 'description'):
            content = entry.description
        else:
            content = ""
        
        link = entry.get("link", "")
        
        # Handle date field (pubDate for RSS, published for Atom)
        published = entry.get("published") or entry.get("pubDate") or entry.get("updated", "")
        
        # Generate slug from title
        slug = generate_slug(title)
        
        # Check if article already exists (by title slug OR external URL)
        existing = await db.archives_content.find_one(
            {"$or": [{"slug": slug}, {"external_url": link}]},
            {"_id": 0}
        )
        
        if existing:
            skipped_count += 1
            continue
        
        # Parse publish date
        try:
            if isinstance(published, str):
                # Try various date formats
                for fmt in ["%a, %d %b %Y %H:%M:%S %z", "%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%SZ"]:
                    try:
                        publish_date = datetime.strptime(published.strip(), fmt)
                        if publish_date.tzinfo is None:
                            publish_date = publish_date.replace(tzinfo=timezone.utc)
                        break
                    except ValueError:
                        continue
                else:
                    publish_date = datetime.now(timezone.utc)
            else:
                publish_date = datetime.now(timezone.utc)
        except Exception:
            publish_date = datetime.now(timezone.utc)
        
        # Create article document with hardcoded source_tag = 'blogspot'
        article_doc = {
            "article_id": f"article_{uuid.uuid4().hex[:12]}",
            "title": title,
            "content": content,
            "slug": slug,
            "source_tag": "blogspot",  # Hardcoded as per spec
            "author": "Ranjan Das",
            "publish_date": publish_date.isoformat(),
            "external_url": link,
            "category": "neural-philosophical",  # Creative/Visionary posts from Blogspot
            "is_published": False,  # Start as draft for admin review
            "reading_time": calculate_reading_time(content),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.archives_content.insert_one(article_doc)
        new_articles.append({"title": title, "slug": slug})
        synced_count += 1
    
    # Trigger session cleanup in background
    background_tasks.add_task(cleanup_expired_sessions)
    
    return {
        "message": "Blogspot sync completed",
        "synced": synced_count,
        "skipped": skipped_count,
        "total_in_feed": len(feed.entries),
        "new_articles": new_articles
    }


# ============== SLM CHATBOT KNOWLEDGE BASE ==============

@router.get("/knowledge-base")
async def get_knowledge_base():
    """
    Get all published article content for SLM chatbot knowledge base
    Returns concatenated text for browser-based SLM context
    """
    cursor = db.archives_content.find(
        {"is_published": True},
        {"_id": 0, "title": 1, "content": 1, "category": 1, "source_tag": 1}
    ).sort("publish_date", -1).limit(50)
    
    articles = await cursor.to_list(length=50)
    
    # Format for SLM context
    knowledge_text = ""
    for article in articles:
        knowledge_text += f"\n\n## {article['title']}\n"
        knowledge_text += f"Category: {article['category']}, Source: {article['source_tag']}\n"
        # Strip HTML tags and limit content
        content = re.sub(r'<[^>]+>', '', article['content'])
        knowledge_text += content[:2000] + "..."
    
    return {
        "article_count": len(articles),
        "knowledge_text": knowledge_text[:50000]  # Limit total size
    }


# ============== SETTINGS ENDPOINTS ==============

class GlobalScriptPayload(BaseModel):
    script: str = ""


@router.get("/settings/global-script")
async def get_global_script(request: Request):
    """
    Get the global article script for monetization slot injection.
    Public endpoint so article pages can fetch it.
    """
    settings = await db.archives_settings.find_one({"key": "global_script"}, {"_id": 0})
    return {"script": settings.get("value", "") if settings else ""}


@router.post("/settings/global-script")
async def save_global_script(payload: GlobalScriptPayload, request: Request):
    """
    Save the global article script (admin only).
    This script is injected into the monetization slot after paragraph 3 of every article.
    """
    # Verify admin access
    user = await verify_admin_access(request)
    
    await db.archives_settings.update_one(
        {"key": "global_script"},
        {
            "$set": {
                "key": "global_script",
                "value": payload.script,
                "updated_by": user.get("email"),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        },
        upsert=True
    )
    
    return {"success": True, "message": "Global script saved"}


# ============== PUBLIC FEED API ==============

@router.get("/feed/latest")
async def get_latest_articles_feed(limit: int = 10):
    """
    Public API endpoint for main domain to display latest articles.
    Returns: Title, Slug, Excerpt, Image (if available)
    
    URL: /api/archives/feed/latest
    """
    cursor = db.archives_content.find(
        {"is_published": True},
        {"_id": 0, "title": 1, "slug": 1, "content": 1, "publish_date": 1, "category": 1, "author": 1}
    ).sort("publish_date", -1).limit(limit)
    
    articles = await cursor.to_list(length=limit)
    
    # Transform to feed format
    feed_articles = []
    for article in articles:
        # Create excerpt from content (strip HTML, take first 160 chars)
        content = article.get("content", "")
        excerpt = re.sub(r'<[^>]+>', '', content)[:160]
        if len(excerpt) == 160:
            excerpt = excerpt[:excerpt.rfind(' ')] + "..."
        
        feed_articles.append({
            "title": article.get("title"),
            "slug": article.get("slug"),
            "excerpt": excerpt,
            "image": None,  # Placeholder - articles don't have featured images yet
            "publish_date": article.get("publish_date"),
            "category": article.get("category"),
            "author": article.get("author", "Ranjan Das"),
            "url": f"https://blog.adsgupta.com/archives/{article.get('slug')}"
        })
    
    return {
        "articles": feed_articles,
        "count": len(feed_articles),
        "generated_at": datetime.now(timezone.utc).isoformat()
    }


# Also expose at /api/articles/latest for the main domain integration
@router.get("/api/articles/latest")  
async def get_articles_latest_alias(limit: int = 10):
    """Alias endpoint for main domain: /api/archives/api/articles/latest -> /api/articles/latest"""
    return await get_latest_articles_feed(limit)
