#!/usr/bin/env python3
"""
Railway entry point - redirects to backend main
"""
import os
import sys
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).resolve().parent / "backend"
sys.path.insert(0, str(backend_dir))

# Change to backend directory
os.chdir(str(backend_dir))
print(f"Changed to directory: {os.getcwd()}")

# Import and run the actual FastAPI app
if __name__ == "__main__":
    try:
        import uvicorn
        from main import app
        
        port = int(os.environ.get("PORT", 8000))
        print(f"Starting FastAPI app on port {port}")
        uvicorn.run(app, host="0.0.0.0", port=port)
    except ImportError as e:
        print(f"Import error: {e}")
        print(f"Current directory: {os.getcwd()}")
        print(f"Python path: {sys.path}")
        sys.exit(1)
