"""
Test script for BlogSEOMetadataGenerator
Run this to verify the service works correctly
"""

import asyncio
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.blog_writer.seo.blog_seo_metadata_generator import BlogSEOMetadataGenerator


async def test_metadata_generation():
    """Test the metadata generation service"""
    
    # Sample blog content
    blog_content = """
    # The Future of AI in Content Marketing

    Artificial Intelligence is revolutionizing the way we create and distribute content. 
    From automated content generation to personalized marketing campaigns, AI is transforming 
    the content marketing landscape.

    ## Key Benefits of AI in Content Marketing

    1. **Automated Content Creation**: AI can generate high-quality content at scale
    2. **Personalization**: AI enables hyper-personalized content for different audiences
    3. **Optimization**: AI helps optimize content for better performance
    4. **Analytics**: AI provides deeper insights into content performance

    ## The Road Ahead

    As AI technology continues to evolve, we can expect even more sophisticated 
    content marketing tools and strategies. The future is bright for AI-powered content marketing.
    """
    
    blog_title = "The Future of AI in Content Marketing"
    
    # Sample research data
    research_data = {
        "keyword_analysis": {
            "primary": ["AI content marketing", "artificial intelligence marketing", "content automation"],
            "long_tail": ["AI content marketing tools 2024", "automated content generation benefits"],
            "semantic": ["machine learning", "content strategy", "digital marketing", "automation"],
            "search_intent": "informational",
            "target_audience": "marketing professionals",
            "industry": "technology"
        }
    }
    
    try:
        print("🚀 Testing BlogSEOMetadataGenerator...")
        
        # Initialize the generator
        generator = BlogSEOMetadataGenerator()
        
        # Generate metadata
        print("📝 Generating comprehensive SEO metadata...")
        results = await generator.generate_comprehensive_metadata(
            blog_content=blog_content,
            blog_title=blog_title,
            research_data=research_data
        )
        
        # Display results
        print("\n✅ Metadata Generation Results:")
        print("=" * 50)
        
        print(f"Success: {results.get('success', False)}")
        print(f"SEO Title: {results.get('seo_title', 'N/A')}")
        print(f"Meta Description: {results.get('meta_description', 'N/A')}")
        print(f"URL Slug: {results.get('url_slug', 'N/A')}")
        print(f"Blog Tags: {results.get('blog_tags', [])}")
        print(f"Blog Categories: {results.get('blog_categories', [])}")
        print(f"Social Hashtags: {results.get('social_hashtags', [])}")
        print(f"Reading Time: {results.get('reading_time', 0)} minutes")
        print(f"Focus Keyword: {results.get('focus_keyword', 'N/A')}")
        print(f"Optimization Score: {results.get('metadata_summary', {}).get('optimization_score', 0)}%")
        
        print("\n📱 Social Media Metadata:")
        print("-" * 30)
        open_graph = results.get('open_graph', {})
        print(f"OG Title: {open_graph.get('title', 'N/A')}")
        print(f"OG Description: {open_graph.get('description', 'N/A')}")
        
        twitter_card = results.get('twitter_card', {})
        print(f"Twitter Title: {twitter_card.get('title', 'N/A')}")
        print(f"Twitter Description: {twitter_card.get('description', 'N/A')}")
        
        print("\n🔍 Structured Data:")
        print("-" * 20)
        json_ld = results.get('json_ld_schema', {})
        print(f"Schema Type: {json_ld.get('@type', 'N/A')}")
        print(f"Headline: {json_ld.get('headline', 'N/A')}")
        
        print(f"\n⏱️ Generation completed in: {results.get('generated_at', 'N/A')}")
        print("🎉 Test completed successfully!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_metadata_generation())
