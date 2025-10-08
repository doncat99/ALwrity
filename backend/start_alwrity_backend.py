#!/usr/bin/env python3
"""
ALwrity Backend Server - Comprehensive Startup Script
Handles setup, dependency installation, and server startup.
Run this from the backend directory to set up and start the FastAPI server.
"""

import os
import sys
import subprocess
import time
import argparse
from pathlib import Path

def install_requirements():
    """Install required Python packages."""
    print("📦 Installing required packages...")
    
    requirements_file = Path(__file__).parent / "requirements.txt"
    
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", str(requirements_file)
        ])
        print("[OK] All packages installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Error installing packages: {e}")
        return False

def create_env_file():
    """Create a .env file with default configuration."""
    env_file = Path(__file__).parent / ".env"
    
    if env_file.exists():
        print("[INFO]  .env file already exists")
        return True
    
    print("🔧 Creating .env file with default configuration...")
    
    env_content = """# ALwrity Backend Configuration

# API Keys (Configure these in the onboarding process)
# OPENAI_API_KEY=your_openai_api_key_here
# GEMINI_API_KEY=your_gemini_api_key_here
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
# MISTRAL_API_KEY=your_mistral_api_key_here

# Research API Keys (Optional)
# TAVILY_API_KEY=your_tavily_api_key_here
# SERPER_API_KEY=your_serper_api_key_here
# METAPHOR_API_KEY=your_metaphor_api_key_here
# FIRECRAWL_API_KEY=your_firecrawl_api_key_here

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=true

# Logging
LOG_LEVEL=INFO
"""
    
    try:
        with open(env_file, 'w') as f:
            f.write(env_content)
        print("[OK] .env file created successfully!")
        return True
    except Exception as e:
        print(f"[ERROR] Error creating .env file: {e}")
        return False

def setup_monitoring_tables():
    """Set up API monitoring database tables."""
    print("📊 Setting up API monitoring tables...")
    
    try:
        # Import and run the monitoring table creation
        sys.path.append(str(Path(__file__).parent))
        from scripts.create_monitoring_tables import create_monitoring_tables
        
        if create_monitoring_tables():
            print("[OK] API monitoring tables created successfully!")
            return True
        else:
            print("[WARNING]  Warning: Failed to create monitoring tables, continuing anyway...")
            return True  # Don't fail startup for monitoring issues
            
    except Exception as e:
        print(f"[WARNING]  Warning: Could not set up monitoring tables: {e}")
        print("   Monitoring will be disabled. Continuing startup...")
        return True  # Don't fail startup for monitoring issues

def setup_billing_tables():
    """Set up billing and subscription database tables."""
    print("💳 Setting up billing and subscription tables...")
    
    try:
        # Import and run the billing table creation
        sys.path.append(str(Path(__file__).parent))
        from scripts.create_billing_tables import create_billing_tables, check_existing_tables
        from services.database import DATABASE_URL
        from sqlalchemy import create_engine
        
        # Create engine to check existing tables
        engine = create_engine(DATABASE_URL, echo=False)
        
        # Check existing tables
        if not check_existing_tables(engine):
            print("[OK] Billing tables already exist, skipping creation")
            return True
        
        if create_billing_tables():
            print("[OK] Billing and subscription tables created successfully!")
            return True
        else:
            print("[WARNING]  Warning: Failed to create billing tables, continuing anyway...")
            return True  # Don't fail startup for billing issues
            
    except Exception as e:
        print(f"[WARNING]  Warning: Could not set up billing tables: {e}")
        print("   Billing system will be disabled. Continuing startup...")
        return True  # Don't fail startup for billing issues

def setup_monitoring_middleware():
    """Set up monitoring middleware in app.py if not already present."""
    print("🔍 Setting up API monitoring middleware...")
    
    app_file = Path(__file__).parent / "app.py"
    
    if not app_file.exists():
        print("[WARNING]  Warning: app.py not found, skipping middleware setup")
        return True
    
    try:
        with open(app_file, 'r') as f:
            content = f.read()
        
        # Check if monitoring middleware is already set up
        if "monitoring_middleware" in content:
            print("[OK] Monitoring middleware already configured")
            return True
        
        # Add monitoring middleware import and setup
        monitoring_import = "from middleware.monitoring_middleware import monitoring_middleware\n"
        monitoring_setup = "app.middleware(\"http\")(monitoring_middleware)\n"
        
        # Find the right place to add the import (after other imports)
        lines = content.split('\n')
        import_end_index = 0
        
        for i, line in enumerate(lines):
            if line.strip().startswith('import ') or line.strip().startswith('from '):
                import_end_index = i + 1
            elif line.strip() and not line.strip().startswith('#'):
                break
        
        # Insert monitoring import
        lines.insert(import_end_index, monitoring_import)
        
        # Find the right place to add middleware setup (after app creation)
        app_creation_index = -1
        for i, line in enumerate(lines):
            if 'app = FastAPI(' in line or 'app = FastAPI()' in line:
                app_creation_index = i
                break
        
        if app_creation_index != -1:
            # Find the end of app configuration
            setup_index = app_creation_index + 1
            for i in range(app_creation_index + 1, len(lines)):
                if lines[i].strip() and not lines[i].strip().startswith('#'):
                    setup_index = i + 1
                    break
            
            lines.insert(setup_index, monitoring_setup)
        
        # Write back to file
        with open(app_file, 'w') as f:
            f.write('\n'.join(lines))
        
        print("[OK] Monitoring middleware configured successfully!")
        return True
        
    except Exception as e:
        print(f"[WARNING]  Warning: Could not set up monitoring middleware: {e}")
        print("   Monitoring will be disabled. Continuing startup...")
        return True  # Don't fail startup for monitoring issues

