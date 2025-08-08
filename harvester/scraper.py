#!/usr/bin/env python3
"""
AFSC Company Data Scraper

Scrapes company information from https://afsc.org/gaza-genocide-companies
and saves it as structured JSON files.
"""

import requests
import json
import os
import time
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional

# Import our utilities
from utils.parser import HTMLParser
from utils.cleaner import DataCleaner
from utils.validator import DataValidator
import config


class AFSCCompanyScraper:
    """Main scraper class for AFSC company data"""
    
    def __init__(self):
        self.base_url = config.BASE_URL
        self.session = self._setup_session()
        self.parser = HTMLParser()
        self.cleaner = DataCleaner()
        self.validator = DataValidator()
        self.companies_data = []
        
        # Setup logging
        self._setup_logging()
        
        # Ensure output directories exist
        self._ensure_directories()
        
        self.logger = logging.getLogger(__name__)
        self.logger.info("AFSC Company Scraper initialized")
    
    def _setup_session(self) -> requests.Session:
        """Setup HTTP session with proper headers"""
        session = requests.Session()
        session.headers.update({
            'User-Agent': config.USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        })
        return session
    
    def _setup_logging(self):
        """Setup logging configuration"""
        logging.basicConfig(
            level=getattr(logging, config.LOG_LEVEL),
            format=config.LOG_FORMAT,
            handlers=[
                logging.FileHandler(config.LOG_FILE),
                logging.StreamHandler()
            ]
        )
    
    def _ensure_directories(self):
        """Ensure all required directories exist"""
        directories = [
            config.OUTPUT_DIR,
            config.COMPANIES_DIR,
            config.LOGS_DIR
        ]
        
        for directory in directories:
            os.makedirs(directory, exist_ok=True)
    
    def fetch_page(self, url: str) -> Optional[str]:
        """Fetch HTML content from URL with retry logic"""
        logger = logging.getLogger(__name__)
        
        for attempt in range(config.RETRY_ATTEMPTS):
            try:
                logger.info(f"Fetching {url} (attempt {attempt + 1})")
                
                response = self.session.get(
                    url,
                    timeout=config.REQUEST_TIMEOUT
                )
                response.raise_for_status()
                
                logger.info(f"Successfully fetched {url}")
                return response.text
                
            except requests.exceptions.RequestException as e:
                logger.warning(f"Attempt {attempt + 1} failed: {e}")
                if attempt < config.RETRY_ATTEMPTS - 1:
                    time.sleep(config.DELAY_BETWEEN_REQUESTS * (attempt + 1))
                else:
                    logger.error(f"Failed to fetch {url} after {config.RETRY_ATTEMPTS} attempts")
                    return None
    
    def scrape_companies(self) -> List[Dict[str, Any]]:
        """Main scraping method"""
        logger = logging.getLogger(__name__)
        logger.info("Starting company data scraping")
        
        # Fetch the main page
        html_content = self.fetch_page(self.base_url)
        if not html_content:
            logger.error("Failed to fetch main page")
            return []
        
        # Parse HTML and extract company data
        logger.info("Parsing HTML content")
        raw_companies = self.parser.extract_all_companies(html_content)
        
        if not raw_companies:
            logger.warning("No companies found in HTML content")
            return []
        
        # Clean and structure the data
        logger.info(f"Cleaning data for {len(raw_companies)} companies")
        cleaned_companies = []
        
        for raw_company in raw_companies:
            try:
                cleaned_data = self.cleaner.clean_company_data(raw_company)
                cleaned_companies.append(cleaned_data)
            except Exception as e:
                logger.error(f"Error cleaning company data: {e}")
                continue
        
        # Validate data
        logger.info("Validating company data")
        valid_companies, invalid_companies = self.validator.validate_batch(cleaned_companies)
        
        # Log validation results
        if invalid_companies:
            logger.warning(f"Found {len(invalid_companies)} invalid companies:")
            for invalid in invalid_companies:
                company_name = invalid['data'].get('company_name', 'Unknown')
                logger.warning(f"  - {company_name}: {invalid['errors']}")
        
        # Remove duplicates
        unique_companies = self.validator.check_duplicates(valid_companies)
        
        self.companies_data = unique_companies
        logger.info(f"Successfully processed {len(unique_companies)} companies")
        
        return unique_companies
    
    def save_individual_files(self, companies: List[Dict[str, Any]]):
        """Save individual JSON files for each company"""
        logger = logging.getLogger(__name__)
        logger.info("Saving individual company files")
        
        for company in companies:
            try:
                company_name = company.get('company_name', 'unknown')
                filename = self.cleaner.normalize_company_filename(company_name)
                filepath = os.path.join(config.COMPANIES_DIR, filename)
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(company, f, indent=2, ensure_ascii=False)
                
                logger.info(f"Saved {company_name} to {filename}")
                
            except Exception as e:
                logger.error(f"Error saving company file for {company_name}: {e}")
    
    def save_combined_file(self, companies: List[Dict[str, Any]]):
        """Save all companies in a single JSON file"""
        logger = logging.getLogger(__name__)
        
        try:
            combined_data = {
                'metadata': {
                    'scraped_at': datetime.now().isoformat(),
                    'source_url': config.BASE_URL,
                    'scraper_version': config.SCRAPER_VERSION,
                    'total_companies': len(companies)
                },
                'companies': companies
            }
            
            filepath = os.path.join(config.OUTPUT_DIR, 'combined.json')
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(combined_data, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Saved combined file with {len(companies)} companies")
            
        except Exception as e:
            logger.error(f"Error saving combined file: {e}")
    
    def save_metadata(self, companies: List[Dict[str, Any]]):
        """Save scraping metadata"""
        logger = logging.getLogger(__name__)
        
        try:
            metadata = {
                'scrape_info': {
                    'scraped_at': datetime.now().isoformat(),
                    'source_url': config.BASE_URL,
                    'scraper_version': config.SCRAPER_VERSION,
                    'total_companies': len(companies)
                },
                'company_list': [
                    {
                        'name': company.get('company_name', 'Unknown'),
                        'filename': self.cleaner.normalize_company_filename(
                            company.get('company_name', 'unknown')
                        ),
                        'has_revenue': bool(company.get('basic_info', {}).get('revenue')),
                        'has_headquarters': bool(company.get('basic_info', {}).get('headquarters')),
                        'incident_count': len(company.get('incidents', [])),
                        'source_count': len(company.get('sources', []))
                    }
                    for company in companies
                ],
                'statistics': {
                    'companies_with_revenue': sum(1 for c in companies 
                                                if c.get('basic_info', {}).get('revenue')),
                    'companies_with_headquarters': sum(1 for c in companies 
                                                     if c.get('basic_info', {}).get('headquarters')),
                    'total_incidents': sum(len(c.get('incidents', [])) for c in companies),
                    'total_sources': sum(len(c.get('sources', [])) for c in companies)
                }
            }
            
            filepath = os.path.join(config.OUTPUT_DIR, 'metadata.json')
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, indent=2, ensure_ascii=False)
            
            logger.info("Saved scraping metadata")
            
        except Exception as e:
            logger.error(f"Error saving metadata: {e}")
    
    def run(self):
        """Run the complete scraping process"""
        logger = logging.getLogger(__name__)
        start_time = datetime.now()
        
        logger.info("=" * 50)
        logger.info("AFSC Company Scraper Starting")
        logger.info("=" * 50)
        
        try:
            # Scrape companies
            companies = self.scrape_companies()
            
            if not companies:
                logger.error("No companies scraped successfully")
                return
            
            # Save data in different formats
            if config.INDIVIDUAL_FILES:
                self.save_individual_files(companies)
            
            if config.COMBINED_FILE:
                self.save_combined_file(companies)
            
            if config.METADATA_FILE:
                self.save_metadata(companies)
            
            # Log completion
            end_time = datetime.now()
            duration = end_time - start_time
            
            logger.info("=" * 50)
            logger.info("AFSC Company Scraper Completed")
            logger.info(f"Companies processed: {len(companies)}")
            logger.info(f"Duration: {duration}")
            logger.info(f"Output directory: {config.OUTPUT_DIR}")
            logger.info("=" * 50)
            
        except Exception as e:
            logger.error(f"Scraper failed with error: {e}")
            raise


def main():
    """Main entry point"""
    scraper = AFSCCompanyScraper()
    scraper.run()


if __name__ == "__main__":
    main()