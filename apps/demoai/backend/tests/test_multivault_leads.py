"""
Test Suite for Multi-Vault Lead Capture API
Tests the lead capture functionality for the Neural Map feature
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestLeadCaptureAPI:
    """Lead Capture API Tests for Multi-Vault / Neural Map feature"""
    
    def test_health_endpoint(self):
        """Test that API is healthy"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["database"] == "connected"
        print("✓ Health endpoint working correctly")
    
    def test_lead_capture_success(self):
        """Test successful lead capture with valid email"""
        unique_email = f"test_lead_{os.urandom(4).hex()}@example.com"
        payload = {
            "email": unique_email,
            "source": "neural_map",
            "insightCount": 15
        }
        
        response = requests.post(
            f"{BASE_URL}/api/leads/capture",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "message" in data
        print(f"✓ Lead capture successful for {unique_email}")
    
    def test_lead_capture_duplicate_email(self):
        """Test lead capture with existing email returns welcome back"""
        # First capture
        email = f"test_duplicate_{os.urandom(4).hex()}@example.com"
        payload = {"email": email, "source": "neural_map", "insightCount": 5}
        
        response1 = requests.post(
            f"{BASE_URL}/api/leads/capture",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response1.status_code == 200
        
        # Second capture with same email
        response2 = requests.post(
            f"{BASE_URL}/api/leads/capture",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response2.status_code == 200
        data = response2.json()
        assert data["success"] == True
        assert data["message"] == "Welcome back!"
        print(f"✓ Duplicate email handling works correctly")
    
    def test_lead_capture_invalid_email_format(self):
        """Test lead capture with invalid email format returns error"""
        payload = {
            "email": "not-a-valid-email",
            "source": "neural_map",
            "insightCount": 5
        }
        
        response = requests.post(
            f"{BASE_URL}/api/leads/capture",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        # Pydantic validation should return 422
        assert response.status_code == 422
        print("✓ Invalid email format rejected correctly")
    
    def test_lead_capture_missing_email(self):
        """Test lead capture without email returns error"""
        payload = {
            "source": "neural_map",
            "insightCount": 5
        }
        
        response = requests.post(
            f"{BASE_URL}/api/leads/capture",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        # Pydantic validation should return 422
        assert response.status_code == 422
        print("✓ Missing email rejected correctly")
    
    def test_lead_capture_default_values(self):
        """Test lead capture with only email uses default values"""
        unique_email = f"test_defaults_{os.urandom(4).hex()}@example.com"
        payload = {"email": unique_email}
        
        response = requests.post(
            f"{BASE_URL}/api/leads/capture",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print("✓ Lead capture with default values works")
    
    def test_lead_count_endpoint(self):
        """Test lead count endpoint"""
        response = requests.get(f"{BASE_URL}/api/leads/count")
        assert response.status_code == 200
        data = response.json()
        assert "count" in data
        assert isinstance(data["count"], int)
        print(f"✓ Lead count endpoint returns {data['count']} leads")
    
    def test_lead_capture_different_sources(self):
        """Test lead capture from different sources"""
        sources = ["neural_map", "multi_vault", "instant_audit", "unknown"]
        
        for source in sources:
            unique_email = f"test_source_{source}_{os.urandom(4).hex()}@example.com"
            payload = {
                "email": unique_email,
                "source": source,
                "insightCount": 10
            }
            
            response = requests.post(
                f"{BASE_URL}/api/leads/capture",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] == True
        
        print(f"✓ Lead capture works for all sources: {sources}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
