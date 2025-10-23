"""
Blog SEO Metadata Generator

Optimized SEO metadata generation service that uses maximum 2 AI calls
to generate comprehensive metadata including titles, descriptions, 
Open Graph tags, Twitter cards, and structured data.
"""

import asyncio
import re
from datetime import datetime
from typing import Dict, Any, List, Optional
from loguru import logger

from services.llm_providers.gemini_provider import gemini_structured_json_response


class BlogSEOMetadataGenerator:
    """Optimized SEO metadata generator with maximum 2 AI calls"""
    
    def __init__(self):
        """Initialize the metadata generator"""
        self.gemini_provider = gemini_structured_json_response
        logger.info("BlogSEOMetadataGenerator initialized")
    
    async def generate_comprehensive_metadata(
        self, 
        blog_content: str, 
        blog_title: str,
        research_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate comprehensive SEO metadata using maximum 2 AI calls
        
        Args:
            blog_content: The blog content to analyze
            blog_title: The blog title
            research_data: Research data containing keywords and insights
            
        Returns:
            Comprehensive metadata including all SEO elements
        """
        try:
            logger.info("Starting comprehensive SEO metadata generation")
            
            # Extract keywords and context from research data
            keywords_data = self._extract_keywords_from_research(research_data)
            logger.info(f"Extracted keywords: {keywords_data}")
            
            # Call 1: Generate core SEO metadata (parallel with Call 2)
            logger.info("Generating core SEO metadata")
            core_metadata_task = self._generate_core_metadata(blog_content, blog_title, keywords_data)
            
            # Call 2: Generate social media and structured data (parallel with Call 1)
            logger.info("Generating social media and structured data")
            social_metadata_task = self._generate_social_metadata(blog_content, blog_title, keywords_data)
            
            # Wait for both calls to complete
            core_metadata, social_metadata = await asyncio.gather(
                core_metadata_task,
                social_metadata_task
            )
            
            # Compile final response
            results = self._compile_metadata_response(core_metadata, social_metadata, blog_title)
            
            logger.info(f"SEO metadata generation completed successfully")
            return results
            
        except Exception as e:
            logger.error(f"SEO metadata generation failed: {e}")
            # Fail fast - don't return fallback data
            raise e
    
    def _extract_keywords_from_research(self, research_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract keywords and context from research data"""
        try:
            keyword_analysis = research_data.get('keyword_analysis', {})
            
            # Handle both 'semantic' and 'semantic_keywords' field names
            semantic_keywords = keyword_analysis.get('semantic', []) or keyword_analysis.get('semantic_keywords', [])
            
            return {
                'primary_keywords': keyword_analysis.get('primary', []),
                'long_tail_keywords': keyword_analysis.get('long_tail', []),
                'semantic_keywords': semantic_keywords,
                'all_keywords': keyword_analysis.get('all_keywords', []),
                'search_intent': keyword_analysis.get('search_intent', 'informational'),
                'target_audience': research_data.get('target_audience', 'general'),
                'industry': research_data.get('industry', 'general')
            }
        except Exception as e:
            logger.error(f"Failed to extract keywords from research: {e}")
            return {
                'primary_keywords': [],
                'long_tail_keywords': [],
                'semantic_keywords': [],
                'all_keywords': [],
                'search_intent': 'informational',
                'target_audience': 'general',
                'industry': 'general'
            }
    
    async def _generate_core_metadata(
        self, 
        blog_content: str, 
        blog_title: str, 
        keywords_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate core SEO metadata (Call 1)"""
        try:
            # Create comprehensive prompt for core metadata
            prompt = self._create_core_metadata_prompt(blog_content, blog_title, keywords_data)
            
            # Define simplified structured schema for core metadata
            schema = {
                "type": "object",
                "properties": {
                    "seo_title": {
                        "type": "string",
                        "description": "SEO-optimized title (50-60 characters)"
                    },
                    "meta_description": {
                        "type": "string", 
                        "description": "Meta description (150-160 characters)"
                    },
                    "url_slug": {
                        "type": "string",
                        "description": "URL slug (lowercase, hyphens)"
                    },
                    "blog_tags": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Blog tags array"
                    },
                    "blog_categories": {
                        "type": "array", 
                        "items": {"type": "string"},
                        "description": "Blog categories array"
                    },
                    "social_hashtags": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Social media hashtags array"
                    },
                    "reading_time": {
                        "type": "integer",
                        "description": "Reading time in minutes"
                    },
                    "focus_keyword": {
                        "type": "string",
                        "description": "Primary focus keyword"
                    }
                },
                "required": ["seo_title", "meta_description", "url_slug", "blog_tags", "blog_categories", "social_hashtags", "reading_time", "focus_keyword"]
            }
            
            # Get structured response from Gemini
            ai_response = self.gemini_provider(
                prompt,
                schema,
                temperature=0.3,
                max_tokens=2048
            )
            
            # Check if we got a valid response
            if not ai_response or not isinstance(ai_response, dict):
                logger.error("Core metadata generation failed: Invalid response from Gemini")
                # Return fallback response
                primary_keywords = ', '.join(keywords_data.get('primary_keywords', ['content']))
                word_count = len(blog_content.split())
                return {
                    'seo_title': blog_title,
                    'meta_description': f'Learn about {primary_keywords.split(", ")[0] if primary_keywords else "this topic"}.',
                    'url_slug': blog_title.lower().replace(' ', '-').replace(':', '').replace(',', '')[:50],
                    'blog_tags': primary_keywords.split(', ') if primary_keywords else ['content'],
                    'blog_categories': ['Content Marketing', 'Technology'],
                    'social_hashtags': ['#content', '#marketing', '#technology'],
                    'reading_time': max(1, word_count // 200),
                    'focus_keyword': primary_keywords.split(', ')[0] if primary_keywords else 'content'
                }
            
            logger.info(f"Core metadata generation completed. Response keys: {list(ai_response.keys())}")
            logger.info(f"Core metadata response: {ai_response}")
            
            return ai_response
            
        except Exception as e:
            logger.error(f"Core metadata generation failed: {e}")
            raise e
    
    async def _generate_social_metadata(
        self, 
        blog_content: str, 
        blog_title: str, 
        keywords_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate social media and structured data (Call 2)"""
        try:
            # Create comprehensive prompt for social metadata
            prompt = self._create_social_metadata_prompt(blog_content, blog_title, keywords_data)
            
            # Define simplified structured schema for social metadata
            schema = {
                "type": "object",
                "properties": {
                    "open_graph": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string"},
                            "description": {"type": "string"},
                            "image": {"type": "string"},
                            "type": {"type": "string"},
                            "site_name": {"type": "string"},
                            "url": {"type": "string"}
                        }
                    },
                    "twitter_card": {
                        "type": "object", 
                        "properties": {
                            "card": {"type": "string"},
                            "title": {"type": "string"},
                            "description": {"type": "string"},
                            "image": {"type": "string"},
                            "site": {"type": "string"},
                            "creator": {"type": "string"}
                        }
                    },
                    "json_ld_schema": {
                        "type": "object",
                        "properties": {
                            "@context": {"type": "string"},
                            "@type": {"type": "string"},
                            "headline": {"type": "string"},
                            "description": {"type": "string"},
                            "author": {"type": "object"},
                            "publisher": {"type": "object"},
                            "datePublished": {"type": "string"},
                            "dateModified": {"type": "string"},
                            "mainEntityOfPage": {"type": "string"},
                            "keywords": {"type": "array"},
                            "wordCount": {"type": "integer"}
                        }
                    }
                },
                "required": ["open_graph", "twitter_card", "json_ld_schema"]
            }
            
            # Get structured response from Gemini
            ai_response = self.gemini_provider(
                prompt,
                schema,
                temperature=0.3,
                max_tokens=2048
            )
            
            # Check if we got a valid response
            if not ai_response or not isinstance(ai_response, dict) or not ai_response.get('open_graph') or not ai_response.get('twitter_card') or not ai_response.get('json_ld_schema'):
                logger.error("Social metadata generation failed: Invalid or empty response from Gemini")
                # Return fallback response
                return {
                    'open_graph': {
                        'title': blog_title,
                        'description': f'Learn about {keywords_data.get("primary_keywords", ["this topic"])[0] if keywords_data.get("primary_keywords") else "this topic"}.',
                        'image': 'https://example.com/image.jpg',
                        'type': 'article',
                        'site_name': 'Your Website',
                        'url': 'https://example.com/blog'
                    },
                    'twitter_card': {
                        'card': 'summary_large_image',
                        'title': blog_title,
                        'description': f'Learn about {keywords_data.get("primary_keywords", ["this topic"])[0] if keywords_data.get("primary_keywords") else "this topic"}.',
                        'image': 'https://example.com/image.jpg',
                        'site': '@yourwebsite',
                        'creator': '@author'
                    },
                    'json_ld_schema': {
                        '@context': 'https://schema.org',
                        '@type': 'Article',
                        'headline': blog_title,
                        'description': f'Learn about {keywords_data.get("primary_keywords", ["this topic"])[0] if keywords_data.get("primary_keywords") else "this topic"}.',
                        'author': {'@type': 'Person', 'name': 'Author Name'},
                        'publisher': {'@type': 'Organization', 'name': 'Your Website'},
                        'datePublished': '2025-01-01T00:00:00Z',
                        'dateModified': '2025-01-01T00:00:00Z',
                        'mainEntityOfPage': 'https://example.com/blog',
                        'keywords': keywords_data.get('primary_keywords', ['content']),
                        'wordCount': len(blog_content.split())
                    }
                }
            
            logger.info(f"Social metadata generation completed. Response keys: {list(ai_response.keys())}")
            logger.info(f"Open Graph data: {ai_response.get('open_graph', 'Not found')}")
            logger.info(f"Twitter Card data: {ai_response.get('twitter_card', 'Not found')}")
            logger.info(f"JSON-LD data: {ai_response.get('json_ld_schema', 'Not found')}")
            
            return ai_response
            
        except Exception as e:
            logger.error(f"Social metadata generation failed: {e}")
            raise e
    
    def _create_core_metadata_prompt(
        self, 
        blog_content: str, 
        blog_title: str, 
        keywords_data: Dict[str, Any]
    ) -> str:
        """Create high-quality prompt for core metadata generation"""
        
        primary_keywords = ", ".join(keywords_data.get('primary_keywords', []))
        semantic_keywords = ", ".join(keywords_data.get('semantic_keywords', []))
        search_intent = keywords_data.get('search_intent', 'informational')
        target_audience = keywords_data.get('target_audience', 'general')
        industry = keywords_data.get('industry', 'general')
        
        # Calculate word count for reading time estimation
        word_count = len(blog_content.split())
        
        prompt = f"""
Generate SEO metadata for this blog post.

BLOG TITLE: {blog_title}
BLOG CONTENT: {blog_content[:1000]}...
PRIMARY KEYWORDS: {primary_keywords}
SEMANTIC KEYWORDS: {semantic_keywords}
WORD COUNT: {word_count}

Generate:
1. SEO TITLE (50-60 characters) - include primary keyword
2. META DESCRIPTION (150-160 characters) - include CTA
3. URL SLUG (lowercase, hyphens, 3-5 words)
4. BLOG TAGS (5-8 relevant tags)
5. BLOG CATEGORIES (2-3 categories)
6. SOCIAL HASHTAGS (5-10 hashtags with #)
7. READING TIME (calculate from {word_count} words)
8. FOCUS KEYWORD (primary keyword for SEO)

Make it compelling and SEO-optimized.
"""
        return prompt
    
    def _create_social_metadata_prompt(
        self, 
        blog_content: str, 
        blog_title: str, 
        keywords_data: Dict[str, Any]
    ) -> str:
        """Create high-quality prompt for social metadata generation"""
        
        primary_keywords = ", ".join(keywords_data.get('primary_keywords', []))
        search_intent = keywords_data.get('search_intent', 'informational')
        target_audience = keywords_data.get('target_audience', 'general')
        industry = keywords_data.get('industry', 'general')
        
        current_date = datetime.now().isoformat()
        
        prompt = f"""
Generate social media metadata for this blog post.

BLOG TITLE: {blog_title}
BLOG CONTENT: {blog_content[:800]}...
PRIMARY KEYWORDS: {primary_keywords}
CURRENT DATE: {current_date}

Generate:

1. OPEN GRAPH (Facebook/LinkedIn):
   - title: 60 chars max
   - description: 160 chars max  
   - image: image URL
   - type: "article"
   - site_name: site name
   - url: canonical URL

2. TWITTER CARD:
   - card: "summary_large_image"
   - title: 70 chars max
   - description: 200 chars max with hashtags
   - image: image URL
   - site: @sitename
   - creator: @author

3. JSON-LD SCHEMA:
   - @context: "https://schema.org"
   - @type: "Article"
   - headline: article title
   - description: article description
   - author: {{"@type": "Person", "name": "Author Name"}}
   - publisher: {{"@type": "Organization", "name": "Site Name"}}
   - datePublished: ISO date
   - dateModified: ISO date
   - mainEntityOfPage: canonical URL
   - keywords: array of keywords
   - wordCount: word count

Make it engaging and SEO-optimized.
"""
        return prompt
    
    def _compile_metadata_response(
        self, 
        core_metadata: Dict[str, Any], 
        social_metadata: Dict[str, Any],
        original_title: str
    ) -> Dict[str, Any]:
        """Compile final metadata response"""
        try:
            # Extract data from AI responses
            seo_title = core_metadata.get('seo_title', original_title)
            meta_description = core_metadata.get('meta_description', '')
            url_slug = core_metadata.get('url_slug', '')
            blog_tags = core_metadata.get('blog_tags', [])
            blog_categories = core_metadata.get('blog_categories', [])
            social_hashtags = core_metadata.get('social_hashtags', [])
            canonical_url = core_metadata.get('canonical_url', '')
            reading_time = core_metadata.get('reading_time', 0)
            focus_keyword = core_metadata.get('focus_keyword', '')
            
            open_graph = social_metadata.get('open_graph', {})
            twitter_card = social_metadata.get('twitter_card', {})
            json_ld_schema = social_metadata.get('json_ld_schema', {})
            
            # Compile comprehensive response
            response = {
                'success': True,
                'title_options': [seo_title],  # For backward compatibility
                'meta_descriptions': [meta_description],  # For backward compatibility
                'seo_title': seo_title,
                'meta_description': meta_description,
                'url_slug': url_slug,
                'blog_tags': blog_tags,
                'blog_categories': blog_categories,
                'social_hashtags': social_hashtags,
                'canonical_url': canonical_url,
                'reading_time': reading_time,
                'focus_keyword': focus_keyword,
                'open_graph': open_graph,
                'twitter_card': twitter_card,
                'json_ld_schema': json_ld_schema,
                'generated_at': datetime.utcnow().isoformat(),
                'metadata_summary': {
                    'total_metadata_types': 10,
                    'ai_calls_used': 2,
                    'optimization_score': self._calculate_optimization_score(core_metadata, social_metadata)
                }
            }
            
            logger.info(f"Metadata compilation completed. Generated {len(response)} metadata fields")
            return response
            
        except Exception as e:
            logger.error(f"Metadata compilation failed: {e}")
            raise e
    
    def _calculate_optimization_score(self, core_metadata: Dict[str, Any], social_metadata: Dict[str, Any]) -> int:
        """Calculate overall optimization score for the generated metadata"""
        try:
            score = 0
            
            # Check core metadata completeness
            if core_metadata.get('seo_title'):
                score += 15
            if core_metadata.get('meta_description'):
                score += 15
            if core_metadata.get('url_slug'):
                score += 10
            if core_metadata.get('blog_tags'):
                score += 10
            if core_metadata.get('blog_categories'):
                score += 10
            if core_metadata.get('social_hashtags'):
                score += 10
            if core_metadata.get('focus_keyword'):
                score += 10
            
            # Check social metadata completeness
            if social_metadata.get('open_graph'):
                score += 10
            if social_metadata.get('twitter_card'):
                score += 5
            if social_metadata.get('json_ld_schema'):
                score += 5
            
            return min(score, 100)  # Cap at 100
            
        except Exception as e:
            logger.error(f"Failed to calculate optimization score: {e}")
            return 0
