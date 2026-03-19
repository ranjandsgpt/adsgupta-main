"""
TalentOS API Routes
AI-powered interview coach, gap analysis, and resume optimization
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Request
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import os
import logging
import json
import re
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from models.database import generate_id

# Initialize router
router = APIRouter(prefix="/talentos", tags=["TalentOS"])
logger = logging.getLogger(__name__)

# Database reference
db = None

def set_db(database):
    global db
    db = database

# Try to import emergent integrations for LLM
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
    HAS_LLM = bool(EMERGENT_LLM_KEY)
    logger.info(f"Emergent LLM available: {HAS_LLM}")
except ImportError as e:
    HAS_LLM = False
    logger.warning(f"Emergent integrations not available: {e}")

# Adtech Knowledge Base - 50+ deep-level programmatic questions
ADTECH_KNOWLEDGE_BASE = [
    {
        "category": "Header Bidding",
        "questions": [
            {"q": "Explain the difference between client-side and server-side header bidding. What are the latency implications?", "difficulty": "hard"},
            {"q": "How would you set up a Prebid.js wrapper with 10 demand partners while keeping latency under 800ms?", "difficulty": "hard"},
            {"q": "What is bid caching in header bidding and when would you use it?", "difficulty": "medium"},
            {"q": "Explain the concept of 'time-out' in header bidding. How do you optimize it?", "difficulty": "medium"},
            {"q": "What's the difference between Prebid.js and Amazon TAM? When would you use each?", "difficulty": "hard"},
        ]
    },
    {
        "category": "DSP/SSP Operations",
        "questions": [
            {"q": "Explain SPO (Supply Path Optimization) vs DPO (Demand Path Optimization). How do they benefit different stakeholders?", "difficulty": "hard"},
            {"q": "What factors would you consider when setting bid multipliers in a DSP?", "difficulty": "medium"},
            {"q": "How does frequency capping work across multiple DSPs? What are the challenges?", "difficulty": "medium"},
            {"q": "Explain the concept of 'bid shading' in first-price auctions. How do DSPs implement it?", "difficulty": "hard"},
            {"q": "What's the difference between a private marketplace (PMP) and a preferred deal?", "difficulty": "medium"},
        ]
    },
    {
        "category": "RTB & Auction Mechanics",
        "questions": [
            {"q": "Walk me through the entire RTB auction process from ad request to impression.", "difficulty": "medium"},
            {"q": "Explain first-price vs second-price auctions. Why did the industry shift to first-price?", "difficulty": "medium"},
            {"q": "What is 'auction duplication' and how does it affect yield?", "difficulty": "hard"},
            {"q": "How do unified auctions differ from traditional waterfalls?", "difficulty": "medium"},
            {"q": "Explain the concept of 'bid density'. How does it impact publisher revenue?", "difficulty": "hard"},
        ]
    },
    {
        "category": "Yield Optimization",
        "questions": [
            {"q": "How would you set up an A/B test for floor price optimization?", "difficulty": "hard"},
            {"q": "What metrics would you use to measure the true incremental revenue of header bidding?", "difficulty": "hard"},
            {"q": "Explain dynamic floor pricing. What signals would you use?", "difficulty": "medium"},
            {"q": "A client's CPM dropped 30% MoM. Walk me through your debugging process.", "difficulty": "hard"},
            {"q": "How do you balance fill rate vs CPM? What's the optimal approach?", "difficulty": "medium"},
        ]
    },
    {
        "category": "Privacy & Identity",
        "questions": [
            {"q": "How does the deprecation of third-party cookies impact programmatic advertising?", "difficulty": "hard"},
            {"q": "Explain Universal ID solutions (UID 2.0, LiveRamp). How do they work?", "difficulty": "hard"},
            {"q": "What is Google's Privacy Sandbox? How will Topics API and FLEDGE affect targeting?", "difficulty": "hard"},
            {"q": "How would you approach contextual targeting as a cookie alternative?", "difficulty": "medium"},
            {"q": "Explain the concept of 'clean rooms' in advertising. Give examples.", "difficulty": "hard"},
        ]
    },
    {
        "category": "Measurement & Attribution",
        "questions": [
            {"q": "Explain multi-touch attribution models. Which would you recommend for a D2C brand?", "difficulty": "medium"},
            {"q": "What is incrementality testing? How would you set one up?", "difficulty": "hard"},
            {"q": "How do you measure viewability? What's the industry standard?", "difficulty": "medium"},
            {"q": "Explain the difference between deterministic and probabilistic matching.", "difficulty": "medium"},
            {"q": "What challenges exist in cross-device attribution?", "difficulty": "hard"},
        ]
    },
    {
        "category": "Campaign Management",
        "questions": [
            {"q": "How would you structure a programmatic campaign for a new product launch?", "difficulty": "medium"},
            {"q": "Explain the concept of 'pacing' in campaign delivery. What algorithms are used?", "difficulty": "medium"},
            {"q": "How do you optimize for both reach and frequency in a branding campaign?", "difficulty": "medium"},
            {"q": "What's your approach to audience segmentation for a performance campaign?", "difficulty": "medium"},
            {"q": "Explain the trade-offs between CPA bidding and CPM bidding.", "difficulty": "medium"},
        ]
    },
    {
        "category": "Ad Fraud & Brand Safety",
        "questions": [
            {"q": "What types of ad fraud exist? How would you detect bot traffic?", "difficulty": "medium"},
            {"q": "Explain ads.txt and sellers.json. How do they prevent fraud?", "difficulty": "medium"},
            {"q": "What is 'domain spoofing'? How do supply path verification tools combat it?", "difficulty": "hard"},
            {"q": "How would you set up brand safety controls for a luxury brand?", "difficulty": "medium"},
            {"q": "Explain the concept of MFA (Made For Advertising) sites. How do you identify them?", "difficulty": "hard"},
        ]
    },
    {
        "category": "Retail Media",
        "questions": [
            {"q": "How does Amazon DSP differ from traditional DSPs?", "difficulty": "medium"},
            {"q": "Explain the concept of retail media networks. Why are they growing?", "difficulty": "medium"},
            {"q": "How would you measure incrementality for a retail media campaign?", "difficulty": "hard"},
            {"q": "What is the difference between sponsored products and display ads in retail media?", "difficulty": "medium"},
            {"q": "How does first-party data advantage retail media over open web?", "difficulty": "medium"},
        ]
    },
    {
        "category": "CTV & Video",
        "questions": [
            {"q": "Explain the CTV advertising landscape. Who are the major players?", "difficulty": "medium"},
            {"q": "What challenges exist in CTV measurement and attribution?", "difficulty": "hard"},
            {"q": "How does VAST differ from VPAID? When would you use each?", "difficulty": "medium"},
            {"q": "Explain server-side ad insertion (SSAI) vs client-side.", "difficulty": "medium"},
            {"q": "What is 'ad podding' in CTV? How does it work?", "difficulty": "medium"},
        ]
    }
]


# Pydantic Models
class AnalysisRequest(BaseModel):
    resume_text: str
    jd_text: str
    linkedin_url: Optional[str] = None


class AnalysisResponse(BaseModel):
    match_score: int
    job_title: str
    company: str
    summary: str
    skill_gaps: List[Dict]
    interview_questions: List[Dict]
    action_items: List[str]
    readiness_score: Dict[str, int]
    high_impact_swaps: List[str] = []
    missing_keywords: List[str] = []


class EvaluateAnswerRequest(BaseModel):
    question: str
    answer: str
    category: str
    session_id: Optional[str] = None


class EvaluateAnswerResponse(BaseModel):
    star_scores: Dict[str, int]
    feedback: str
    follow_up: Optional[str] = None
    filler_words: List[str] = []
    filler_count: int = 0


class InterviewStartRequest(BaseModel):
    user_id: str
    job_match_id: Optional[str] = None
    mode: str = "adtech"  # adtech, general, behavioral


class InterviewMessageRequest(BaseModel):
    session_id: str
    user_message: str
    is_audio: bool = False


class ResumeBriefRequest(BaseModel):
    resume_text: str
    jd_text: str


class ResumeBriefResponse(BaseModel):
    high_impact_swaps: List[str]
    missing_keywords: List[str]
    summary: str


# Master System Prompt for Interview AI
INTERVIEW_SYSTEM_PROMPT = """You are the TalentOS Interviewer. Your tone is professional, slightly challenging, and data-driven.

