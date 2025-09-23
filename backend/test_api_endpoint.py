"""
Test script for the SEO metadata API endpoint
"""

import requests
import json

def test_seo_metadata_endpoint():
    """Test the SEO metadata API endpoint"""
    
    # Test data
    test_data = {
        "content": "# The Future of AI in Content Marketing\n\nArtificial Intelligence is revolutionizing the way we create and distribute content. From automated content generation to personalized marketing campaigns, AI is transforming the content marketing landscape.\n\n## Key Benefits of AI in Content Marketing\n\n1. **Automated Content Creation**: AI can generate high-quality content at scale\n2. **Personalization**: AI enables hyper-personalized content for different audiences\n3. **Optimization**: AI helps optimize content for better performance\n4. **Analytics**: AI provides deeper insights into content performance",
        "title": "The Future of AI in Content Marketing",
        "research_data": {
            "keyword_analysis": {
                "primary": ["AI content marketing", "artificial intelligence marketing", "content automation"],
                "long_tail": ["AI content marketing tools 2024", "automated content generation benefits"],
                "semantic": ["machine learning", "content strategy", "digital marketing", "automation"],
                "search_intent": "informational",
                "target_audience": "marketing professionals",
                "industry": "technology"
            }
        }
    }
    
    try:
        print("🚀 Testing SEO Metadata API Endpoint...")
        print(f"📡 Making request to: http://localhost:8000/api/blog/seo/metadata")
        
        # Make the API request
        response = requests.post(
            "http://localhost:8000/api/blog/seo/metadata",
            headers={"Content-Type": "application/json"},
            json=test_data,
            timeout=60
        )
        
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ API Endpoint Test Successful!")
            print("=" * 50)
            
            # Debug: Print the full response structure
            print("🔍 Full API Response Structure:")
            for key, value in result.items():
                if isinstance(value, dict):
                    print(f"  {key}: {type(value)} with {len(value)} keys")
                elif isinstance(value, list):
                    print(f"  {key}: {type(value)} with {len(value)} items")
                else:
                    print(f"  {key}: {type(value)} = {value}")
            print("-" * 50)
            
            # Display key results
            print(f"Success: {result.get('success', False)}")
            print(f"SEO Title: {result.get('seo_title', 'N/A')}")
            print(f"Meta Description: {result.get('meta_description', 'N/A')}")
            print(f"URL Slug: {result.get('url_slug', 'N/A')}")
            print(f"Blog Tags: {result.get('blog_tags', [])}")
            print(f"Blog Categories: {result.get('blog_categories', [])}")
            print(f"Social Hashtags: {result.get('social_hashtags', [])}")
            print(f"Reading Time: {result.get('reading_time', 0)} minutes")
            print(f"Focus Keyword: {result.get('focus_keyword', 'N/A')}")
            print(f"Optimization Score: {result.get('optimization_score', 0)}%")
            
            # Social media metadata
            open_graph = result.get('open_graph', {})
            twitter_card = result.get('twitter_card', {})
            print(f"\n📱 Social Media Metadata:")
            print(f"OG Title: {open_graph.get('title', 'N/A')}")
            print(f"OG Description: {open_graph.get('description', 'N/A')}")
            print(f"Twitter Title: {twitter_card.get('title', 'N/A')}")
            print(f"Twitter Description: {twitter_card.get('description', 'N/A')}")
            
            # Structured data
            json_ld = result.get('json_ld_schema', {})
            print(f"\n🔍 Structured Data:")
            print(f"Schema Type: {json_ld.get('@type', 'N/A')}")
            print(f"Headline: {json_ld.get('headline', 'N/A')}")
            
            print(f"\n⏱️ Generated at: {result.get('generated_at', 'N/A')}")
            print("🎉 API endpoint test completed successfully!")
            
        else:
            print(f"❌ API Endpoint Test Failed!")
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Could not connect to the server")
        print("Make sure the backend server is running on http://localhost:8000")
    except requests.exceptions.Timeout:
        print("❌ Timeout Error: Request took too long")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_seo_metadata_endpoint()
