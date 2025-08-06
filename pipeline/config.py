import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Base configuration class."""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB max file size
    
    # NLP Configuration
    SPACY_MODEL = os.environ.get('SPACY_MODEL', 'en_core_web_sm')
    EXTRACTION_CONFIDENCE_THRESHOLD = float(os.environ.get('EXTRACTION_CONFIDENCE_THRESHOLD', '0.7'))
    
    # Database Configuration
    DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///pipeline.db')
    REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
    
    # File paths for JSON databases
    COMPANIES_JSON_PATH = os.environ.get('COMPANIES_JSON_PATH', 'companies_complicit/companies.json')
    INTERVENTIONS_JSON_PATH = os.environ.get('INTERVENTIONS_JSON_PATH', 'data/us_interventions.json')
    INVESTMENTS_JSON_PATH = os.environ.get('INVESTMENTS_JSON_PATH', 'arabs_complicit/arabs_investment.json')

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    TESTING = False

class TestingConfig(Config):
    """Testing configuration."""
    DEBUG = True
    TESTING = True
    DATABASE_URL = 'sqlite:///:memory:'

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}