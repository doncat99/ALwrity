"""
Step Management Service
Handles onboarding step operations and progress tracking.
"""

from typing import Dict, Any, List, Optional
from fastapi import HTTPException
from loguru import logger

from services.api_key_manager import get_onboarding_progress_for_user, StepStatus
from services.progressive_setup_service import ProgressiveSetupService
from services.database import get_db_session

class StepManagementService:
    """Service for handling onboarding step management."""
    
    def __init__(self):
        pass
    
    async def get_onboarding_status(self, current_user: Dict[str, Any]) -> Dict[str, Any]:
        """Get the current onboarding status (per user)."""
        try:
            user_id = str(current_user.get('id'))
            progress = get_onboarding_progress_for_user(user_id)
            
            # Safety check: if all steps are completed, ensure is_completed is True
            all_steps_completed = all(s.status in [StepStatus.COMPLETED, StepStatus.SKIPPED] for s in progress.steps)
            if all_steps_completed and not progress.is_completed:
                logger.info(f"[get_onboarding_status] All steps completed but is_completed was False, fixing...")
                progress.is_completed = True
                progress.completed_at = progress.started_at  # Use started_at as fallback
                progress.current_step = len(progress.steps)
                progress.save_progress()
            
            return {
                "is_completed": progress.is_completed,
                "current_step": progress.current_step,
                "completion_percentage": progress.get_completion_percentage(),
                "next_step": progress.get_next_incomplete_step(),
                "started_at": progress.started_at,
                "completed_at": progress.completed_at,
                "can_proceed_to_final": progress.can_complete_onboarding()
            }
        except Exception as e:
            logger.error(f"Error getting onboarding status: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    async def get_onboarding_progress_full(self, current_user: Dict[str, Any]) -> Dict[str, Any]:
        """Get the full onboarding progress data."""
        try:
            user_id = str(current_user.get('id'))
            progress = get_onboarding_progress_for_user(user_id)
            
            # Convert StepData objects to dictionaries
            step_data = []
            for step in progress.steps:
                step_data.append({
                    "step_number": step.step_number,
                    "title": step.title,
                    "description": step.description,
                    "status": step.status.value,
                    "completed_at": step.completed_at,
                    "data": step.data,
                    "validation_errors": step.validation_errors or []
                })
            
            return {
                "steps": step_data,
                "current_step": progress.current_step,
                "started_at": progress.started_at,
                "last_updated": progress.last_updated,
                "is_completed": progress.is_completed,
                "completed_at": progress.completed_at,
                "completion_percentage": progress.get_completion_percentage()
            }
        except Exception as e:
            logger.error(f"Error getting onboarding progress: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    async def get_step_data(self, step_number: int, current_user: Dict[str, Any]) -> Dict[str, Any]:
        """Get data for a specific step."""
        try:
            user_id = str(current_user.get('id'))
            progress = get_onboarding_progress_for_user(user_id)
            step = progress.get_step_data(step_number)
            
            if not step:
                raise HTTPException(status_code=404, detail=f"Step {step_number} not found")
            
            return {
                "step_number": step.step_number,
                "title": step.title,
                "description": step.description,
                "status": step.status.value,
                "completed_at": step.completed_at,
                "data": step.data,
                "validation_errors": step.validation_errors or []
            }
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting step data: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    async def complete_step(self, step_number: int, request_data: Dict[str, Any], current_user: Dict[str, Any]) -> Dict[str, Any]:
        """Mark a step as completed."""
        try:
            logger.info(f"[complete_step] Completing step {step_number}")
            user_id = str(current_user.get('id'))
            progress = get_onboarding_progress_for_user(user_id)
            step = progress.get_step_data(step_number)
            
            if not step:
                logger.error(f"[complete_step] Step {step_number} not found")
                raise HTTPException(status_code=404, detail=f"Step {step_number} not found")
            
            # Validate step data before marking as completed
            from services.validation import validate_step_data
            logger.info(f"[complete_step] Validating step {step_number} with data: {request_data}")
            validation_errors = validate_step_data(step_number, request_data)
            
            if validation_errors:
                logger.warning(f"[complete_step] Step {step_number} validation failed: {validation_errors}")
                raise HTTPException(status_code=400, detail=f"Step validation failed: {'; '.join(validation_errors)}")
            
            # Mark step as completed
            progress.mark_step_completed(step_number, request_data)
            logger.info(f"[complete_step] Step {step_number} completed successfully")
            
            # If this is step 1 (API keys), also save to global .env file
            if step_number == 1 and request_data and 'api_keys' in request_data:
                try:
                    from services.api_key_manager import APIKeyManager
                    api_manager = APIKeyManager()
                    
                    # Save each API key to the global .env file
                    api_keys = request_data['api_keys']
                    for provider, api_key in api_keys.items():
                        if api_key:  # Only save non-empty keys
                            api_manager.save_api_key(provider, api_key)
                            logger.info(f"[complete_step] Saved {provider} API key to global .env file")
                except Exception as env_error:
                    logger.warning(f"Could not save API keys to global .env file: {env_error}")
                    # Don't fail the step completion for .env file issues
            
            # Initialize/upgrade user environment based on new step
            try:
                db_session = get_db_session()
                if db_session:
                    setup_service = ProgressiveSetupService(db_session)
                    
                    # Initialize environment if first time, or upgrade if progressing
                    if step_number == 1:
                        setup_service.initialize_user_environment(user_id)
                    else:
                        setup_service.upgrade_user_environment(user_id, step_number)
                    
                    db_session.close()
            except Exception as env_error:
                logger.warning(f"Could not set up user environment: {env_error}")
                # Don't fail the step completion for environment setup issues
            
            return {
                "message": f"Step {step_number} completed successfully",
                "step_number": step_number,
                "data": request_data
            }
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error completing step: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    async def skip_step(self, step_number: int, current_user: Dict[str, Any]) -> Dict[str, Any]:
        """Skip a step (for optional steps)."""
        try:
            user_id = str(current_user.get('id'))
            progress = get_onboarding_progress_for_user(user_id)
            step = progress.get_step_data(step_number)
            
            if not step:
                raise HTTPException(status_code=404, detail=f"Step {step_number} not found")
            
            # Mark step as skipped
            progress.mark_step_skipped(step_number)
            
            return {
                "message": f"Step {step_number} skipped successfully",
                "step_number": step_number
            }
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error skipping step: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    async def validate_step_access(self, step_number: int, current_user: Dict[str, Any]) -> Dict[str, Any]:
        """Validate if user can access a specific step."""
        try:
            user_id = str(current_user.get('id'))
            progress = get_onboarding_progress_for_user(user_id)
            
            if not progress.can_proceed_to_step(step_number):
                return {
                    "can_proceed": False,
                    "validation_errors": [f"Cannot proceed to step {step_number}. Complete previous steps first."],
                    "step_status": "locked"
                }
            
            return {
                "can_proceed": True,
                "validation_errors": [],
                "step_status": "available"
            }
        except Exception as e:
            logger.error(f"Error validating step access: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
