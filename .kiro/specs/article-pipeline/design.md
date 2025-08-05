# Design Document

## Overview

The Article-to-Visualization Pipeline is an intelligent system that transforms raw journalistic articles into structured data and automatically updates D3.js visualizations. The system employs Natural Language Processing (NLP) to extract entities and relationships, formats data according to existing JSON schemas, and provides real-time updates to accountability visualizations.

## Architecture

### System Architecture Diagram

```
[Frontend Interface]
       │
       ▼
[Flask Web Server] ←→ [Static File Server]
       │                      │
       ▼                      ▼
[NLP Processing Engine] → [JSON Database]
       │                      │
       ▼                      ▼
[Entity Extraction] → [Data Merger] → [D3.js Visualizations]
       │                      │              │
       ▼                      ▼              ▼
[Validation Layer] → [Audit Logger] → [WebSocket Updates]
```

### Technology Stack

**Backend:**
- Python Flask for web server and API endpoints
- spaCy for Named Entity Recognition (NER)
- transformers library for advanced NLP tasks
- fuzzywuzzy for entity deduplication
- SQLite for audit logging
- WebSocket for real-time updates

**Frontend:**
- HTML5/CSS3/JavaScript for user interface
- D3.js v7 for visualization updates
- WebSocket client for real-time communication
- Fetch API for HTTP requests

**Data Processing:**
- JSON for data storage and exchange
- Regular expressions for pattern matching
- Fuzzy string matching for entity resolution
- Schema validation for data integrity

## Components and Interfaces

### 1. Frontend Interface Component

**Purpose:** Provides user interface for article input and processing feedback

**Key Classes:**
```javascript
class ArticleProcessor {
    constructor(apiEndpoint, wsEndpoint)
    submitArticle(text)
    displayResults(extractedData)
    showProgress(percentage)
    handleErrors(errorMessage)
}

class VisualizationUpdater {
    constructor(d3Container)
    refreshVisualizations(newData)
    highlightNewEntities(entities)
    maintainViewState()
}
```

**Interfaces:**
- REST API for article submission
- WebSocket for real-time updates
- File upload for PDF/HTML processing

### 2. NLP Processing Engine

**Purpose:** Extracts entities, relationships, and structured information from articles

**Key Classes:**
```python
class EntityExtractor:
    def __init__(self, model_name="en_core_web_sm")
    def extract_entities(self, text: str) -> Dict
    def extract_relationships(self, text: str) -> List
    def categorize_organizations(self, orgs: List) -> Dict
    def validate_extractions(self, entities: Dict) -> bool

class TextPreprocessor:
    def clean_html(self, html_content: str) -> str
    def extract_pdf_text(self, pdf_path: str) -> str
    def normalize_text(self, text: str) -> str
    def detect_language(self, text: str) -> str
```

**Interfaces:**
- HTTP POST endpoint for text processing
- File upload endpoint for documents
- Configuration API for model parameters

### 3. Data Merger Component

**Purpose:** Intelligently merges new data with existing JSON databases

**Key Classes:**
```python
class DataMerger:
    def __init__(self, db_paths: Dict[str, str])
    def merge_company_data(self, new_data: Dict) -> bool
    def merge_intervention_data(self, new_data: Dict) -> bool
    def merge_investment_data(self, new_data: Dict) -> bool
    def detect_duplicates(self, entity: Dict, existing: List) -> Optional[Dict]
    def resolve_conflicts(self, new: Dict, existing: Dict) -> Dict

class SchemaValidator:
    def validate_company_schema(self, data: Dict) -> bool
    def validate_intervention_schema(self, data: Dict) -> bool
    def validate_investment_schema(self, data: Dict) -> bool
    def generate_validation_report(self, data: Dict) -> Dict
```

**Interfaces:**
- Database read/write operations
- Schema validation endpoints
- Conflict resolution API

### 4. Audit and Logging System

**Purpose:** Tracks data provenance, changes, and system operations

**Key Classes:**
```python
class AuditLogger:
    def __init__(self, db_connection)
    def log_extraction(self, article_id: str, entities: Dict)
    def log_merge_operation(self, operation: str, data: Dict)
    def log_user_action(self, user_id: str, action: str)
    def generate_audit_report(self, date_range: Tuple) -> Dict

class ProvenanceTracker:
    def track_data_source(self, data: Dict, source: str)
    def update_lineage(self, entity_id: str, changes: Dict)
    def get_data_history(self, entity_id: str) -> List
```

## Data Models

### Entity Extraction Schema