RULES:
1. If the role is Adtech-related, ask about the impact of third-party cookie deprecation, header bidding, or programmatic mechanics.
2. Analyze the user's answer for filler words (um, ah, like, you know, basically, actually).
3. Grade the answer using the STAR method (Situation, Task, Action, Result).
4. Ask follow-up questions that drill deeper into their claims.
5. Do NOT provide the overall score until the very end of the session.
6. Be encouraging but push for specifics and quantifiable results.
7. If an answer is vague, ask for concrete examples with numbers.

INTERVIEW FLOW:
- Start with a warm-up behavioral question
- Move to technical/domain questions
- End with situational questions
- Provide consolidated feedback only at the end"""


# Helper function to call LLM
async def call_llm(prompt: str, system_message: str = "You are a helpful career coach.") -> str:
    """Call the Emergent LLM API using GPT-4o"""
    if not HAS_LLM:
        return None
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"talentos_{datetime.utcnow().timestamp()}",
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        return response
    except Exception as e:
        logger.error(f"LLM call failed: {e}")
        return None


def extract_skills_from_text(text: str) -> List[str]:
    """Extract skills from resume or JD text"""
    skill_patterns = [
        r"programmatic", r"dsp", r"ssp", r"header bidding", r"prebid", r"rtb",
        r"google ad manager", r"gam", r"dfp", r"dv360", r"the trade desk",
        r"amazon\s*(ads|dsp)", r"yield optimization", r"ad operations",
        r"campaign management", r"media buying", r"sql", r"python", r"excel",
        r"tableau", r"looker", r"data analysis", r"a/b testing", r"analytics",
        r"facebook ads", r"google ads", r"ppc", r"sem", r"seo", r"crm",
        r"salesforce", r"hubspot", r"marketo", r"api", r"javascript", r"html"
    ]
    
    text_lower = text.lower()
    found_skills = []
    for pattern in skill_patterns:
        if re.search(pattern, text_lower):
            found_skills.append(pattern.replace(r"\s*", " ").replace("\\", ""))
    
    return list(set(found_skills))


def detect_filler_words(text: str) -> tuple:
    """Detect filler words in speech/text"""
    filler_patterns = [
        r"\bum+\b", r"\buh+\b", r"\bah+\b", r"\ber+\b",
        r"\blike\b", r"\byou know\b", r"\bbasically\b", r"\bactually\b",
        r"\bi mean\b", r"\bkind of\b", r"\bsort of\b", r"\bi guess\b"
    ]
    
    text_lower = text.lower()
    found_fillers = []
    count = 0
    
    for pattern in filler_patterns:
        matches = re.findall(pattern, text_lower)
        if matches:
            found_fillers.extend(matches)
            count += len(matches)
    
    return found_fillers, count


# API Endpoints
@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_resume_jd(request: AnalysisRequest):
    """Analyze resume against job description with AI-powered insights"""
    try:
        resume_skills = extract_skills_from_text(request.resume_text)
        jd_skills = extract_skills_from_text(request.jd_text)
        
        # Find missing skills
        missing = [s for s in jd_skills if s not in resume_skills]
        matched = [s for s in jd_skills if s in resume_skills]
        
        # Calculate match score
        if jd_skills:
            match_percentage = int((len(matched) / len(jd_skills)) * 100)
        else:
            match_percentage = 50
        
        # Clamp between 35-95
        match_score = max(35, min(95, match_percentage))
        
        # Extract job title and company (simplified)
        job_title = "Senior Programmatic Specialist"
        company = "Target Company"
        
        # Patterns to detect job title
        title_patterns = [
            (r"manager", "Manager"),
            (r"director", "Director"),
            (r"specialist", "Specialist"),
            (r"analyst", "Analyst"),
            (r"lead", "Lead")
        ]
        for pattern, title_suffix in title_patterns:
            if re.search(pattern, request.jd_text.lower()):
                job_title = f"Ad Operations {title_suffix}"
                break
        
        # Generate high impact swaps and missing keywords
        high_impact_swaps = []
        missing_keywords = missing[:5]
        
        # Use LLM for better analysis if available
        llm_analysis = None
        if HAS_LLM:
            try:
                llm_prompt = f"""
