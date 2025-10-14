"""
OLLAMA Router
API endpoints for OLLAMA installation, management, and validation.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from loguru import logger

from services.ollama.installation_service import OllamaInstallationService
from services.ollama.platform_manager import OllamaPlatformManager
from services.ollama.validation_service import OllamaValidationService

router = APIRouter(prefix="/api/ollama", tags=["ollama"])

# Initialize services
installation_service = OllamaInstallationService()
platform_manager = OllamaPlatformManager()
validation_service = OllamaValidationService()

# Pydantic models
class InstallationRequest(BaseModel):
    force_reinstall: bool = False

class InstallationResponse(BaseModel):
    success: bool
    message: str
    version: Optional[str] = None
    already_installed: bool = False
    service_started: bool = False
    verification_passed: bool = False
    error: Optional[str] = None

class ValidationResponse(BaseModel):
    overall_status: str
    checks: Dict[str, Any]
    summary: Dict[str, Any]
    recommendations: List[str]

class PlatformInfoResponse(BaseModel):
    system: Dict[str, Any]
    ollama_paths: Dict[str, str]
    requirements: Dict[str, Any]
    installation_method: Dict[str, Any]
    service_management: Dict[str, Any]

class SystemRequirementsResponse(BaseModel):
    meets_requirements: bool
    checks: Dict[str, Any]
    recommendations: List[str]

class ModelsResponse(BaseModel):
    models: List[Dict[str, Any]]
    model_count: int

class ModelPullRequest(BaseModel):
    model_name: str

@router.get("/status", response_model=Dict[str, Any])
async def get_ollama_status():
    """Get comprehensive OLLAMA status."""
    try:
        install_status = installation_service.get_installation_status()
        validation_results = validation_service.validate_installation()
        
        return {
            "installation": install_status,
            "validation": validation_results,
            "timestamp": installation_service._get_timestamp(),
        }
    except Exception as e:
        logger.error(f"Failed to get OLLAMA status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/install", response_model=InstallationResponse)
async def install_ollama(request: InstallationRequest):
    """Install OLLAMA on the system with enhanced error handling."""
    try:
        logger.info("Starting OLLAMA installation")
        
        # Check system requirements first
        requirements = platform_manager.check_system_requirements()
        if not requirements.get('meets_requirements', False):
            return InstallationResponse(
                success=False,
                error=f"System requirements not met: {', '.join(requirements.get('checks', {}).keys())}",
            )
        
        # Check if already installed
        if not request.force_reinstall:
            install_check = installation_service.check_ollama_installed()
            if install_check.get('installed', False):
                return InstallationResponse(
                    success=True,
                    message="OLLAMA is already installed",
                    version=install_check.get('version'),
                    already_installed=True,
                )
        
        # Perform installation
        result = installation_service.install_ollama()
        
        if result['success']:
            return InstallationResponse(
                success=True,
                message=result['message'],
                version=result.get('version'),
                service_started=result.get('service_started', False),
                verification_passed=result.get('verification_passed', False),
            )
        else:
            # Enhanced error response with error type
            error_response = InstallationResponse(
                success=False,
                message=result.get('error', 'Installation failed'),
                error=result.get('error', 'Installation failed'),
            )
            
            # Add error type if available
            if 'error_type' in result:
                error_response.error_type = result['error_type']
            
            return error_response
            
    except Exception as e:
        logger.error(f"OLLAMA installation failed: {e}")
        
        # Categorize the error
        error_message = str(e)
        if 'permission' in error_message.lower():
            raise HTTPException(status_code=403, detail="Permission denied. Please run as administrator.")
        elif 'network' in error_message.lower() or 'connection' in error_message.lower():
            raise HTTPException(status_code=503, detail="Network error. Please check your connection.")
        elif 'timeout' in error_message.lower():
            raise HTTPException(status_code=408, detail="Installation timeout. Please try again.")
        else:
            raise HTTPException(status_code=500, detail=f"Installation failed: {error_message}")

@router.get("/platform", response_model=PlatformInfoResponse)
async def get_platform_info():
    """Get platform-specific information."""
    try:
        platform_info = platform_manager.get_platform_info()
        return PlatformInfoResponse(**platform_info)
    except Exception as e:
        logger.error(f"Failed to get platform info: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/requirements", response_model=SystemRequirementsResponse)
async def check_system_requirements():
    """Check if system meets OLLAMA requirements."""
    try:
        requirements_check = platform_manager.check_system_requirements()
        return SystemRequirementsResponse(**requirements_check)
    except Exception as e:
        logger.error(f"Failed to check system requirements: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/validate", response_model=ValidationResponse)
async def validate_installation():
    """Validate OLLAMA installation and functionality."""
    try:
        validation_results = validation_service.validate_installation()
        return ValidationResponse(**validation_results)
    except Exception as e:
        logger.error(f"Validation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/models", response_model=ModelsResponse)
async def get_available_models():
    """Get list of available OLLAMA models."""
    try:
        # Check if OLLAMA is running
        running_check = installation_service.check_ollama_running()
        if not running_check.get('running', False):
            raise HTTPException(
                status_code=503, 
                detail="OLLAMA service is not running. Please start it first."
            )
        
        # Get models
        models_check = validation_service.check_models_available()
        if models_check.get('status') != 'success':
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to get models: {models_check.get('message', 'Unknown error')}"
            )
        
        models = models_check.get('models', [])
        return ModelsResponse(
            models=models,
            model_count=len(models)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get models: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/models/pull")
async def pull_model(request: ModelPullRequest):
    """Pull (download) a model."""
    try:
        # Check if OLLAMA is running
        running_check = installation_service.check_ollama_running()
        if not running_check.get('running', False):
            raise HTTPException(
                status_code=503, 
                detail="OLLAMA service is not running. Please start it first."
            )
        
        # Pull the model
        import requests
        response = requests.post(
            f"{installation_service.ollama_base_url}/api/pull",
            json={"name": request.model_name, "stream": False},
            timeout=300  # 5 minutes timeout
        )
        
        if response.status_code == 200:
            return {"success": True, "message": f"Model {request.model_name} pulled successfully"}
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Failed to pull model: {response.text}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to pull model {request.model_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/service/start")
async def start_ollama_service():
    """Start the OLLAMA service."""
    try:
        success, message = installation_service.start_ollama_service()
        
        if success:
            return {"success": True, "message": message}
        else:
            raise HTTPException(status_code=500, detail=message)
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to start OLLAMA service: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/service/stop")
async def stop_ollama_service():
    """Stop the OLLAMA service."""
    try:
        # This would need to be implemented in the installation service
        # For now, we'll return a not implemented response
        raise HTTPException(
            status_code=501, 
            detail="Stop service functionality not implemented yet"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to stop OLLAMA service: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/service/status")
async def get_service_status():
    """Get OLLAMA service status."""
    try:
        running_check = installation_service.check_ollama_running()
        return running_check
        
    except Exception as e:
        logger.error(f"Failed to get service status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Simple health check endpoint."""
    try:
        # Quick API connectivity check
        api_check = validation_service.check_api_connectivity()
        
        if api_check.get('status') == 'success':
            return {
                "status": "healthy",
                "message": "OLLAMA is running and accessible",
                "version": api_check.get('version', 'unknown'),
            }
        else:
            return {
                "status": "unhealthy",
                "message": "OLLAMA is not accessible",
                "error": api_check.get('message', 'Unknown error'),
            }
            
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "error",
            "message": "Health check failed",
            "error": str(e),
        }

