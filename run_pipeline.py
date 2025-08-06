#!/usr/bin/env python3
"""
Run script for the Article Pipeline application.
"""
import os
import sys
from pipeline.app import create_app

if __name__ == '__main__':
    # Set environment if not already set
    if 'FLASK_ENV' not in os.environ:
        os.environ['FLASK_ENV'] = 'development'
    
    app = create_app()
    
    # Run the application
    print("Starting Article Pipeline...")
    print("Access the application at: http://localhost:5000")
    print("Health check available at: http://localhost:5000/health")
    
    try:
        app.run(debug=True, host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        print("\nShutting down Article Pipeline...")
        sys.exit(0)