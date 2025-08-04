#!/usr/bin/env python3
"""
Simple HTTP server for the Arab Complicity visualization
Run this to serve the files and avoid CORS issues
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.dirname(os.path.abspath(__file__)), **kwargs)

def main():
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"🌅 Arab Complicity Visualization Server")
            print(f"📡 Serving at http://localhost:{PORT}")
            print(f"🚀 Opening browser...")
            print(f"📊 Main visualization: http://localhost:{PORT}/index.html")
            print(f"🎯 Demo page: http://localhost:{PORT}/demo.html")
            print(f"⏹️  Press Ctrl+C to stop the server")
            
            # Open browser automatically
            webbrowser.open(f'http://localhost:{PORT}/demo.html')
            
            httpd.serve_forever()
    except KeyboardInterrupt:
        print(f"\n🛑 Server stopped")
        sys.exit(0)
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {PORT} is already in use. Try a different port or stop the existing server.")
            sys.exit(1)
        else:
            raise

if __name__ == "__main__":
    main()