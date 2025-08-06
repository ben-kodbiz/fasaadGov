from flask import Flask, jsonify, render_template
import os
from pipeline.config import config

def create_app(config_name=None):
    """Application factory pattern for Flask app creation."""
    app = Flask(__name__)
    
    # Load configuration
    config_name = config_name or os.environ.get('FLASK_ENV', 'development')
    app.config.from_object(config[config_name])
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        """Health check endpoint for monitoring."""
        return jsonify({
            'status': 'healthy',
            'service': 'article-pipeline',
            'version': '1.0.0',
            'config': config_name
        }), 200
    
    # Basic route for the interface
    @app.route('/')
    def index():
        """Main interface for article processing."""
        return render_template('index.html')
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)