def setup_spacy_model():
    """Set up spaCy English model for linguistic analysis."""
    print("Setting up spaCy English model...")
    
    try:
        import spacy
        
        # Check if en_core_web_sm model is already installed
        model_name = "en_core_web_sm"
        
        try:
            # Try to load the model directly
            nlp = spacy.load(model_name)
            
            # Test the model with a simple sentence
            test_doc = nlp("This is a test sentence.")
            if test_doc and len(test_doc) > 0:
                print(f"SUCCESS: spaCy model '{model_name}' is already installed and working")
                print(f"   Test: Processed {len(test_doc)} tokens successfully")
                return True
            else:
                raise OSError("Model loaded but not functioning correctly")
            
        except OSError:
            print(f"INFO: spaCy model '{model_name}' not found or not working, downloading...")
            
            # Try to download the model using subprocess
            try:
                print(f"   Downloading {model_name}...")
                result = subprocess.run([
                    sys.executable, "-m", "spacy", "download", model_name
                ], capture_output=True, text=True, timeout=300)  # 5 minute timeout
                
                if result.returncode == 0:
                    print(f"   SUCCESS: Model download completed")
                else:
                    print(f"   WARNING: Download warning: {result.stderr}")
                    
            except subprocess.TimeoutExpired:
                print(f"   ERROR: Download timed out after 5 minutes")
                return False
            except subprocess.CalledProcessError as e:
                print(f"   ERROR: Download failed: {e}")
                return False
            
            # Verify the model was downloaded correctly
            try:
                nlp = spacy.load(model_name)
                
                # Test the model
                test_doc = nlp("This is a test sentence.")
                if test_doc and len(test_doc) > 0:
                    print(f"SUCCESS: spaCy model '{model_name}' downloaded and verified successfully")
                    print(f"   Test: Processed {len(test_doc)} tokens successfully")
                    return True
                else:
                    print(f"ERROR: Model downloaded but not functioning correctly")
                    return False
                    
            except OSError as e:
                print(f"ERROR: Model downloaded but failed to load: {e}")
                return False
            
    except subprocess.CalledProcessError as e:
        print(f"ERROR: Error downloading spaCy model: {e}")
        print("   Manual installation required:")
        print("   1. Install spaCy: pip install spacy>=3.7.0")
        print("   2. Download model: python -m spacy download en_core_web_sm")
        print("   3. Test setup: python -c \"import spacy; nlp=spacy.load('en_core_web_sm'); print('spaCy working!')\"")
        print("   4. Restart the backend")
        return False
    except ImportError as e:
        print(f"ERROR: spaCy not installed: {e}")
        print("   Manual installation required:")
        print("   1. Install spaCy: pip install spacy>=3.7.0")
        print("   2. Download model: python -m spacy download en_core_web_sm")
        print("   3. Test setup: python -c \"import spacy; nlp=spacy.load('en_core_web_sm'); print('spaCy working!')\"")
        print("   4. Restart the backend")
        return False
    except Exception as e:
        print(f"ERROR: Error setting up spaCy model: {e}")
        print("   Manual installation required:")
        print("   1. Install spaCy: pip install spacy>=3.7.0")
        print("   2. Download model: python -m spacy download en_core_web_sm")
        print("   3. Test setup: python -c \"import spacy; nlp=spacy.load('en_core_web_sm'); print('spaCy working!')\"")
        print("   4. Restart the backend")
        return False

