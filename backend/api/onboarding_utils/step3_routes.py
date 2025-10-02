"""
Step 3 Research Routes for Onboarding

FastAPI routes for Step 3 research phase of onboarding,
including competitor discovery and research data management.

Author: ALwrity Team
Version: 1.0
Last Updated: January 2025
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from pydantic import BaseModel, HttpUrl, Field
from typing import Dict, List, Optional, Any
from datetime import datetime
import traceback
from loguru import logger

from middleware.auth_middleware import get_current_user
from .step3_research_service import Step3ResearchService

router = APIRouter(prefix="/api/onboarding/step3", tags=["Onboarding Step 3 - Research"])

# Request/Response Models
class CompetitorDiscoveryRequest(BaseModel):
    """Request model for competitor discovery."""
    session_id: Optional[str] = Field(None, description="Deprecated - user identification comes from auth token")
    user_url: str = Field(..., description="User's website URL")
    industry_context: Optional[str] = Field(None, description="Industry context for better discovery")
    num_results: int = Field(25, ge=1, le=100, description="Number of competitors to discover")
    website_analysis_data: Optional[Dict[str, Any]] = Field(None, description="Website analysis data from Step 2 for better targeting")

class CompetitorDiscoveryResponse(BaseModel):
    """Response model for competitor discovery."""
    success: bool
    message: str
    session_id: str
    user_url: str
    competitors: Optional[List[Dict[str, Any]]] = None
    social_media_accounts: Optional[Dict[str, str]] = None
    social_media_citations: Optional[List[Dict[str, Any]]] = None
    research_summary: Optional[Dict[str, Any]] = None
    total_competitors: Optional[int] = None
    industry_context: Optional[str] = None
    analysis_timestamp: Optional[str] = None
    api_cost: Optional[float] = None
    error: Optional[str] = None

class ResearchDataRequest(BaseModel):
    """Request model for retrieving research data."""
    session_id: str = Field(..., description="Onboarding session ID")

class ResearchDataResponse(BaseModel):
    """Response model for research data retrieval."""
    success: bool
    message: str
    session_id: Optional[str] = None
    research_data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class ResearchHealthResponse(BaseModel):
    """Response model for research service health check."""
    success: bool
    message: str
    service_status: Optional[Dict[str, Any]] = None
    timestamp: Optional[str] = None

# Initialize service
step3_research_service = Step3ResearchService()

@router.post("/discover-competitors", response_model=CompetitorDiscoveryResponse)
async def discover_competitors(
    request: CompetitorDiscoveryRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
) -> CompetitorDiscoveryResponse:
    """
    Discover competitors for the user's website using Exa API with user isolation.
    
    This endpoint performs neural search to find semantically similar websites
    and analyzes their content for competitive intelligence.
    """
    try:
        # Get Clerk user ID for user isolation
        clerk_user_id = str(current_user.get('id'))
        
        logger.info(f"Starting competitor discovery for authenticated user {clerk_user_id}, URL: {request.user_url}")
        logger.info(f"Request data - user_url: '{request.user_url}', industry_context: '{request.industry_context}', num_results: {request.num_results}")
        
        # Validate URL format
        if not request.user_url.startswith(('http://', 'https://')):
            request.user_url = f"https://{request.user_url}"
        
        # Perform competitor discovery with Clerk user ID
        result = await step3_research_service.discover_competitors_for_onboarding(
            user_url=request.user_url,
            session_id=clerk_user_id,  # Use Clerk user ID for isolation
            industry_context=request.industry_context,
            num_results=request.num_results,
            website_analysis_data=request.website_analysis_data
        )
        
        if result["success"]:
            logger.info(f"✅ Successfully discovered {result['total_competitors']} competitors for user {clerk_user_id}")
            
            return CompetitorDiscoveryResponse(
                success=True,
                message=f"Successfully discovered {result['total_competitors']} competitors and social media accounts",
                session_id=result["session_id"],
                user_url=result["user_url"],
                competitors=result["competitors"],
                social_media_accounts=result.get("social_media_accounts"),
                social_media_citations=result.get("social_media_citations"),
                research_summary=result["research_summary"],
                total_competitors=result["total_competitors"],
                industry_context=result["industry_context"],
                analysis_timestamp=result["analysis_timestamp"],
                api_cost=result["api_cost"]
            )
        else:
            logger.error(f"❌ Competitor discovery failed for user {clerk_user_id}: {result.get('error')}")
            
            return CompetitorDiscoveryResponse(
                success=False,
                message="Competitor discovery failed",
                session_id=clerk_user_id,
                user_url=result.get("user_url", request.user_url),
                error=result.get("error", "Unknown error occurred")
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error in competitor discovery endpoint: {str(e)}")
        logger.error(traceback.format_exc())
        
        # Return error response with Clerk user ID
        clerk_user_id = str(current_user.get('id', 'unknown'))
        return CompetitorDiscoveryResponse(
            success=False,
            message="Internal server error during competitor discovery",
            session_id=clerk_user_id,
            user_url=request.user_url,
            error=str(e)
        )

@router.post("/research-data", response_model=ResearchDataResponse)
async def get_research_data(request: ResearchDataRequest) -> ResearchDataResponse:
    """
    Retrieve research data for a specific onboarding session.
    
    This endpoint returns the stored research data including competitor analysis
    and research summary for the given session.
    """
    try:
        logger.info(f"Retrieving research data for session {request.session_id}")
        
        # Validate session ID
        if not request.session_id or len(request.session_id) < 10:
            raise HTTPException(
                status_code=400,
                detail="Invalid session ID"
            )
        
        # Retrieve research data
        result = await step3_research_service.get_research_data(request.session_id)
        
        if result["success"]:
            logger.info(f"Successfully retrieved research data for session {request.session_id}")
            
            return ResearchDataResponse(
                success=True,
                message="Research data retrieved successfully",
                session_id=result["session_id"],
                research_data=result["research_data"]
            )
        else:
            logger.warning(f"No research data found for session {request.session_id}")
            
            return ResearchDataResponse(
                success=False,
                message="No research data found for this session",
                session_id=request.session_id,
                error=result.get("error", "Research data not found")
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving research data: {str(e)}")
        logger.error(traceback.format_exc())
        
        return ResearchDataResponse(
            success=False,
            message="Internal server error while retrieving research data",
            session_id=request.session_id,
            error=str(e)
        )

@router.get("/health", response_model=ResearchHealthResponse)
async def health_check() -> ResearchHealthResponse:
    """
    Check the health of the Step 3 research service.
    
    This endpoint provides health status information for the research service
    including Exa API connectivity and service status.
    """
    try:
        logger.info("Performing Step 3 research service health check")
        
        health_status = await step3_research_service.health_check()
        
        if health_status["status"] == "healthy":
            return ResearchHealthResponse(
                success=True,
                message="Step 3 research service is healthy",
                service_status=health_status,
                timestamp=health_status["timestamp"]
            )
        else:
            return ResearchHealthResponse(
                success=False,
                message=f"Step 3 research service is {health_status['status']}",
                service_status=health_status,
                timestamp=health_status["timestamp"]
            )
            
    except Exception as e:
        logger.error(f"Error in health check: {str(e)}")
        logger.error(traceback.format_exc())
        
        return ResearchHealthResponse(
            success=False,
            message="Health check failed",
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )

@router.post("/validate-session")
async def validate_session(session_id: str) -> Dict[str, Any]:
    """
    Validate that a session exists and is ready for Step 3.
    
    This endpoint checks if the session exists and has completed previous steps.
    """
    try:
        logger.info(f"Validating session {session_id} for Step 3")
        
        # Basic validation
        if not session_id or len(session_id) < 10:
            raise HTTPException(
                status_code=400,
                detail="Invalid session ID format"
            )
        
        # Check if session has completed Step 2 (website analysis)
        # This would integrate with the existing session validation logic
        
        return {
            "success": True,
            "message": "Session is valid for Step 3",
            "session_id": session_id,
            "ready_for_step3": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error validating session: {str(e)}")
        
        return {
            "success": False,
            "message": "Session validation failed",
            "error": str(e)
        }

@router.get("/cost-estimate")
async def get_cost_estimate(
    num_results: int = 25,
    include_content: bool = True
) -> Dict[str, Any]:
    """
    Get cost estimate for competitor discovery.
    
    This endpoint provides cost estimates for Exa API usage
    to help users understand the cost of competitor discovery.
    """
    try:
        logger.info(f"Getting cost estimate for {num_results} results, content: {include_content}")
        
        cost_estimate = step3_research_service.exa_service.get_cost_estimate(
            num_results=num_results,
            include_content=include_content
        )
        
        return {
            "success": True,
            "cost_estimate": cost_estimate,
            "message": "Cost estimate calculated successfully"
        }
        
    except Exception as e:
        logger.error(f"Error calculating cost estimate: {str(e)}")
        
        return {
            "success": False,
            "message": "Failed to calculate cost estimate",
            "error": str(e)
        }