Analyze this resume against the job description:

RESUME:
{request.resume_text[:2000]}

JOB DESCRIPTION:
{request.jd_text[:2000]}

Provide:
1. Three specific "High-Impact Swaps" - exact phrases to change in the resume
2. Five missing keywords to add
3. A 2-sentence summary of fit

Format as JSON:
{{"high_impact_swaps": ["swap1", "swap2", "swap3"], "missing_keywords": ["kw1", "kw2", "kw3", "kw4", "kw5"], "summary": "..."}}
"""
                llm_response = await call_llm(llm_prompt, "You are an expert resume optimizer. Always respond with valid JSON.")
                if llm_response:
                    try:
                        # Extract JSON from response
                        json_match = re.search(r'\{.*\}', llm_response, re.DOTALL)
                        if json_match:
                            llm_analysis = json.loads(json_match.group())
                            high_impact_swaps = llm_analysis.get("high_impact_swaps", [])[:3]
                            missing_keywords = llm_analysis.get("missing_keywords", missing[:5])
                    except:
                        pass
            except Exception as e:
                logger.error(f"LLM analysis failed: {e}")
        
        # Default high impact swaps if LLM didn't provide
        if not high_impact_swaps:
            high_impact_swaps = [
                f"Add quantifiable results: 'Managed campaigns' → 'Managed $2M+ campaigns achieving 35% ROAS improvement'",
                f"Highlight missing skill: Add experience with {missing[0] if missing else 'header bidding'}",
                "Use action verbs: 'Was responsible for' → 'Drove' or 'Optimized' or 'Led'"
            ]
        
        # Generate skill gaps analysis
        skill_gaps = []
        for skill in jd_skills[:6]:
            status = "match" if skill in resume_skills else "gap"
            skill_gaps.append({
                "skill": skill.title(),
                "status": status,
                "description": f"Experience with {skill}",
                "priority": "low" if status == "match" else "high"
            })
        
        # Get relevant interview questions
        interview_questions = []
        for category in ADTECH_KNOWLEDGE_BASE[:4]:
            q = category["questions"][0]
            interview_questions.append({
                "question": q["q"],
                "category": category["category"],
                "difficulty": q["difficulty"]
            })
        
        summary = llm_analysis.get("summary") if llm_analysis else (
            f"Based on your resume analysis, you have a {match_score}% match with this role. "
            f"Key strengths: {', '.join(matched[:3]) if matched else 'campaign management'}. "
            f"Areas to strengthen: {', '.join(missing[:3]) if missing else 'header bidding, yield optimization'}."
        )
        
        return AnalysisResponse(
            match_score=match_score,
            job_title=job_title,
            company=company,
            summary=summary,
            skill_gaps=skill_gaps,
            interview_questions=interview_questions,
            action_items=[
                f"Add {missing[0] if missing else 'header bidding'} experience to your resume",
                "Quantify achievements with percentages and dollar amounts",
                "Practice explaining RTB auction mechanics",
                "Prepare 2-3 case studies of campaign optimizations you've led"
            ],
            readiness_score={
                "technical": 70 if len(matched) > 3 else 55,
                "behavioral": 85,
                "industry_knowledge": 75 if any("programmatic" in s for s in matched) else 60,
                "communication": 80
            },
            high_impact_swaps=high_impact_swaps,
            missing_keywords=missing_keywords
        )
        
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/resume-brief", response_model=ResumeBriefResponse)
async def generate_resume_brief(request: ResumeBriefRequest):
    """Generate AI-powered resume brief with specific improvements"""
    high_impact_swaps = []
    missing_keywords = []
    summary = ""
    
    if HAS_LLM:
        try:
            prompt = f"""
