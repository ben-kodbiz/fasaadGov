#!/usr/bin/env python3
"""
Simple Server Starter

A lightweight script to start both web server and upload server together.
Perfect for quick development and testing.
"""

import os
import sys
import time
import subprocess
import webbrowser
from pathlib import Path

def start_servers():
    """Start both servers and open browser"""
    print("🚀 Starting US Atrocities Treemap System")
    print("-" * 40)
    
    # Check if upload server exists
    upload_script = Path("scripts/upload_server.py")
    if not upload_script.exists():
        print("❌ Upload server not found. Running web server only...")
        # Start just web server
        print("🌐 Starting web server on http://localhost:8000")
        subprocess.Popen([sys.executable, "-m", "http.server", "8000"])
        time.sleep(2)
        webbrowser.open("http://localhost:8000")
        print("✅ Web server started. Upload functionality not available.")
        return
    
    # Start upload server
    print("🔧 Starting upload server on http://localhost:5000")
    upload_process = subprocess.Popen([
        sys.executable, 
        str(upload_script)
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    # Give upload server time to start
    time.sleep(3)
    
    # Start web server
    print("🌐 Starting web server on http://localhost:8000")
    web_process = subprocess.Popen([
        sys.executable, 
        "-m", "http.server", "8000"
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    # Give web server time to start
    time.sleep(2)
    
    # Open browser
    print("🔗 Opening browser...")
    try:
        webbrowser.open("http://localhost:8000")
    except:
        pass
    
    print()
    print("✅ System is running!")
    print("📊 Treemap: http://localhost:8000")
    print("📤 Upload:  http://localhost:8000/upload.html")
    print()
    print("Press Ctrl+C to stop")
    
    # Keep script running
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping servers...")
        upload_process.terminate()
        web_process.terminate()
        print("✅ Stopped")

if __name__ == "__main__":
    start_servers()