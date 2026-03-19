"""
AI Insights Service - Gemini 3 Flash Integration
"""
from fastapi import APIRouter, HTTPException, Request
from datetime import datetime, timezone
import os
import logging
from typing import Dict, Any

from emergentintegrations.llm.chat import LlmChat, UserMessage
from models.database import AIInsightRequest
from routes.auth import get_current_user

router = APIRouter(prefix="/ai", tags=["AI Insights"])
logger = logging.getLogger(__name__)

# Database reference
db = None

def set_db(database):
    global db
    db = database


SYSTEM_PROMPT = """You are an expert Amazon Seller Analytics AI for AdsGupta, an AI advertising platform. 
Your role is to analyze e-commerce and advertising metrics and provide actionable, data-driven recommendations.

When analyzing data:
1. Identify key trends and patterns
2. Highlight concerning metrics that need attention
3. Provide specific, actionable recommendations
4. Use plain English, avoiding jargon where possible
5. Prioritize insights by potential business impact
6. Reference specific numbers from the data provided

Format your response as:
- **Key Insights**: 2-3 most important observations
- **Recommendations**: 3-5 specific actions to take
- **Watch List**: Any metrics that need monitoring

Keep responses concise but insightful - aim for 150-200 words maximum."""


async def generate_insights(metrics: Dict[str, Any], period: str = "last_7_days") -> str:
    """Generate AI insights from metrics using Gemini 3 Flash"""
    
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        logger.warning("EMERGENT_LLM_KEY not configured")
        return "AI insights unavailable. Please configure the AI integration."
    
    # Build the prompt
    prompt = f"""Analyze the following Amazon seller metrics for the {period} period and provide strategic recommendations:

**Traffic & Conversion:**
- Total Sessions: {metrics.get('total_sessions', 0):,}
- Total Page Views: {metrics.get('total_page_views', 0):,}
- Average Conversion Rate: {metrics.get('avg_conversion_rate', 0):.2f}%
- Average Buy Box %: {metrics.get('avg_buy_box_percentage', 0):.2f}%

**Sales Performance:**
- Total Sales: ${metrics.get('total_sales', 0):,.2f}
- Total Units Sold: {metrics.get('total_units', 0):,}
- Total Orders: {metrics.get('total_orders', 0):,}

**PPC Advertising:**
- Total Ad Spend: ${metrics.get('total_ppc_spend', 0):,.2f}
- PPC Sales: ${metrics.get('total_ppc_sales', 0):,.2f}
- ACOS (Advertising Cost of Sales): {metrics.get('avg_acos', 0):.2f}%
- TACOS (Total ACOS): {metrics.get('avg_tacos', 0):.2f}%
- ROAS (Return on Ad Spend): {metrics.get('avg_roas', 0):.2f}x

**Financial Health:**
- Total Revenue: ${metrics.get('total_revenue', 0):,.2f}
- Total Fees: ${metrics.get('total_fees', 0):,.2f}
- Total Refunds: ${metrics.get('total_refunds', 0):,.2f}
- Refund Rate: {metrics.get('refund_rate', 0):.2f}%
- Net Profit: ${metrics.get('net_profit', 0):,.2f}

Provide actionable insights and recommendations."""

    try:
        chat = LlmChat(
            api_key=api_key,
            session_id=f"insights_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}",
            system_message=SYSTEM_PROMPT
        ).with_model("gemini", "gemini-3-flash-preview")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        return response
        
    except Exception as e:
        logger.error(f"AI insight generation failed: {e}")
        return f"Unable to generate insights at this time. Error: {str(e)}"


@router.post("/insights")
async def get_ai_insights(request: Request, insight_request: AIInsightRequest):
    """Generate AI-powered insights from provided metrics"""
    user = await get_current_user(request)
    
    insights = await generate_insights(
        metrics=insight_request.metrics,
        period=insight_request.period
    )
    
    # Store the insight for history
    insight_doc = {
        "user_id": user["user_id"],
        "metrics_snapshot": insight_request.metrics,
        "period": insight_request.period,
        "insights": insights,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.ai_insights.insert_one(insight_doc)
    
    return {
        "insights": insights,
        "generated_at": datetime.now(timezone.utc).isoformat()
    }


@router.get("/insights/latest")
async def get_latest_insight(request: Request):
    """Get the most recent AI insight for the user"""
    user = await get_current_user(request)
    
    insight = await db.ai_insights.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0},
        sort=[("created_at", -1)]
    )
    
    if not insight:
        return {"insights": None, "message": "No insights generated yet"}
    
    return insight


@router.get("/insights/history")
async def get_insights_history(request: Request, limit: int = 10):
    """Get history of AI insights"""
    user = await get_current_user(request)
    
    insights = await db.ai_insights.find(
        {"user_id": user["user_id"]},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return {"insights": insights}
