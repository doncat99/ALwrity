"""
Google Search Console Analytics Handler

Handles GSC analytics data retrieval and processing.
"""

from typing import Dict, Any
from datetime import datetime, timedelta
from loguru import logger

from services.gsc_service import GSCService
from ...analytics_cache_service import analytics_cache
from ..models.analytics_data import AnalyticsData
from ..models.platform_types import PlatformType
from .base_handler import BaseAnalyticsHandler


class GSCAnalyticsHandler(BaseAnalyticsHandler):
    """Handler for Google Search Console analytics"""
    
    def __init__(self):
        super().__init__(PlatformType.GSC)
        self.gsc_service = GSCService()
    
    async def get_analytics(self, user_id: str) -> AnalyticsData:
        """
        Get Google Search Console analytics data with caching
        
        Returns comprehensive SEO metrics including clicks, impressions, CTR, and position data.
        """
        self.log_analytics_request(user_id, "get_analytics")
        
        # Check cache first - GSC API calls can be expensive
        cached_data = analytics_cache.get('gsc_analytics', user_id)
        if cached_data:
            logger.info("Using cached GSC analytics for user {user_id}", user_id=user_id)
            return AnalyticsData(**cached_data)
        
        logger.info("Fetching fresh GSC analytics for user {user_id}", user_id=user_id)
        try:
            # Get user's sites
            sites = self.gsc_service.get_site_list(user_id)
            logger.info(f"GSC Sites found for user {user_id}: {sites}")
            if not sites:
                logger.warning(f"No GSC sites found for user {user_id}")
                return self.create_error_response('No GSC sites found')
            
            # Get analytics for the first site (or combine all sites)
            site_url = sites[0]['siteUrl']
            logger.info(f"Using GSC site URL: {site_url}")
            
            # Get search analytics for last 30 days
            end_date = datetime.now().strftime('%Y-%m-%d')
            start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
            logger.info(f"GSC Date range: {start_date} to {end_date}")
            
            search_analytics = self.gsc_service.get_search_analytics(
                user_id=user_id,
                site_url=site_url,
                start_date=start_date,
                end_date=end_date
            )
            logger.info(f"GSC Search analytics retrieved for user {user_id}")
            
            # Process GSC data into standardized format
            processed_metrics = self._process_gsc_metrics(search_analytics)
            
            result = self.create_success_response(
                metrics=processed_metrics,
                date_range={'start': start_date, 'end': end_date}
            )
            
            # Cache the result to avoid expensive API calls
            analytics_cache.set('gsc_analytics', user_id, result.__dict__)
            logger.info("Cached GSC analytics data for user {user_id}", user_id=user_id)
            
            return result
            
        except Exception as e:
            self.log_analytics_error(user_id, "get_analytics", e)
            error_result = self.create_error_response(str(e))
            
            # Cache error result for shorter time to retry sooner
            analytics_cache.set('gsc_analytics', user_id, error_result.__dict__, ttl_override=300)  # 5 minutes
            return error_result
    
    def get_connection_status(self, user_id: str) -> Dict[str, Any]:
        """Get GSC connection status"""
        self.log_analytics_request(user_id, "get_connection_status")
        
        try:
            sites = self.gsc_service.get_site_list(user_id)
            return {
                'connected': len(sites) > 0,
                'sites_count': len(sites),
                'sites': sites[:3] if sites else [],  # Show first 3 sites
                'error': None
            }
        except Exception as e:
            self.log_analytics_error(user_id, "get_connection_status", e)
            return {
                'connected': False,
                'sites_count': 0,
                'sites': [],
                'error': str(e)
            }
    
    def _process_gsc_metrics(self, search_analytics: Dict[str, Any]) -> Dict[str, Any]:
        """Process GSC raw data into standardized metrics"""
        try:
            # Debug: Log the raw search analytics data structure
            logger.info(f"GSC Raw search analytics structure: {search_analytics}")
            logger.info(f"GSC Raw search analytics keys: {list(search_analytics.keys())}")
            
            # Handle new data structure with overall_metrics and query_data
            if 'overall_metrics' in search_analytics:
                # New structure from updated GSC service
                overall_rows = search_analytics.get('overall_metrics', {}).get('rows', [])
                query_rows = search_analytics.get('query_data', {}).get('rows', [])
                verification_rows = search_analytics.get('verification_data', {}).get('rows', [])
                
                logger.info(f"GSC Overall metrics rows: {len(overall_rows)}")
                logger.info(f"GSC Query data rows: {len(query_rows)}")
                logger.info(f"GSC Verification rows: {len(verification_rows)}")
                
                if overall_rows:
                    logger.info(f"GSC Overall first row: {overall_rows[0]}")
                if query_rows:
                    logger.info(f"GSC Query first row: {query_rows[0]}")
                
                # Use query_rows for detailed insights, overall_rows for summary
                rows = query_rows if query_rows else overall_rows
            else:
                # Legacy structure
                rows = search_analytics.get('rows', [])
                logger.info(f"GSC Legacy rows count: {len(rows)}")
                if rows:
                    logger.info(f"GSC Legacy first row structure: {rows[0]}")
                    logger.info(f"GSC Legacy first row keys: {list(rows[0].keys()) if rows[0] else 'No rows'}")
            
            # Calculate summary metrics - handle different response formats
            total_clicks = 0
            total_impressions = 0
            total_position = 0
            valid_rows = 0
            
            for row in rows:
                # Handle different possible response formats
                clicks = row.get('clicks', 0)
                impressions = row.get('impressions', 0)
                position = row.get('position', 0)
                
                # If position is 0 or None, skip it from average calculation
                if position and position > 0:
                    total_position += position
                    valid_rows += 1
                
                total_clicks += clicks
                total_impressions += impressions
            
            avg_ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
            avg_position = total_position / valid_rows if valid_rows > 0 else 0
            
            logger.info(f"GSC Calculated metrics - clicks: {total_clicks}, impressions: {total_impressions}, ctr: {avg_ctr}, position: {avg_position}, valid_rows: {valid_rows}")
            
            # Get top performing queries - handle different data structures
            if rows and 'keys' in rows[0]:
                # New GSC API format with keys array
                top_queries = sorted(rows, key=lambda x: x.get('clicks', 0), reverse=True)[:10]
                
                # Get top performing pages (if we have page data)
                page_data = {}
                for row in rows:
                    # Handle different key structures
                    keys = row.get('keys', [])
                    if len(keys) > 1 and keys[1]:  # Page data available
                        page = keys[1].get('keys', ['Unknown'])[0] if isinstance(keys[1], dict) else str(keys[1])
                    else:
                        page = 'Unknown'
                    
                    if page not in page_data:
                        page_data[page] = {'clicks': 0, 'impressions': 0, 'ctr': 0, 'position': 0}
                    page_data[page]['clicks'] += row.get('clicks', 0)
                    page_data[page]['impressions'] += row.get('impressions', 0)
            else:
                # Legacy format or no keys structure
                top_queries = sorted(rows, key=lambda x: x.get('clicks', 0), reverse=True)[:10]
                page_data = {}
            
            # Calculate page metrics
            for page in page_data:
                if page_data[page]['impressions'] > 0:
                    page_data[page]['ctr'] = page_data[page]['clicks'] / page_data[page]['impressions'] * 100
            
            top_pages = sorted(page_data.items(), key=lambda x: x[1]['clicks'], reverse=True)[:10]
            
            return {
                'connection_status': 'connected',
                'connected_sites': 1,  # GSC typically has one site per user
                'total_clicks': total_clicks,
                'total_impressions': total_impressions,
                'avg_ctr': round(avg_ctr, 2),
                'avg_position': round(avg_position, 2),
                'total_queries': len(rows),
                'top_queries': [
                    {
                        'query': self._extract_query_from_row(row),
                        'clicks': row.get('clicks', 0),
                        'impressions': row.get('impressions', 0),
                        'ctr': round(row.get('ctr', 0) * 100, 2),
                        'position': round(row.get('position', 0), 2)
                    }
                    for row in top_queries
                ],
                'top_pages': [
                    {
                        'page': page,
                        'clicks': data['clicks'],
                        'impressions': data['impressions'],
                        'ctr': round(data['ctr'], 2)
                    }
                    for page, data in top_pages
                ],
                'note': 'Google Search Console provides search performance data, keyword rankings, and SEO insights'
            }
            
        except Exception as e:
            logger.error(f"Error processing GSC metrics: {e}")
            return {
                'connection_status': 'error',
                'connected_sites': 0,
                'total_clicks': 0,
                'total_impressions': 0,
                'avg_ctr': 0,
                'avg_position': 0,
                'total_queries': 0,
                'top_queries': [],
                'top_pages': [],
                'error': str(e)
            }
    
    def _extract_query_from_row(self, row: Dict[str, Any]) -> str:
        """Extract query text from GSC API row data"""
        try:
            keys = row.get('keys', [])
            if keys and len(keys) > 0:
                first_key = keys[0]
                if isinstance(first_key, dict):
                    return first_key.get('keys', ['Unknown'])[0]
                else:
                    return str(first_key)
            return 'Unknown'
        except Exception as e:
            logger.error(f"Error extracting query from row: {e}")
            return 'Unknown'