def setup_nltk_data():
    """Set up required NLTK data for linguistic analysis."""
    print("Setting up NLTK data...")
    
    try:
        import nltk
        
        # Required NLTK data packages
        required_data = [
            'punkt_tab',  # Updated for newer NLTK versions
            'stopwords', 
            'averaged_perceptron_tagger_eng',  # Updated for newer NLTK versions
            'wordnet',
            'omw-1.4'
        ]
        
        for data_package in required_data:
            try:
                nltk.data.find(f'tokenizers/{data_package}' if data_package in ['punkt', 'punkt_tab'] 
                              else f'corpora/{data_package}' if data_package in ['stopwords', 'wordnet', 'omw-1.4']
                              else f'taggers/{data_package}' if data_package in ['averaged_perceptron_tagger', 'averaged_perceptron_tagger_eng']
                              else f'corpora/{data_package}')
                print(f"   SUCCESS: {data_package}")
            except LookupError:
                print(f"   INFO: Downloading {data_package}...")
                nltk.download(data_package, quiet=True)
                print(f"   SUCCESS: {data_package} downloaded")
        
        print("SUCCESS: All required NLTK data is available")
        return True
        
    except Exception as e:
        print(f"ERROR: Error setting up NLTK data: {e}")
        return False

def check_dependencies():
    """Check if required dependencies are installed."""
    print("🔍 Checking dependencies...")
    
    required_packages = [
        'fastapi',
        'uvicorn',
        'pydantic',
        'loguru',
        'openai',
        'google.generativeai',
        'anthropic',
        'mistralai',
        'sqlalchemy',
        'spacy',  # Added spaCy to required packages
        'nltk'    # Added NLTK to required packages
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"   [OK] {package}")
        except ImportError:
            print(f"   [ERROR] {package} - MISSING")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n[ERROR] Missing packages: {', '.join(missing_packages)}")
        print("Installing missing packages...")
        return install_requirements()
    else:
        print("\n[OK] All dependencies are available!")
        return True

def setup_environment():
    """Set up the environment for the backend."""
    print("🔧 Setting up environment...")
    
    # Create necessary directories
    directories = [
        "lib/workspace/alwrity_content",
        "lib/workspace/alwrity_web_research", 
        "lib/workspace/alwrity_prompts",
        "lib/workspace/alwrity_config"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"   [OK] Created directory: {directory}")
    
    # Create .env file if it doesn't exist
    create_env_file()
    
    # Set up monitoring
    setup_monitoring_tables()
    setup_monitoring_middleware()
    
    # Set up billing and subscription system
    setup_billing_tables()
    
    # Set up persona tables
    if setup_persona_tables():
        # Verify persona tables were created successfully
        verify_persona_tables()
    else:
        print("[WARNING]  Warning: Persona tables setup failed, but continuing...")
    
    # Set up linguistic analysis dependencies (Required for persona generation)
    print("🧠 Setting up linguistic analysis dependencies...")
    
    # Set up spaCy model (REQUIRED for persona generation)
    if not setup_spacy_model():
        print("[ERROR] CRITICAL: spaCy model setup failed - persona generation will not work!")
        print("   Please ensure spaCy is installed and en_core_web_sm model is available")
        return False
    
    # Set up NLTK data (supplementary to spaCy)
    if not setup_nltk_data():
        print("[WARNING]  Warning: NLTK data setup failed, but continuing...")
    
    print("[OK] Environment setup complete")
    return True

def setup_persona_tables():
    """Set up persona database tables."""
    print("🔧 Setting up persona tables...")
    try:
        from services.database import engine
        from models.persona_models import Base as PersonaBase
        
        # Create persona tables
        PersonaBase.metadata.create_all(bind=engine)
        print("[OK] Persona tables created successfully")
        
        # Verify tables were created
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        persona_tables = [
            'writing_personas',
            'platform_personas', 
            'persona_analysis_results',
            'persona_validation_results'
        ]
        
        created_tables = [table for table in persona_tables if table in tables]
        print(f"[OK] Verified persona tables created: {created_tables}")
        
        if len(created_tables) != len(persona_tables):
            missing = [table for table in persona_tables if table not in created_tables]
            print(f"[WARNING]  Warning: Missing persona tables: {missing}")
            return False
        
        return True
        
    except Exception as e:
        print(f"[ERROR] Error setting up persona tables: {e}")
        return False

def verify_persona_tables():
    """Verify that persona tables exist and are accessible."""
    print("🔍 Verifying persona tables...")
    try:
        from services.database import get_db_session
        from models.persona_models import WritingPersona, PlatformPersona, PersonaAnalysisResult, PersonaValidationResult
        
        session = get_db_session()
        if session:
            # Try to query all persona tables to verify they exist
            session.query(WritingPersona).first()
            session.query(PlatformPersona).first()
            session.query(PersonaAnalysisResult).first()
            session.query(PersonaValidationResult).first()
            session.close()
            print("[OK] All persona tables verified successfully")
            return True
        else:
            print("[WARNING]  Warning: Could not get database session")
            return False
    except Exception as e:
        print(f"[WARNING]  Warning: Could not verify persona tables: {e}")
        return False

