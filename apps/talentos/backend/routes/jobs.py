"""
TalentOS Job Discovery Routes
Integrates with Adzuna API and job scraping
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import httpx
import os
import logging
import re

from models.database import generate_id

router = APIRouter(prefix="/jobs", tags=["Jobs"])
logger = logging.getLogger(__name__)

# Adzuna API config
ADZUNA_APP_ID = os.environ.get("ADZUNA_APP_ID", "")
ADZUNA_APP_KEY = os.environ.get("ADZUNA_APP_KEY", "")
ADZUNA_BASE_URL = "https://api.adzuna.com/v1/api/jobs"

HAS_ADZUNA = bool(ADZUNA_APP_ID and ADZUNA_APP_KEY)
if HAS_ADZUNA:
    logger.info("Adzuna API configured")
else:
    logger.warning("Adzuna credentials not configured")

# Database reference
db = None

def set_db(database):
    global db
    db = database

# Adtech keywords for filtering
ADTECH_KEYWORDS = [
    "programmatic", "dsp", "ssp", "ad tech", "adtech", "ad operations",
    "header bidding", "prebid", "rtb", "real-time bidding", "yield optimization",
    "demand side", "supply side", "ad exchange", "ad server", "google ad manager",
    "dfp", "dv360", "the trade desk", "amazon ads", "retail media", "advertising technology",
    "campaign manager", "media buying", "performance marketing", "ad trafficking"
]


# Request/Response Models
class JobSearchRequest(BaseModel):
    keywords: str
    location: Optional[str] = "india"
    page: int = 1
    results_per_page: int = 10
    adtech_only: bool = False


class JobSearchResult(BaseModel):
    job_id: str
    title: str
    company: str
    location: str
    description: str
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    url: str
    created: str
    is_adtech: bool
    match_keywords: List[str] = []


class ScrapeJobRequest(BaseModel):
    url: str  # LinkedIn or Naukri job URL


class ScrapeJobResponse(BaseModel):
    title: str
    company: str
    location: str
    description: str
    skills: List[str]
    url: str


def extract_adtech_keywords(text: str) -> List[str]:
    """Extract matching adtech keywords from text"""
    text_lower = text.lower()
    matches = []
    for keyword in ADTECH_KEYWORDS:
        if keyword in text_lower:
            matches.append(keyword)
    return matches


def is_adtech_job(title: str, description: str) -> bool:
    """Check if job is related to ad-tech"""
    combined = f"{title} {description}".lower()
    return any(kw in combined for kw in ADTECH_KEYWORDS)


@router.get("/config")
async def get_jobs_config():
    """Get job search configuration"""
    return {
        "adzuna_enabled": HAS_ADZUNA,
        "supported_countries": ["in", "us", "gb", "au", "de", "fr"],
        "adtech_keywords": ADTECH_KEYWORDS[:10]  # Sample keywords
    }


@router.post("/search", response_model=List[JobSearchResult])
async def search_jobs(request: JobSearchRequest):
    """Search jobs using Adzuna API"""
    if not HAS_ADZUNA:
        # Return mock data if API not configured
        return get_mock_jobs(request.keywords, request.adtech_only)
    
    # Map location to country code
    country_map = {
        "india": "in",
        "us": "us", "usa": "us", "united states": "us",
        "uk": "gb", "united kingdom": "gb",
        "australia": "au",
        "germany": "de",
        "france": "fr"
    }
    country = country_map.get(request.location.lower(), "in")
    
    # Build search query
    search_query = request.keywords
    if request.adtech_only:
        search_query = f"{search_query} programmatic adtech"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{ADZUNA_BASE_URL}/{country}/search/{request.page}",
                params={
                    "app_id": ADZUNA_APP_ID,
                    "app_key": ADZUNA_APP_KEY,
                    "results_per_page": request.results_per_page,
                    "what": search_query,
                    "content-type": "application/json"
                },
                timeout=15.0
            )
            
            if response.status_code != 200:
                logger.error(f"Adzuna API error: {response.status_code} - {response.text}")
                return get_mock_jobs(request.keywords, request.adtech_only)
            
            data = response.json()
            results = data.get("results", [])
            
            jobs = []
            for job in results:
                title = job.get("title", "")
                description = job.get("description", "")
                job_is_adtech = is_adtech_job(title, description)
                
                # Skip if adtech_only and not an adtech job
                if request.adtech_only and not job_is_adtech:
                    continue
                
                jobs.append(JobSearchResult(
                    job_id=str(job.get("id", generate_id("job"))),
                    title=title,
                    company=job.get("company", {}).get("display_name", "Unknown"),
                    location=job.get("location", {}).get("display_name", ""),
                    description=description[:500] + "..." if len(description) > 500 else description,
                    salary_min=job.get("salary_min"),
                    salary_max=job.get("salary_max"),
                    url=job.get("redirect_url", ""),
                    created=job.get("created", ""),
                    is_adtech=job_is_adtech,
                    match_keywords=extract_adtech_keywords(f"{title} {description}")
                ))
            
            return jobs
            
    except Exception as e:
        logger.error(f"Job search error: {e}")
        return get_mock_jobs(request.keywords, request.adtech_only)


def get_mock_jobs(keywords: str, adtech_only: bool) -> List[JobSearchResult]:
    """Return mock job data for development/demo"""
    mock_jobs = [
        JobSearchResult(
            job_id="mock_1",
            title="Senior Programmatic Specialist",
            company="Publicis Media",
            location="Mumbai, India",
            description="Looking for experienced programmatic specialists with DSP expertise. Must have experience with DV360, The Trade Desk, and header bidding implementations.",
            salary_min=1500000,
            salary_max=2500000,
            url="https://example.com/job/1",
            created=datetime.now(timezone.utc).isoformat(),
            is_adtech=True,
            match_keywords=["programmatic", "dsp", "header bidding", "dv360", "the trade desk"]
        ),
        JobSearchResult(
            job_id="mock_2",
            title="Ad Operations Manager",
            company="GroupM",
            location="Bangalore, India",
            description="Manage ad operations for premium publisher clients. Experience with GAM, Prebid, and yield optimization required.",
            salary_min=1200000,
            salary_max=1800000,
            url="https://example.com/job/2",
            created=datetime.now(timezone.utc).isoformat(),
            is_adtech=True,
            match_keywords=["ad operations", "prebid", "yield optimization"]
        ),
        JobSearchResult(
            job_id="mock_3",
            title="Yield Optimization Analyst",
            company="InMobi",
            location="Bangalore, India",
            description="Drive yield optimization strategies for our mobile ad network. Strong analytical skills and understanding of RTB required.",
            salary_min=1000000,
            salary_max=1600000,
            url="https://example.com/job/3",
            created=datetime.now(timezone.utc).isoformat(),
            is_adtech=True,
            match_keywords=["yield optimization", "rtb"]
        ),
        JobSearchResult(
            job_id="mock_4",
            title="DSP Campaign Manager",
            company="MediaMath",
            location="Delhi, India",
            description="Manage programmatic campaigns across multiple DSPs. Experience with audience targeting, bid optimization, and performance analysis.",
            salary_min=800000,
            salary_max=1400000,
            url="https://example.com/job/4",
            created=datetime.now(timezone.utc).isoformat(),
            is_adtech=True,
            match_keywords=["programmatic", "dsp", "campaign manager"]
        ),
        JobSearchResult(
            job_id="mock_5",
            title="Digital Marketing Manager",
            company="TCS",
            location="Chennai, India",
            description="Lead digital marketing initiatives for enterprise clients. Experience with paid media, SEO, and analytics required.",
            salary_min=1200000,
            salary_max=2000000,
            url="https://example.com/job/5",
            created=datetime.now(timezone.utc).isoformat(),
            is_adtech=False,
            match_keywords=[]
        )
    ]
    
    if adtech_only:
        return [j for j in mock_jobs if j.is_adtech]
    
    # Filter by keywords
    keywords_lower = keywords.lower()
    return [j for j in mock_jobs if keywords_lower in j.title.lower() or keywords_lower in j.description.lower() or not keywords]


@router.post("/scrape", response_model=ScrapeJobResponse)
async def scrape_job_url(request: ScrapeJobRequest):
    """Scrape job description from LinkedIn or Naukri URL"""
    url = request.url.lower()
    
    # Validate URL
    valid_domains = ["linkedin.com", "naukri.com", "indeed.com"]
    if not any(domain in url for domain in valid_domains):
        raise HTTPException(
            status_code=400, 
            detail="Only LinkedIn, Naukri, and Indeed URLs are supported"
        )
    
    # For now, return a mock response
    # In production, this would use playwright-aws-lambda or similar
    return ScrapeJobResponse(
        title="Senior Programmatic Specialist",
        company="Extracted Company Name",
        location="Mumbai, India",
        description="""
