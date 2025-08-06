# Article Processing Pipeline

An intelligent system that transforms raw journalistic articles into structured data and automatically updates D3.js visualizations.

## Quick Start

1. **Setup the environment:**
   ```bash
   python setup_pipeline.py
   ```

2. **Start the application:**
   ```bash
   python run_pipeline.py
   ```

3. **Access the application:**
   - Main interface: http://localhost:5000
   - Health check: http://localhost:5000/health

## Project Structure

```
pipeline/
├── __init__.py          # Package initialization
├── app.py              # Main Flask application
├── config.py           # Configuration management
├── static/             # Static assets (CSS, JS)
│   └── css/
│       └── style.css
└── templates/          # HTML templates
    └── index.html
```

## Configuration

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Key configuration options:
- `SECRET_KEY`: Flask secret key for sessions
- `SPACY_MODEL`: spaCy model for NLP processing
- `EXTRACTION_CONFIDENCE_THRESHOLD`: Minimum confidence for entity extraction
- Database and file paths for JSON data sources

## Dependencies

Core dependencies include:
- Flask for web framework
- spaCy for NLP processing
- transformers for advanced ML models
- fuzzywuzzy for entity deduplication
- SQLAlchemy for database operations

## Development

The application uses Flask's development server with hot-reload enabled. For production deployment, use a WSGI server like Gunicorn.

## Health Check

The `/health` endpoint provides system status information for monitoring and load balancing.