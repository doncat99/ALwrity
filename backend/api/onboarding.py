"""Onboarding API endpoints for ALwrity."""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from datetime import datetime
import json
import os
from loguru import logger
import time

# Import the existing progress tracking system
from services.api_key_manager import (
    OnboardingProgress, 
    get_onboarding_progress, 
    get_onboarding_progress_for_user,
    StepStatus, 
    StepData,
    APIKeyManager
)
from middleware.auth_middleware import get_current_user
from services.validation import check_all_api_keys

# Pydantic models for API requests/responses
class StepDataModel(BaseModel):
    step_number: int
    title: str
    description: str
    status: str
    completed_at: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    validation_errors: List[str] = []

class OnboardingProgressModel(BaseModel):
    steps: List[StepDataModel]
    current_step: int
    started_at: str
    last_updated: str
    is_completed: bool
    completed_at: Optional[str] = None

class StepCompletionRequest(BaseModel):
    data: Optional[Dict[str, Any]] = None
    validation_errors: List[str] = []

class APIKeyRequest(BaseModel):
    provider: str = Field(..., description="API provider name (e.g., 'openai', 'gemini')")
    api_key: str = Field(..., description="API key value")
    description: Optional[str] = Field(None, description="Optional description")

class OnboardingStatusResponse(BaseModel):
    is_completed: bool
    current_step: int
    completion_percentage: float
    next_step: Optional[int]
    started_at: str
    completed_at: Optional[str] = None
    can_proceed_to_final: bool

class StepValidationResponse(BaseModel):
    can_proceed: bool
    validation_errors: List[str]
    step_status: str

# Dependency to get progress instance
def get_progress() -> OnboardingProgress:
    """Get the current onboarding progress instance."""
    return get_onboarding_progress()

# Dependency to get API key manager
def get_api_key_manager() -> APIKeyManager:
    """Get the API key manager instance."""
    return APIKeyManager()

