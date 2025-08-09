"""
Configuration settings for AFSC Company Scraper
"""

import os
from datetime import datetime

# Base configuration
BASE_URL = "https://afsc.org/gaza-genocide-companies"
SCRAPER_VERSION = "1.0.0"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "output")
COMPANIES_DIR = os.path.join(OUTPUT_DIR, "companies")
LOGS_DIR = os.path.join(BASE_DIR, "logs")

# Scraping settings
REQUEST_TIMEOUT = 30
RETRY_ATTEMPTS = 3
DELAY_BETWEEN_REQUESTS = 1  # seconds

# Data extraction settings
COMPANY_FIELDS = {
    'name': ['h2', 'h3', '.company-name', 'strong'],
    'description': ['p', '.company-description', '.description'],
    'involvement': ['.involvement-section', 'p'],
    'revenue': ['.revenue-info', 'p'],
    'headquarters': ['.headquarters-info', 'p'],
    'incidents': ['.incident-list', 'p'],
    'sources': ['a[href]'],
    'last_updated': ['.date-info', '.updated']
}

# Output settings
INDIVIDUAL_FILES = True
COMBINED_FILE = True
METADATA_FILE = True

# Logging settings
LOG_LEVEL = "INFO"
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
LOG_FILE = os.path.join(LOGS_DIR, f"scraper_{datetime.now().strftime('%Y%m%d')}.log")

# Data validation
REQUIRED_FIELDS = ['name']
MIN_DESCRIPTION_LENGTH = 50