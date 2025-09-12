"""
Outline Generator - AI-powered outline generation from research data.

Generates comprehensive, SEO-optimized outlines using research intelligence.
"""

from typing import Dict, Any, List
import asyncio
from loguru import logger

from models.blog_models import (
    BlogOutlineRequest,
    BlogOutlineResponse,
    BlogOutlineSection,
)


class OutlineGenerator:
    """Generates AI-powered outlines from research data."""
    
    async def generate(self, request: BlogOutlineRequest) -> BlogOutlineResponse:
        """
        Generate AI-powered outline using research results
        """
        # Extract research insights
        research = request.research
        primary_keywords = research.keyword_analysis.get('primary', [])
        secondary_keywords = research.keyword_analysis.get('secondary', [])
        content_angles = research.suggested_angles
        sources = research.sources
        search_intent = research.keyword_analysis.get('search_intent', 'informational')
        
        # Check for custom instructions
        custom_instructions = getattr(request, 'custom_instructions', None)
        
        # Build comprehensive outline generation prompt with rich research data
        outline_prompt = self._build_outline_prompt(
            primary_keywords, secondary_keywords, content_angles, sources,
            search_intent, request, custom_instructions
        )
        
        logger.info("Generating AI-powered outline using research results")
        
        # Define schema with proper property ordering (critical for Gemini API)
        outline_schema = self._get_outline_schema()
        
        # Generate outline using structured JSON response with retry logic
        outline_data = await self._generate_with_retry(outline_prompt, outline_schema)
        
        # Convert to BlogOutlineSection objects
        outline_sections = self._convert_to_sections(outline_data, sources)
        
        # Extract title options
        title_options = outline_data.get('title_options', [])
        if not title_options:
            title_options = self._generate_fallback_titles(primary_keywords)
        
        logger.info(f"Generated outline with {len(outline_sections)} sections and {len(title_options)} title options")
        
        return BlogOutlineResponse(
            success=True,
            title_options=title_options,
            outline=outline_sections
        )
    
    async def generate_with_progress(self, request: BlogOutlineRequest, task_id: str) -> BlogOutlineResponse:
        """
        Outline generation method with progress updates for real-time feedback.
        """
        from api.blog_writer.router import _update_progress
        
        # Extract research insights
        research = request.research
        primary_keywords = research.keyword_analysis.get('primary', [])
        secondary_keywords = research.keyword_analysis.get('secondary', [])
        content_angles = research.suggested_angles
        sources = research.sources
        search_intent = research.keyword_analysis.get('search_intent', 'informational')
        
        # Check for custom instructions
        custom_instructions = getattr(request, 'custom_instructions', None)
        
        await _update_progress(task_id, "📊 Analyzing research data and building content strategy...")
        
        # Build comprehensive outline generation prompt with rich research data
        outline_prompt = self._build_outline_prompt(
            primary_keywords, secondary_keywords, content_angles, sources,
            search_intent, request, custom_instructions
        )
        
        await _update_progress(task_id, "🤖 Generating AI-powered outline with research insights...")
        
        # Define schema with proper property ordering (critical for Gemini API)
        outline_schema = self._get_outline_schema()
        
        await _update_progress(task_id, "🔄 Making AI request to generate structured outline...")
        
        # Generate outline using structured JSON response with retry logic
        outline_data = await self._generate_with_retry(outline_prompt, outline_schema, task_id)
        
        await _update_progress(task_id, "📝 Processing outline structure and validating sections...")
        
        # Convert to BlogOutlineSection objects
        outline_sections = self._convert_to_sections(outline_data, sources)
        
        # Extract title options
        title_options = outline_data.get('title_options', [])
        if not title_options:
            title_options = self._generate_fallback_titles(primary_keywords)
        
        await _update_progress(task_id, "✅ Outline generation completed successfully!")
        
        return BlogOutlineResponse(
            success=True,
            title_options=title_options,
            outline=outline_sections
        )
    
    def _build_outline_prompt(self, primary_keywords: List[str], secondary_keywords: List[str], 
                            content_angles: List[str], sources: List, search_intent: str,
                            request: BlogOutlineRequest, custom_instructions: str = None) -> str:
        """Build the comprehensive outline generation prompt."""
        return f"""
        You are a world-class content strategist and SEO expert with 15+ years of experience creating viral, high-converting blog content. Your outlines have generated millions of views and driven significant business results.

        CONTENT STRATEGY BRIEF:
        Topic: {', '.join(primary_keywords)}
        Search Intent: {search_intent}
        Target Word Count: {request.word_count or 1500} words
        Industry Context: {getattr(request.persona, 'industry', 'General') if request.persona else 'General'}
        Audience: {getattr(request.persona, 'target_audience', 'General') if request.persona else 'General'}
        
        {f"CUSTOM USER INSTRUCTIONS: {custom_instructions}" if custom_instructions else ""}

        RESEARCH INTELLIGENCE:
        Primary Keywords: {', '.join(primary_keywords)}
        Secondary Keywords: {', '.join(secondary_keywords)}
        Long-tail Opportunities: {', '.join(request.research.keyword_analysis.get('long_tail', [])[:5])}
        Semantic Keywords: {', '.join(request.research.keyword_analysis.get('semantic_keywords', [])[:5])}
        Trending Terms: {', '.join(request.research.keyword_analysis.get('trending_terms', [])[:3])}
        Keyword Difficulty: {request.research.keyword_analysis.get('difficulty', 6)}/10
        Content Gaps: {', '.join(request.research.keyword_analysis.get('content_gaps', [])[:3])}
        
        Content Angles Discovered:
        {chr(10).join([f"• {angle}" for angle in content_angles[:6]])}
        
        Competitive Intelligence:
        Top Competitors: {', '.join(request.research.competitor_analysis.get('top_competitors', [])[:3])}
        Market Opportunities: {', '.join(request.research.competitor_analysis.get('opportunities', [])[:3])}
        Competitive Advantages: {', '.join(request.research.competitor_analysis.get('competitive_advantages', [])[:3])}
        Market Positioning: {request.research.competitor_analysis.get('market_positioning', 'Standard positioning')}
        
        Research Sources Available: {len(sources)} authoritative sources with current data
        Key Statistics Available: Multiple data points, percentages, and expert quotes from credible sources

        STRATEGIC OUTLINE REQUIREMENTS:
        
        {f"CUSTOM REQUIREMENTS: {custom_instructions}" if custom_instructions else ""}
        
        1. CONTENT ARCHITECTURE:
        - Create a logical, engaging narrative arc that guides readers from problem to solution
        - Structure content to build authority and trust progressively
        - Include data-driven insights and expert opinions from research
        - Ensure each section adds unique value and builds upon previous sections
        
        2. SEO OPTIMIZATION:
        - Naturally integrate primary keywords in headings and content
        - Use secondary keywords strategically throughout sections
        - Include long-tail keywords in subheadings and key points
        - Optimize for featured snippets and voice search
        
        3. READER ENGAGEMENT:
        - Start with compelling hooks and pain points
        - Use storytelling elements and real-world examples
        - Include actionable insights and practical takeaways
        - End with clear next steps and calls-to-action
        
        4. CONTENT DEPTH:
        - Provide comprehensive coverage of the topic
        - Include multiple perspectives and expert insights
        - Address common questions and objections
        - Offer unique angles not covered by competitors
        
        5. WORD COUNT DISTRIBUTION:
        - Introduction: 12% of total word count
        - Main content sections: 76% of total word count
        - Conclusion: 12% of total word count
        - Ensure balanced section lengths for optimal readability
        
        6. COMPETITIVE ADVANTAGE:
        - Leverage content gaps identified in research
        - Include unique data points and statistics
        - Provide fresh perspectives on trending topics
        - Address underserved audience segments

        TITLE STRATEGY:
        Create 5 compelling title options that:
        - Include primary keywords naturally
        - Promise clear value and outcomes
        - Appeal to the target audience's pain points
        - Stand out from competitor content
        - Optimize for click-through rates

        Generate a comprehensive outline with the following structure:
        {{
            "title_options": [
                "Title 1 with primary keyword",
                "Title 2 with emotional hook",
                "Title 3 with benefit-focused approach",
                "Title 4 with question format",
                "Title 5 with urgency/trending angle"
            ],
            "outline": [
                {{
                    "heading": "Section heading with primary keyword",
                    "subheadings": ["Subheading 1", "Subheading 2", "Subheading 3"],
                    "key_points": ["Key point 1", "Key point 2", "Key point 3"],
                    "word_count": 300,
                    "keywords": ["primary keyword", "secondary keyword"]
                }}
            ]
        }}
        """
    
    def _get_outline_schema(self) -> Dict[str, Any]:
        """Get the structured JSON schema for outline generation."""
        return {
            "type": "object",
            "properties": {
                "title_options": {
                    "type": "array",
                    "items": {"type": "string"}
                },
                "outline": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "heading": {"type": "string"},
                            "subheadings": {
                                "type": "array",
                                "items": {"type": "string"}
                            },
                            "key_points": {
                                "type": "array",
                                "items": {"type": "string"}
                            },
                            "word_count": {"type": "integer"},
                            "keywords": {
                                "type": "array",
                                "items": {"type": "string"}
                            }
                        },
                        "required": ["heading", "subheadings", "key_points", "word_count", "keywords"]
                    }
                }
            },
            "required": ["title_options", "outline"],
            "propertyOrdering": ["title_options", "outline"]
        }
    
    async def _generate_with_retry(self, prompt: str, schema: Dict[str, Any], task_id: str = None) -> Dict[str, Any]:
        """Generate outline with retry logic for API failures."""
        from services.llm_providers.gemini_provider import gemini_structured_json_response
        from api.blog_writer.router import _update_progress
        
        max_retries = 2  # Conservative retry for expensive API calls
        retry_delay = 5  # 5 second delay between retries
        
        for attempt in range(max_retries + 1):
            try:
                if task_id:
                    await _update_progress(task_id, f"🤖 Calling Gemini API for outline generation (attempt {attempt + 1}/{max_retries + 1})...")
                
                outline_data = gemini_structured_json_response(
                    prompt=prompt,
                    schema=schema,
                    temperature=0.3,
                    max_tokens=4000  # Increased to avoid MAX_TOKENS truncation
                )
                
                # Log response for debugging
                logger.info(f"Gemini response received: {type(outline_data)}")
                
                # Check for errors in the response
                if isinstance(outline_data, dict) and 'error' in outline_data:
                    error_msg = str(outline_data['error'])
                    if "503" in error_msg and "overloaded" in error_msg and attempt < max_retries:
                        if task_id:
                            await _update_progress(task_id, f"⚠️ AI service overloaded, retrying in {retry_delay} seconds...")
                        logger.warning(f"Gemini API overloaded, retrying in {retry_delay} seconds (attempt {attempt + 1}/{max_retries + 1})")
                        await asyncio.sleep(retry_delay)
                        continue
                    else:
                        logger.error(f"Gemini structured response error: {outline_data['error']}")
                        raise ValueError(f"AI outline generation failed: {outline_data['error']}")
                
                # Validate required fields
                if not isinstance(outline_data, dict) or 'outline' not in outline_data or not isinstance(outline_data['outline'], list):
                    if attempt < max_retries:
                        if task_id:
                            await _update_progress(task_id, f"⚠️ Invalid response structure, retrying in {retry_delay} seconds...")
                        logger.warning(f"Invalid response structure, retrying in {retry_delay} seconds (attempt {attempt + 1}/{max_retries + 1})")
                        await asyncio.sleep(retry_delay)
                        continue
                    else:
                        raise ValueError("Invalid outline structure in Gemini response")
                
                # If we get here, the response is valid
                return outline_data
                
            except Exception as e:
                error_str = str(e)
                if ("503" in error_str or "overloaded" in error_str) and attempt < max_retries:
                    if task_id:
                        await _update_progress(task_id, f"⚠️ AI service error, retrying in {retry_delay} seconds...")
                    logger.warning(f"Gemini API error, retrying in {retry_delay} seconds (attempt {attempt + 1}/{max_retries + 1}): {error_str}")
                    await asyncio.sleep(retry_delay)
                    continue
                else:
                    logger.error(f"Outline generation failed after {attempt + 1} attempts: {error_str}")
                    raise ValueError(f"AI outline generation failed: {error_str}")
    
    def _convert_to_sections(self, outline_data: Dict[str, Any], sources: List) -> List[BlogOutlineSection]:
        """Convert outline data to BlogOutlineSection objects."""
        outline_sections = []
        for i, section_data in enumerate(outline_data.get('outline', [])):
            if not isinstance(section_data, dict) or 'heading' not in section_data:
                continue
                
            section = BlogOutlineSection(
                id=f"s{i+1}",
                heading=section_data.get('heading', f'Section {i+1}'),
                subheadings=section_data.get('subheadings', []),
                key_points=section_data.get('key_points', []),
                references=sources[:3],  # Use first 3 sources as references
                target_words=section_data.get('word_count', 200),
                keywords=section_data.get('keywords', [])
            )
            outline_sections.append(section)
        
        return outline_sections
    
    def _generate_fallback_titles(self, primary_keywords: List[str]) -> List[str]:
        """Generate fallback titles when AI generation fails."""
        primary_keyword = primary_keywords[0] if primary_keywords else "Topic"
        return [
            f"The Complete Guide to {primary_keyword}",
            f"{primary_keyword}: Everything You Need to Know",
            f"How to Master {primary_keyword} in 2024"
        ]