```json
{
  "extraction_id": "uuid",
  "timestamp": "ISO-8601",
  "source_url": "string",
  "confidence_scores": {
    "organizations": 0.85,
    "locations": 0.92,
    "persons": 0.78
  },
  "entities": {
    "organizations": [
      {
        "name": "NSO Group",
        "category": "Surveillance",
        "confidence": 0.95,
        "context": "surrounding text snippet"
      }
    ],
    "locations": [
      {
        "name": "Israel",
        "type": "country",
        "confidence": 0.98
      }
    ],
    "persons": [
      {
        "name": "John Doe",
        "role": "CEO",
        "organization": "NSO Group",
        "confidence": 0.82
      }
    ],
    "relationships": [
      {
        "subject": "NSO Group",
        "predicate": "develops",
        "object": "Pegasus spyware",
        "confidence": 0.89
      }
    ]
  }
}
```

### Merged Data Schema

```json
{
  "entity_id": "uuid",
  "name": "NSO Group",
  "category": "Surveillance & Technology",
  "country": "Israel",
  "summary": "Israeli cyber-intelligence company...",
  "involvement": "Spyware targeting human rights defenders",
  "revenue": "$243 million (2021)",
  "headquarters": "Herzliya, Israel",
  "sources": [
    {
      "url": "https://example.com/article",
      "date": "2025-01-15",
      "extraction_confidence": 0.95
    }
  ],
  "last_updated": "2025-01-15T10:30:00Z",
  "audit_trail": [
    {
      "action": "created",
      "timestamp": "2025-01-15T10:30:00Z",
      "source": "article_pipeline"
    }
  ]
}
```

## Error Handling

### Error Categories and Responses

**1. Input Validation Errors**
- Invalid text format or encoding
- Oversized input (>50,000 characters)
- Malicious content detection
- Response: HTTP 400 with specific error message

**2. Processing Errors**
- NLP model failures
- Entity extraction timeouts
- Language detection failures
- Response: HTTP 500 with retry instructions

**3. Data Integrity Errors**
- Schema validation failures
- Database constraint violations
- Merge conflict resolution failures
- Response: HTTP 422 with validation details

**4. System Errors**
- Database connection failures
- File system errors
- Memory/resource exhaustion
- Response: HTTP 503 with system status

### Error Recovery Strategies

```python
class ErrorHandler:
    def handle_nlp_failure(self, text: str, error: Exception):
        # Fallback to simpler extraction methods
        # Log error for model improvement
        # Return partial results with confidence flags
        
    def handle_merge_conflict(self, new_data: Dict, existing: Dict):
        # Create conflict resolution queue
        # Notify administrators
        # Preserve both versions for manual review
        
    def handle_system_overload(self):
        # Implement request queuing
        # Scale processing resources
        # Provide estimated wait times
```

## Testing Strategy

### Unit Testing

**NLP Components:**
- Test entity extraction accuracy with known articles
- Validate relationship extraction with ground truth data
- Test language detection with multilingual content
- Benchmark processing performance with various text sizes

**Data Merger:**
- Test duplicate detection with fuzzy matching scenarios
- Validate schema compliance with malformed data
- Test conflict resolution with competing information
- Verify audit trail generation

**Frontend Components:**
- Test user interface responsiveness
- Validate WebSocket connection handling
- Test error message display and user feedback
- Verify visualization update mechanisms

### Integration Testing

**End-to-End Pipeline:**
- Submit test articles and verify complete processing
- Test real-time visualization updates
- Validate data persistence and retrieval
- Test concurrent user scenarios

**API Testing:**
- Test all REST endpoints with various payloads
- Validate authentication and authorization
- Test rate limiting and throttling
- Verify error response formats

### Performance Testing

**Load Testing:**
- Process 100 concurrent article submissions
- Test database performance with 10,000+ entities
- Measure visualization refresh times with large datasets
- Test memory usage with extended operation

**Stress Testing:**
- Submit maximum-size articles (50,000 characters)
- Test system behavior under resource constraints
- Validate graceful degradation under high load
- Test recovery after system failures

### Security Testing

**Input Validation:**
- Test XSS prevention with malicious HTML
- Validate SQL injection protection
- Test file upload security with various formats
- Verify input sanitization effectiveness

**Data Protection:**
- Test audit log integrity
- Validate source attribution accuracy
- Test data encryption in transit and at rest
- Verify access control mechanisms

## Deployment Architecture

### Development Environment
- Local Flask development server
- SQLite database for rapid iteration
- File-based JSON storage for simplicity
- Hot-reload for frontend development

### Production Environment
- Gunicorn WSGI server with multiple workers
- PostgreSQL for audit logging and metadata
- Redis for caching and session management
- Nginx reverse proxy for static file serving
- Docker containers for consistent deployment

### Monitoring and Observability
- Application performance monitoring (APM)
- Error tracking and alerting
- Database performance metrics
- User activity analytics
- System resource monitoring

## Security Considerations

### Input Security
- HTML sanitization to prevent XSS attacks
- File type validation for uploads
- Content-length limits to prevent DoS
- Rate limiting per IP address

### Data Security
- Encryption of sensitive data at rest
- HTTPS for all client-server communication
- Secure session management
- Regular security audits and updates

### Access Control
- Role-based access for administrative functions
- API key authentication for programmatic access
- Audit logging of all user actions
- Secure password policies for user accounts