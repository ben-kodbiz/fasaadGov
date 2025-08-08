#!/usr/bin/env python3
"""
Debug script to examine the HTML structure of the AFSC page
"""

import requests
from bs4 import BeautifulSoup
import config

def debug_html_structure():
    """Examine the HTML structure to understand how to parse it"""
    
    # Fetch the page
    session = requests.Session()
    session.headers.update({
        'User-Agent': config.USER_AGENT,
    })
    
    print("Fetching page...")
    response = session.get(config.BASE_URL)
    response.raise_for_status()
    
    soup = BeautifulSoup(response.text, 'lxml')
    
    print(f"Page title: {soup.title.string if soup.title else 'No title'}")
    print(f"Total page length: {len(response.text)} characters")
    
    # Look for different heading levels
    for level in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
        headings = soup.find_all(level)
        print(f"\n{level.upper()} headings ({len(headings)}):")
        for i, heading in enumerate(headings[:10]):  # Show first 10
            text = heading.get_text().strip()[:100]
            print(f"  {i+1}. {text}")
        if len(headings) > 10:
            print(f"  ... and {len(headings) - 10} more")
    
    # Look for potential company names
    print("\n" + "="*50)
    print("SEARCHING FOR COMPANY PATTERNS")
    print("="*50)
    
    company_keywords = ['boeing', 'lockheed', 'raytheon', 'elbit', 'caterpillar', 
                       'microsoft', 'google', 'amazon', 'general dynamics']
    
    for keyword in company_keywords:
        # Search in all text
        if keyword.lower() in response.text.lower():
            print(f"\n✓ Found '{keyword}' in page content")
            
            # Find elements containing this keyword
            elements = soup.find_all(text=lambda text: text and keyword.lower() in text.lower())
            for element in elements[:3]:  # Show first 3 matches
                parent = element.parent
                if parent:
                    context = parent.get_text().strip()[:200]
                    print(f"  Context: {context}...")
    
    # Look for specific content patterns
    print("\n" + "="*50)
    print("CONTENT STRUCTURE ANALYSIS")
    print("="*50)
    
    # Check for main content area
    main_content = soup.find('main') or soup.find('article') or soup.find('div', class_='content')
    if main_content:
        print(f"Found main content area: {main_content.name}")
        print(f"Main content length: {len(main_content.get_text())} characters")
        
        # Look for paragraphs in main content
        paragraphs = main_content.find_all('p')
        print(f"Paragraphs in main content: {len(paragraphs)}")
        
        # Show first few paragraphs
        for i, p in enumerate(paragraphs[:5]):
            text = p.get_text().strip()[:150]
            if text:
                print(f"  P{i+1}: {text}...")
    
    # Look for lists that might contain companies
    lists = soup.find_all(['ul', 'ol'])
    print(f"\nFound {len(lists)} lists")
    for i, lst in enumerate(lists[:3]):
        items = lst.find_all('li')
        print(f"  List {i+1}: {len(items)} items")
        for j, item in enumerate(items[:3]):
            text = item.get_text().strip()[:100]
            print(f"    Item {j+1}: {text}")

if __name__ == "__main__":
    debug_html_structure()