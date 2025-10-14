#!/usr/bin/env python3
"""
Start ALwrity backend with OLLAMA support.
This script starts the backend server with all necessary dependencies.
"""

import os
import sys
import subprocess
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible."""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")

def check_dependencies():
    """Check if required dependencies are installed."""
    required_packages = [
        'fastapi',
        'uvicorn',
        'requests',
        'psutil',
        'loguru',
        'python-dotenv'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"❌ Missing packages: {', '.join(missing_packages)}")
        print("Installing missing packages...")
        subprocess.check_call([sys.executable, '-m', 'pip', 'install'] + missing_packages)
        print("✅ All packages installed")
    else:
        print("✅ All required packages are available")

def setup_environment():
    """Set up environment variables."""
    env_file = Path('.env')
    if not env_file.exists():
        print("⚠️  .env file not found. Creating template...")
        env_template = """# ALwrity Backend Environment Variables
DEBUG=true
DEPLOY_ENV=local

# Database
DATABASE_URL=sqlite:///./alwrity.db

# API Keys (will be managed by users)
GEMINI_API_KEY=
EXA_API_KEY=
COPILOTKIT_API_KEY=

# OLLAMA Configuration
OLLAMA_HOST=127.0.0.1:11434
OLLAMA_MODELS=./.ollama/models
OLLAMA_KEEP_ALIVE=5m
OLLAMA_DEBUG=false

# CORS Settings
CORS_ORIGINS=http://localhost:3000,http://localhost:8000,http://localhost:3001

# Logging
LOG_LEVEL=INFO
"""
        with open(env_file, 'w') as f:
            f.write(env_template)
        print("✅ .env template created")
    else:
        print("✅ .env file exists")

def start_server():
    """Start the FastAPI server."""
    print("\n🚀 Starting ALwrity Backend with OLLAMA support...")
    print("📍 Backend will be available at: http://localhost:8000")
    print("📍 OLLAMA API endpoints: http://localhost:8000/api/ollama/")
    print("📍 API Documentation: http://localhost:8000/docs")
    print("\nPress Ctrl+C to stop the server\n")
    
    try:
        subprocess.run([
            sys.executable, '-m', 'uvicorn',
            'app:app',
            '--host', '0.0.0.0',
            '--port', '8000',
            '--reload',
            '--log-level', 'info'
        ])
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

def main():
    """Main function."""
    print("🔧 ALwrity Backend Setup with OLLAMA Support")
    print("=" * 50)
    
    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    check_python_version()
    check_dependencies()
    setup_environment()
    start_server()

if __name__ == "__main__":
    main()
