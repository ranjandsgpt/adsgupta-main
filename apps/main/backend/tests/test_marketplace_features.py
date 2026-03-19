"""
Backend API Tests for AdsGupta Marketplace Re-Architecture Phase 2
Tests:
- Lead capture API with marketplace source tracking
- Health endpoint verification
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestLeadCaptureWithMarketplace:
    """Tests for lead capture API with marketplace source tracking"""
    
    def test_lead_capture_walmart_waitlist(self):
        """Test lead capture for Walmart marketplace waitlist"""
        unique_email = f"test_walmart_{uuid.uuid4().hex[:8]}@example.com"
        
        response = requests.post(f"{BASE_URL}/api/leads/capture", json={
            "email": unique_email,
            "source": "marketplace_waitlist_walmart",
            "marketplace": "Walmart"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "message" in data
    
    def test_lead_capture_blinkit_waitlist(self):
        """Test lead capture for Blinkit marketplace waitlist"""
        unique_email = f"test_blinkit_{uuid.uuid4().hex[:8]}@example.com"
        
        response = requests.post(f"{BASE_URL}/api/leads/capture", json={
            "email": unique_email,
            "source": "marketplace_waitlist_blinkit",
            "marketplace": "Blinkit"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
    
    def test_lead_capture_swiggy_waitlist(self):
        """Test lead capture for Swiggy Instamart marketplace waitlist"""
        unique_email = f"test_swiggy_{uuid.uuid4().hex[:8]}@example.com"
        
        response = requests.post(f"{BASE_URL}/api/leads/capture", json={
            "email": unique_email,
            "source": "marketplace_waitlist_swiggy",
            "marketplace": "Swiggy Instamart"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
    
    def test_lead_capture_zomato_waitlist(self):
        """Test lead capture for Zomato marketplace waitlist"""
        unique_email = f"test_zomato_{uuid.uuid4().hex[:8]}@example.com"
        
        response = requests.post(f"{BASE_URL}/api/leads/capture", json={
            "email": unique_email,
            "source": "marketplace_waitlist_zomato",
            "marketplace": "Zomato"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
    
    def test_lead_capture_duplicate_email(self):
        """Test lead capture handles duplicate emails gracefully"""
        unique_email = f"test_dup_{uuid.uuid4().hex[:8]}@example.com"
        
        # First submission
        response1 = requests.post(f"{BASE_URL}/api/leads/capture", json={
            "email": unique_email,
            "source": "marketplace_waitlist_walmart",
            "marketplace": "Walmart"
        })
        assert response1.status_code == 200
        
        # Second submission (duplicate)
        response2 = requests.post(f"{BASE_URL}/api/leads/capture", json={
            "email": unique_email,
            "source": "marketplace_waitlist_blinkit",
            "marketplace": "Blinkit"
        })
        
        assert response2.status_code == 200
        data = response2.json()
        assert data["success"] == True
        assert data["message"] == "Welcome back!"
    
    def test_lead_capture_invalid_email(self):
        """Test lead capture rejects invalid email format"""
        response = requests.post(f"{BASE_URL}/api/leads/capture", json={
            "email": "not-an-email",
            "source": "marketplace_waitlist_walmart",
            "marketplace": "Walmart"
        })
        
        # Should return 422 Unprocessable Entity for validation error
        assert response.status_code == 422
    
    def test_lead_capture_without_marketplace(self):
        """Test lead capture works without marketplace field (backward compatibility)"""
        unique_email = f"test_no_mp_{uuid.uuid4().hex[:8]}@example.com"
        
        response = requests.post(f"{BASE_URL}/api/leads/capture", json={
            "email": unique_email,
            "source": "neural_map"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True


class TestHealthEndpoint:
    """Tests for health check endpoint"""
    
    def test_health_endpoint(self):
        """Test health endpoint returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["database"] == "connected"
        assert "services" in data


class TestPageAccessibility:
    """Tests for page accessibility"""
    
    def test_audit_page_accessible(self):
        """Test /audit page is accessible"""
        response = requests.get(f"{BASE_URL}/audit", allow_redirects=True)
        assert response.status_code == 200
    
    def test_tools_page_accessible(self):
        """Test /tools page is accessible"""
        response = requests.get(f"{BASE_URL}/tools", allow_redirects=True)
        assert response.status_code == 200
    
    def test_marketplace_solutions_accessible(self):
        """Test /marketplacesolutions page is accessible"""
        response = requests.get(f"{BASE_URL}/marketplacesolutions", allow_redirects=True)
        assert response.status_code == 200


class TestLeadCount:
    """Tests for lead count endpoint"""
    
    def test_lead_count_returns_number(self):
        """Test lead count endpoint returns numeric count"""
        response = requests.get(f"{BASE_URL}/api/leads/count")
        
        assert response.status_code == 200
        data = response.json()
        assert "count" in data
        assert isinstance(data["count"], int)
        assert data["count"] >= 0
