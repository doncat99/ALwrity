#!/usr/bin/env python3
"""
ALwrity Backend Server - Modular Startup Script
Handles setup, dependency installation, and server startup using modular utilities.
Run this from the backend directory to set up and start the FastAPI server.
"""

import os
import sys
import argparse
from pathlib import Path

# Import modular utilities
from alwrity_utils import (
    DependencyManager,
    EnvironmentSetup,
    DatabaseSetup,
    ProductionOptimizer
)


def start_backend(enable_reload=False, production_mode=False):
    """Start the backend server."""
    print("🚀 Starting ALwrity Backend...")
    
    # Set host based on environment and mode
    # Use 127.0.0.1 for local production testing on Windows
    # Use 0.0.0.0 for actual cloud deployments (Render, Railway, etc.)
    default_host = os.getenv("RENDER") or os.getenv("RAILWAY_ENVIRONMENT") or os.getenv("DEPLOY_ENV")
    if default_host:
        # Cloud deployment detected - use 0.0.0.0
        os.environ.setdefault("HOST", "0.0.0.0")
    else:
        # Local deployment - use 127.0.0.1 for better Windows compatibility
        os.environ.setdefault("HOST", "127.0.0.1")
    
    os.environ.setdefault("PORT", "8000")
    
    # Set reload based on argument or environment variable
    if enable_reload and not production_mode:
        os.environ.setdefault("RELOAD", "true")
        print("   🔄 Development mode: Auto-reload enabled")
    else:
        os.environ.setdefault("RELOAD", "false")
        print("   🏭 Production mode: Auto-reload disabled")
    
    host = os.getenv("HOST")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("RELOAD", "false").lower() == "true"
    
    print(f"   📍 Host: {host}")
    print(f"   🔌 Port: {port}")
    print(f"   🔄 Reload: {reload}")
    
    try:
        # Import and run the app
        from app import app
        from services.database import init_database
        import uvicorn
        
        # Explicitly initialize database before starting server
        print("[DB]  Initializing database...")
        init_database()
        print("[OK] Database initialized successfully")
        
        print("\n🌐 Backend is starting...")
        print("   📖 API Documentation: http://localhost:8000/api/docs")
        print("   🔍 Health Check: http://localhost:8000/health")
        print("   📊 ReDoc: http://localhost:8000/api/redoc")
        
        if not production_mode:
            print("   📈 API Monitoring: http://localhost:8000/api/content-planning/monitoring/health")
            print("   💳 Billing Dashboard: http://localhost:8000/api/subscription/plans")
            print("   📊 Usage Tracking: http://localhost:8000/api/subscription/usage/demo")
        
        print("\n[STOP]  Press Ctrl+C to stop the server")
        print("=" * 60)
        print("\n💡 Usage:")
        print("   Production mode: python start_alwrity_backend.py --production")
        print("   Development mode: python start_alwrity_backend.py --dev")
        print("   With auto-reload: python start_alwrity_backend.py --reload")
        print("=" * 60)
        
        uvicorn.run(
            "app:app",
            host=host,
            port=port,
            reload=reload,
            reload_excludes=[
                "*.pyc",
                "*.pyo", 
                "*.pyd",
                "__pycache__",
                "*.log",
                "*.sqlite",
                "*.db",
                "*.tmp",
                "*.temp",
                "test_*.py",
                "temp_*.py",
                "monitoring_data_service.py",
                "test_monitoring_save.py",
                "*.json",
                "*.yaml",
                "*.yml",
                ".env*",
                "logs/*",
                "cache/*",
                "tmp/*",
                "temp/*",
                "middleware/*",
                "models/*",
                "scripts/*",
                "alwrity_utils/*"
            ],
            reload_includes=[
                "app.py",
                "api/**/*.py",
                "services/**/*.py"
            ],
            log_level="info"
        )
        
    except KeyboardInterrupt:
        print("\n\n🛑 Backend stopped by user")
    except Exception as e:
        print(f"\n[ERROR] Error starting backend: {e}")
        return False
    
    return True


def main():
    """Main function to set up and start the backend."""
    # Parse command line arguments
    parser = argparse.ArgumentParser(description="ALwrity Backend Server")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload for development")
    parser.add_argument("--dev", action="store_true", help="Enable development mode (auto-reload)")
    parser.add_argument("--production", action="store_true", help="Enable production mode (optimized for deployment)")
    args = parser.parse_args()
    
    # Determine mode
    production_mode = args.production
    enable_reload = (args.reload or args.dev) and not production_mode
    
    print("ALwrity Backend Server")
    print("=" * 40)
    print(f"Mode: {'PRODUCTION' if production_mode else 'DEVELOPMENT'}")
    print(f"Auto-reload: {'ENABLED' if enable_reload else 'DISABLED'}")
    print("=" * 40)
    
    # Check if we're in the right directory
    if not os.path.exists("app.py"):
        print("[ERROR] Error: app.py not found. Please run this script from the backend directory.")
        print("   Current directory:", os.getcwd())
        print("   Expected files:", [f for f in os.listdir('.') if f.endswith('.py')])
        return False
    
    # Initialize modular components
    dependency_manager = DependencyManager()
    environment_setup = EnvironmentSetup(production_mode=production_mode)
    database_setup = DatabaseSetup(production_mode=production_mode)
    production_optimizer = ProductionOptimizer()
    
    # Apply production optimizations if needed
    if production_mode:
        if not production_optimizer.apply_production_optimizations():
            print("[ERROR] Production optimization failed")
            return False
    
    # Check and install dependencies
    critical_ok, missing_critical = dependency_manager.check_critical_dependencies()
    if not critical_ok:
        print("[ERROR] Critical dependencies missing, installing...")
        if not dependency_manager.install_requirements():
            print("[ERROR] Failed to install dependencies")
            return False
    
    # Check optional dependencies (non-critical)
    dependency_manager.check_optional_dependencies()
    
    # Setup environment
    if not environment_setup.setup_directories():
        print("[ERROR] Directory setup failed")
        return False
    
    if not environment_setup.setup_environment_variables():
        print("[ERROR] Environment variable setup failed")
        return False
    
    # Create .env file only in development
    if not production_mode:
        environment_setup.create_env_file()
    
    # Setup database
    if not database_setup.setup_essential_tables():
        print("[WARNING] Database setup had issues, continuing...")
    
    # Setup advanced features in development, verify in all modes
    if not production_mode:
        database_setup.setup_advanced_tables()
    
    # Always verify database tables (important for both dev and production)
    database_setup.verify_tables()
    
    # Setup linguistic analysis (always check, download only if needed)
    # This ensures models are verified in both dev and production
    if not production_optimizer.skip_spacy_setup():
        dependency_manager.setup_spacy_model()
    if not production_optimizer.skip_nltk_setup():
        dependency_manager.setup_nltk_data()
    
    # Start backend
    return start_backend(enable_reload=enable_reload, production_mode=production_mode)


if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1)