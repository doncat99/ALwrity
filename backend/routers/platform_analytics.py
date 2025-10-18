"""
Platform Analytics API Routes

Provides endpoints for retrieving analytics data from connected platforms.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Dict, Any, List, Optional
from loguru import logger
from pydantic import BaseModel

from services.analytics import PlatformAnalyticsService
from middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["Platform Analytics"])

# Initialize analytics service
analytics_service = PlatformAnalyticsService()


class AnalyticsRequest(BaseModel):
    """Request model for analytics data"""
    platforms: Optional[List[str]] = None
    date_range: Optional[Dict[str, str]] = None


class AnalyticsResponse(BaseModel):
    """Response model for analytics data"""
    success: bool
    data: Dict[str, Any]
    summary: Dict[str, Any]
    error: Optional[str] = None


@router.get("/platforms")
async def get_platform_connection_status(current_user: dict = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Get connection status for all platforms
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Connection status for each platform
    """
    try:
        user_id = current_user.get('id')
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        logger.info(f"Getting platform connection status for user: {user_id}")
        
        status = await analytics_service.get_platform_connection_status(user_id)
        
        return {
            "success": True,
            "platforms": status,
            "total_connected": sum(1 for p in status.values() if p.get('connected', False))
        }
        
    except Exception as e:
        logger.error(f"Failed to get platform connection status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/data")
async def get_analytics_data(
    platforms: Optional[str] = Query(None, description="Comma-separated list of platforms (gsc,wix,wordpress)"),
    current_user: dict = Depends(get_current_user)
) -> AnalyticsResponse:
    """
    Get analytics data from connected platforms
    
    Args:
        platforms: Comma-separated list of platforms to get data from
        current_user: Current authenticated user
        
    Returns:
        Analytics data from specified platforms
    """
    try:
        user_id = current_user.get('id')
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        # Parse platforms parameter
        platform_list = None
        if platforms:
            platform_list = [p.strip() for p in platforms.split(',') if p.strip()]
        
        logger.info(f"Getting analytics data for user: {user_id}, platforms: {platform_list}")
        
        # Get analytics data
        analytics_data = await analytics_service.get_comprehensive_analytics(user_id, platform_list)
        
        # Generate summary
        summary = analytics_service.get_analytics_summary(analytics_data)
        
        # Convert AnalyticsData objects to dictionaries
        data_dict = {}
        for platform, data in analytics_data.items():
            data_dict[platform] = {
                'platform': data.platform,
                'metrics': data.metrics,
                'date_range': data.date_range,
                'last_updated': data.last_updated,
                'status': data.status,
                'error_message': data.error_message
            }
        
        return AnalyticsResponse(
            success=True,
            data=data_dict,
            summary=summary,
            error=None
        )
        
    except Exception as e:
        logger.error(f"Failed to get analytics data: {e}")
        return AnalyticsResponse(
            success=False,
            data={},
            summary={},
            error=str(e)
        )


@router.post("/data")
async def get_analytics_data_post(
    request: AnalyticsRequest,
    current_user: dict = Depends(get_current_user)
) -> AnalyticsResponse:
    """
    Get analytics data from connected platforms (POST version)
    
    Args:
        request: Analytics request with platforms and date range
        current_user: Current authenticated user
        
    Returns:
        Analytics data from specified platforms
    """
    try:
        user_id = current_user.get('id')
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        logger.info(f"Getting analytics data for user: {user_id}, platforms: {request.platforms}")
        
        # Get analytics data
        analytics_data = await analytics_service.get_comprehensive_analytics(user_id, request.platforms)
        
        # Generate summary
        summary = analytics_service.get_analytics_summary(analytics_data)
        
        # Convert AnalyticsData objects to dictionaries
        data_dict = {}
        for platform, data in analytics_data.items():
            data_dict[platform] = {
                'platform': data.platform,
                'metrics': data.metrics,
                'date_range': data.date_range,
                'last_updated': data.last_updated,
                'status': data.status,
                'error_message': data.error_message
            }
        
        return AnalyticsResponse(
            success=True,
            data=data_dict,
            summary=summary,
            error=None
        )
        
    except Exception as e:
        logger.error(f"Failed to get analytics data: {e}")
        return AnalyticsResponse(
            success=False,
            data={},
            summary={},
            error=str(e)
        )


@router.get("/gsc")
async def get_gsc_analytics(
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get Google Search Console analytics data specifically
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        GSC analytics data
    """
    try:
        user_id = current_user.get('id')
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        logger.info(f"Getting GSC analytics for user: {user_id}")
        
        # Get GSC analytics
        gsc_data = await analytics_service._get_gsc_analytics(user_id)
        
        return {
            "success": gsc_data.status == 'success',
            "platform": gsc_data.platform,
            "metrics": gsc_data.metrics,
            "date_range": gsc_data.date_range,
            "last_updated": gsc_data.last_updated,
            "status": gsc_data.status,
            "error": gsc_data.error_message
        }
        
    except Exception as e:
        logger.error(f"Failed to get GSC analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/summary")
async def get_analytics_summary(current_user: dict = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Get a summary of analytics data across all connected platforms
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Analytics summary
    """
    try:
        user_id = current_user.get('id')
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        logger.info(f"Getting analytics summary for user: {user_id}")
        
        # Get analytics data from all platforms
        analytics_data = await analytics_service.get_comprehensive_analytics(user_id)
        
        # Generate summary
        summary = analytics_service.get_analytics_summary(analytics_data)
        
        return {
            "success": True,
            "summary": summary,
            "platforms_connected": summary['connected_platforms'],
            "platforms_total": summary['total_platforms']
        }
        
    except Exception as e:
        logger.error(f"Failed to get analytics summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cache/test")
async def test_cache_endpoint(current_user: dict = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Test endpoint to verify cache routes are working
    """
    return {
        "success": True,
        "message": "Cache endpoint is working",
        "user_id": current_user.get('id'),
        "timestamp": datetime.now().isoformat()
    }


@router.post("/cache/clear")
async def clear_analytics_cache(
    platform: Optional[str] = Query(None, description="Specific platform to clear cache for (optional)"),
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Clear analytics cache for a user
    
    Args:
        platform: Specific platform to clear cache for (optional, clears all if None)
        current_user: Current authenticated user
        
    Returns:
        Cache clearing result
    """
    try:
        from datetime import datetime
        user_id = current_user.get('id')
        logger.info(f"Cache clear request received for user {user_id}, platform: {platform}")
        
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        if platform:
            # Clear cache for specific platform
            analytics_service.invalidate_platform_cache(user_id, platform)
            message = f"Cleared cache for {platform}"
        else:
            # Clear all cache for user
            analytics_service.invalidate_user_cache(user_id)
            message = "Cleared all analytics cache"
        
        logger.info(f"Cache cleared for user {user_id}: {message}")
        
        return {
            "success": True,
            "user_id": user_id,
            "platform": platform,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error clearing cache: {e}")
        raise HTTPException(status_code=500, detail=str(e))