def verify_linguistic_analyzer():
    """Verify that the linguistic analyzer is working correctly."""
    print("Verifying linguistic analyzer setup...")
    try:
        from services.persona.enhanced_linguistic_analyzer import EnhancedLinguisticAnalyzer
        
        # Try to initialize the linguistic analyzer
        analyzer = EnhancedLinguisticAnalyzer()
        
        # Test with a sample text
        test_texts = [
            "This is a test sentence for linguistic analysis.",
            "ALwrity provides high-quality AI writing assistance.",
            "The persona generation system uses advanced NLP techniques."
        ]
        
        # Perform a simple analysis
        analysis_result = analyzer.analyze_writing_style(test_texts)
        
        if analysis_result and 'basic_metrics' in analysis_result:
            print("SUCCESS: Linguistic analyzer verified successfully")
            print(f"   Analyzed {len(test_texts)} text samples")
            print(f"   Analysis keys: {list(analysis_result.keys())}")
            return True
        else:
            print("WARNING: Linguistic analyzer returned unexpected result")
            print(f"   Result: {analysis_result}")
            return False
            
    except Exception as e:
        print(f"WARNING: Could not verify linguistic analyzer: {e}")
        return False

def verify_billing_tables():
    """Verify that billing and subscription tables exist and are accessible."""
    print("🔍 Verifying billing and subscription tables...")
    try:
        from services.database import get_db_session
        from models.subscription_models import (
            SubscriptionPlan, UserSubscription, APIUsageLog, 
            UsageSummary, APIProviderPricing, UsageAlert
        )
        
        session = get_db_session()
        if session:
            # Try to query all billing tables to verify they exist
            session.query(SubscriptionPlan).first()
            session.query(UserSubscription).first()
            session.query(APIUsageLog).first()
            session.query(UsageSummary).first()
            session.query(APIProviderPricing).first()
            session.query(UsageAlert).first()
            session.close()
            print("[OK] All billing and subscription tables verified successfully")
            return True
        else:
            print("[WARNING]  Warning: Could not get database session")
            return False
    except Exception as e:
        print(f"[WARNING]  Warning: Could not verify billing tables: {e}")
        return False

def start_backend(enable_reload=False):
    """Start the backend server."""
    print("🚀 Starting ALwrity Backend...")
    
    # Set environment variables
    os.environ.setdefault("HOST", "0.0.0.0")
    os.environ.setdefault("PORT", "8000")
    
    # Set reload based on argument or environment variable
    if enable_reload:
        os.environ.setdefault("RELOAD", "true")
        print("   🔄 Development mode: Auto-reload enabled")
    else:
        os.environ.setdefault("RELOAD", "false")
        print("   🏭 Production mode: Auto-reload disabled")
    
    host = os.getenv("HOST", "0.0.0.0")
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
        
        # Verify persona tables exist
        verify_persona_tables()
        
        # Verify linguistic analyzer is working
        verify_linguistic_analyzer()
        
        # Verify billing tables exist
        verify_billing_tables()
        
        print("\n🌐 Backend is starting...")
        print("   📖 API Documentation: http://localhost:8000/api/docs")
        print("   🔍 Health Check: http://localhost:8000/health")
        print("   📊 ReDoc: http://localhost:8000/api/redoc")
        print("   📈 API Monitoring: http://localhost:8000/api/content-planning/monitoring/health")
        print("   💳 Billing Dashboard: http://localhost:8000/api/subscription/plans")
        print("   📊 Usage Tracking: http://localhost:8000/api/subscription/usage/demo")
        print("\n[STOP]  Press Ctrl+C to stop the server")
        print("=" * 60)
        print("\n💡 Usage:")
        print("   Production mode (default): python start_alwrity_backend.py")
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
                "scripts/*"
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
    args = parser.parse_args()
    
    print("ALwrity Backend Server")
    print("=" * 40)
    
    # Check if we're in the right directory
    if not os.path.exists("app.py"):
        print("[ERROR] Error: app.py not found. Please run this script from the backend directory.")
        print("   Current directory:", os.getcwd())
        print("   Expected files:", [f for f in os.listdir('.') if f.endswith('.py')])
        return False
    
    # Check and install dependencies
    if not check_dependencies():
        print("[ERROR] Failed to install dependencies")
        return False
    
    # Setup environment
    if not setup_environment():
        print("[ERROR] Environment setup failed")
        return False
    
    # Start backend with reload option
    enable_reload = args.reload or args.dev
    return start_backend(enable_reload=enable_reload)

if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1) 