We are looking for a Senior Programmatic Specialist to join our team.

Requirements:
- 5+ years experience in programmatic advertising
- Expert knowledge of DSP platforms (DV360, The Trade Desk)
- Experience with header bidding (Prebid.js)
- Strong analytical skills and Excel proficiency
- Understanding of RTB auction mechanics

Responsibilities:
- Manage programmatic campaigns across multiple DSPs
- Optimize campaign performance and ROAS
- Work with publishers on header bidding implementation
- Analyze data and provide strategic recommendations
        """.strip(),
        skills=["programmatic", "dsp", "dv360", "the trade desk", "header bidding", "prebid", "rtb"],
        url=request.url
    )


@router.post("/save")
async def save_job(user_id: str, job: JobSearchResult):
    """Save a job to user's saved jobs"""
    job_doc = {
        "job_id": generate_id("saved"),
        "user_id": user_id,
        "source": "adzuna",
        "external_id": job.job_id,
        "title": job.title,
        "company": job.company,
        "location": job.location,
        "description": job.description,
        "salary_min": job.salary_min,
        "salary_max": job.salary_max,
        "url": job.url,
        "is_adtech": job.is_adtech,
        "skills": job.match_keywords,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.saved_jobs.insert_one(job_doc)
    
    return {"success": True, "job_id": job_doc["job_id"]}


@router.get("/saved/{user_id}")
async def get_saved_jobs(user_id: str):
    """Get user's saved jobs"""
    jobs = await db.saved_jobs.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    return {"jobs": jobs}


@router.delete("/saved/{job_id}")
async def delete_saved_job(job_id: str, user_id: str):
    """Delete a saved job"""
    result = await db.saved_jobs.delete_one({"job_id": job_id, "user_id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return {"success": True}


@router.get("/recommendations/{user_id}")
async def get_job_recommendations(user_id: str, limit: int = 10):
    """Get job recommendations based on user's resume"""
    # Get user's latest resume
    resume = await db.resumes.find_one(
        {"user_id": user_id},
        {"_id": 0}
    )
    
    if not resume or not resume.get("parsed_data"):
        # No resume, return generic adtech jobs
        return await search_jobs(JobSearchRequest(
            keywords="programmatic advertising",
            adtech_only=True,
            results_per_page=limit
        ))
    
    # Extract skills from resume
    skills = resume.get("parsed_data", {}).get("skills", [])
    
    # Search for jobs matching skills
    search_keywords = " ".join(skills[:5])  # Top 5 skills
    
    return await search_jobs(JobSearchRequest(
        keywords=search_keywords,
        adtech_only=True,
        results_per_page=limit
    ))
