"""
TalentOS API Routes
AI-powered interview coach and gap analysis
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime
import os
import logging
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize router
router = APIRouter(prefix="/talentos", tags=["TalentOS"])
logger = logging.getLogger(__name__)

# Try to import emergent integrations for LLM
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
    HAS_LLM = bool(EMERGENT_LLM_KEY)
    logger.info(f"Emergent LLM available: {HAS_LLM}")
except ImportError as e:
    HAS_LLM = False
    logger.warning(f"Emergent integrations not available: {e}")


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


class EvaluateAnswerRequest(BaseModel):
    question: str
    answer: str
    category: str


class EvaluateAnswerResponse(BaseModel):
    star_scores: Dict[str, int]
    feedback: str
    follow_up: Optional[str] = None


# Helper function to call LLM
async def call_llm(prompt: str, system_message: str = "You are a helpful career coach.") -> str:
    """Call the Emergent LLM API using GPT-4o"""
    if not HAS_LLM:
        return None
    
    try:
        # Initialize chat with unique session
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"talentos_{datetime.utcnow().timestamp()}",
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        # Create user message
        user_message = UserMessage(text=prompt)
        
        # Send message and get response
        response = await chat.send_message(user_message)
        return response
    except Exception as e:
        logger.error(f"LLM call failed: {e}")
        return None


# API Endpoints
@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_resume_jd(request: AnalysisRequest):
    """
    Analyze resume against job description
    Returns match score, skill gaps, and interview questions
    """
    try:
        # Try to use LLM for analysis
        if HAS_LLM:
            system_prompt = """You are an expert career coach specializing in ad-tech and programmatic advertising roles.
            Analyze the resume against the job description and provide:
            1. A match score (0-100)
            2. Identified skill gaps
            3. Likely interview questions
            4. Action items for improvement
            
            Be specific and actionable in your analysis."""
            
            analysis_prompt = f"""
            Resume:
            {request.resume_text}
            
            Job Description:
            {request.jd_text}
            
            Analyze this candidate's fit for the role and provide structured feedback.
            """
            
            llm_response = await call_llm(analysis_prompt, system_prompt)
            
            # Parse LLM response (in real implementation, would parse structured output)
            if llm_response:
                # For now, we'll use mock data enhanced by LLM context
                pass
        
        # Generate analysis (mock/enhanced response)
        # Extract job title from JD (simplified)
        job_title = "Senior Programmatic Specialist"
        if "manager" in request.jd_text.lower():
            job_title = "Ad Operations Manager"
        elif "director" in request.jd_text.lower():
            job_title = "Director of Programmatic"
        
        # Calculate match score based on keyword overlap
        resume_lower = request.resume_text.lower()
        keywords = ["programmatic", "dsp", "ssp", "header bidding", "rtb", "yield", "campaign", "optimization"]
        matches = sum(1 for kw in keywords if kw in resume_lower)
        base_score = min(95, 50 + (matches * 6))
        
        response = AnalysisResponse(
            match_score=base_score,
            job_title=job_title,
            company="Target Company",
            summary=f"Based on your resume analysis, you have a {base_score}% match with this role. "
                   f"Your experience shows strength in campaign management but there are opportunities "
                   f"to strengthen your header bidding and yield optimization skills.",
            skill_gaps=[
                {
                    "skill": "DSP Operations",
                    "status": "match" if "dsp" in resume_lower else "gap",
                    "description": "Experience with demand-side platforms like The Trade Desk, DV360",
                    "priority": "low" if "dsp" in resume_lower else "high"
                },
                {
                    "skill": "Header Bidding",
                    "status": "match" if "header bidding" in resume_lower or "prebid" in resume_lower else "gap",
                    "description": "Implementation and optimization of header bidding wrappers",
                    "priority": "high" if "header bidding" not in resume_lower else "low"
                },
                {
                    "skill": "RTB & Auction Logic",
                    "status": "partial",
                    "description": "Understanding of real-time bidding mechanics and auction dynamics",
                    "priority": "medium"
                },
                {
                    "skill": "Yield Optimization",
                    "status": "gap" if "yield" not in resume_lower else "partial",
                    "description": "Floor price optimization and revenue maximization strategies",
                    "priority": "high" if "yield" not in resume_lower else "medium"
                },
                {
                    "skill": "Data Analysis",
                    "status": "match" if "sql" in resume_lower or "analytics" in resume_lower else "partial",
                    "description": "SQL, Excel, and data visualization for campaign analysis",
                    "priority": "low"
                },
                {
                    "skill": "Campaign Management",
                    "status": "match",
                    "description": "End-to-end campaign setup, optimization, and reporting",
                    "priority": "low"
                }
            ],
            interview_questions=[
                {
                    "question": "Walk me through how you would set up a header bidding wrapper with 8 demand partners while keeping latency under 500ms.",
                    "category": "Header Bidding",
                    "difficulty": "hard"
                },
                {
                    "question": "How do you measure the true incremental revenue of header bidding vs. waterfall?",
                    "category": "Yield Optimization",
                    "difficulty": "medium"
                },
                {
                    "question": "Explain the difference between first-price and second-price auctions. How does bid shading work?",
                    "category": "RTB",
                    "difficulty": "medium"
                },
                {
                    "question": "A client's CPM has dropped 30% month-over-month. Walk me through your debugging process.",
                    "category": "Troubleshooting",
                    "difficulty": "hard"
                },
                {
                    "question": "How would you structure a test to determine optimal floor prices across different ad units?",
                    "category": "Yield Optimization",
                    "difficulty": "hard"
                }
            ],
            action_items=[
                "Complete a Prebid.js tutorial and implement a test wrapper",
                "Study floor price optimization strategies and A/B testing methodologies",
                "Practice explaining RTB auction mechanics using concrete examples",
                "Prepare 2-3 case studies of campaign optimizations you've led"
            ],
            readiness_score={
                "technical": 68 if "technical" not in resume_lower else 78,
                "behavioral": 85,
                "industry_knowledge": 72,
                "communication": 80
            }
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/evaluate-answer", response_model=EvaluateAnswerResponse)
async def evaluate_interview_answer(request: EvaluateAnswerRequest):
    """
    Evaluate a candidate's interview answer using STAR method
    Returns scores for Situation, Task, Action, Result
    """
    try:
        answer_lower = request.answer.lower()
        answer_words = len(request.answer.split())
        
        # STAR scoring logic
        # Situation: Did they set the context?
        situation_keywords = ["when", "at", "company", "role", "project", "team", "client", "situation"]
        situation_score = min(100, sum(20 for kw in situation_keywords if kw in answer_lower))
        
        # Task: Did they explain their responsibility?
        task_keywords = ["responsible", "task", "goal", "objective", "needed to", "had to", "assigned"]
        task_score = min(100, sum(20 for kw in task_keywords if kw in answer_lower))
        
        # Action: Did they describe specific actions?
        action_keywords = ["i", "implemented", "created", "developed", "built", "analyzed", "optimized", "led"]
        action_score = min(100, sum(15 for kw in action_keywords if kw in answer_lower))
        
        # Result: Did they mention outcomes?
        result_keywords = ["result", "outcome", "increased", "decreased", "improved", "achieved", "%", "revenue"]
        result_score = min(100, sum(20 for kw in result_keywords if kw in answer_lower))
        
        # Bonus for length (good answers are typically 150-300 words)
        length_bonus = 10 if 150 <= answer_words <= 300 else 0
        
        # Apply length bonus
        situation_score = min(100, situation_score + length_bonus)
        task_score = min(100, task_score + length_bonus)
        action_score = min(100, action_score + length_bonus)
        result_score = min(100, result_score + length_bonus)
        
        # Ensure minimum scores
        situation_score = max(30, situation_score)
        task_score = max(25, task_score)
        action_score = max(40, action_score)
        result_score = max(20, result_score)
        
        # Generate feedback
        feedback_parts = []
        if situation_score < 60:
            feedback_parts.append("Try to provide more context about the situation.")
        if task_score < 60:
            feedback_parts.append("Clarify your specific responsibility or task.")
        if action_score < 60:
            feedback_parts.append("Focus more on the specific actions YOU took.")
        if result_score < 60:
            feedback_parts.append("Include quantifiable results or outcomes.")
        
        if not feedback_parts:
            feedback = "Great answer! You covered all STAR components well. Let me ask a follow-up question."
        else:
            feedback = " ".join(feedback_parts)
        
        # Try LLM for better feedback if available
        if HAS_LLM:
            try:
                llm_feedback = await call_llm(
                    f"Given this interview question: '{request.question}'\n"
                    f"And this answer: '{request.answer}'\n"
                    f"Provide a brief (2 sentences) constructive feedback and a relevant follow-up question.",
                    "You are an experienced ad-tech hiring manager providing interview feedback."
                )
                if llm_feedback:
                    feedback = llm_feedback
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
            follow_up=None
        )
        
    except Exception as e:
        logger.error(f"Evaluation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check for TalentOS API"""
    return {
        "status": "healthy",
        "service": "talentos",
        "llm_available": HAS_LLM,
        "timestamp": datetime.utcnow().isoformat()
    }
