from typing import Any, Dict, List
from loguru import logger
from services.llm_providers.gemini_provider import gemini_structured_json_response

from models.blog_models import (
    BlogResearchRequest,
    BlogResearchResponse,
    BlogOutlineRequest,
    BlogOutlineResponse,
    BlogOutlineRefineRequest,
    BlogSectionRequest,
    BlogSectionResponse,
    BlogOptimizeRequest,
    BlogOptimizeResponse,
    BlogSEOAnalyzeRequest,
    BlogSEOAnalyzeResponse,
    BlogSEOMetadataRequest,
    BlogSEOMetadataResponse,
    BlogPublishRequest,
    BlogPublishResponse,
    ResearchSource,
    BlogOutlineSection,
)


class BlogWriterService:
    """Service layer for AI Blog Writer (stub implementations for scaffolding)."""

    async def research(self, request: BlogResearchRequest) -> BlogResearchResponse:
        """
        Stage 1: Research & Strategy (AI Orchestration)
        Uses ONLY Gemini's native Google Search grounding - ONE API call for everything.
        Follows LinkedIn service pattern for efficiency and cost optimization.
        """
        from services.llm_providers.gemini_grounded_provider import GeminiGroundedProvider
        
        gemini = GeminiGroundedProvider()

        topic = request.topic or ", ".join(request.keywords)
        industry = request.industry or (request.persona.industry if request.persona and request.persona.industry else "General")
        target_audience = getattr(request.persona, 'target_audience', 'General') if request.persona else 'General'

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
        keyword_analysis = self._parse_keyword_analysis(content, request.keywords)
        competitor_analysis = self._parse_competitor_analysis(content)
        suggested_angles = self._parse_content_angles(content, topic, industry)
        
        logger.info(f"Research completed successfully with {len(sources)} sources and {len(search_queries)} search queries")

        return BlogResearchResponse(
            success=True,
            sources=sources,
            keyword_analysis=keyword_analysis,
            competitor_analysis=competitor_analysis,
            suggested_angles=suggested_angles,
            # Add search widget and queries for UI display
            search_widget=search_widget if 'search_widget' in locals() else "",
            search_queries=search_queries if 'search_queries' in locals() else [],
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

    def _parse_keyword_analysis(self, content: str, original_keywords: List[str]) -> Dict[str, Any]:
        """Parse keyword analysis from the research content."""
        # Extract keywords from content sections
        lines = content.split('\n')
        keyword_section = []
        in_keyword_section = False
        
        for line in lines:
            if 'keyword' in line.lower() and ('analysis' in line.lower() or 'primary' in line.lower()):
                in_keyword_section = True
                continue
            if in_keyword_section and line.strip():
                if line.startswith(('1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.')):
                    break
                keyword_section.append(line.strip())
        
        return {
            "primary": original_keywords[:1] if original_keywords else [],
            "secondary": original_keywords[1:] if len(original_keywords) > 1 else [],
            "long_tail": [f"{kw} guide" for kw in original_keywords[:2]] if original_keywords else [],
            "search_intent": "informational",
            "difficulty": 6,
            "content_gaps": [f"{kw} best practices" for kw in original_keywords[:2]] if original_keywords else [],
            "analysis_content": "\n".join(keyword_section) if keyword_section else content[:200]
        }

    def _parse_competitor_analysis(self, content: str) -> Dict[str, Any]:
        """Parse competitor analysis from the research content."""
        lines = content.split('\n')
        competitor_section = []
        in_competitor_section = False
        
        for line in lines:
            if 'competitor' in line.lower() and ('analysis' in line.lower() or 'top' in line.lower()):
                in_competitor_section = True
                continue
            if in_competitor_section and line.strip():
                if line.startswith(('1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.')):
                    break
                competitor_section.append(line.strip())
        
        return {
            "top_competitors": [],
            "content_gaps": [],
            "opportunities": [],
            "analysis_notes": "\n".join(competitor_section) if competitor_section else "Competitor analysis from research"
        }

    def _parse_content_angles(self, content: str, topic: str, industry: str) -> List[str]:
        """Parse content angles from the research content."""
        lines = content.split('\n')
        angles_section = []
        in_angles_section = False
        
        for line in lines:
            if 'angle' in line.lower() and ('suggest' in line.lower() or 'content' in line.lower()):
                in_angles_section = True
                continue
            if in_angles_section and line.strip():
                if line.startswith(('1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.')):
                    break
                if line.strip() and not line.startswith(('•', '-', '*')):
                    angles_section.append(line.strip())
        
        # If no angles found in content, use fallback
        if not angles_section:
            angles_section = [
                f"How {topic} is Transforming {industry}",
                f"Latest {topic} Trends: What You Need to Know",
                f"{topic} Best Practices for {industry}",
                f"Case Study: {topic} Success Stories",
                f"The Future of {topic} in {industry}"
            ]
        
        return angles_section[:5]  # Return top 5 angles


    async def generate_outline(self, request: BlogOutlineRequest) -> BlogOutlineResponse:
        """
        Stage 2: Content Planning with AI-generated outline using research results
        Uses Gemini with research data to create comprehensive, SEO-optimized outline
        """
        # Extract research insights
        research = request.research
        primary_keywords = research.keyword_analysis.get('primary', [])
        secondary_keywords = research.keyword_analysis.get('secondary', [])
        content_angles = research.suggested_angles
        sources = research.sources
        search_intent = research.keyword_analysis.get('search_intent', 'informational')
        
        # Build sophisticated outline generation prompt with advanced content strategy
        outline_prompt = f"""
        You are a world-class content strategist and SEO expert with 15+ years of experience creating viral, high-converting blog content. Your outlines have generated millions of views and driven significant business results.

        CONTENT STRATEGY BRIEF:
        Topic: {', '.join(primary_keywords)}
        Search Intent: {search_intent}
        Target Word Count: {request.word_count or 1500} words
        Industry Context: {getattr(request.persona, 'industry', 'General') if request.persona else 'General'}
        Audience: {getattr(request.persona, 'target_audience', 'General') if request.persona else 'General'}

        RESEARCH INTELLIGENCE:
        Primary Keywords: {', '.join(primary_keywords)}
        Secondary Keywords: {', '.join(secondary_keywords)}
        Long-tail Opportunities: {', '.join(research.keyword_analysis.get('long_tail', [])[:5])}
        
        Content Angles Discovered:
        {chr(10).join([f"• {angle}" for angle in content_angles[:6]])}
        
        Research Sources Available: {len(sources)} authoritative sources with current data

        STRATEGIC OUTLINE REQUIREMENTS:

        1. CONTENT ARCHITECTURE:
           - Create 5-7 sections that follow a logical progression
           - Each section must have a clear purpose and value proposition
           - Build a narrative arc that keeps readers engaged throughout
           - Include strategic content gaps that competitors miss

        2. SEO OPTIMIZATION:
           - Naturally integrate primary keywords in H2 headings (not forced)
           - Use secondary keywords in subheadings and key points
           - Include long-tail keywords in natural language
           - Optimize for featured snippets and voice search
           - Create semantic keyword clusters

        3. READER ENGAGEMENT:
           - Start with a compelling hook that addresses pain points
           - Use storytelling elements and real-world examples
           - Include actionable insights readers can implement immediately
           - Create sections that encourage social sharing
           - End with a strong call-to-action

        4. CONTENT DEPTH:
           - Each section: 2-4 specific, actionable subheadings
           - Each section: 4-6 key points with research-backed insights
           - Include data points, statistics, and case studies where relevant
           - Address common objections and questions
           - Provide unique angles not covered by competitors

        5. WORD COUNT DISTRIBUTION:
           - Introduction: 10-15% of total words
           - Main sections: 70-80% of total words (distributed strategically)
           - Conclusion: 10-15% of total words
           - Total target: {request.word_count or 1500} words

        6. COMPETITIVE ADVANTAGE:
           - Include fresh perspectives from recent research
           - Address emerging trends and future implications
           - Provide deeper insights than surface-level content
           - Include practical tools, frameworks, or templates
           - Reference authoritative sources and data

        TITLE STRATEGY:
        Create 3 distinct title options that:
        - Include primary keywords naturally
        - Promise clear value to readers
        - Create curiosity and urgency
        - Are optimized for click-through rates
        - Work well for social media sharing

        CRITICAL: Respond ONLY with valid JSON. No additional text or explanations.

        JSON FORMAT:
        {{
            "title_options": [
                "Compelling title with primary keyword and benefit",
                "Question-based title that creates curiosity",
                "How-to title with specific outcome promise"
            ],
            "outline": [
                {{
                    "heading": "Strategic section title with primary keyword",
                    "subheadings": [
                        "Specific, actionable subheading 1",
                        "Data-driven subheading 2", 
                        "Case study or example subheading 3"
                    ],
                    "key_points": [
                        "Research-backed insight with specific data",
                        "Actionable step readers can take immediately",
                        "Common mistake to avoid with explanation",
                        "Advanced tip that provides competitive advantage",
                        "Real-world example or case study"
                    ],
                    "target_words": 300,
                    "keywords": ["primary keyword", "secondary keyword", "long-tail phrase"]
                }}
            ]
        }}
        """
        
        logger.info("Generating AI-powered outline using research results")
        
        # Define the schema for structured JSON response
        outline_schema = {
            "type": "object",
            "properties": {
                "title_options": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "3 SEO-optimized title options"
                },
                "outline": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": {"type": "string"},
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
                                "items": {"type": "string"},
                                "description": "Keywords to focus on in this section"
                            }
                        },
                        "required": ["id", "heading", "subheadings", "key_points", "word_count", "keywords"]
                    }
                }
            },
            "required": ["title_options", "outline"]
        }
        
        # Generate outline using structured JSON response (no grounding needed)
        outline_data = gemini_structured_json_response(
            prompt=outline_prompt,
            schema=outline_schema,
            temperature=0.3,
            max_tokens=3000
        )
        
        # Check for errors in the response
        if isinstance(outline_data, dict) and 'error' in outline_data:
            logger.error(f"Gemini structured response error: {outline_data['error']}")
            raise ValueError(f"AI outline generation failed: {outline_data['error']}")
        
        # Validate required fields
        if not isinstance(outline_data, dict) or 'outline' not in outline_data or not isinstance(outline_data['outline'], list):
            logger.error(f"Invalid outline structure: {outline_data}")
            raise ValueError("Invalid outline structure in Gemini response")
        
        # Convert to BlogOutlineSection objects
        outline_sections = []
        for i, section_data in enumerate(outline_data.get('outline', [])):
            if not isinstance(section_data, dict) or 'heading' not in section_data:
                logger.warning(f"Skipping invalid section data at index {i}")
                continue
                
            section = BlogOutlineSection(
                id=f"s{i+1}",
                heading=section_data.get('heading', f'Section {i+1}'),
                subheadings=section_data.get('subheadings', []),
                key_points=section_data.get('key_points', []),
                references=sources[:2] if i < 2 else [],  # Assign sources to first 2 sections
                target_words=section_data.get('target_words', 300),
                keywords=section_data.get('keywords', [])
            )
            outline_sections.append(section)
        
        title_options = outline_data.get('title_options', [])
        if not title_options:
            raise ValueError("No title options provided in Gemini response")
        
        logger.info(f"Generated outline with {len(outline_sections)} sections and {len(title_options)} title options")
        
        return BlogOutlineResponse(
            success=True, 
            title_options=title_options, 
            outline=outline_sections
        )
    

    async def refine_outline(self, request: BlogOutlineRefineRequest) -> BlogOutlineResponse:
        """
        Refine outline with HITL (Human-in-the-Loop) operations
        Supports add, remove, move, merge, rename operations
        """
        outline = request.outline.copy()
        operation = request.operation.lower()
        section_id = request.section_id
        payload = request.payload or {}
        
        try:
            if operation == 'add':
                # Add new section
                new_section = BlogOutlineSection(
                    id=f"s{len(outline) + 1}",
                    heading=payload.get('heading', 'New Section'),
                    subheadings=payload.get('subheadings', []),
                    key_points=payload.get('key_points', []),
                    references=[],
                    target_words=payload.get('target_words', 300)
                )
                outline.append(new_section)
                logger.info(f"Added new section: {new_section.heading}")
                
            elif operation == 'remove' and section_id:
                # Remove section
                outline = [s for s in outline if s.id != section_id]
                logger.info(f"Removed section: {section_id}")
                
            elif operation == 'rename' and section_id:
                # Rename section
                for section in outline:
                    if section.id == section_id:
                        section.heading = payload.get('heading', section.heading)
                        break
                logger.info(f"Renamed section {section_id} to: {payload.get('heading')}")
                
            elif operation == 'move' and section_id:
                # Move section (reorder)
                direction = payload.get('direction', 'down')  # 'up' or 'down'
                current_index = next((i for i, s in enumerate(outline) if s.id == section_id), -1)
                
                if current_index != -1:
                    if direction == 'up' and current_index > 0:
                        outline[current_index], outline[current_index - 1] = outline[current_index - 1], outline[current_index]
                    elif direction == 'down' and current_index < len(outline) - 1:
                        outline[current_index], outline[current_index + 1] = outline[current_index + 1], outline[current_index]
                logger.info(f"Moved section {section_id} {direction}")
                
            elif operation == 'merge' and section_id:
                # Merge with next section
                current_index = next((i for i, s in enumerate(outline) if s.id == section_id), -1)
                if current_index != -1 and current_index < len(outline) - 1:
                    current_section = outline[current_index]
                    next_section = outline[current_index + 1]
                    
                    # Merge sections
                    current_section.heading = f"{current_section.heading} & {next_section.heading}"
                    current_section.subheadings.extend(next_section.subheadings)
                    current_section.key_points.extend(next_section.key_points)
                    current_section.references.extend(next_section.references)
                    current_section.target_words = (current_section.target_words or 0) + (next_section.target_words or 0)
                    
                    # Remove the next section
                    outline.pop(current_index + 1)
                logger.info(f"Merged section {section_id} with next section")
                
            elif operation == 'update' and section_id:
                # Update section details
                for section in outline:
                    if section.id == section_id:
                        if 'heading' in payload:
                            section.heading = payload['heading']
                        if 'subheadings' in payload:
                            section.subheadings = payload['subheadings']
                        if 'key_points' in payload:
                            section.key_points = payload['key_points']
                        if 'target_words' in payload:
                            section.target_words = payload['target_words']
                        break
                logger.info(f"Updated section {section_id}")
            
            # Reassign IDs to maintain order
            for i, section in enumerate(outline):
                section.id = f"s{i+1}"
            
            return BlogOutlineResponse(
                success=True, 
                title_options=["Refined Outline"], 
                outline=outline
            )
            
        except Exception as e:
            logger.error(f"Outline refinement failed: {e}")
            return BlogOutlineResponse(
                success=False, 
                title_options=["Error"], 
                outline=request.outline
            )

    async def generate_section(self, request: BlogSectionRequest) -> BlogSectionResponse:
        # TODO: Generate section markdown incorporating references and persona/tone
        md = f"## {request.section.heading}\n\nThis section content will be generated here.\n"
        return BlogSectionResponse(success=True, markdown=md, citations=request.section.references)

    async def optimize_section(self, request: BlogOptimizeRequest) -> BlogOptimizeResponse:
        # TODO: Run readability/EEAT optimization and return diff
        return BlogOptimizeResponse(success=True, optimized=request.content, diff_preview=None)

    async def hallucination_check(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Run hallucination detection on provided text using existing detector service."""
        text = str(payload.get("text", "") or "").strip()
        if not text:
            return {"success": False, "error": "No text provided"}

        # Prefer direct service use over HTTP proxy
        try:
            from services.hallucination_detector import HallucinationDetector
            detector = HallucinationDetector()
            result = await detector.detect_hallucinations(text)

            # Serialize dataclass-like result to dict
            claims = []
            for c in result.claims:
                claims.append({
                    "text": c.text,
                    "confidence": c.confidence,
                    "assessment": c.assessment,
                    "supporting_sources": c.supporting_sources,
                    "refuting_sources": c.refuting_sources,
                    "reasoning": c.reasoning,
                })

            return {
                "success": True,
                "overall_confidence": result.overall_confidence,
                "total_claims": result.total_claims,
                "supported_claims": result.supported_claims,
                "refuted_claims": result.refuted_claims,
                "insufficient_claims": result.insufficient_claims,
                "timestamp": result.timestamp,
                "claims": claims,
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def seo_analyze(self, request: BlogSEOAnalyzeRequest) -> BlogSEOAnalyzeResponse:
        """Wrap existing SEO tools to produce unified analysis for blog content."""
        from services.seo_tools.on_page_seo_service import OnPageSEOService
        from services.seo_tools.image_alt_service import ImageAltService
        from services.seo_tools.content_strategy_service import ContentStrategyService

        content = request.content or ""
        target_keywords = request.keywords or []

        # On-page analysis (treat content as a virtual URL/document for now)
        on_page = OnPageSEOService()
        on_page_result = await on_page.analyze_on_page_seo(url="about:blank", target_keywords=target_keywords)

        # Image alt coverage (placeholder: no images in raw content yet)
        try:
            image_alt_service = ImageAltService()
            image_alt_status = {"total_images": 0, "missing_alt": 0}
        except Exception:
            image_alt_status = {"total_images": 0, "missing_alt": 0}

        # Strategy hints (keywords/topics)
        try:
            strategy = ContentStrategyService()
            strategy_hints = await strategy.analyze_content_topics(content=content)
        except Exception:
            strategy_hints = {"topics": [], "gaps": []}

        # Lightweight markdown parsing for headings/links/keywords
        import re
        content_text = content or ""
        words = re.findall(r"[A-Za-z0-9']+", content_text)
        total_words = max(len(words), 1)
        heading_lines = content_text.splitlines()
        h1 = sum(1 for ln in heading_lines if ln.startswith('# '))
        h2 = sum(1 for ln in heading_lines if ln.startswith('## '))
        h3 = sum(1 for ln in heading_lines if ln.startswith('### '))
        md_links = re.findall(r"\[([^\]]+)\]\(([^)]+)\)", content_text)
        external_links = [u for (_t, u) in md_links if u.startswith('http')]

        # Keyword density
        density_map: Dict[str, Any] = {"target_keywords": target_keywords}
        for kw in target_keywords:
            try:
                occurrences = len(re.findall(re.escape(kw), content_text, flags=re.IGNORECASE))
            except re.error:
                occurrences = 0
            density_map[kw] = {
                "occurrences": occurrences,
                "density": round(occurrences / total_words, 4)
            }

        # Build unified response
        recommendations: List[str] = []
        if isinstance(on_page_result.get("recommendations"), list):
            recommendations.extend(on_page_result["recommendations"]) 
        if strategy_hints.get("gaps"):
            recommendations.append("Cover missing topics: " + ", ".join(strategy_hints["gaps"]))
        if not external_links:
            recommendations.append("Add at least one credible external link to authoritative sources.")
        if h2 < 2:
            recommendations.append("Increase number of H2 sections for better structure.")

        # Internal link suggestions: generate anchors for H2s and propose cross-links
        def to_anchor(h: str) -> str:
            import re
            a = re.sub(r"[^a-z0-9\s-]", "", h.lower())
            a = re.sub(r"\s+", "-", a).strip('-')
            return a
        h2_headings = [ln[3:].strip() for ln in heading_lines if ln.startswith('## ')]
        anchors = [to_anchor(h) for h in h2_headings]
        internal_link_suggestions = []
        for i in range(len(anchors)-1):
            internal_link_suggestions.append({
                "from": h2_headings[i],
                "to": h2_headings[i+1],
                "anchor": f"#{anchors[i+1]}",
                "suggestion": f"Add internal link from '{h2_headings[i]}' to '{h2_headings[i+1]}'"
            })

        return BlogSEOAnalyzeResponse(
            success=True,
            seo_score=float(on_page_result.get("overall_score", 75)),
            density=density_map,
            structure={
                **on_page_result.get("heading_structure", {}),
                "markdown_headings": {"h1": h1, "h2": h2, "h3": h3},
                "links": {"total": len(md_links), "external": len(external_links)}
            },
            readability=on_page_result.get("content_analysis", {}),
            link_suggestions=([{"suggestion": "Add external citation links for key claims."}] if not external_links else []) + internal_link_suggestions,
            image_alt_status=image_alt_status,
            recommendations=recommendations,
        )

    async def seo_metadata(self, request: BlogSEOMetadataRequest) -> BlogSEOMetadataResponse:
        # TODO: Generate SEO metadata using existing services
        return BlogSEOMetadataResponse(
            success=True,
            title_options=[request.title or "Generated SEO Title"],
            meta_descriptions=["Compelling meta description..."],
            open_graph={"title": request.title or "OG Title", "image": ""},
            twitter_card={"card": "summary_large_image"},
            schema={"@type": "Article"},
        )

    async def publish(self, request: BlogPublishRequest) -> BlogPublishResponse:
        # TODO: Call Wix/WordPress adapters to publish
        return BlogPublishResponse(success=True, platform=request.platform, url="https://example.com/post")


