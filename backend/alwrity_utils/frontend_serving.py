"""
Frontend Serving Module
Handles React frontend serving and static file mounting.
"""

import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from loguru import logger
from typing import Dict, Any


class FrontendServing:
    """Manages React frontend serving and static file mounting."""
    
    def __init__(self, app: FastAPI):
        self.app = app
        self.frontend_build_path = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "build")
        self.static_path = os.path.join(self.frontend_build_path, "static")
    
    def setup_frontend_serving(self) -> bool:
        """Set up React frontend serving and static file mounting."""
        try:
            logger.info("Setting up frontend serving...")
            
            # Mount static files for React app (only if directory exists)
            if os.path.exists(self.static_path):
                self.app.mount("/static", StaticFiles(directory=self.static_path), name="static")
                logger.info("Frontend static files mounted successfully")
                return True
            else:
                logger.info("Frontend build directory not found. Static files not mounted.")
                return False
                
        except Exception as e:
            logger.error(f"Could not mount static files: {e}")
            return False
    
    def serve_frontend(self) -> FileResponse | Dict[str, Any]:
        """Serve the React frontend."""
        try:
            # Check if frontend build exists
            index_html = os.path.join(self.frontend_build_path, "index.html")
            
            if os.path.exists(index_html):
                return FileResponse(index_html)
            else:
                return {
                    "message": "Frontend not built. Please run 'npm run build' in the frontend directory.",
                    "api_docs": "/api/docs"
                }
                
        except Exception as e:
            logger.error(f"Error serving frontend: {e}")
            return {
                "message": "Error serving frontend",
                "error": str(e),
                "api_docs": "/api/docs"
            }
    
    def get_frontend_status(self) -> Dict[str, Any]:
        """Get the status of frontend build and serving."""
        try:
            index_html = os.path.join(self.frontend_build_path, "index.html")
            static_exists = os.path.exists(self.static_path)
            
            return {
                "frontend_build_path": self.frontend_build_path,
                "static_path": self.static_path,
                "index_html_exists": os.path.exists(index_html),
                "static_files_exist": static_exists,
                "frontend_ready": os.path.exists(index_html) and static_exists
            }
            
        except Exception as e:
            logger.error(f"Error checking frontend status: {e}")
            return {
                "error": str(e),
                "frontend_ready": False
            }
