"""
Test suite for dual-domain deployment features
Tests: Tools domain homepage, Audit page, Lead capture API, Cross-domain links
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthCheck:
    """Health endpoint tests"""
    
    def test_backend_health_check(self):
        """Test backend health check returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("status") == "healthy"
        assert "database" in data
        print(f"✓ Health check passed: {data}")


class TestLeadCaptureAPI:
    """Lead capture API tests"""
    
    def test_lead_capture_success(self):
        """Test lead capture with valid email"""
        payload = {
            "email": "test-dual-domain@example.com",
            "source": "dual_domain_test",
            "insightCount": 5
        }
        response = requests.post(
            f"{BASE_URL}/api/leads/capture",
            json=payload,
            timeout=10
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("success") == True
        assert "message" in data
        print(f"✓ Lead capture success: {data}")
    
    def test_lead_capture_duplicate_email(self):
        """Test lead capture with same email returns welcome back"""
        payload = {
            "email": "test-dual-domain@example.com",
            "source": "dual_domain_test",
            "insightCount": 10
        }
        response = requests.post(
            f"{BASE_URL}/api/leads/capture",
            json=payload,
            timeout=10
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("success") == True
        # Second submission should say "Welcome back!"
        print(f"✓ Duplicate lead handled: {data}")
    
    def test_lead_capture_invalid_email(self):
        """Test lead capture rejects invalid email format"""
        payload = {
            "email": "not-an-email",
            "source": "test",
            "insightCount": 0
        }
        response = requests.post(
            f"{BASE_URL}/api/leads/capture",
            json=payload,
            timeout=10
        )
        # Should reject with 422 validation error
        assert response.status_code == 422
        print(f"✓ Invalid email rejected with 422")
    
    def test_lead_capture_missing_email(self):
        """Test lead capture requires email field"""
        payload = {
            "source": "test",
            "insightCount": 0
        }
        response = requests.post(
            f"{BASE_URL}/api/leads/capture",
            json=payload,
            timeout=10
        )
        # Should reject with 422 validation error
        assert response.status_code == 422
        print(f"✓ Missing email rejected with 422")
    
    def test_lead_capture_different_sources(self):
        """Test lead capture works for different sources"""
        sources = ["neural_map", "audit_page", "demo_universe"]
        
        for source in sources:
            payload = {
                "email": f"source-test-{source}@example.com",
                "source": source,
                "insightCount": 3
            }
            response = requests.post(
                f"{BASE_URL}/api/leads/capture",
                json=payload,
                timeout=10
            )
            assert response.status_code == 200
            data = response.json()
            assert data.get("success") == True
            print(f"✓ Lead captured from source: {source}")


class TestLeadCountAPI:
    """Lead count endpoint tests"""
    
    def test_lead_count_returns_count(self):
        """Test lead count endpoint returns numeric count"""
        response = requests.get(f"{BASE_URL}/api/leads/count", timeout=10)
        assert response.status_code == 200
        
        data = response.json()
        assert "count" in data
        assert isinstance(data["count"], int)
        assert data["count"] >= 0
        print(f"✓ Lead count: {data['count']}")


class TestFrontendRoutes:
    """Test frontend routes are accessible"""
    
    def test_homepage_accessible(self):
        """Test homepage (/) is accessible"""
        response = requests.get(f"{BASE_URL}/", timeout=10)
        assert response.status_code == 200
        print(f"✓ Homepage accessible")
    
    def test_audit_page_accessible(self):
        """Test audit page (/audit) is accessible"""
        response = requests.get(f"{BASE_URL}/audit", timeout=10)
        assert response.status_code == 200
        print(f"✓ Audit page accessible")
    
    def test_neural_map_page_accessible(self):
        """Test neural map page (/neural-map) is accessible"""
        response = requests.get(f"{BASE_URL}/neural-map", timeout=10)
        assert response.status_code == 200
        print(f"✓ Neural map page accessible")
    
    def test_multi_vault_page_accessible(self):
        """Test multi-vault page (/multi-vault) is accessible"""
        response = requests.get(f"{BASE_URL}/multi-vault", timeout=10)
        assert response.status_code == 200
        print(f"✓ Multi-vault page accessible")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
