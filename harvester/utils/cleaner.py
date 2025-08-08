"""
Data cleaning utilities for AFSC Company Scraper
"""

import re
from typing import Dict, List, Any, Optional
from datetime import datetime


class DataCleaner:
    """Handles cleaning and normalization of scraped data"""
    
    def __init__(self):
        self.html_tag_pattern = re.compile(r'<[^>]+>')
        self.whitespace_pattern = re.compile(r'\s+')
        self.revenue_pattern = re.compile(r'\$[\d,.]+ (?:billion|million|trillion)', re.IGNORECASE)
        self.date_pattern = re.compile(r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}')
        
    def clean_text(self, text: str) -> str:
        """Clean and normalize text content"""
        if not text:
            return ""
        
        # Remove HTML tags
        text = self.html_tag_pattern.sub('', text)
        
        # Normalize whitespace
        text = self.whitespace_pattern.sub(' ', text)
        
        # Strip leading/trailing whitespace
        text = text.strip()
        
        return text
    
    def extract_company_name(self, text: str) -> str:
        """Extract and clean company name"""
        name = self.clean_text(text)
        
        # Remove common prefixes/suffixes that might be in headers
        prefixes_to_remove = ['company profile:', 'about', 'profile:']
        for prefix in prefixes_to_remove:
            if name.lower().startswith(prefix):
                name = name[len(prefix):].strip()
        
        return name
    
    def extract_revenue(self, text: str) -> Optional[str]:
        """Extract revenue information from text"""
        text = self.clean_text(text)
        revenue_match = self.revenue_pattern.search(text)
        
        if revenue_match:
            return revenue_match.group(0)
        
        return None
    
    def extract_headquarters(self, text: str) -> Optional[str]:
        """Extract headquarters information"""
        text = self.clean_text(text)
        
        # Look for common headquarters patterns
        hq_patterns = [
            r'headquartered in ([^.]+)',
            r'headquarters[:\s]+([^.]+)',
            r'based in ([^.]+)',
            r'located in ([^.]+)'
        ]
        
        for pattern in hq_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        return None
    
    def extract_incidents(self, text: str) -> List[Dict[str, Any]]:
        """Extract incident information from text"""
        text = self.clean_text(text)
        incidents = []
        
        # Split text into sentences for incident detection
        sentences = re.split(r'[.!?]+', text)
        
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) < 20:  # Skip very short sentences
                continue
            
            # Look for date patterns
            date_match = self.date_pattern.search(sentence)
            
            # Look for incident keywords
            incident_keywords = [
                'attack', 'bombing', 'strike', 'killed', 'casualties', 
                'war crime', 'violation', 'incident', 'operation'
            ]
            
            if any(keyword in sentence.lower() for keyword in incident_keywords):
                incident = {
                    'description': sentence,
                    'date': date_match.group(0) if date_match else None,
                    'extracted_from': 'text_analysis'
                }
                incidents.append(incident)
        
        return incidents
    
    def clean_company_data(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """Clean and structure company data"""
        cleaned_data = {
            'company_name': '',
            'metadata': {
                'scraped_at': datetime.now().isoformat(),
                'source_url': 'https://afsc.org/gaza-genocide-companies',
                'scraper_version': '1.0.0'
            },
            'basic_info': {
                'name': '',
                'headquarters': None,
                'revenue': None,
                'industry': 'Defense/Military'
            },
            'involvement': {
                'summary': '',
                'specific_activities': []
            },
            'incidents': [],
            'sources': []
        }
        
        # Clean and assign basic info
        if 'name' in raw_data:
            name = self.extract_company_name(raw_data['name'])
            cleaned_data['company_name'] = name
            cleaned_data['basic_info']['name'] = name
        
        # Clean description/summary
        if 'description' in raw_data:
            summary = self.clean_text(raw_data['description'])
            cleaned_data['involvement']['summary'] = summary
            
            # Extract structured information from summary
            revenue = self.extract_revenue(summary)
            if revenue:
                cleaned_data['basic_info']['revenue'] = revenue
            
            headquarters = self.extract_headquarters(summary)
            if headquarters:
                cleaned_data['basic_info']['headquarters'] = headquarters
            
            # Extract incidents
            incidents = self.extract_incidents(summary)
            cleaned_data['incidents'].extend(incidents)
        
        # Process sources
        if 'sources' in raw_data and raw_data['sources']:
            for source in raw_data['sources']:
                if isinstance(source, dict) and 'url' in source:
                    cleaned_data['sources'].append({
                        'type': 'reference',
                        'url': source['url'],
                        'title': source.get('title', 'Reference Link')
                    })
        
        return cleaned_data
    
    def normalize_company_filename(self, company_name: str) -> str:
        """Create a normalized filename for the company"""
        # Remove special characters and spaces
        filename = re.sub(r'[^\w\s-]', '', company_name.lower())
        filename = re.sub(r'[-\s]+', '_', filename)
        return f"{filename}.json"