@router.get("/recommended-models")
async def get_recommended_models():
    """Get list of recommended models for different use cases."""
    try:
        recommended_models = [
            {
                "name": "llama3.2:3b",
                "description": "Fast and efficient model for general tasks",
                "size": "~2GB",
                "use_case": "General purpose, fast responses",
                "download_command": "ollama pull llama3.2:3b",
            },
            {
                "name": "llama3.2:1b",
                "description": "Ultra-lightweight model for basic tasks",
                "size": "~1GB",
                "use_case": "Basic tasks, low resource usage",
                "download_command": "ollama pull llama3.2:1b",
            },
            {
                "name": "llama3.1:8b",
                "description": "Balanced model with good performance",
                "size": "~4.7GB",
                "use_case": "Balanced performance and resource usage",
                "download_command": "ollama pull llama3.1:8b",
            },
            {
                "name": "codellama:7b",
                "description": "Specialized for code generation and analysis",
                "size": "~3.8GB",
                "use_case": "Code generation, programming assistance",
                "download_command": "ollama pull codellama:7b",
            },
            {
                "name": "mistral:7b",
                "description": "High-quality general purpose model",
                "size": "~4.1GB",
                "use_case": "High-quality text generation",
                "download_command": "ollama pull mistral:7b",
            },
        ]
        
        return {
            "recommended_models": recommended_models,
            "total_count": len(recommended_models),
        }
        
    except Exception as e:
        logger.error(f"Failed to get recommended models: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Add timestamp method to installation service
def _get_timestamp():
    import datetime
    return datetime.datetime.now().isoformat()

# Monkey patch the method
installation_service._get_timestamp = _get_timestamp
