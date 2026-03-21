"""
Archives CMS API Tests - The Archives (blog.adsgupta.com)
Tests for public and admin endpoints including authentication
"""
import pytest
import requests
import os
from datetime import datetime

# Backend URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://content-hub-dev-4.preview.emergentagent.com').rstrip('/')

# Test admin session token (as provided)
TEST_SESSION_TOKEN = "test_admin_session_1771425966070"
TEST_ADMIN_EMAIL = "ranjandsgpt@gmail.com"


class TestHealthCheck:
    """Basic health check to ensure API is available"""
    
    def test_api_health(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print(f"✓ API health check passed: {data}")


class TestArchivesPublicEndpoints:
    """Test public Archives API endpoints (no auth required)"""
    
    def test_get_published_articles(self):
        """GET /api/archives/articles - Returns published articles"""
        response = requests.get(f"{BASE_URL}/api/archives/articles")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "articles" in data, "Response missing 'articles' key"
        assert "total" in data, "Response missing 'total' key"
        assert isinstance(data["articles"], list), "Articles should be a list"
        print(f"✓ GET /api/archives/articles - Found {data['total']} published articles")
        
        # Verify article structure if articles exist
        if len(data["articles"]) > 0:
            article = data["articles"][0]
            assert "title" in article
            assert "slug" in article
            assert "is_published" in article
            assert article["is_published"] == True, "Public endpoint should only return published articles"
            print(f"✓ Article structure verified: {article['title'][:50]}...")
    
    def test_get_articles_by_category(self):
        """GET /api/archives/articles?category=neural-philosophical - Filter by category"""
        categories = ["neural-philosophical", "marketplace-protocols", "ecosystem-updates"]
        
        for category in categories:
            response = requests.get(f"{BASE_URL}/api/archives/articles?category={category}")
            assert response.status_code == 200, f"Category {category} returned {response.status_code}"
            
            data = response.json()
            # Verify all returned articles match the category
            for article in data["articles"]:
                assert article["category"] == category, f"Article category mismatch: expected {category}, got {article['category']}"
            print(f"✓ Category filter '{category}' works - {len(data['articles'])} articles")
    
    def test_get_single_article_by_slug(self):
        """GET /api/archives/articles/multi-report-sync - Get single article"""
        # Test with a known slug
        slug = "multi-report-sync"
        response = requests.get(f"{BASE_URL}/api/archives/articles/{slug}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        article = response.json()
        assert article["slug"] == slug, "Slug mismatch"
        assert "title" in article
        assert "content" in article
        assert "author" in article
        print(f"✓ GET /api/archives/articles/{slug} - Found: {article['title']}")
    
    def test_get_nonexistent_article(self):
        """GET /api/archives/articles/nonexistent-slug - Should return 404"""
        response = requests.get(f"{BASE_URL}/api/archives/articles/this-article-does-not-exist-xyz")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Non-existent article correctly returns 404")
    
    def test_get_categories_with_counts(self):
        """GET /api/archives/categories - Get all categories with counts"""
        response = requests.get(f"{BASE_URL}/api/archives/categories")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Categories should be a list"
        
        # Verify category structure
        for cat in data:
            assert "category" in cat
            assert "count" in cat
            assert isinstance(cat["count"], int)
        
        print(f"✓ GET /api/archives/categories - Found {len(data)} categories")
        for cat in data:
            print(f"   - {cat['category']}: {cat['count']} articles")


class TestArchivesAuthEndpoints:
    """Test Archives admin authentication endpoints"""
    
    def test_auth_me_without_token(self):
        """GET /api/archives/auth/me without token - Should return 401"""
        response = requests.get(f"{BASE_URL}/api/archives/auth/me")
        assert response.status_code == 401, f"Expected 401 without token, got {response.status_code}"
        print("✓ Auth/me without token correctly returns 401")
    
    def test_auth_me_with_valid_token(self):
        """GET /api/archives/auth/me with valid session token - Should return user data"""
        headers = {"Authorization": f"Bearer {TEST_SESSION_TOKEN}"}
        response = requests.get(f"{BASE_URL}/api/archives/auth/me", headers=headers)
        assert response.status_code == 200, f"Expected 200 with valid token, got {response.status_code}: {response.text}"
        
        user = response.json()
        assert "email" in user
        assert user["email"] == TEST_ADMIN_EMAIL
        assert user.get("is_admin") == True
        print(f"✓ Auth/me with token - User: {user['email']}, Admin: {user.get('is_admin')}")
    
    def test_auth_me_with_invalid_token(self):
        """GET /api/archives/auth/me with invalid token - Should return 401"""
        headers = {"Authorization": "Bearer invalid_token_12345"}
        response = requests.get(f"{BASE_URL}/api/archives/auth/me", headers=headers)
        assert response.status_code == 401, f"Expected 401 with invalid token, got {response.status_code}"
        print("✓ Invalid token correctly returns 401")


class TestArchivesAdminArticleEndpoints:
    """Test Admin article CRUD operations (requires auth)"""
    
    @pytest.fixture
    def auth_headers(self):
        return {"Authorization": f"Bearer {TEST_SESSION_TOKEN}"}
    
    def test_admin_get_all_articles(self, auth_headers):
        """GET /api/archives/admin/articles - Get all articles (including drafts)"""
        response = requests.get(f"{BASE_URL}/api/archives/admin/articles", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "articles" in data
        assert "total" in data
        print(f"✓ Admin GET all articles - {data['total']} total articles")
    
    def test_admin_get_articles_no_auth(self):
        """GET /api/archives/admin/articles without auth - Should return 401"""
        response = requests.get(f"{BASE_URL}/api/archives/admin/articles")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Admin articles without auth correctly returns 401")
    
    def test_admin_create_article(self, auth_headers):
        """POST /api/archives/admin/articles - Create a new article"""
        article_data = {
            "title": "TEST_Pytest Created Article",
            "content": "<p>This article was created during pytest testing.</p>",
            "source_tag": "linkedin",
            "category": "marketplace-protocols",
            "is_published": False
        }
        
        response = requests.post(
            f"{BASE_URL}/api/archives/admin/articles",
            headers={**auth_headers, "Content-Type": "application/json"},
            json=article_data
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        created = response.json()
        assert created["title"] == article_data["title"]
        assert "article_id" in created
        assert "slug" in created
        assert created["is_published"] == False
        
        print(f"✓ Created article: {created['title']} (ID: {created['article_id']})")
        
        # Cleanup: Delete the created article
        delete_response = requests.delete(
            f"{BASE_URL}/api/archives/admin/articles/{created['article_id']}",
            headers=auth_headers
        )
        assert delete_response.status_code == 200, "Cleanup delete failed"
        print(f"✓ Cleanup: Deleted test article")
    
    def test_admin_create_article_no_auth(self):
        """POST /api/archives/admin/articles without auth - Should return 401"""
        article_data = {
            "title": "Unauthorized Article",
            "content": "This should fail",
            "source_tag": "linkedin"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/archives/admin/articles",
            headers={"Content-Type": "application/json"},
            json=article_data
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Create article without auth correctly returns 401")
    
    def test_admin_update_article_flow(self, auth_headers):
        """Full create → update → verify → delete flow"""
        # 1. Create
        create_data = {
            "title": "TEST_Article for Update Test",
            "content": "<p>Original content</p>",
            "source_tag": "blogspot",
            "category": "neural-philosophical",
            "is_published": False
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/archives/admin/articles",
            headers={**auth_headers, "Content-Type": "application/json"},
            json=create_data
        )
        assert create_response.status_code == 200
        article = create_response.json()
        article_id = article["article_id"]
        print(f"✓ Created article for update test: {article_id}")
        
        # 2. Update
        update_data = {
            "title": "TEST_Updated Article Title",
            "content": "<p>Updated content!</p>",
            "is_published": True
        }
        
        update_response = requests.put(
            f"{BASE_URL}/api/archives/admin/articles/{article_id}",
            headers={**auth_headers, "Content-Type": "application/json"},
            json=update_data
        )
        assert update_response.status_code == 200, f"Update failed: {update_response.text}"
        updated = update_response.json()
        assert updated["title"] == update_data["title"]
        assert updated["is_published"] == True
        print(f"✓ Updated article title and published status")
        
        # 3. Verify via public endpoint (since it's now published)
        verify_response = requests.get(f"{BASE_URL}/api/archives/articles/{updated['slug']}")
        assert verify_response.status_code == 200, "Updated article not accessible via public endpoint"
        print(f"✓ Verified published article accessible via public endpoint")
        
        # 4. Cleanup
        delete_response = requests.delete(
            f"{BASE_URL}/api/archives/admin/articles/{article_id}",
            headers=auth_headers
        )
        assert delete_response.status_code == 200
        print(f"✓ Cleanup: Deleted test article")
    
    def test_admin_publish_unpublish_flow(self, auth_headers):
        """Test publish and unpublish endpoints"""
        # Create a draft article
        create_data = {
            "title": "TEST_Publish Flow Article",
            "content": "<p>Test content</p>",
            "source_tag": "adsgupta-original",
            "is_published": False
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/archives/admin/articles",
            headers={**auth_headers, "Content-Type": "application/json"},
            json=create_data
        )
        article = create_response.json()
        article_id = article["article_id"]
        
        # Publish
        publish_response = requests.post(
            f"{BASE_URL}/api/archives/admin/articles/{article_id}/publish",
            headers=auth_headers
        )
        assert publish_response.status_code == 200, f"Publish failed: {publish_response.text}"
        print(f"✓ Published article")
        
        # Unpublish
        unpublish_response = requests.post(
            f"{BASE_URL}/api/archives/admin/articles/{article_id}/unpublish",
            headers=auth_headers
        )
        assert unpublish_response.status_code == 200, f"Unpublish failed: {unpublish_response.text}"
        print(f"✓ Unpublished article")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/archives/admin/articles/{article_id}", headers=auth_headers)


class TestArchivesNewFeatures:
    """Test new V2 features: reading_time, has_more, category endpoint, og_meta"""
    
    def test_articles_have_reading_time(self):
        """GET /api/archives/articles - Verify reading_time field present"""
        response = requests.get(f"{BASE_URL}/api/archives/articles")
        assert response.status_code == 200
        
        data = response.json()
        for article in data["articles"]:
            assert "reading_time" in article, f"Article {article['title']} missing reading_time"
            assert isinstance(article["reading_time"], int), "reading_time should be integer"
            assert article["reading_time"] >= 1, "reading_time should be at least 1"
        print(f"✓ All {len(data['articles'])} articles have reading_time field")
    
    def test_articles_pagination_has_more(self):
        """GET /api/archives/articles - Verify has_more field for pagination"""
        # Get first batch
        response = requests.get(f"{BASE_URL}/api/archives/articles?limit=2&skip=0")
        assert response.status_code == 200
        
        data = response.json()
        assert "has_more" in data, "Response missing has_more field"
        assert isinstance(data["has_more"], bool), "has_more should be boolean"
        print(f"✓ Pagination has_more field present: {data['has_more']}")
    
    def test_category_endpoint(self):
        """GET /api/archives/category/:name - Test category endpoint"""
        categories = ["neural-philosophical", "marketplace-protocols", "ecosystem-updates"]
        
        for category in categories:
            response = requests.get(f"{BASE_URL}/api/archives/category/{category}")
            assert response.status_code == 200, f"Category {category} failed with {response.status_code}"
            
            data = response.json()
            assert data["category"] == category, "Category mismatch in response"
            assert "meta" in data, "Response missing meta field"
            assert "label" in data["meta"], "Meta missing label"
            assert "description" in data["meta"], "Meta missing description"
            assert "articles" in data, "Response missing articles"
            
            # Verify all articles belong to this category
            for article in data["articles"]:
                assert article["category"] == category
                assert "reading_time" in article
            
            print(f"✓ Category endpoint /{category}: {len(data['articles'])} articles, meta: {data['meta']['label']}")
    
    def test_invalid_category_returns_404(self):
        """GET /api/archives/category/invalid-category - Should return 404"""
        response = requests.get(f"{BASE_URL}/api/archives/category/invalid-category-xyz")
        assert response.status_code == 404, f"Expected 404 for invalid category, got {response.status_code}"
        print("✓ Invalid category correctly returns 404")
    
    def test_single_article_has_og_meta(self):
        """GET /api/archives/articles/:slug - Verify og_meta for OpenGraph"""
        slug = "multi-report-sync"
        response = requests.get(f"{BASE_URL}/api/archives/articles/{slug}")
        assert response.status_code == 200
        
        article = response.json()
        assert "og_meta" in article, "Article missing og_meta field"
        
        og_meta = article["og_meta"]
        required_og_fields = ["title", "description", "type", "author", "published_time", "section", "site_name", "url"]
        for field in required_og_fields:
            assert field in og_meta, f"og_meta missing {field}"
        
        assert og_meta["type"] == "article", "og_meta type should be 'article'"
        assert og_meta["site_name"] == "The Archives - AdsGupta", "Incorrect site_name"
        assert slug in og_meta["url"], "URL should contain slug"
        
        print(f"✓ Article has complete og_meta for OpenGraph sharing")
        print(f"  og:title = {og_meta['title'][:50]}...")
        print(f"  og:url = {og_meta['url']}")
    
    def test_single_article_has_reading_time(self):
        """GET /api/archives/articles/:slug - Verify reading_time on single article"""
        response = requests.get(f"{BASE_URL}/api/archives/articles/multi-report-sync")
        assert response.status_code == 200
        
        article = response.json()
        assert "reading_time" in article, "Single article missing reading_time"
        assert isinstance(article["reading_time"], int)
        print(f"✓ Single article has reading_time: {article['reading_time']} min")


class TestArchivesKnowledgeBase:
    """Test SLM Chatbot knowledge base endpoint"""
    
    def test_get_knowledge_base(self):
        """GET /api/archives/knowledge-base - Get content for SLM"""
        response = requests.get(f"{BASE_URL}/api/archives/knowledge-base")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "article_count" in data
        assert "knowledge_text" in data
        assert isinstance(data["knowledge_text"], str)
        
        print(f"✓ Knowledge base returned {data['article_count']} articles")
        print(f"  Text length: {len(data['knowledge_text'])} characters")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
