"""
AdsGupta Dashboard Backend API Tests
Tests for auth, dashboard, amazon, and AI insights endpoints
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://seller-insights-11.preview.emergentagent.com')

# Test user credentials
TEST_EMAIL = "test@adsgupta.com"
TEST_PASSWORD = "testpass123"
TEST_NAME = "Test User"


class TestHealthEndpoints:
    """Health check and root endpoint tests"""
    
    def test_health_endpoint(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["database"] == "connected"
        assert "services" in data
        assert data["services"]["auth"] == "active"
        assert data["services"]["dashboard"] == "active"
        assert data["services"]["ai_insights"] == "active"
        print("PASS: Health endpoint returns healthy status")
    
    def test_root_endpoint(self):
        """Test /api/ returns API info"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "AdsGupta Dashboard API"
        assert data["status"] == "healthy"
        assert "version" in data
        print("PASS: Root endpoint returns API info")


class TestAuthEndpoints:
    """Authentication endpoint tests - JWT auth"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get JWT token for authenticated tests"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if response.status_code == 200:
            return response.json().get("access_token")
        # If login fails, try register
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD, "name": TEST_NAME}
        )
        if response.status_code in [200, 201]:
            return response.json().get("access_token")
        pytest.skip("Could not get auth token")
    
    def test_login_success(self):
        """Test POST /api/auth/login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_EMAIL
        assert data["token_type"] == "bearer"
        assert data["expires_in"] > 0
        print("PASS: Login with valid credentials returns token")
    
    def test_login_invalid_credentials(self):
        """Test POST /api/auth/login with invalid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "invalid@test.com", "password": "wrongpass"}
        )
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print("PASS: Login with invalid credentials returns 401")
    
    def test_register_duplicate_email(self):
        """Test POST /api/auth/register with existing email"""
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD, "name": TEST_NAME}
        )
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "already registered" in data["detail"].lower()
        print("PASS: Register with duplicate email returns 400")
    
    def test_register_new_user(self):
        """Test POST /api/auth/register with new email"""
        unique_email = f"testuser_{int(time.time())}@adsgupta.com"
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={"email": unique_email, "password": "testpass123", "name": "New Test User"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == unique_email
        print(f"PASS: Register new user {unique_email} returns token")
    
    def test_get_me_authenticated(self, auth_token):
        """Test GET /api/auth/me with valid token"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data
        assert "email" in data
        assert "name" in data
        assert data["email"] == TEST_EMAIL
        # Ensure password_hash is not returned
        assert "password_hash" not in data
        print("PASS: GET /api/auth/me returns user data without password")
    
    def test_get_me_unauthenticated(self):
        """Test GET /api/auth/me without token"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("PASS: GET /api/auth/me without token returns 401")
    
    def test_logout(self, auth_token):
        """Test POST /api/auth/logout"""
        response = requests.post(
            f"{BASE_URL}/api/auth/logout",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print("PASS: Logout returns success message")


class TestDashboardEndpoints:
    """Dashboard KPI endpoint tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get JWT token for authenticated tests"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Could not get auth token")
    
    def test_get_kpis_default_period(self, auth_token):
        """Test GET /api/dashboard/kpis with default period (7d)"""
        response = requests.get(
            f"{BASE_URL}/api/dashboard/kpis",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "kpis" in data
        assert "connected" in data
        
        # Verify KPI structure
        kpis = data["kpis"]
        expected_fields = [
            "total_sessions", "total_page_views", "avg_conversion_rate",
            "avg_buy_box_percentage", "total_sales", "total_units",
            "total_orders", "total_ppc_spend", "total_ppc_sales",
            "avg_acos", "avg_tacos", "avg_roas", "total_revenue",
            "total_fees", "total_refunds", "refund_rate", "net_profit"
        ]
        for field in expected_fields:
            assert field in kpis, f"Missing field: {field}"
        print("PASS: GET /api/dashboard/kpis returns complete KPI structure")
    
    def test_get_kpis_various_periods(self, auth_token):
        """Test GET /api/dashboard/kpis with different periods"""
        periods = ["7d", "30d", "90d"]
        for period in periods:
            response = requests.get(
                f"{BASE_URL}/api/dashboard/kpis?period={period}",
                headers={"Authorization": f"Bearer {auth_token}"}
            )
            assert response.status_code == 200
            data = response.json()
            assert "kpis" in data
            print(f"PASS: GET /api/dashboard/kpis?period={period} returns KPIs")
    
    def test_get_kpis_unauthenticated(self):
        """Test GET /api/dashboard/kpis without token"""
        response = requests.get(f"{BASE_URL}/api/dashboard/kpis")
        assert response.status_code == 401
        print("PASS: GET /api/dashboard/kpis without auth returns 401")


class TestAmazonEndpoints:
    """Amazon SP-API endpoint tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get JWT token for authenticated tests"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Could not get auth token")
    
    def test_get_amazon_status_not_connected(self, auth_token):
        """Test GET /api/amazon/status when no Amazon connected"""
        response = requests.get(
            f"{BASE_URL}/api/amazon/status",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "connected" in data
        assert "status" in data
        assert "redirect_uri" in data
        assert data["redirect_uri"].endswith("/api/amazon/callback")
        print("PASS: Amazon status returns connection info with redirect_uri")
    
    def test_connect_amazon_missing_credentials(self, auth_token):
        """Test GET /api/amazon/connect when LWA credentials not configured"""
        response = requests.get(
            f"{BASE_URL}/api/amazon/connect",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        # Will return 400 if LWA credentials not set
        # This is expected behavior when LWA_CLIENT_ID is not configured
        assert response.status_code in [200, 400]
        data = response.json()
        if response.status_code == 400:
            assert "detail" in data
            assert "LWA" in data["detail"] or "credentials" in data["detail"].lower()
            print("PASS: Amazon connect returns 400 when LWA credentials not configured")
        else:
            assert "authorization_url" in data
            print("PASS: Amazon connect returns authorization URL")
    
    def test_amazon_status_unauthenticated(self):
        """Test GET /api/amazon/status without token"""
        response = requests.get(f"{BASE_URL}/api/amazon/status")
        assert response.status_code == 401
        print("PASS: Amazon status without auth returns 401")
    
    def test_get_redirect_uri(self):
        """Test GET /api/settings/redirect-uri"""
        response = requests.get(f"{BASE_URL}/api/settings/redirect-uri")
        assert response.status_code == 200
        data = response.json()
        assert "redirect_uri" in data
        assert "note" in data
        assert "/api/amazon/callback" in data["redirect_uri"]
        print("PASS: Settings redirect-uri returns correct callback URL")


class TestAIInsightsEndpoints:
    """AI Insights endpoint tests - Gemini 3 Flash"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get JWT token for authenticated tests"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Could not get auth token")
    
    def test_generate_insights_success(self, auth_token):
        """Test POST /api/ai/insights with valid metrics"""
        test_metrics = {
            "total_sessions": 1000,
            "total_page_views": 2500,
            "avg_conversion_rate": 3.5,
            "avg_buy_box_percentage": 92.0,
            "total_sales": 15000.0,
            "total_units": 150,
            "total_orders": 120,
            "total_ppc_spend": 1500.0,
            "total_ppc_sales": 5000.0,
            "avg_acos": 30.0,
            "avg_tacos": 10.0,
            "avg_roas": 3.33,
            "total_revenue": 14000.0,
            "total_fees": 2500.0,
            "total_refunds": 500.0,
            "refund_rate": 3.5,
            "net_profit": 11000.0
        }
        
        response = requests.post(
            f"{BASE_URL}/api/ai/insights",
            headers={
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            },
            json={"metrics": test_metrics, "period": "last_7_days"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "insights" in data
        assert "generated_at" in data
        assert len(data["insights"]) > 100  # Should have meaningful content
        # Verify insights contain expected sections
        assert "Key Insights" in data["insights"] or "Recommendations" in data["insights"]
        print("PASS: AI insights generates meaningful recommendations")
    
    def test_generate_insights_empty_metrics(self, auth_token):
        """Test POST /api/ai/insights with empty metrics"""
        response = requests.post(
            f"{BASE_URL}/api/ai/insights",
            headers={
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            },
            json={"metrics": {}, "period": "last_7_days"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "insights" in data
        print("PASS: AI insights handles empty metrics")
    
    def test_get_latest_insight(self, auth_token):
        """Test GET /api/ai/insights/latest"""
        response = requests.get(
            f"{BASE_URL}/api/ai/insights/latest",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        # Either returns latest insight or message that none exist
        assert "insights" in data or "message" in data
        print("PASS: GET /api/ai/insights/latest returns insight or message")
    
    def test_get_insights_history(self, auth_token):
        """Test GET /api/ai/insights/history"""
        response = requests.get(
            f"{BASE_URL}/api/ai/insights/history?limit=5",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "insights" in data
        assert isinstance(data["insights"], list)
        print("PASS: GET /api/ai/insights/history returns list of insights")
    
    def test_insights_unauthenticated(self):
        """Test POST /api/ai/insights without token"""
        response = requests.post(
            f"{BASE_URL}/api/ai/insights",
            json={"metrics": {}, "period": "last_7_days"}
        )
        assert response.status_code == 401
        print("PASS: AI insights without auth returns 401")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
