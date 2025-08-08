#!/usr/bin/env python3
"""
Enhanced debug script to find the exact location of company data
"""

import requests
from bs4 import BeautifulSoup
import re
import config

def find_company_locations():
    """Find where exactly the companies are located in the HTML"""
    
    # Fetch the page
    session = requests.Session()
    session.headers.update({'User-Agent': config.USER_AGENT})
    
    response = session.get(config.BASE_URL)
    response.raise_for_status()
    
    soup = BeautifulSoup(response.text, 'lxml')
    
    # Known companies to search for
    companies = [
        'Boeing', 'Lockheed Martin', 'RTX', 'Raytheon', 'General Dynamics',
        'Caterpillar', 'Elbit Systems', 'Microsoft', 'Google', 'Amazon'
    ]
    
    print("SEARCHING FOR EXACT COMPANY LOCATIONS")
    print("="*60)
    
    for company in companies:
        print(f"\n🔍 Searching for: {company}")
        
        # Find all text containing this company
        elements = soup.find_all(string=re.compile(company, re.IGNORECASE))
        
        for i, element in enumerate(elements):
            if i >= 3:  # Limit to first 3 matches
                break
                
            # Get the parent element
            parent = element.parent
            
            # Walk up to find a substantial parent
            current = parent
            while current and len(current.get_text().strip()) < 100:
                current = current.parent
                if not current:
                    break
            
            if current:
                text = current.get_text().strip()
                
                # Check if this looks like a company section
                if len(text) > 200 and company.lower() in text.lower():
                    print(f"  ✓ Found in {current.name} tag")
                    print(f"    Text length: {len(text)} chars")
                    print(f"    Preview: {text[:200]}...")
                    
                    # Check if it starts with asterisk pattern
                    lines = text.split('\n')
                    for line in lines[:5]:
                        line = line.strip()
                        if line.startswith('*') and company.lower() in line.lower():
                            print(f"    ⭐ Asterisk line: {line[:100]}...")
                            break
                    
                    print(f"    Parent chain: {' > '.join([p.name for p in current.parents if p.name][:5])}")
                    print()

def analyze_content_structure():
    """Analyze the overall content structure"""
    
    session = requests.Session()
    session.headers.update({'User-Agent': config.USER_AGENT})
    
    response = session.get(config.BASE_URL)
    soup = BeautifulSoup(response.text, 'lxml')
    
    print("\nCONTENT STRUCTURE ANALYSIS")
    print("="*60)
    
    # Look for the main content area
    main_areas = [
        soup.find('main'),
        soup.find('article'),
        soup.find('div', class_='content'),
        soup.find('div', class_='main'),
        soup.find('div', id='content'),
        soup.find('div', id='main')
    ]
    
    for area in main_areas:
        if area:
            print(f"Found content area: {area.name} with class/id: {area.get('class', [])} {area.get('id', '')}")
            
            # Look for asterisk patterns in this area
            text = area.get_text()
            asterisk_lines = [line.strip() for line in text.split('\n') if line.strip().startswith('*')]
            
            print(f"  Asterisk lines found: {len(asterisk_lines)}")
            for i, line in enumerate(asterisk_lines[:10]):
                if any(company.lower() in line.lower() for company in ['boeing', 'lockheed', 'elbit', 'microsoft']):
                    print(f"    {i+1}. {line[:100]}...")
            
            break

if __name__ == "__main__":
    find_company_locations()
    analyze_content_structure()