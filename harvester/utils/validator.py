"""
Data validation utilities for AFSC Company Scraper
"""

from typing import Dict, List, Any, Optional, Tuple
import logging
import re

logger = logging.getLogger(__name__)


class DataValidator:
    """Handles validation of scraped company data"""
    
    def __init__(self):
        self.required_fields = ['company_name', 'basic_info', 'involvement']
        self.min_description_length = 50
        
    def validate_company_data(self, data: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """
        Validate company data structure and content
        
        Returns:
            Tuple of (is_valid, list_of_errors)
        """
        errors = []
        
        # Check required fields
        for field in self.required_fields:
            if field not in data:
                errors.append(f"Missing required field: {field}")
        
        # Validate company name
        if 'company_name' in data:
            if not data['company_name'] or len(data['company_name'].strip()) < 2:
                errors.append("Company name is too short or empty")
        
        # Validate basic info
        if 'basic_info' in data:
            basic_info = data['basic_info']
            if 'name' not in basic_info or not basic_info['name']:
                errors.append("Basic info missing company name")
        
        # Validate involvement section
        if 'involvement' in data:
            involvement = data['involvement']
            if 'summary' in involvement:
                summary = involvement['summary']
                if len(summary) < self.min_description_length:
                    errors.append(f"Involvement summary too short (minimum {self.min_description_length} characters)")
        
        # Validate metadata
        if 'metadata' in data:
            metadata = data['metadata']
            required_metadata = ['scraped_at', 'source_url', 'scraper_version']
            for field in required_metadata:
                if field not in metadata:
                    errors.append(f"Missing metadata field: {field}")
        
        # Validate sources format
        if 'sources' in data and data['sources']:
            for i, source in enumerate(data['sources']):
                if not isinstance(source, dict):
                    errors.append(f"Source {i} is not a dictionary")
                    continue
                
                if 'url' not in source:
                    errors.append(f"Source {i} missing URL")
                elif not self._is_valid_url(source['url']):
                    errors.append(f"Source {i} has invalid URL: {source['url']}")
        
        is_valid = len(errors) == 0
        
        if not is_valid:
            logger.warning(f"Validation failed for {data.get('company_name', 'Unknown')}: {errors}")
        else:
            logger.info(f"Validation passed for {data.get('company_name', 'Unknown')}")
        
        return is_valid, errors
    
    def _is_valid_url(self, url: str) -> bool:
        """Check if URL is valid"""
        url_pattern = re.compile(
            r'^https?://'  # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
            r'localhost|'  # localhost...
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
            r'(?::\d+)?'  # optional port
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
        
        return url_pattern.match(url) is not None
    
    def validate_batch(self, companies_data: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Validate a batch of company data
        
        Returns:
            Tuple of (valid_companies, invalid_companies_with_errors)
        """
        valid_companies = []
        invalid_companies = []
        
        for company_data in companies_data:
            is_valid, errors = self.validate_company_data(company_data)
            
            if is_valid:
                valid_companies.append(company_data)
            else:
                invalid_companies.append({
                    'data': company_data,
                    'errors': errors
                })
        
        logger.info(f"Validation complete: {len(valid_companies)} valid, {len(invalid_companies)} invalid")
        
        return valid_companies, invalid_companies
    
    def check_duplicates(self, companies_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate companies based on name"""
        seen_names = set()
        unique_companies = []
        
        for company in companies_data:
            name = company.get('company_name', '').lower().strip()
            
            if name and name not in seen_names:
                seen_names.add(name)
                unique_companies.append(company)
            else:
                logger.warning(f"Duplicate company found: {name}")
        
        logger.info(f"Removed {len(companies_data) - len(unique_companies)} duplicates")
        return unique_companies
    
    def sanitize_filename(self, filename: str) -> str:
        """Sanitize filename for safe file system usage"""
        # Remove or replace invalid characters
        sanitized = re.sub(r'[<>:"/\\|?*]', '_', filename)
        sanitized = re.sub(r'\s+', '_', sanitized)
        sanitized = sanitized.strip('._')
        
        # Ensure reasonable length
        if len(sanitized) > 100:
            sanitized = sanitized[:100]
        
        return sanitized or 'unknown_company'