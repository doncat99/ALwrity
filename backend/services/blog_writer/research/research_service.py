"""
Research Service - Core research functionality for AI Blog Writer.

Handles Google Search grounding, caching, and research orchestration.
"""

from typing import Dict, Any, List
from loguru import logger

from models.blog_models import (
    BlogResearchRequest,
    BlogResearchResponse,
    ResearchSource,
)

from .keyword_analyzer import KeywordAnalyzer
from .competitor_analyzer import CompetitorAnalyzer
from .content_angle_generator import ContentAngleGenerator


class ResearchService:
    """Service for conducting comprehensive research using Google Search grounding."""
    
    def __init__(self):
        self.keyword_analyzer = KeywordAnalyzer()
        self.competitor_analyzer = CompetitorAnalyzer()
        self.content_angle_generator = ContentAngleGenerator()
    
    async def research(self, request: BlogResearchRequest) -> BlogResearchResponse:
        """
        Stage 1: Research & Strategy (AI Orchestration)
        Uses ONLY Gemini's native Google Search grounding - ONE API call for everything.
        Follows LinkedIn service pattern for efficiency and cost optimization.
        Includes intelligent caching for exact keyword matches.
        """
        try:
            from services.llm_providers.gemini_grounded_provider import GeminiGroundedProvider
            from services.cache.research_cache import research_cache
            
            topic = request.topic or ", ".join(request.keywords)
            industry = request.industry or (request.persona.industry if request.persona and request.persona.industry else "General")
            target_audience = getattr(request.persona, 'target_audience', 'General') if request.persona else 'General'
            
            # Check cache first for exact keyword match
            cached_result = research_cache.get_cached_result(
                keywords=request.keywords,
                industry=industry,
                target_audience=target_audience
            )
            
            if cached_result:
                logger.info(f"Returning cached research result for keywords: {request.keywords}")
                return BlogResearchResponse(**cached_result)
            
            # Cache miss - proceed with API call
            logger.info(f"Cache miss - making API call for keywords: {request.keywords}")
            gemini = GeminiGroundedProvider()

            # Single comprehensive research prompt - Gemini handles Google Search automatically
            research_prompt = f"""
            Research the topic "{topic}" in the {industry} industry for {target_audience} audience. Provide a comprehensive analysis including:

            1. Current trends and insights (2024-2025)
            2. Key statistics and data points with sources
            3. Industry expert opinions and quotes
            4. Recent developments and news
            5. Market analysis and forecasts
            6. Best practices and case studies
            7. Keyword analysis: primary, secondary, and long-tail opportunities
            8. Competitor analysis: top players and content gaps
            9. Content angle suggestions: 5 compelling angles for blog posts

            Focus on factual, up-to-date information from credible sources.
            Include specific data points, percentages, and recent developments.
            Structure your response with clear sections for each analysis area.
            """
            
            # Single Gemini call with native Google Search grounding - no fallbacks
            gemini_result = await gemini.generate_grounded_content(
                prompt=research_prompt,
                content_type="research",
                max_tokens=2000
            )
            
            # Extract sources from grounding metadata
            sources = self._extract_sources_from_grounding(gemini_result)
            
            # Extract search widget and queries for UI display
            search_widget = gemini_result.get("search_widget", "") or ""
            search_queries = gemini_result.get("search_queries", []) or []
            
            # Parse the comprehensive response for different analysis components
            content = gemini_result.get("content", "")
            keyword_analysis = self.keyword_analyzer.analyze(content, request.keywords)
            competitor_analysis = self.competitor_analyzer.analyze(content)
            suggested_angles = self.content_angle_generator.generate(content, topic, industry)
            
            logger.info(f"Research completed successfully with {len(sources)} sources and {len(search_queries)} search queries")

            # Create the response
            response = BlogResearchResponse(
                success=True,
                sources=sources,
                keyword_analysis=keyword_analysis,
                competitor_analysis=competitor_analysis,
                suggested_angles=suggested_angles,
                # Add search widget and queries for UI display
                search_widget=search_widget if 'search_widget' in locals() else "",
                search_queries=search_queries if 'search_queries' in locals() else [],
            )
            
            # Cache the successful result for future exact keyword matches
            research_cache.cache_result(
                keywords=request.keywords,
                industry=industry,
                target_audience=target_audience,
                result=response.dict()
            )
            
            return response
            
        except Exception as e:
            error_message = str(e)
            logger.error(f"Research failed: {error_message}")
            
            # Return a graceful failure response instead of raising
            return BlogResearchResponse(
                success=False,
                sources=[],
                keyword_analysis={},
                competitor_analysis={},
                suggested_angles=[],
                search_widget="",
                search_queries=[],
                error_message=error_message
            )
    
    async def research_with_progress(self, request: BlogResearchRequest, task_id: str) -> BlogResearchResponse:
        """
        Research method with progress updates for real-time feedback.
        """
        try:
            from services.llm_providers.gemini_grounded_provider import GeminiGroundedProvider
            from services.cache.research_cache import research_cache
            from api.blog_writer.router import _update_progress
            
            topic = request.topic or ", ".join(request.keywords)
            industry = request.industry or (request.persona.industry if request.persona and request.persona.industry else "General")
            target_audience = getattr(request.persona, 'target_audience', 'General') if request.persona else 'General'
            
            # Check cache first for exact keyword match
            await _update_progress(task_id, "🔍 Checking cache for existing research...")
            cached_result = research_cache.get_cached_result(
                keywords=request.keywords,
                industry=industry,
                target_audience=target_audience
            )
            
            if cached_result:
                await _update_progress(task_id, "✅ Found cached research results! Returning instantly...")
                logger.info(f"Returning cached research result for keywords: {request.keywords}")
                return BlogResearchResponse(**cached_result)
            
            # Cache miss - proceed with API call
            await _update_progress(task_id, "🌐 Cache miss - connecting to Google Search grounding...")
            logger.info(f"Cache miss - making API call for keywords: {request.keywords}")
            gemini = GeminiGroundedProvider()

            # Single comprehensive research prompt - Gemini handles Google Search automatically
            research_prompt = f"""
            Research the topic "{topic}" in the {industry} industry for {target_audience} audience. Provide a comprehensive analysis including:

            1. Current trends and insights (2024-2025)
            2. Key statistics and data points with sources
            3. Industry expert opinions and quotes
            4. Recent developments and news
            5. Market analysis and forecasts
            6. Best practices and case studies
            7. Keyword analysis: primary, secondary, and long-tail opportunities
            8. Competitor analysis: top players and content gaps
            9. Content angle suggestions: 5 compelling angles for blog posts

            Focus on factual, up-to-date information from credible sources.
            Include specific data points, percentages, and recent developments.
            Structure your response with clear sections for each analysis area.
            """
            
            await _update_progress(task_id, "🤖 Making AI request to Gemini with Google Search grounding...")
            # Single Gemini call with native Google Search grounding - no fallbacks
            gemini_result = await gemini.generate_grounded_content(
                prompt=research_prompt,
                content_type="research",
                max_tokens=2000
            )
            
            await _update_progress(task_id, "📊 Processing research results and extracting insights...")
            # Extract sources from grounding metadata
            sources = self._extract_sources_from_grounding(gemini_result)
            
            # Extract search widget and queries for UI display
            search_widget = gemini_result.get("search_widget", "") or ""
            search_queries = gemini_result.get("search_queries", []) or []
            
            await _update_progress(task_id, "🔍 Analyzing keywords and content angles...")
            # Parse the comprehensive response for different analysis components
            content = gemini_result.get("content", "")
            keyword_analysis = self.keyword_analyzer.analyze(content, request.keywords)
            competitor_analysis = self.competitor_analyzer.analyze(content)
            suggested_angles = self.content_angle_generator.generate(content, topic, industry)
            
            await _update_progress(task_id, "💾 Caching results for future use...")
            logger.info(f"Research completed successfully with {len(sources)} sources and {len(search_queries)} search queries")

            # Create the response
            response = BlogResearchResponse(
                success=True,
                sources=sources,
                keyword_analysis=keyword_analysis,
                competitor_analysis=competitor_analysis,
                suggested_angles=suggested_angles,
                # Add search widget and queries for UI display
                search_widget=search_widget if 'search_widget' in locals() else "",
                search_queries=search_queries if 'search_queries' in locals() else [],
            )
            
            # Cache the successful result for future exact keyword matches
            research_cache.cache_result(
                keywords=request.keywords,
                industry=industry,
                target_audience=target_audience,
                result=response.dict()
            )
            
            return response
            
        except Exception as e:
            error_message = str(e)
            logger.error(f"Research failed: {error_message}")
            
            # Return a graceful failure response instead of raising
            return BlogResearchResponse(
                success=False,
                sources=[],
                keyword_analysis={},
                competitor_analysis={},
                suggested_angles=[],
                search_widget="",
                search_queries=[],
                error_message=error_message
            )

    def _extract_sources_from_grounding(self, gemini_result: Dict[str, Any]) -> List[ResearchSource]:
        """Extract sources from Gemini grounding metadata."""
        sources = []
        
        # The Gemini grounded provider already extracts sources and puts them in the 'sources' field
        raw_sources = gemini_result.get("sources", [])
        for src in raw_sources:
            source = ResearchSource(
                title=src.get("title", "Untitled"),
                url=src.get("url", ""),
                excerpt=src.get("content", "")[:500] if src.get("content") else f"Source from {src.get('title', 'web')}",
                credibility_score=float(src.get("credibility_score", 0.8)),
                published_at=str(src.get("publication_date", "2024-01-01"))
            )
            sources.append(source)
        
        return sources
