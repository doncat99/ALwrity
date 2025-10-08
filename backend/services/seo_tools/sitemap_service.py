"""
Sitemap Analysis Service

AI-enhanced sitemap analyzer that provides insights into website structure,
content distribution, and publishing patterns for SEO optimization.
"""

import aiohttp
import asyncio
import re
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from loguru import logger
import xml.etree.ElementTree as ET
from urllib.parse import urlparse, urljoin
import pandas as pd

from ..llm_providers.main_text_generation import llm_text_gen
from middleware.logging_middleware import seo_logger


class SitemapService:
    """Service for analyzing website sitemaps with AI insights"""
    
    def __init__(self):
        """Initialize the sitemap service"""
        self.service_name = "sitemap_analyzer"
        logger.info(f"Initialized {self.service_name}")
        
        # Common sitemap paths to check
        self.common_sitemap_paths = [
            "sitemap.xml",
            "sitemap_index.xml", 
            "sitemap/index.xml",
            "sitemap.php",
            "sitemap.txt",
            "sitemap.xml.gz",
            "sitemap1.xml",
            # Common CMS/plugin paths
            "wp-sitemap.xml",  # WordPress 5.5+ default
            "post-sitemap.xml",
            "page-sitemap.xml",
            "product-sitemap.xml",  # WooCommerce
            "category-sitemap.xml",
            # Common feed paths that can act as sitemaps
            "rss/",
            "rss.xml",
            "atom.xml",
        ]
    
    async def analyze_sitemap(
        self,
        sitemap_url: str,
        analyze_content_trends: bool = True,
        analyze_publishing_patterns: bool = True
    ) -> Dict[str, Any]:
        """
        Analyze website sitemap for structure and patterns
        
        Args:
            sitemap_url: URL of the sitemap to analyze
            analyze_content_trends: Whether to analyze content trends
            analyze_publishing_patterns: Whether to analyze publishing patterns
            
        Returns:
            Dictionary containing sitemap analysis and AI insights
        """
        try:
            start_time = datetime.utcnow()
            
            if not sitemap_url:
                raise ValueError("Sitemap URL is required")
            
            logger.info(f"Analyzing sitemap: {sitemap_url}")
            
            # Fetch and parse sitemap data
            sitemap_data = await self._fetch_sitemap_data(sitemap_url)
            
            if not sitemap_data:
                raise Exception("Failed to fetch sitemap data")
            
            # Analyze sitemap structure
            structure_analysis = self._analyze_sitemap_structure(sitemap_data)
            
            # Analyze content trends if requested
            content_trends = {}
            if analyze_content_trends and sitemap_data.get("urls"):
                content_trends = self._analyze_content_trends(sitemap_data["urls"])
            
            # Analyze publishing patterns if requested  
            publishing_patterns = {}
            if analyze_publishing_patterns and sitemap_data.get("urls"):
                publishing_patterns = self._analyze_publishing_patterns(sitemap_data["urls"])
            
            # Generate AI insights
            ai_insights = await self._generate_ai_insights(
                structure_analysis, content_trends, publishing_patterns, sitemap_url
            )
            
            execution_time = (datetime.utcnow() - start_time).total_seconds()
            
            result = {
                "sitemap_url": sitemap_url,
                "analysis_date": datetime.utcnow().isoformat(),
                "total_urls": len(sitemap_data.get("urls", [])),
                "structure_analysis": structure_analysis,
                "content_trends": content_trends,
                "publishing_patterns": publishing_patterns,
                "ai_insights": ai_insights,
                "seo_recommendations": self._generate_seo_recommendations(
                    structure_analysis, content_trends, publishing_patterns
                ),
                "execution_time": execution_time
            }
            
            # Log the operation
            await seo_logger.log_tool_usage(
                tool_name=self.service_name,
                input_data={
                    "sitemap_url": sitemap_url,
                    "analyze_content_trends": analyze_content_trends,
                    "analyze_publishing_patterns": analyze_publishing_patterns
                },
                output_data=result,
                success=True
            )
            
            logger.info(f"Sitemap analysis completed for {sitemap_url}")
            return result
            
        except Exception as e:
            logger.error(f"Error analyzing sitemap {sitemap_url}: {e}")
            
            # Log the error
            await seo_logger.log_tool_usage(
                tool_name=self.service_name,
                input_data={
                    "sitemap_url": sitemap_url,
                    "analyze_content_trends": analyze_content_trends,
                    "analyze_publishing_patterns": analyze_publishing_patterns
                },
                output_data={"error": str(e)},
                success=False
            )
            
            raise
    
    async def _fetch_sitemap_data(self, sitemap_url: str) -> Dict[str, Any]:
        """Fetch and parse sitemap data"""
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(sitemap_url, timeout=aiohttp.ClientTimeout(total=30)) as response:
                    if response.status != 200:
                        raise Exception(f"Failed to fetch sitemap: HTTP {response.status}")
                    
                    content = await response.text()
                    
                    # Parse XML
                    root = ET.fromstring(content)
                    
                    # Handle different sitemap formats
                    urls = []
                    sitemaps = []
                    
                    # Check if it's a sitemap index
                    if root.tag.endswith('sitemapindex'):
                        # Extract nested sitemaps
                        for sitemap in root:
                            if sitemap.tag.endswith('sitemap'):
                                loc = sitemap.find('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')
                                if loc is not None:
                                    sitemaps.append(loc.text)
                        
                        # Fetch and parse nested sitemaps
                        for nested_url in sitemaps[:10]:  # Limit to 10 sitemaps
                            try:
                                nested_data = await self._fetch_sitemap_data(nested_url)
                                urls.extend(nested_data.get("urls", []))
                            except Exception as e:
                                logger.warning(f"Failed to fetch nested sitemap {nested_url}: {e}")
                    
                    else:
                        # Regular sitemap with URLs
                        for url_element in root:
                            if url_element.tag.endswith('url'):
                                url_data = {}
                                
                                for child in url_element:
                                    tag_name = child.tag.split('}')[-1]  # Remove namespace
                                    url_data[tag_name] = child.text
                                
                                if 'loc' in url_data:
                                    urls.append(url_data)
                    
                    return {
                        "urls": urls,
                        "sitemaps": sitemaps,
                        "total_urls": len(urls)
                    }
                    
        except ET.ParseError as e:
            raise Exception(f"Failed to parse sitemap XML: {e}")
        except Exception as e:
            logger.error(f"Error fetching sitemap data: {e}")
            raise
    
    def _analyze_sitemap_structure(self, sitemap_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze the structure of the sitemap"""
        
        urls = sitemap_data.get("urls", [])
        
        if not urls:
            return {"error": "No URLs found in sitemap"}
        
        # Analyze URL patterns
        url_patterns = {}
        file_types = {}
        path_levels = []
        
        for url_info in urls:
            url = url_info.get("loc", "")
            parsed_url = urlparse(url)
            
            # Analyze path patterns
            path_parts = parsed_url.path.strip('/').split('/')
            path_levels.append(len(path_parts))
            
            # Categorize by first path segment
            if len(path_parts) > 0 and path_parts[0]:
                category = path_parts[0]
                url_patterns[category] = url_patterns.get(category, 0) + 1
            
            # Analyze file types
            if '.' in parsed_url.path:
                extension = parsed_url.path.split('.')[-1].lower()
                file_types[extension] = file_types.get(extension, 0) + 1
        
        # Calculate statistics
        avg_path_depth = sum(path_levels) / len(path_levels) if path_levels else 0
        
        return {
            "total_urls": len(urls),
            "url_patterns": dict(sorted(url_patterns.items(), key=lambda x: x[1], reverse=True)[:10]),
            "file_types": dict(sorted(file_types.items(), key=lambda x: x[1], reverse=True)),
            "average_path_depth": round(avg_path_depth, 2),
            "max_path_depth": max(path_levels) if path_levels else 0,
            "structure_quality": self._assess_structure_quality(url_patterns, avg_path_depth)
        }
    
    def _analyze_content_trends(self, urls: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze content publishing trends"""
        
        # Extract dates from lastmod
        dates = []
        for url_info in urls:
            lastmod = url_info.get("lastmod")
            if lastmod:
                try:
                    # Parse various date formats
                    date_str = lastmod.split('T')[0]  # Remove time component
                    date_obj = datetime.strptime(date_str, "%Y-%m-%d")
                    dates.append(date_obj)
                except ValueError:
                    continue
        
        if not dates:
            return {"message": "No valid dates found for trend analysis"}
        
        # Analyze trends
        dates.sort()
        
        # Monthly distribution
        monthly_counts = {}
        yearly_counts = {}
        
        for date in dates:
            month_key = date.strftime("%Y-%m")
            year_key = date.strftime("%Y")
            
            monthly_counts[month_key] = monthly_counts.get(month_key, 0) + 1
            yearly_counts[year_key] = yearly_counts.get(year_key, 0) + 1
        
        # Calculate publishing velocity
        date_range = (dates[-1] - dates[0]).days
        publishing_velocity = len(dates) / max(date_range, 1) if date_range > 0 else 0
        
        return {
            "date_range": {
                "earliest": dates[0].isoformat(),
                "latest": dates[-1].isoformat(),
                "span_days": date_range
            },
            "monthly_distribution": dict(sorted(monthly_counts.items())[-12:]),  # Last 12 months
            "yearly_distribution": yearly_counts,
            "publishing_velocity": round(publishing_velocity, 3),
            "total_dated_urls": len(dates),
            "trends": self._identify_publishing_trends(monthly_counts)
        }
    
    def _analyze_publishing_patterns(self, urls: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze publishing patterns and frequency"""
        
        # Extract and analyze priority and changefreq
        priority_distribution = {}
        changefreq_distribution = {}
        
        for url_info in urls:
            priority = url_info.get("priority")
            if priority:
                try:
                    priority_float = float(priority)
                    priority_range = f"{int(priority_float * 10)}/10"
                    priority_distribution[priority_range] = priority_distribution.get(priority_range, 0) + 1
                except ValueError:
                    pass
            
            changefreq = url_info.get("changefreq")
            if changefreq:
                changefreq_distribution[changefreq] = changefreq_distribution.get(changefreq, 0) + 1
        
        return {
            "priority_distribution": priority_distribution,
            "changefreq_distribution": changefreq_distribution,
            "optimization_opportunities": self._identify_optimization_opportunities(
                priority_distribution, changefreq_distribution, len(urls)
            )
        }
    
    async def analyze_sitemap_for_onboarding(
        self,
        sitemap_url: str,
        user_url: str,
        competitors: List[str] = None,
        industry_context: str = None,
        analyze_content_trends: bool = True,
        analyze_publishing_patterns: bool = True
    ) -> Dict[str, Any]:
        """Enhanced sitemap analysis specifically for onboarding Step 3 competitive analysis"""
        
        try:
            # Run standard sitemap analysis
            analysis_result = await self.analyze_sitemap(
                sitemap_url=sitemap_url,
                analyze_content_trends=analyze_content_trends,
                analyze_publishing_patterns=analyze_publishing_patterns
            )
            
            # Enhance with onboarding-specific insights
            onboarding_insights = await self._generate_onboarding_insights(
                analysis_result,
                user_url,
                competitors,
                industry_context
            )
            
            # Combine results
            analysis_result["onboarding_insights"] = onboarding_insights
            analysis_result["user_url"] = user_url
            analysis_result["industry_context"] = industry_context
            analysis_result["competitors_analyzed"] = competitors or []
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"Error in onboarding sitemap analysis: {e}")
            return {
                "error": str(e),
                "success": False
            }

    async def _generate_onboarding_insights(
        self,
        analysis_result: Dict[str, Any],
        user_url: str,
        competitors: List[str] = None,
        industry_context: str = None
    ) -> Dict[str, Any]:
        """Generate onboarding-specific insights for competitive analysis"""
        
        try:
            structure_analysis = analysis_result.get("structure_analysis", {})
            content_trends = analysis_result.get("content_trends", {})
            publishing_patterns = analysis_result.get("publishing_patterns", {})
            
            # Build onboarding-specific prompt
            prompt = self._build_onboarding_analysis_prompt(
                structure_analysis, content_trends, publishing_patterns, 
                user_url, competitors, industry_context
            )
            
            # Generate AI insights
            ai_response = llm_text_gen(
                prompt=prompt,
                system_prompt=self._get_onboarding_system_prompt()
            )
            
            # Parse and structure insights
            insights = self._parse_onboarding_insights(ai_response)
            
            # Log AI analysis
            await seo_logger.log_ai_analysis(
                tool_name=f"{self.service_name}_onboarding",
                prompt=prompt,
                response=ai_response,
                model_used="gemini-2.0-flash-001"
            )
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating onboarding insights: {e}")
            return {
                "competitive_positioning": "Analysis unavailable",
                "content_gaps": [],
                "growth_opportunities": [],
                "industry_benchmarks": []
            }

    async def _generate_ai_insights(
        self,
        structure_analysis: Dict[str, Any],
        content_trends: Dict[str, Any],
        publishing_patterns: Dict[str, Any],
        sitemap_url: str
    ) -> Dict[str, Any]:
        """Generate AI-powered insights for sitemap analysis"""
        
        try:
            # Build prompt with analysis data
            prompt = self._build_ai_analysis_prompt(
                structure_analysis, content_trends, publishing_patterns, sitemap_url
            )
            
            # Generate AI insights
            ai_response = llm_text_gen(
                prompt=prompt,
                system_prompt=self._get_system_prompt()
            )
            
            # Parse and structure insights
            insights = self._parse_ai_insights(ai_response)
            
            # Log AI analysis
            await seo_logger.log_ai_analysis(
                tool_name=self.service_name,
                prompt=prompt,
                response=ai_response,
                model_used="gemini-2.0-flash-001"
            )
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating AI insights: {e}")
            return {
                "summary": "AI analysis unavailable",
                "content_strategy": [],
                "seo_opportunities": [],
                "technical_recommendations": []
            }
    
    def _build_ai_analysis_prompt(
        self,
        structure_analysis: Dict[str, Any],
        content_trends: Dict[str, Any],
        publishing_patterns: Dict[str, Any],
        sitemap_url: str
    ) -> str:
        """Build AI prompt for sitemap analysis"""
        
        total_urls = structure_analysis.get("total_urls", 0)
        url_patterns = structure_analysis.get("url_patterns", {})
        avg_depth = structure_analysis.get("average_path_depth", 0)
        
        publishing_velocity = content_trends.get("publishing_velocity", 0)
        date_range = content_trends.get("date_range", {})
        
        prompt = f"""
Analyze this website sitemap data and provide strategic insights for content creators and digital marketers:

Sitemap URL: {sitemap_url}
Total URLs: {total_urls}
Average Path Depth: {avg_depth}
Publishing Velocity: {publishing_velocity} posts/day

URL Patterns (top categories):
{chr(10).join([f"- {category}: {count} URLs" for category, count in list(url_patterns.items())[:5]])}

Content Timeline:
- Date Range: {date_range.get('span_days', 0)} days
- Publishing Rate: {publishing_velocity:.2f} pages per day

Please provide:
1. Content Strategy Insights (opportunities for new content categories)
2. SEO Structure Assessment (how well the site is organized for search engines)
3. Publishing Pattern Analysis (content frequency and consistency)
4. Growth Recommendations (specific actions for content expansion)
5. Technical SEO Opportunities (sitemap optimization suggestions)

Focus on actionable insights for content creators and digital marketing professionals.
"""
        
        return prompt
    
    def _get_system_prompt(self) -> str:
        """Get system prompt for AI analysis"""
        return """You are an SEO and content strategy expert specializing in website structure analysis.
        Your audience includes content creators, digital marketers, and solopreneurs who need to understand how their site structure impacts SEO and content performance.
        
        Provide practical, actionable insights that help users:
        - Optimize their content strategy
        - Improve site structure for SEO
        - Identify content gaps and opportunities
        - Plan future content development
        
        Always explain the business impact of your recommendations.
        """
    
    def _parse_ai_insights(self, ai_response: str) -> Dict[str, Any]:
        """Parse AI response into structured insights"""
        
        insights = {
            "summary": "",
            "content_strategy": [],
            "seo_opportunities": [],
            "technical_recommendations": [],
            "growth_recommendations": []
        }
        
        try:
            # Split into sections and parse
            sections = ai_response.split('\n\n')
            
            for section in sections:
                section = section.strip()
                if not section:
                    continue
                
                if 'content strategy' in section.lower():
                    insights["content_strategy"] = self._extract_list_items(section)
                elif 'seo' in section.lower() and 'opportunities' in section.lower():
                    insights["seo_opportunities"] = self._extract_list_items(section)
                elif 'technical' in section.lower():
                    insights["technical_recommendations"] = self._extract_list_items(section)
                elif 'growth' in section.lower() or 'recommendations' in section.lower():
                    insights["growth_recommendations"] = self._extract_list_items(section)
                elif 'analysis' in section.lower() or 'assessment' in section.lower():
                    insights["summary"] = self._extract_content(section)
            
            # Fallback
            if not any(insights.values()):
                insights["summary"] = ai_response[:300] + "..." if len(ai_response) > 300 else ai_response
                
        except Exception as e:
            logger.error(f"Error parsing AI insights: {e}")
            insights["summary"] = "AI analysis completed but parsing failed"
        
        return insights
    
    def _extract_content(self, section: str) -> str:
        """Extract content from a section"""
        lines = section.split('\n')
        content_lines = []
        
        for line in lines:
            line = line.strip()
            if line and not line.endswith(':') and not line.startswith('#'):
                content_lines.append(line)
        
        return ' '.join(content_lines)
    
    def _extract_list_items(self, section: str) -> List[str]:
        """Extract list items from a section"""
        items = []
        lines = section.split('\n')
        
        for line in lines:
            line = line.strip()
            if line and (line.startswith('-') or line.startswith('*') or 
                        (line[0].isdigit() and '.' in line[:3])):
                clean_line = line.lstrip('-*0123456789. ').strip()
                if clean_line:
                    items.append(clean_line)
        
        return items[:5]
    
    def _assess_structure_quality(self, url_patterns: Dict[str, int], avg_depth: float) -> str:
        """Assess the quality of site structure"""
        
        if avg_depth < 2:
            return "Shallow structure - may lack content organization"
        elif avg_depth > 5:
            return "Deep structure - may hurt crawlability"
        elif len(url_patterns) < 3:
            return "Limited content categories - opportunity for expansion"
        else:
            return "Well-structured site with good organization"
    
    def _identify_publishing_trends(self, monthly_counts: Dict[str, int]) -> List[str]:
        """Identify publishing trends from monthly data"""
        
        trends = []
        
        if not monthly_counts or len(monthly_counts) < 3:
            return ["Insufficient data for trend analysis"]
        
        # Get recent months
        recent_months = list(monthly_counts.values())[-6:]  # Last 6 months
        
        if len(recent_months) >= 3:
            # Check for growth trend
            if recent_months[-1] > recent_months[-3]:
                trends.append("Increasing publishing frequency")
            elif recent_months[-1] < recent_months[-3]:
                trends.append("Decreasing publishing frequency")
            
            # Check consistency
            avg_posts = sum(recent_months) / len(recent_months)
            if max(recent_months) - min(recent_months) <= avg_posts * 0.5:
                trends.append("Consistent publishing schedule")
            else:
                trends.append("Irregular publishing pattern")
        
        return trends or ["Stable publishing pattern"]
    
    def _identify_optimization_opportunities(
        self,
        priority_dist: Dict[str, int],
        changefreq_dist: Dict[str, int],
        total_urls: int
    ) -> List[str]:
        """Identify sitemap optimization opportunities"""
        
        opportunities = []
        
        # Check if priorities are being used
        if not priority_dist:
            opportunities.append("Add priority values to sitemap URLs")
        
        # Check if changefreq is being used
        if not changefreq_dist:
            opportunities.append("Add changefreq values to sitemap URLs")
        
        # Check for overuse of high priority
        high_priority_count = priority_dist.get("10/10", 0) + priority_dist.get("9/10", 0)
        if high_priority_count > total_urls * 0.3:
            opportunities.append("Reduce number of high-priority pages (max 30%)")
        
        return opportunities or ["Sitemap is well-optimized"]
    
    def _generate_seo_recommendations(
        self,
        structure_analysis: Dict[str, Any],
        content_trends: Dict[str, Any],
        publishing_patterns: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate specific SEO recommendations"""
        
        recommendations = []
        
        # Structure recommendations
        total_urls = structure_analysis.get("total_urls", 0)
        avg_depth = structure_analysis.get("average_path_depth", 0)
        
        if avg_depth > 4:
            recommendations.append({
                "category": "Site Structure",
                "priority": "High",
                "recommendation": "Reduce URL depth to improve crawlability",
                "impact": "Better search engine indexing"
            })
        
        if total_urls > 50000:
            recommendations.append({
                "category": "Sitemap Management",
                "priority": "Medium",
                "recommendation": "Split large sitemap into smaller files",
                "impact": "Improved crawl efficiency"
            })
        
        # Content recommendations
        publishing_velocity = content_trends.get("publishing_velocity", 0)
        
        if publishing_velocity < 0.1:  # Less than 1 post per 10 days
            recommendations.append({
                "category": "Content Strategy", 
                "priority": "High",
                "recommendation": "Increase content publishing frequency",
                "impact": "Better search visibility and freshness signals"
            })
        
        return recommendations
    
    async def health_check(self) -> Dict[str, Any]:
        """Health check for the sitemap service"""
        try:
            # Test with a simple sitemap
            test_url = "https://www.google.com/sitemap.xml"
            result = await self.analyze_sitemap(test_url, False, False)
            
            return {
                "status": "operational",
                "service": self.service_name,
                "test_passed": bool(result.get("total_urls", 0) > 0),
                "last_check": datetime.utcnow().isoformat()
            }
        except Exception as e:
            return {
                "status": "error",
                "service": self.service_name,
                "error": str(e),
                "last_check": datetime.utcnow().isoformat()
            }

    def _build_onboarding_analysis_prompt(
        self,
        structure_analysis: Dict[str, Any],
        content_trends: Dict[str, Any],
        publishing_patterns: Dict[str, Any],
        user_url: str,
        competitors: List[str] = None,
        industry_context: str = None
    ) -> str:
        """Build AI prompt for onboarding-specific sitemap analysis"""
        
        total_urls = structure_analysis.get("total_urls", 0)
        url_patterns = structure_analysis.get("url_patterns", {})
        avg_depth = structure_analysis.get("average_path_depth", 0)
        publishing_velocity = content_trends.get("publishing_velocity", 0)
        
        competitor_info = ""
        if competitors:
            competitor_info = f"\nCompetitors to consider: {', '.join(competitors[:5])}"
        
        industry_info = ""
        if industry_context:
            industry_info = f"\nIndustry Context: {industry_context}"
        
        prompt = f"""
Analyze this website's sitemap for competitive positioning and content strategy insights:

USER WEBSITE: {user_url}
Total URLs: {total_urls}
Average Path Depth: {avg_depth}
Publishing Velocity: {publishing_velocity:.2f} posts/day
{industry_info}{competitor_info}

URL Structure Analysis:
{chr(10).join([f"- {category}: {count} URLs" for category, count in list(url_patterns.items())[:8]])}

Content Publishing Patterns:
- Publishing Rate: {publishing_velocity:.2f} pages per day
- Content Categories: {len(url_patterns)} main categories identified

Please provide competitive analysis insights focusing on:

1. **COMPETITIVE POSITIONING**: How does this site's content structure compare to industry standards?
2. **CONTENT GAPS**: What content categories or topics are missing based on the URL structure?
3. **GROWTH OPPORTUNITIES**: Specific content expansion opportunities to compete better
4. **INDUSTRY BENCHMARKS**: How does publishing frequency and content depth compare to competitors?
5. **STRATEGIC RECOMMENDATIONS**: 3-5 actionable steps for content strategy improvement

Focus on actionable insights that help content creators understand their competitive position and identify growth opportunities.
"""
        
        return prompt

    def _get_onboarding_system_prompt(self) -> str:
        """Get system prompt for onboarding sitemap analysis"""
        return """You are a competitive intelligence and content strategy expert specializing in website structure analysis for content creators and digital marketers.

Your role is to analyze website sitemaps and provide strategic insights that help users understand their competitive position and identify content opportunities.

Key focus areas:
- Competitive positioning analysis
- Content gap identification
- Growth opportunity recommendations
- Industry benchmarking insights
- Actionable strategic recommendations

Provide practical, data-driven insights that help content creators make informed decisions about their content strategy and competitive positioning.

Format your response as structured insights that can be easily parsed and displayed in a user interface."""

    def _parse_onboarding_insights(self, ai_response: str) -> Dict[str, Any]:
        """Parse AI response for onboarding-specific insights"""
        
        try:
            # Initialize structured response
            insights = {
                "competitive_positioning": "Analysis in progress...",
                "content_gaps": [],
                "growth_opportunities": [],
                "industry_benchmarks": [],
                "strategic_recommendations": []
            }
            
            # Simple parsing logic - look for structured sections
            lines = ai_response.split('\n')
            current_section = None
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                # Detect sections
                if any(keyword in line.lower() for keyword in ['competitive positioning', 'market position']):
                    current_section = 'competitive_positioning'
                    insights[current_section] = line
                elif any(keyword in line.lower() for keyword in ['content gaps', 'missing content']):
                    current_section = 'content_gaps'
                elif any(keyword in line.lower() for keyword in ['growth opportunities', 'expansion']):
                    current_section = 'growth_opportunities'
                elif any(keyword in line.lower() for keyword in ['industry benchmarks', 'benchmarks']):
                    current_section = 'industry_benchmarks'
                elif any(keyword in line.lower() for keyword in ['strategic recommendations', 'recommendations']):
                    current_section = 'strategic_recommendations'
                elif line.startswith('-') or line.startswith('•'):
                    # This is a list item
                    if current_section and current_section in insights:
                        if isinstance(insights[current_section], str):
                            insights[current_section] = [insights[current_section]]
                        insights[current_section].append(line[1:].strip())
                elif current_section == 'competitive_positioning':
                    # Append to competitive positioning text
                    if insights[current_section] == "Analysis in progress...":
                        insights[current_section] = line
                    else:
                        insights[current_section] += " " + line
            
            # Fallback: if no structured parsing worked, use the full response
            if insights["competitive_positioning"] == "Analysis in progress...":
                insights["competitive_positioning"] = ai_response[:500] + "..." if len(ai_response) > 500 else ai_response
            
            # Ensure lists are properly formatted
            for key in ['content_gaps', 'growth_opportunities', 'industry_benchmarks', 'strategic_recommendations']:
                if isinstance(insights[key], str):
                    insights[key] = [insights[key]] if insights[key] else []
            
            return insights
            
        except Exception as e:
            logger.error(f"Error parsing onboarding insights: {e}")
            return {
                "competitive_positioning": ai_response[:300] + "..." if len(ai_response) > 300 else ai_response,
                "content_gaps": ["Analysis parsing error - see full response above"],
                "growth_opportunities": [],
                "industry_benchmarks": [],
                "strategic_recommendations": []
            }

    async def discover_sitemap_url(self, website_url: str) -> Optional[str]:
        """
        Intelligently discover the sitemap URL for a given website.
        
        Args:
            website_url: The website URL to find sitemap for
            
        Returns:
            The discovered sitemap URL or None if not found
        """
        try:
            # Ensure the URL has a proper scheme
            if not urlparse(website_url).scheme:
                base_url = f"https://{website_url}"
            else:
                base_url = website_url.rstrip('/')
            
            logger.info(f"Discovering sitemap for: {base_url}")
            
            # Method 1: Check robots.txt first (most reliable)
            sitemap_url = await self._find_sitemap_in_robots_txt(base_url)
            if sitemap_url:
                logger.info(f"Found sitemap via robots.txt: {sitemap_url}")
                return sitemap_url
            
            # Method 2: Check common paths
            sitemap_url = await self._find_sitemap_by_common_paths(base_url)
            if sitemap_url:
                logger.info(f"Found sitemap via common paths: {sitemap_url}")
                return sitemap_url
            
            logger.warning(f"No sitemap found for {base_url}")
            return None
            
        except Exception as e:
            logger.error(f"Error discovering sitemap for {website_url}: {e}")
            return None

    async def _find_sitemap_in_robots_txt(self, base_url: str) -> Optional[str]:
        """
        Check robots.txt for sitemap directives.
        
        Args:
            base_url: Base URL of the website
            
        Returns:
            Sitemap URL if found in robots.txt, None otherwise
        """
        try:
            robots_url = urljoin(base_url, "/robots.txt")
            logger.debug(f"Checking robots.txt at: {robots_url}")
            
            async with aiohttp.ClientSession() as session:
                async with session.get(robots_url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    if response.status == 200:
                        content = await response.text()
                        
                        # Look for sitemap directives (case-insensitive)
                        sitemap_matches = re.findall(r'^Sitemap:\s*(.+)', content, re.IGNORECASE | re.MULTILINE)
                        
                        if sitemap_matches:
                            sitemap_url = sitemap_matches[0].strip()
                            logger.debug(f"Found sitemap directive in robots.txt: {sitemap_url}")
                            
                            # Verify the sitemap URL is accessible
                            if await self._verify_sitemap_url(sitemap_url):
                                return sitemap_url
                            else:
                                logger.warning(f"robots.txt points to inaccessible sitemap: {sitemap_url}")
                        
                        logger.debug("No sitemap directive found in robots.txt")
                    else:
                        logger.debug(f"robots.txt returned HTTP {response.status}")
                        
        except Exception as e:
            logger.debug(f"Error checking robots.txt: {e}")
            
        return None

    async def _find_sitemap_by_common_paths(self, base_url: str) -> Optional[str]:
        """
        Check common sitemap paths.
        
        Args:
            base_url: Base URL of the website
            
        Returns:
            Sitemap URL if found at common paths, None otherwise
        """
        try:
            logger.debug(f"Checking common sitemap paths for: {base_url}")
            
            # Check paths in parallel for better performance
            tasks = []
            for path in self.common_sitemap_paths:
                full_url = urljoin(base_url, path)
                tasks.append(self._check_sitemap_url(full_url, f"common path: /{path}"))
            
            # Wait for all checks to complete
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Return the first successful result
            for result in results:
                if isinstance(result, str) and result:
                    return result
            
            logger.debug("No sitemap found at common paths")
            
        except Exception as e:
            logger.debug(f"Error checking common paths: {e}")
            
        return None

    async def _check_sitemap_url(self, url: str, method: str) -> Optional[str]:
        """
        Check if a URL is a valid sitemap.
        
        Args:
            url: URL to check
            method: Method description for logging
            
        Returns:
            URL if valid sitemap, None otherwise
        """
        try:
            headers = {
                'User-Agent': 'ALwritySitemapBot/1.0 (https://alwrity.com)',
                'Accept': 'application/xml, text/xml, */*'
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    if response.status == 200:
                        content_type = response.headers.get('Content-Type', '').lower()
                        
                        # Check if it's a valid sitemap content type
                        if any(xml_type in content_type for xml_type in ['xml', 'text', 'application/x-gzip']):
                            logger.debug(f"Found valid sitemap via {method}: {url} (Content-Type: {content_type})")
                            return url
                        else:
                            # Still consider it if it's 200 but not typical content type
                            logger.debug(f"Found potential sitemap via {method}: {url} (Content-Type: {content_type})")
                            return url
                    elif response.status == 404:
                        # Skip 404s silently
                        pass
                    else:
                        logger.debug(f"HTTP {response.status} for {url} via {method}")
                        
        except Exception as e:
            # Skip connection errors silently
            logger.debug(f"Connection error for {url}: {e}")
            
        return None

    async def _verify_sitemap_url(self, url: str) -> bool:
        """
        Verify that a sitemap URL is accessible and returns valid content.
        
        Args:
            url: Sitemap URL to verify
            
        Returns:
            True if accessible, False otherwise
        """
        try:
            headers = {
                'User-Agent': 'ALwritySitemapBot/1.0 (https://alwrity.com)',
                'Accept': 'application/xml, text/xml, */*'
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.head(url, headers=headers, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    return response.status == 200
                    
        except Exception:
            return False