# Health check endpoint
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Batch initialization endpoint - combines multiple calls into one
async def initialize_onboarding(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Single endpoint for onboarding initialization - reduces round trips.
    
    Combines:
    - User information
    - Onboarding status
    - Progress details
    - Step data
    
    This eliminates 3-4 separate API calls on initial load.
    """
    try:
        user_id = str(current_user.get('id'))
        progress = get_onboarding_progress_for_user(user_id)
        
        # Build comprehensive step data
        steps_data = []
        for step in progress.steps:
            steps_data.append({
                "step_number": step.step_number,
                "title": step.title,
                "description": step.description,
                "status": step.status.value,
                "completed_at": step.completed_at,
                "has_data": step.data is not None and len(step.data) > 0 if step.data else False
            })
        
        # Get next incomplete step
        next_step = progress.get_next_incomplete_step()
        
        response_data = {
            "user": {
                "id": user_id,
                "email": current_user.get('email'),
                "first_name": current_user.get('first_name'),
                "last_name": current_user.get('last_name'),
                "clerk_user_id": user_id  # Clerk user ID is the session
            },
            "onboarding": {
                "is_completed": progress.is_completed,
                "current_step": progress.current_step,
                "completion_percentage": progress.get_completion_percentage(),
                "next_step": next_step,
                "started_at": progress.started_at,
                "last_updated": progress.last_updated,
                "completed_at": progress.completed_at,
                "can_proceed_to_final": progress.can_complete_onboarding(),
                "steps": steps_data
            },
            "session": {
                "session_id": user_id,  # Clerk user ID is the session identifier
                "initialized_at": datetime.now().isoformat()
            }
        }
        
        logger.info(f"Batch init successful for user {user_id}: step {progress.current_step}/{len(progress.steps)}")
        return response_data
        
    except Exception as e:
        logger.error(f"Error in initialize_onboarding: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to initialize onboarding: {str(e)}"
        )

# Onboarding status endpoints
async def get_onboarding_status(current_user: Dict[str, Any]):
    """Get the current onboarding status (per user)."""
    try:
        from api.onboarding_utils.step_management_service import StepManagementService
        
        step_service = StepManagementService()
        return await step_service.get_onboarding_status(current_user)
    except Exception as e:
        logger.error(f"Error getting onboarding status: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def get_onboarding_progress_full(current_user: Dict[str, Any]):
    """Get the full onboarding progress data."""
    try:
        from api.onboarding_utils.step_management_service import StepManagementService
        
        step_service = StepManagementService()
        return await step_service.get_onboarding_progress_full(current_user)
    except Exception as e:
        logger.error(f"Error getting onboarding progress: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def get_step_data(step_number: int, current_user: Dict[str, Any]):
    """Get data for a specific step."""
    try:
        from api.onboarding_utils.step_management_service import StepManagementService
        
        step_service = StepManagementService()
        return await step_service.get_step_data(step_number, current_user)
    except Exception as e:
        logger.error(f"Error getting step data: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def complete_step(step_number: int, request: StepCompletionRequest, current_user: Dict[str, Any]):
    """Mark a step as completed."""
    try:
        from api.onboarding_utils.step_management_service import StepManagementService
        
        step_service = StepManagementService()
        return await step_service.complete_step(step_number, request.data, current_user)
    except HTTPException:
        # Propagate known HTTP errors (e.g., 400 validation failures) without converting to 500
        raise
    except Exception as e:
        logger.error(f"Error completing step: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def skip_step(step_number: int, current_user: Dict[str, Any]):
    """Skip a step (for optional steps)."""
    try:
        from api.onboarding_utils.step_management_service import StepManagementService
        
        step_service = StepManagementService()
        return await step_service.skip_step(step_number, current_user)
    except Exception as e:
        logger.error(f"Error skipping step: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def validate_step_access(step_number: int, current_user: Dict[str, Any]):
    """Validate if user can access a specific step."""
    try:
        from api.onboarding_utils.step_management_service import StepManagementService
        
        step_service = StepManagementService()
        return await step_service.validate_step_access(step_number, current_user)
    except Exception as e:
        logger.error(f"Error validating step access: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def get_api_keys():
    """Get all configured API keys (masked)."""
    try:
        from api.onboarding_utils.api_key_management_service import APIKeyManagementService
        
        api_service = APIKeyManagementService()
        return await api_service.get_api_keys()
    except Exception as e:
        logger.error(f"Error getting API keys: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def get_api_keys_for_onboarding():
    """Get all configured API keys for onboarding (unmasked)."""
    try:
        from api.onboarding_utils.api_key_management_service import APIKeyManagementService
        
        api_service = APIKeyManagementService()
        return await api_service.get_api_keys_for_onboarding()
    except Exception as e:
        logger.error(f"Error getting API keys for onboarding: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def save_api_key(request: APIKeyRequest):
    """Save an API key for a provider."""
    try:
        from api.onboarding_utils.api_key_management_service import APIKeyManagementService
        
        api_service = APIKeyManagementService()
        return await api_service.save_api_key(request.provider, request.api_key, request.description)
    except Exception as e:
        logger.error(f"Error saving API key: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def validate_api_keys():
    """Validate all configured API keys."""
    try:
        from api.onboarding_utils.api_key_management_service import APIKeyManagementService
        
        api_service = APIKeyManagementService()
        return await api_service.validate_api_keys()
    except Exception as e:
        logger.error(f"Error validating API keys: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def start_onboarding(current_user: Dict[str, Any]):
    """Start a new onboarding session."""
    try:
        from api.onboarding_utils.onboarding_control_service import OnboardingControlService
        
        control_service = OnboardingControlService()
        return await control_service.start_onboarding(current_user)
    except Exception as e:
        logger.error(f"Error starting onboarding: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def complete_onboarding(current_user: Dict[str, Any]):
    """Complete the onboarding process."""
    try:
        from api.onboarding_utils.onboarding_completion_service import OnboardingCompletionService
        
        completion_service = OnboardingCompletionService()
        return await completion_service.complete_onboarding(current_user)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error completing onboarding: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def reset_onboarding():
    """Reset the onboarding progress."""
    try:
        from api.onboarding_utils.onboarding_control_service import OnboardingControlService
        
        control_service = OnboardingControlService()
        return await control_service.reset_onboarding()
    except Exception as e:
        logger.error(f"Error resetting onboarding: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def get_resume_info():
    """Get information for resuming onboarding."""
    try:
        from api.onboarding_utils.onboarding_control_service import OnboardingControlService
        
        control_service = OnboardingControlService()
        return await control_service.get_resume_info()
    except Exception as e:
        logger.error(f"Error getting resume info: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

def get_onboarding_config():
    """Get onboarding configuration and requirements."""
    try:
        from api.onboarding_utils.onboarding_config_service import OnboardingConfigService
        
        config_service = OnboardingConfigService()
        return config_service.get_onboarding_config()
    except Exception as e:
        logger.error(f"Error getting onboarding config: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error") 

# Add new endpoints for enhanced functionality

async def get_provider_setup_info(provider: str):
    """Get setup information for a specific provider."""
    try:
        from api.onboarding_utils.onboarding_config_service import OnboardingConfigService
        
        config_service = OnboardingConfigService()
        return await config_service.get_provider_setup_info(provider)
    except Exception as e:
        logger.error(f"Error getting provider setup info: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def get_all_providers_info():
    """Get setup information for all providers."""
    try:
        from api.onboarding_utils.onboarding_config_service import OnboardingConfigService
        
        config_service = OnboardingConfigService()
        return config_service.get_all_providers_info()
    except Exception as e:
        logger.error(f"Error getting all providers info: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def validate_provider_key(provider: str, request: APIKeyRequest):
    """Validate a specific provider's API key."""
    try:
        from api.onboarding_utils.onboarding_config_service import OnboardingConfigService
        
        config_service = OnboardingConfigService()
        return await config_service.validate_provider_key(provider, request.api_key)
    except Exception as e:
        logger.error(f"Error validating provider key: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def get_enhanced_validation_status():
    """Get enhanced validation status for all configured services."""
    try:
        from api.onboarding_utils.onboarding_config_service import OnboardingConfigService
        
        config_service = OnboardingConfigService()
        return await config_service.get_enhanced_validation_status()
    except Exception as e:
        logger.error(f"Error getting enhanced validation status: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# New endpoints for FinalStep data loading
async def get_onboarding_summary(current_user: Dict[str, Any]):
    """Get comprehensive onboarding summary for FinalStep with user isolation."""
    try:
        from api.onboarding_utils.onboarding_summary_service import OnboardingSummaryService
        
        user_id = str(current_user.get('id'))
        summary_service = OnboardingSummaryService(user_id)
        logger.info(f"Getting onboarding summary for user {user_id}")
        return await summary_service.get_onboarding_summary()
    except Exception as e:
        logger.error(f"Error getting onboarding summary: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def get_website_analysis_data(current_user: Dict[str, Any]):
    """Get website analysis data for FinalStep with user isolation."""
    try:
        from api.onboarding_utils.onboarding_summary_service import OnboardingSummaryService
        
        user_id = str(current_user.get('id'))
        summary_service = OnboardingSummaryService(user_id)
        logger.info(f"Getting website analysis data for user {user_id}")
        return await summary_service.get_website_analysis_data()
    except Exception as e:
        logger.error(f"Error getting website analysis data: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def get_research_preferences_data(current_user: Dict[str, Any]):
    """Get research preferences data for FinalStep with user isolation."""
    try:
        from api.onboarding_utils.onboarding_summary_service import OnboardingSummaryService
        
        user_id = str(current_user.get('id'))
        summary_service = OnboardingSummaryService(user_id)
        logger.info(f"Getting research preferences data for user {user_id}")
        return await summary_service.get_research_preferences_data()
    except Exception as e:
        logger.error(f"Error getting research preferences data: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# New persona-related endpoints

async def check_persona_generation_readiness(user_id: int = 1):
    """Check if user has sufficient data for persona generation."""
    try:
        from api.onboarding_utils.persona_management_service import PersonaManagementService
        
        persona_service = PersonaManagementService()
        return await persona_service.check_persona_generation_readiness(user_id)
    except Exception as e:
        logger.error(f"Error checking persona readiness: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def generate_persona_preview(user_id: int = 1):
    """Generate a preview of the writing persona without saving."""
    try:
        from api.onboarding_utils.persona_management_service import PersonaManagementService
        
        persona_service = PersonaManagementService()
        return await persona_service.generate_persona_preview(user_id)
    except Exception as e:
        logger.error(f"Error generating persona preview: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def generate_writing_persona(user_id: int = 1):
    """Generate and save a writing persona from onboarding data."""
    try:
        from api.onboarding_utils.persona_management_service import PersonaManagementService
        
        persona_service = PersonaManagementService()
        return await persona_service.generate_writing_persona(user_id)
    except Exception as e:
        logger.error(f"Error generating writing persona: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def get_user_writing_personas(user_id: int = 1):
    """Get all writing personas for the user."""
    try:
        from api.onboarding_utils.persona_management_service import PersonaManagementService
        
        persona_service = PersonaManagementService()
        return await persona_service.get_user_writing_personas(user_id)
    except Exception as e:
        logger.error(f"Error getting user personas: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error") 

# Business Information endpoints
async def save_business_info(business_info: 'BusinessInfoRequest'):
    """Save business information for users without websites."""
    try:
        from api.onboarding_utils.business_info_service import BusinessInfoService
        
        business_service = BusinessInfoService()
        return await business_service.save_business_info(business_info)
    except Exception as e:
        logger.error(f"❌ Error saving business info: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save business info: {str(e)}")

async def get_business_info(business_info_id: int):
    """Get business information by ID."""
    try:
        from api.onboarding_utils.business_info_service import BusinessInfoService
        
        business_service = BusinessInfoService()
        return await business_service.get_business_info(business_info_id)
    except Exception as e:
        logger.error(f"❌ Error getting business info: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get business info: {str(e)}")

async def get_business_info_by_user(user_id: int):
    """Get business information by user ID."""
    try:
        from api.onboarding_utils.business_info_service import BusinessInfoService
        
        business_service = BusinessInfoService()
        return await business_service.get_business_info_by_user(user_id)
    except Exception as e:
        logger.error(f"❌ Error getting business info: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get business info: {str(e)}")

async def update_business_info(business_info_id: int, business_info: 'BusinessInfoRequest'):
    """Update business information."""
    try:
        from api.onboarding_utils.business_info_service import BusinessInfoService
        
        business_service = BusinessInfoService()
        return await business_service.update_business_info(business_info_id, business_info)
    except Exception as e:
        logger.error(f"❌ Error updating business info: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update business info: {str(e)}")
