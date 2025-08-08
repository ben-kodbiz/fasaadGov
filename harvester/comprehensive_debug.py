#!/usr/bin/env python3
"""
Comprehensive debug to find ALL companies on the page
"""

import requests
from bs4 import BeautifulSoup
import re
import config

def find_all_companies():
    """Find all companies using multiple methods"""
    
    session = requests.Session()
    session.headers.update({'User-Agent': config.USER_AGENT})
    
    response = session.get(config.BASE_URL)
    soup = BeautifulSoup(response.text, 'lxml')
    
    print("COMPREHENSIVE COMPANY SEARCH")
    print("="*60)
    
    # Method 1: Find navigation links (table of contents)
    print("\n1. NAVIGATION LINKS METHOD")
    print("-"*40)
    
    nav_companies = set()
    nav_links = soup.find_all('a', href=True)
    
    for link in nav_links:
        href = link.get('href', '')
        if href.startswith('#') and len(href) > 1:
            # Extract company name from anchor link
            company_id = href[1:]  # Remove #
            span = link.find('span')
            if span:
                company_name = span.get_text().strip()
                # Clean up the name
                company_name = re.sub(r'\([^)]*\)', '', company_name).strip()  # Remove stock symbols
                company_name = company_name.lstrip('*').strip()  # Remove asterisk
                
                if len(company_name) > 2 and company_name not in ['Our Work', 'Strategic Goals', 'Programs']:
                    nav_companies.add(company_name)
                    print(f"  • {company_name}")
    
    print(f"\nFound {len(nav_companies)} companies in navigation")
    
    # Method 2: Find sections with IDs matching navigation
    print("\n2. CONTENT SECTIONS METHOD")
    print("-"*40)
    
    content_companies = {}
    
    for company in nav_companies:
        # Create possible ID variations
        company_id = company.lower().replace(' ', '-').replace('&', '').replace('/', '').replace('(', '').replace(')', '')
        possible_ids = [
            company_id,
            company_id.replace('-', ''),
            company.replace(' ', '-'),
            company.replace(' ', '').lower()
        ]
        
        # Look for elements with these IDs
        for pid in possible_ids:
            element = soup.find(id=pid) or soup.find(id=f"#{pid}")
            if element:
                # Get the content section
                content = element.get_text().strip()
                if len(content) > 100:  # Substantial content
                    content_companies[company] = {
                        'id': pid,
                        'element': element,
                        'content_length': len(content),
                        'preview': content[:200] + '...'
                    }
                    print(f"  ✓ {company}: {len(content)} chars")
                    break
        
        if company not in content_companies:
            print(f"  ✗ {company}: No content found")
    
    print(f"\nFound content for {len(content_companies)} companies")
    
    # Method 3: Look for all elements with IDs that might be companies
    print("\n3. ALL ID ELEMENTS METHOD")
    print("-"*40)
    
    all_id_elements = soup.find_all(id=True)
    id_companies = {}
    
    for element in all_id_elements:
        element_id = element.get('id')
        content = element.get_text().strip()
        
        # Check if this looks like a company section
        if (len(content) > 200 and 
            any(keyword in content.lower() for keyword in ['military', 'weapons', 'israel', 'gaza', 'company', 'corporation'])):
            
            # Try to extract company name from ID
            company_name = element_id.replace('-', ' ').replace('_', ' ').title()
            company_name = re.sub(r'\b(Nasdaq|Nyse|Lse|Tase|Bit|Frw|Krx)\b', '', company_name, flags=re.IGNORECASE).strip()
            
            if company_name and len(company_name) > 2:
                id_companies[company_name] = {
                    'id': element_id,
                    'content_length': len(content),
                    'preview': content[:150] + '...'
                }
    
    print(f"Found {len(id_companies)} potential company sections by ID")
    for name, info in list(id_companies.items())[:10]:  # Show first 10
        print(f"  • {name}: {info['content_length']} chars")
    
    # Summary
    print(f"\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Navigation companies: {len(nav_companies)}")
    print(f"Content found for: {len(content_companies)}")
    print(f"ID-based companies: {len(id_companies)}")
    
    # Show companies we're missing
    missing = nav_companies - set(content_companies.keys())
    if missing:
        print(f"\nMISSING COMPANIES ({len(missing)}):")
        for company in sorted(missing):
            print(f"  • {company}")
    
    return nav_companies, content_companies, id_companies

if __name__ == "__main__":
    find_all_companies()