You are an expert resume optimizer for ad-tech/programmatic advertising roles.

RESUME:
{request.resume_text[:3000]}

JOB DESCRIPTION:
{request.jd_text[:2000]}

Provide EXACTLY:
1. Three "High-Impact Swaps" - specific phrases to change (before → after)
2. Two critical missing keywords that MUST be added
3. A one-sentence summary

Format:
HIGH-IMPACT SWAPS:
1. [current phrase] → [improved phrase with metrics]
2. [current phrase] → [improved phrase with metrics]
3. [current phrase] → [improved phrase with metrics]

MISSING KEYWORDS:
1. [keyword]
2. [keyword]

SUMMARY: [one sentence]
"""
            response = await call_llm(prompt, "You are a senior ad-tech recruiter optimizing resumes.")
            
            if response:
                # Parse the response
                lines = response.split('\n')
                in_swaps = False
                in_keywords = False
                
                for line in lines:
                    line = line.strip()
                    if 'HIGH-IMPACT SWAPS' in line.upper():
                        in_swaps = True
                        in_keywords = False
                        continue
                    if 'MISSING KEYWORDS' in line.upper():
                        in_swaps = False
                        in_keywords = True
                        continue
                    if 'SUMMARY' in line.upper():
                        in_swaps = False
                        in_keywords = False
                        summary = line.replace('SUMMARY:', '').strip()
                        continue
                    
                    if in_swaps and ('→' in line or '->' in line):
                        high_impact_swaps.append(line.lstrip('0123456789. '))
                    elif in_keywords and line and line[0].isdigit():
                        kw = line.lstrip('0123456789. ')
                        if kw:
                            missing_keywords.append(kw)
                
        except Exception as e:
            logger.error(f"Resume brief LLM error: {e}")
    
    # Defaults if LLM failed
    if not high_impact_swaps:
        high_impact_swaps = [
            "'Managed campaigns' → 'Managed $1.5M monthly ad spend achieving 42% ROAS improvement'",
            "'Worked on optimization' → 'Led yield optimization initiatives increasing CPMs by 28%'",
            "'Experience with DSPs' → 'Expert in DV360, The Trade Desk, and Amazon DSP with certified credentials'"
        ]
    
    if not missing_keywords:
        missing_keywords = ["header bidding", "Prebid.js"]
    
    if not summary:
        summary = "Your resume shows strong campaign management skills but needs more quantifiable metrics and technical depth in header bidding."
    
    return ResumeBriefResponse(
        high_impact_swaps=high_impact_swaps[:3],
        missing_keywords=missing_keywords[:2],
        summary=summary
    )


@router.post("/interview/start")
async def start_interview_session(request: InterviewStartRequest):
    """Start a new mock interview session"""
    # Check if db is available
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Get first question based on mode
    if request.mode == "adtech":
        category = ADTECH_KNOWLEDGE_BASE[0]
        first_question = category["questions"][0]["q"]
        category_name = category["category"]
    else:
        first_question = "Tell me about yourself and why you're interested in this role."
        category_name = "Introduction"
    
    # Create session
    session_doc = {
        "session_id": generate_id("interview"),
        "user_id": request.user_id,
        "job_match_id": request.job_match_id,
        "mode": request.mode,
        "status": "active",
        "transcript": [
            {
                "role": "interviewer",
                "content": f"Welcome to your mock interview. Let's begin.\n\n{first_question}",
                "category": category_name,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        ],
        "question_index": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.interview_sessions.insert_one(session_doc)
    
    return {
        "session_id": session_doc["session_id"],
        "first_question": first_question,
        "category": category_name,
        "mode": request.mode
    }


@router.post("/interview/message")
async def process_interview_message(request: InterviewMessageRequest):
    """Process user's interview response and generate follow-up"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Get session
    session = await db.interview_sessions.find_one(
        {"session_id": request.session_id},
        {"_id": 0}
    )
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.get("status") == "completed":
        raise HTTPException(status_code=400, detail="Session already completed")
    
    # Detect filler words
    fillers, filler_count = detect_filler_words(request.user_message)
    
    # Score with STAR method
    answer_lower = request.user_message.lower()
    star_scores = {
        "situation": min(100, max(30, sum(20 for kw in ["when", "at", "company", "team", "project"] if kw in answer_lower))),
        "task": min(100, max(25, sum(20 for kw in ["responsible", "needed to", "goal", "objective"] if kw in answer_lower))),
        "action": min(100, max(40, sum(15 for kw in ["i", "implemented", "created", "led", "built", "developed"] if kw in answer_lower))),
        "result": min(100, max(20, sum(20 for kw in ["result", "outcome", "increased", "improved", "%"] if kw in answer_lower)))
    }
    
    # Update transcript
    transcript = session.get("transcript", [])
    transcript.append({
        "role": "user",
        "content": request.user_message,
        "star_scores": star_scores,
        "filler_count": filler_count,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    # Get next question
    question_index = session.get("question_index", 0) + 1
    mode = session.get("mode", "adtech")
    
    # Determine response
    if question_index >= 5:
        # End interview
        status = "completed"
        overall_score = int(sum([
            sum(star_scores.values()) / 4,
            100 - (filler_count * 5)
        ]) / 2)
        
        response_content = f"""Thank you for completing this mock interview!

Here's your performance summary:
- STAR Method Score: {int(sum(star_scores.values()) / 4)}%
- Filler Words Used: {filler_count}
- Overall Score: {overall_score}/100

Key feedback:
- {"Great structure using the STAR method!" if star_scores["result"] > 60 else "Try to include more quantifiable results in your answers."}
- {"Watch out for filler words like 'um', 'like', 'basically'." if filler_count > 3 else "Good control of speech patterns."}
"""
        category_name = "Feedback"
        
        # Update session
        await db.interview_sessions.update_one(
            {"session_id": request.session_id},
            {"$set": {
                "transcript": transcript,
                "status": status,
                "overall_score": overall_score,
                "feedback": {
                    "star_scores": star_scores,
                    "filler_count": filler_count,
                    "overall_score": overall_score
                },
                "completed_at": datetime.now(timezone.utc).isoformat()
            }}
        )
    else:
        # Get next question
        if mode == "adtech" and question_index < len(ADTECH_KNOWLEDGE_BASE):
            category = ADTECH_KNOWLEDGE_BASE[question_index % len(ADTECH_KNOWLEDGE_BASE)]
            next_q = category["questions"][0]["q"]
            category_name = category["category"]
        else:
            next_q = "Can you give me a specific example where you overcame a significant challenge?"
            category_name = "Behavioral"
        
        # Generate AI follow-up if available
        if HAS_LLM and star_scores["result"] < 50:
            try:
                last_q = transcript[-2]["content"] if len(transcript) > 1 else ""
                follow_up_prompt = f"""
The candidate answered this question: "{last_q}"
With this response: "{request.user_message[:500]}"

They didn't include quantifiable results. Generate a brief, probing follow-up question to get specific metrics.
Keep it under 30 words.
"""
                follow_up = await call_llm(follow_up_prompt, INTERVIEW_SYSTEM_PROMPT)
                if follow_up:
                    response_content = f"Interesting. {follow_up}\n\nNext question:\n{next_q}"
                else:
                    response_content = f"Good. Can you quantify the impact of your actions?\n\nMoving on:\n{next_q}"
            except:
                response_content = f"Thank you. Let's move on.\n\n{next_q}"
        else:
            response_content = f"Thank you for that answer.\n\n{next_q}"
        
        status = "active"
        
        # Add interviewer response
        transcript.append({
            "role": "interviewer",
            "content": response_content,
            "category": category_name,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        await db.interview_sessions.update_one(
            {"session_id": request.session_id},
            {"$set": {
                "transcript": transcript,
                "question_index": question_index
            }}
        )
    
    return {
        "response": response_content,
        "star_scores": star_scores,
        "filler_words": fillers,
        "filler_count": filler_count,
        "status": status,
        "question_index": question_index,
        "category": category_name
    }


@router.get("/interview/{session_id}")
async def get_interview_session(session_id: str):
    """Get interview session details"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    session = await db.interview_sessions.find_one(
        {"session_id": session_id},
        {"_id": 0}
    )
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return session


@router.post("/evaluate-answer", response_model=EvaluateAnswerResponse)
async def evaluate_interview_answer(request: EvaluateAnswerRequest):
    """Evaluate a single interview answer using STAR method"""
    try:
        answer_lower = request.answer.lower()
        answer_words = len(request.answer.split())
        
        # STAR scoring
        situation_score = min(100, max(30, sum(20 for kw in ["when", "at", "company", "role", "project", "team", "client", "situation"] if kw in answer_lower)))
        task_score = min(100, max(25, sum(20 for kw in ["responsible", "task", "goal", "objective", "needed to", "had to", "assigned"] if kw in answer_lower)))
        action_score = min(100, max(40, sum(15 for kw in ["i", "implemented", "created", "developed", "built", "analyzed", "optimized", "led"] if kw in answer_lower)))
        result_score = min(100, max(20, sum(20 for kw in ["result", "outcome", "increased", "decreased", "improved", "achieved", "%", "revenue"] if kw in answer_lower)))
        
        # Length bonus
        length_bonus = 10 if 150 <= answer_words <= 300 else 0
        situation_score = min(100, situation_score + length_bonus)
        task_score = min(100, task_score + length_bonus)
        action_score = min(100, action_score + length_bonus)
        result_score = min(100, result_score + length_bonus)
        
        # Detect fillers
        fillers, filler_count = detect_filler_words(request.answer)
        
        # Generate feedback
        feedback_parts = []
        if situation_score < 60:
            feedback_parts.append("Provide more context about the situation.")
        if task_score < 60:
            feedback_parts.append("Clarify your specific responsibility.")
        if action_score < 60:
            feedback_parts.append("Focus on the specific actions YOU took.")
        if result_score < 60:
            feedback_parts.append("Include quantifiable results.")
        if filler_count > 3:
            feedback_parts.append(f"Reduce filler words ({filler_count} detected).")
        
        feedback = " ".join(feedback_parts) if feedback_parts else "Strong answer! You covered all STAR components well."
        
        # Generate follow-up if LLM available
        follow_up = None
        if HAS_LLM and result_score < 60:
            try:
                llm_followup = await call_llm(
                    f"Generate a brief follow-up question to get specific metrics for this answer: '{request.answer[:300]}...'",
                    "You are an ad-tech hiring manager. Keep response under 25 words."
                )
                if llm_followup:
                    follow_up = llm_followup
            except:
                pass
        
        return EvaluateAnswerResponse(
            star_scores={
                "situation": situation_score,
                "task": task_score,
                "action": action_score,
                "result": result_score
            },
            feedback=feedback,
            follow_up=follow_up,
            filler_words=fillers,
            filler_count=filler_count
        )
        
    except Exception as e:
        logger.error(f"Evaluation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/questions/{category}")
async def get_interview_questions(category: str = "all", difficulty: str = "all"):
    """Get interview questions from knowledge base"""
    questions = []
    
    for cat in ADTECH_KNOWLEDGE_BASE:
        if category.lower() == "all" or category.lower() in cat["category"].lower():
            for q in cat["questions"]:
                if difficulty == "all" or q["difficulty"] == difficulty:
                    questions.append({
                        "question": q["q"],
                        "category": cat["category"],
                        "difficulty": q["difficulty"]
                    })
    
    return {"questions": questions}


@router.delete("/user/{user_id}")
async def delete_user_data(user_id: str):
    """Delete all user data (GDPR compliance)"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Delete from all collections
    collections = ["users", "resumes", "job_matches", "interview_sessions", "payments", "saved_jobs"]
    deleted_counts = {}
    
    for collection in collections:
        try:
            result = await db[collection].delete_many({"user_id": user_id})
            deleted_counts[collection] = result.deleted_count
        except Exception as e:
            logger.error(f"Error deleting from {collection}: {e}")
            deleted_counts[collection] = 0
    
    # Also delete from user_sessions
    await db.user_sessions.delete_many({"user_id": user_id})
    
    return {
        "success": True,
        "user_id": user_id,
        "deleted_counts": deleted_counts
    }


@router.get("/health")
async def health_check():
    """Health check for TalentOS API"""
    return {
        "status": "healthy",
        "service": "talentos",
        "llm_available": HAS_LLM,
        "knowledge_base_categories": len(ADTECH_KNOWLEDGE_BASE),
        "timestamp": datetime.utcnow().isoformat()
    }
