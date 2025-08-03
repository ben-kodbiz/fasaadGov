#!/usr/bin/env python3
"""
Upload Server

A simple Flask server to handle file uploads and processing
for the US Atrocities Treemap.
"""

import os
import json
import tempfile
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from upload_processor import DocumentProcessor

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
UPLOAD_FOLDER = Path('uploads')
UPLOAD_FOLDER.mkdir(exist_ok=True)
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB max file size

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Initialize processor
processor = DocumentProcessor()

ALLOWED_EXTENSIONS = {'.txt', '.pdf', '.html', '.htm', '.doc', '.docx'}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    """Serve the upload interface"""
    return send_from_directory('.', 'upload.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle file upload and processing"""
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file type
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not supported'}), 400
        
        # Get configuration from form data
        config = {
            'dataType': request.form.get('dataType', 'news_article'),
            'category': request.form.get('category', 'auto'),
            'sourceUrl': request.form.get('sourceUrl', ''),
            'customDate': request.form.get('customDate', ''),
            'tags': json.loads(request.form.get('tags', '[]'))
        }
        
        # Save uploaded file temporarily
        filename = secure_filename(file.filename)
        temp_path = UPLOAD_FOLDER / filename
        file.save(temp_path)
        
        try:
            # Process the file
            result = processor.process_uploaded_file(temp_path, config)
            
            # Clean up temporary file
            temp_path.unlink()
            
            return jsonify(result)
            
        except Exception as e:
            # Clean up on error
            if temp_path.exists():
                temp_path.unlink()
            raise e
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/upload/batch', methods=['POST'])
def upload_batch():
    """Handle multiple file uploads"""
    try:
        files = request.files.getlist('files')
        if not files:
            return jsonify({'error': 'No files provided'}), 400
        
        # Get configuration
        config = {
            'dataType': request.form.get('dataType', 'news_article'),
            'category': request.form.get('category', 'auto'),
            'sourceUrl': request.form.get('sourceUrl', ''),
            'customDate': request.form.get('customDate', ''),
            'tags': json.loads(request.form.get('tags', '[]'))
        }
        
        results = []
        
        for file in files:
            if file.filename == '' or not allowed_file(file.filename):
                results.append({
                    'filename': file.filename,
                    'status': 'error',
                    'error': 'Invalid file type'
                })
                continue
            
            # Save and process each file
            filename = secure_filename(file.filename)
            temp_path = UPLOAD_FOLDER / filename
            file.save(temp_path)
            
            try:
                result = processor.process_uploaded_file(temp_path, config)
                result['filename'] = filename
                results.append(result)
                
                # Clean up
                temp_path.unlink()
                
            except Exception as e:
                results.append({
                    'filename': filename,
                    'status': 'error',
                    'error': str(e)
                })
                if temp_path.exists():
                    temp_path.unlink()
        
        return jsonify({'results': results})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/stats', methods=['GET'])
def get_stats():
    """Get current statistics"""
    try:
        data = processor.load_existing_data()
        metadata = data.get('metadata', {})
        
        # Ensure all required fields exist
        stats = {
            "lastUpdated": metadata.get("lastUpdated", "Unknown"),
            "totalEvents": metadata.get("totalEvents", 0),
            "totalCategories": metadata.get("totalCategories", 0),
            "newsArticlesCount": metadata.get("newsArticlesCount", 0),
            "markdownEventsCount": metadata.get("markdownEventsCount", 0),
            "uploadedFilesCount": metadata.get("uploadedFilesCount", 0)
        }
        
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/categories', methods=['GET'])
def get_categories():
    """Get available categories"""
    try:
        data = processor.load_existing_data()
        categories = [cat['name'] for cat in data['categories']]
        return jsonify({'categories': categories})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Upload server is running'})

@app.errorhandler(413)
def too_large(e):
    return jsonify({'error': 'File too large. Maximum size is 16MB.'}), 413

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("Starting Upload Server...")
    print("Upload interface: http://localhost:5000")
    print("API endpoints:")
    print("  POST /upload - Single file upload")
    print("  POST /upload/batch - Multiple file upload")
    print("  GET /stats - Get statistics")
    print("  GET /categories - Get available categories")
    print("  GET /health - Health check")
    
    app.run(debug=True, host='0.0.0.0', port=5000)