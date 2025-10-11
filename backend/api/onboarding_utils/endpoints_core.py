from typing import Dict, Any
from datetime import datetime
from loguru import logger
from fastapi import HTTPException, Depends

from middleware.auth_middleware import get_current_user

from .endpoint_models import (
    get_onboarding_progress_for_user,
)


def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


async def initialize_onboarding(current_user: Dict[str, Any] = Depends(get_current_user)):
    try:
        user_id = str(current_user.get('id'))
        progress = get_onboarding_progress_for_user(user_id)

        steps_data = []
        for step in progress.steps:
            # Include step data for completed steps, especially persona data (step 4) and research data (step 3)
            step_data = None
            if step.data:
                if step.step_number == 4:  # Personalization step with persona data
                    # Include persona data for step 4 to ensure it's available for step 5
                    step_data = step.data
                    logger.info(f"Including persona data for step 4: {len(str(step_data))} chars")
                elif step.step_number == 3:  # Research step with research preferences
                    # Include research preferences for step 3 to ensure it's available for step 4
                    step_data = step.data
                    logger.info(f"Including research data for step 3: {len(str(step_data))} chars")

            steps_data.append({
                "step_number": step.step_number,
                "title": step.title,
                "description": step.description,
                "status": step.status.value,
                "completed_at": step.completed_at,
                "has_data": step.data is not None and len(step.data) > 0 if step.data else False,
                "data": step_data,  # Include actual data for critical steps
            })

        next_step = progress.get_next_incomplete_step()

        # Derive a resilient current_step from DB if progress looks unset (production refresh)
        derived_current_step = progress.current_step
        try:
            # Only derive if we're at the initial state
            if not progress.is_completed and (progress.current_step in (1, 0)):
                from services.onboarding_database_service import OnboardingDatabaseService
                from services.database import SessionLocal
                db = SessionLocal()
                try:
                    db_service = OnboardingDatabaseService()
                    # If website analysis exists -> at least step 2 completed
                    website = db_service.get_website_analysis(user_id, db)
                    if website and (website.get('website_url') or website.get('writing_style') or website.get('status') == 'completed'):
                        derived_current_step = max(derived_current_step, 2)
                    # If competitor research data exists, bump to step 3 (best-effort via preferences)
                    prefs = db_service.get_research_preferences(user_id, db)
                    if prefs and (prefs.get('research_depth') or prefs.get('content_types')):
                        derived_current_step = max(derived_current_step, 3)
                    # If persona data exists, bump to step 4
                    persona = db_service.get_persona_data(user_id, db)
                    if persona and (persona.get('corePersona') or persona.get('platformPersonas')):
                        derived_current_step = max(derived_current_step, 4)
                finally:
                    db.close()
        except Exception:
            # Non-fatal; keep original progress.current_step
            pass

        response_data = {
            "user": {
                "id": user_id,
                "email": current_user.get('email'),
                "first_name": current_user.get('first_name'),
                "last_name": current_user.get('last_name'),
                "clerk_user_id": user_id,
            },
            "onboarding": {
                "is_completed": progress.is_completed,
                "current_step": derived_current_step,
                "completion_percentage": progress.get_completion_percentage(),
                "next_step": next_step,
                "started_at": progress.started_at,
                "last_updated": progress.last_updated,
                "completed_at": progress.completed_at,
                "can_proceed_to_final": progress.can_complete_onboarding(),
                "steps": steps_data,
            },
            "session": {
                "session_id": user_id,
                "initialized_at": datetime.now().isoformat(),
            },
        }

        logger.info(
            f"Batch init successful for user {user_id}: step {progress.current_step}/{len(progress.steps)}"
        )
        return response_data
    except Exception as e:
        logger.error(f"Error in initialize_onboarding: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to initialize onboarding: {str(e)}")


async def get_onboarding_status(current_user: Dict[str, Any]):
    try:
        from api.onboarding_utils.step_management_service import StepManagementService
        step_service = StepManagementService()
        return await step_service.get_onboarding_status(current_user)
    except Exception as e:
        from fastapi import HTTPException
        from loguru import logger
        logger.error(f"Error getting onboarding status: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


async def get_onboarding_progress_full(current_user: Dict[str, Any]):
    try:
        from api.onboarding_utils.step_management_service import StepManagementService
        step_service = StepManagementService()
        return await step_service.get_onboarding_progress_full(current_user)
    except Exception as e:
        from fastapi import HTTPException
        from loguru import logger
        logger.error(f"Error getting onboarding progress: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


async def get_step_data(step_number: int, current_user: Dict[str, Any]):
    try:
        from api.onboarding_utils.step_management_service import StepManagementService
        step_service = StepManagementService()
        return await step_service.get_step_data(step_number, current_user)
    except Exception as e:
        from fastapi import HTTPException
        from loguru import logger
        logger.error(f"Error getting step data: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


__all__ = [name for name in globals().keys() if not name.startswith('_')]


