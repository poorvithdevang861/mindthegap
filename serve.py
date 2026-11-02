#!/usr/bin/env python3
"""
Simple HTTP server with CORS and no-cache headers to run the Pune GIS Map application.
Run via: python3 serve.py
"""

import http.server
import socketserver
import os
import sys
import webbrowser

PORT = 8000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(BASE_DIR, 'dist')
DIRECTORY = DIST_DIR if os.path.exists(os.path.join(DIST_DIR, 'index.html')) else BASE_DIR

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

def run_server():
    port = PORT
    for attempt in range(10):
        try:
            with socketserver.TCPServer(("", port), CORSHTTPRequestHandler) as httpd:
                url = f"http://localhost:{port}"
                print("=" * 65)
                print("🚀 Pune GIS Spatial Map & Ward Intelligence Platform")
                print(f"📡 Serving directory: {DIRECTORY}")
                print(f"🔗 Map Application URL: {url}")
                print("=" * 65)
                print("Press Ctrl+C to stop the server.")
                
                # Attempt to open browser if running in interactive user terminal
                if sys.stdin.isatty():
                    try:
                        webbrowser.open(url)
                    except Exception:
                        pass
                    
                httpd.serve_forever()
                break
        except OSError as e:
            if "Address already in use" in str(e):
                port += 1
            else:
                raise

if __name__ == '__main__':
    run_server()
