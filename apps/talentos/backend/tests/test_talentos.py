"""
TalentOS API Backend Tests
Tests for interview, job search, payments, and resume analysis endpoints
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://monetization-ai.preview.emergentagent.com')

class TestTalentOSHealth:
    """Health check tests for TalentOS endpoints"""
    
    def test_talentos_health_endpoint(self):
        """Test TalentOS health endpoint returns healthy status and LLM availability"""
        response = requests.get(f"{BASE_URL}/api/talentos/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "talentos"
        assert "llm_available" in data
        assert data["knowledge_base_categories"] == 10  # 10 adtech categories
        print(f"TalentOS health: LLM available={data['llm_available']}")


class TestInterviewFlow:
    """Interview session start and message flow tests"""
    
    def test_interview_start_returns_first_question(self):
        """Test /interview/start returns session_id and first question from adtech knowledge base"""
        response = requests.post(
            f"{BASE_URL}/api/talentos/interview/start",
            json={
                "user_id": "TEST_user_interview",
                "mode": "adtech"
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "session_id" in data
        assert data["session_id"].startswith("interview_")
        assert "first_question" in data
        assert len(data["first_question"]) > 20  # Should be a real question
        assert data["category"] == "Header Bidding"  # First category
        assert data["mode"] == "adtech"
        print(f"Interview started: session_id={data['session_id']}")
        return data["session_id"]
    
    def test_interview_message_returns_star_scores(self):
        """Test /interview/message returns STAR scores and follow-up"""
        # First start a session
        start_response = requests.post(
            f"{BASE_URL}/api/talentos/interview/start",
            json={
                "user_id": "TEST_user_star_scoring",
                "mode": "adtech"
            }
        )
        assert start_response.status_code == 200
        session_id = start_response.json()["session_id"]
        
        # Send a response with STAR method elements
        answer = """
        When I was at my previous company (Situation), I was responsible for implementing 
        server-side header bidding (Task). I led the migration from Prebid.js client-side 
        to server-side architecture using Amazon TAM (Action). This resulted in 40% latency 
        reduction and 15% CPM improvement (Result).
        """
        
        response = requests.post(
            f"{BASE_URL}/api/talentos/interview/message",
            json={
                "session_id": session_id,
                "user_message": answer
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "star_scores" in data
        assert "situation" in data["star_scores"]
        assert "task" in data["star_scores"]
        assert "action" in data["star_scores"]
        assert "result" in data["star_scores"]
        assert data["star_scores"]["situation"] > 0
        assert data["star_scores"]["result"] > 0  # Should detect "resulted"
        assert "filler_count" in data
        assert data["status"] in ["active", "completed"]
        print(f"STAR scores: {data['star_scores']}")
    
    def test_interview_message_detects_filler_words(self):
        """Test filler word detection in interview responses"""
        start_response = requests.post(
            f"{BASE_URL}/api/talentos/interview/start",
            json={
                "user_id": "TEST_user_fillers",
                "mode": "adtech"
            }
        )
        session_id = start_response.json()["session_id"]
        
        # Answer with filler words
        answer = "Um, basically, like, you know, I would say that header bidding is, um, like a way to get more bids."
        
        response = requests.post(
            f"{BASE_URL}/api/talentos/interview/message",
            json={
                "session_id": session_id,
                "user_message": answer
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["filler_count"] > 0  # Should detect um, like, basically, you know
        print(f"Filler words detected: {data['filler_count']}, words: {data.get('filler_words', [])}")


class TestResumeAnalysis:
    """Resume-to-JD analysis endpoint tests"""
    
    def test_analyze_returns_match_score(self):
        """Test /analyze endpoint returns match score and skill gaps"""
        resume = """
        Senior Programmatic Specialist with 5 years experience in DSP, SSP, 
        header bidding, Prebid.js, DV360, The Trade Desk, and yield optimization.
        Managed $2M+ monthly ad spend. Led campaign optimization achieving 35% ROAS improvement.
        """
        
        jd = """
        Looking for a Programmatic Manager with experience in header bidding, RTB, 
        DSP platforms like DV360 and The Trade Desk. Must have strong analytical skills.
        Experience with Google Ad Manager and yield optimization required.
        """
        
        response = requests.post(
            f"{BASE_URL}/api/talentos/analyze",
            json={
                "resume_text": resume,
                "jd_text": jd
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "match_score" in data
        assert 35 <= data["match_score"] <= 95  # Clamped range
        assert "skill_gaps" in data
        assert isinstance(data["skill_gaps"], list)
        assert "interview_questions" in data
        assert len(data["interview_questions"]) > 0
        assert "high_impact_swaps" in data
        assert len(data["high_impact_swaps"]) > 0
        assert "missing_keywords" in data
        print(f"Match score: {data['match_score']}%, gaps: {len(data['skill_gaps'])}")
    
    def test_analyze_identifies_skill_gaps(self):
        """Test analysis identifies missing skills from resume"""
        # Resume missing RTB experience
        resume = "Campaign manager with Facebook Ads experience."
        jd = "Need programmatic specialist with RTB, DSP, header bidding, Prebid.js expertise."
        
        response = requests.post(
            f"{BASE_URL}/api/talentos/analyze",
            json={
                "resume_text": resume,
                "jd_text": jd
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        # Should have gaps since resume is missing key skills
        gaps = [g for g in data["skill_gaps"] if g.get("status") == "gap"]
        assert len(gaps) > 0
        print(f"Identified {len(gaps)} skill gaps")


class TestJobSearch:
    """Job discovery endpoint tests using Adzuna API"""
    
    def test_jobs_config_returns_adzuna_status(self):
        """Test /jobs/config returns Adzuna API configuration"""
        response = requests.get(f"{BASE_URL}/api/jobs/config")
        assert response.status_code == 200
        
        data = response.json()
        assert "adzuna_enabled" in data
        assert "supported_countries" in data
        assert "adtech_keywords" in data
        print(f"Adzuna enabled: {data['adzuna_enabled']}")
    
    def test_job_search_returns_results(self):
        """Test /jobs/search returns job listings from Adzuna API"""
        response = requests.post(
            f"{BASE_URL}/api/jobs/search",
            json={
                "keywords": "marketing manager",
                "location": "in",
                "adtech_only": False,
                "results_per_page": 5
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            job = data[0]
            assert "job_id" in job
            assert "title" in job
            assert "company" in job
            assert "location" in job
            assert "url" in job
            print(f"Found {len(data)} jobs, first: {job['title']} at {job['company']}")
    
    def test_job_search_filters_adtech(self):
        """Test adtech filter returns only ad-tech related jobs"""
        response = requests.post(
            f"{BASE_URL}/api/jobs/search",
            json={
                "keywords": "programmatic",
                "location": "us",
                "adtech_only": True,
                "results_per_page": 10
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        # If results found, they should be adtech
        for job in data:
            if job.get("is_adtech") is not None:
                # Check job has adtech keywords or is flagged
                assert job.get("is_adtech") == True or len(job.get("match_keywords", [])) > 0
        print(f"Adtech jobs found: {len(data)}")
    
    def test_job_scrape_returns_mock_data(self):
        """Test /jobs/scrape returns mock data (actual scraping not implemented)"""
        response = requests.post(
            f"{BASE_URL}/api/jobs/scrape",
            json={
                "url": "https://www.linkedin.com/jobs/view/123456789"
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "title" in data
        assert "company" in data
        assert "description" in data
        assert "skills" in data
        print("Job scrape endpoint working (MOCKED)")


class TestPayments:
    """Payment configuration and Razorpay integration tests"""
    
    def test_payments_config_returns_pricing(self):
        """Test /payments/config returns pricing and Razorpay key"""
        response = requests.get(f"{BASE_URL}/api/payments/config")
        assert response.status_code == 200
        
        data = response.json()
        assert "enabled" in data
        assert data["enabled"] == True
        assert "key_id" in data
        assert data["key_id"].startswith("rzp_")
        assert "pricing" in data
        
        # Check pricing tiers
        pricing = data["pricing"]
        assert "pro_monthly" in pricing
        assert "pro_yearly" in pricing
        assert "pro_trial" in pricing
        
        # Verify amounts
        assert pricing["pro_monthly"]["amount"] == 99900  # ₹999
        assert pricing["pro_yearly"]["amount"] == 799900  # ₹7999
        assert pricing["pro_trial"]["amount"] == 100  # ₹1
        
        print(f"Razorpay enabled: key={data['key_id'][:15]}...")
    
    def test_payments_config_displays_amounts(self):
        """Test pricing displays correctly formatted amounts"""
        response = requests.get(f"{BASE_URL}/api/payments/config")
        data = response.json()
        
        for plan_key, plan in data["pricing"].items():
            assert "amount_display" in plan
            assert plan["amount_display"].startswith("₹")
        
        print("Pricing amounts formatted correctly")


class TestInterviewQuestions:
    """Interview questions knowledge base tests"""
    
    def test_get_questions_all_categories(self):
        """Test /questions/all returns questions from all categories"""
        response = requests.get(f"{BASE_URL}/api/talentos/questions/all")
        assert response.status_code == 200
        
        data = response.json()
        assert "questions" in data
        questions = data["questions"]
        assert len(questions) > 40  # Should have 50+ questions
        
        # Check categories are diverse
        categories = set(q["category"] for q in questions)
        assert len(categories) >= 8  # At least 8 different categories
        print(f"Total questions: {len(questions)}, categories: {len(categories)}")
    
    def test_get_questions_by_category(self):
        """Test filtering questions by specific category"""
        response = requests.get(f"{BASE_URL}/api/talentos/questions/Header%20Bidding")
        assert response.status_code == 200
        
        data = response.json()
        questions = data["questions"]
        assert len(questions) > 0
        for q in questions:
            assert "Header Bidding" in q["category"]
        print(f"Header Bidding questions: {len(questions)}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
