#!/usr/bin/env python3
"""
VoiceLoop Backend Startup Script
This script initializes and starts the VoiceLoop backend server
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Error: Python 3.8+ is required")
        print(f"Current version: {sys.version}")
        sys.exit(1)
    print(f"✅ Python version: {sys.version.split()[0]}")

def check_dependencies():
    """Check if required dependencies are installed"""
    required_packages = [
        'flask', 'openai', 'chromadb', 'sentence-transformers',
        'PyPDF2', 'python-docx', 'whisper'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package}")
        except ImportError:
            missing_packages.append(package)
            print(f"❌ {package}")
    
    if missing_packages:
        print(f"\n❌ Missing packages: {', '.join(missing_packages)}")
        print("Run: pip install -r requirements.txt")
        return False
    
    return True

def create_directories():
    """Create necessary directories"""
    directories = [
        'database',
        'database/chroma',
        'uploads',
        'logs'
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"✅ Created directory: {directory}")

def check_environment():
    """Check environment configuration"""
    env_file = Path('.env')
    if not env_file.exists():
        print("⚠️  .env file not found")
        print("Creating from template...")
        
        # Copy from template if it exists
        template_file = Path('env.template')
        if template_file.exists():
            import shutil
            shutil.copy(template_file, env_file)
            print("✅ Created .env from template")
            print("⚠️  Please update .env with your API keys")
        else:
            print("❌ env.template not found")
            return False
    
    # Check for OpenAI API key
    openai_key = os.getenv('OPENAI_API_KEY')
    if not openai_key or openai_key == 'your-openai-api-key-here':
        print("⚠️  OpenAI API key not configured")
        print("Please update .env file with your OpenAI API key")
        return False
    
    print("✅ Environment configuration looks good")
    return True

def start_server():
    """Start the Flask server"""
    print("\n🚀 Starting VoiceLoop Backend...")
    
    try:
        # Import and run the app
        from app import app
        
        print("✅ Server initialized successfully")
        print("🌐 Server will be available at: http://localhost:5000")
        print("📚 API documentation: http://localhost:5000/api/health")
        print("\nPress Ctrl+C to stop the server")
        
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=True
        )
        
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        return False

def main():
    """Main startup function"""
    print("🎯 VoiceLoop Backend Startup")
    print("=" * 40)
    
    # Change to script directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # Run checks
    check_python_version()
    
    print("\n📦 Checking dependencies...")
    if not check_dependencies():
        sys.exit(1)
    
    print("\n📁 Creating directories...")
    create_directories()
    
    print("\n🔧 Checking environment...")
    if not check_environment():
        print("\n⚠️  Environment issues detected")
        print("Please fix the issues above and try again")
        sys.exit(1)
    
    print("\n" + "=" * 40)
    print("🎉 All checks passed! Starting server...")
    
    # Start the server
    start_server()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)
