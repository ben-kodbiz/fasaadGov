#!/usr/bin/env python3
"""
Integration script to add AFSC scraped data as news articles 
to the companies_complicit database.
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Any, Optional
import re

class NewsIntegrator:
    """Integrates AFSC scraped data into companies_complicit as news articles"""
    
    def __init__(self):
        self.base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.companies_db_path = os.path.join(self.base_path, 'companies_complicit', 'companies_enhanced.json')
        self.scraped_data_path = os.path.join(self.base_path, 'harvester', 'output', 'combined.json')
        
    def load_companies_database(self) -> Dict[str, Any]:
        """Load the existing companies database"""
        try:
            with open(self.companies_db_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Companies database not found at {self.companies_db_path}")
            return None
        except Exception as e:
            print(f"Error loading companies database: {e}")
            return None
    
    def load_scraped_data(self) -> Dict[str, Any]:
        """Load the scraped AFSC data"""
        try:
            with open(self.scraped_data_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Scraped data not found at {self.scraped_data_path}")
            return None
        except Exception as e:
            print(f"Error loading scraped data: {e}")
            return None
    
    def find_matching_company(self, companies_db: Dict, scraped_company_name: str) -> Optional[Dict]:
        """Find a matching company in the database"""
        scraped_name_lower = scraped_company_name.lower()
        
        # Direct name matching variations
        name_variations = [
            scraped_company_name,
            scraped_name_lower,
            scraped_company_name.replace('/', ' '),
            scraped_company_name.replace('&', 'and'),
        ]
        
        # Search through all categories
        for category in companies_db.get('children', []):
            for company in category.get('children', []):
                company_name = company.get('name', '').lower()
                
                # Check direct matches
                for variation in name_variations:
                    if self._names_match(variation.lower(), company_name):
                        return company
                
                # Check subsidiaries
                if 'children' in company:
                    for subsidiary in company['children']:
                        sub_name = subsidiary.get('name', '').lower()
                        for variation in name_variations:
                            if self._names_match(variation.lower(), sub_name):
                                return subsidiary
        
        return None
    
    def _names_match(self, scraped_name: str, db_name: str) -> bool:
        """Check if two company names match"""
        # Exact match
        if scraped_name == db_name:
            return True
        
        # Handle common variations
        variations = {
            'google/alphabet': ['alphabet inc. (google)', 'google', 'alphabet'],
            'microsoft': ['microsoft corporation', 'microsoft corp'],
            'boeing': ['the boeing company', 'boeing company'],
            'lockheed martin': ['lockheed martin corporation'],
            'general dynamics': ['general dynamics corporation'],
            'general electric': ['general electric company'],
            'rtx': ['rtx corporation', 'raytheon'],
            'bae systems': ['bae systems plc'],
            'elbit systems': ['elbit systems ltd'],
            'amazon': ['amazon.com, inc.', 'amazon web services']
        }
        
        # Check if either name is a known variation
        for base_name, variants in variations.items():
            if (scraped_name == base_name and db_name in [v.lower() for v in variants]) or \
               (db_name == base_name and scraped_name in [v.lower() for v in variants]):
                return True
        
        # Check if one name contains the other (for partial matches)
        if len(scraped_name) > 3 and len(db_name) > 3:
            if scraped_name in db_name or db_name in scraped_name:
                return True
        
        return False
    
    def create_news_article(self, scraped_company: Dict) -> Dict[str, Any]:
        """Create a news article from scraped company data"""
        company_name = scraped_company.get('company_name', 'Unknown Company')
        involvement = scraped_company.get('involvement', {})
        summary = involvement.get('summary', '')
        
        # Extract key information for the news article
        title = f"{company_name} Involvement in Gaza Military Operations"
        
        # Create a concise summary (first 500 characters)
        news_summary = self._create_news_summary(summary, company_name)
        
        # Extract incidents for additional context
        incidents = scraped_company.get('incidents', [])
        incident_count = len(incidents)
        
        # Get source links
        sources = scraped_company.get('sources', [])
        primary_source = sources[0] if sources else None
        
        return {
            "title": title,
            "date": "2024-08-09",  # Date when we scraped the data
            "source": "American Friends Service Committee (AFSC)",
            "url": primary_source.get('url') if primary_source else "https://afsc.org/gaza-genocide-companies",
            "summary": news_summary,
            "category": "investigation",
            "confidence": 0.95,
            "added_timestamp": datetime.now().isoformat(),
            "metadata": {
                "scraped_from": "AFSC Gaza Genocide Companies Report",
                "incident_count": incident_count,
                "source_count": len(sources),
                "data_quality": "comprehensive"
            }
        }
    
    def _create_news_summary(self, full_summary: str, company_name: str) -> str:
        """Create a concise news summary from the full scraped content"""
        if not full_summary:
            return f"Investigation reveals {company_name}'s involvement in providing technology and services that enable military operations."
        
        # Find the company-specific content (usually starts after general intro)
        # Look for the company name in the text to find relevant section
        company_section = ""
        lines = full_summary.split('\n')
        
        found_company_section = False
        for line in lines:
            line = line.strip()
            if company_name.lower() in line.lower() and len(line) > 50:
                found_company_section = True
                company_section = line
                break
        
        if not found_company_section:
            # Fallback: use first substantial paragraph
            for line in lines:
                line = line.strip()
                if len(line) > 100 and not line.startswith('Quaker') and not line.startswith('Our Work'):
                    company_section = line
                    break
        
        if not company_section:
            company_section = f"Comprehensive investigation reveals {company_name}'s involvement in military operations and weapons supply chains."
        
        # Limit to 400 characters for news summary
        if len(company_section) > 400:
            company_section = company_section[:400] + "..."
        
        return company_section
    
    def integrate_news_articles(self) -> bool:
        """Main integration process"""
        print("Starting AFSC News Integration Process")
        print("=" * 50)
        
        # Load data
        companies_db = self.load_companies_database()
        scraped_data = self.load_scraped_data()
        
        if not companies_db or not scraped_data:
            print("Failed to load required data files")
            return False
        
        scraped_companies = scraped_data.get('companies', [])
        print(f"Found {len(scraped_companies)} scraped companies")
        
        # Create backup
        backup_path = f"{self.companies_db_path}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        with open(backup_path, 'w', encoding='utf-8') as f:
            json.dump(companies_db, f, indent=2, ensure_ascii=False)
        print(f"Created backup: {backup_path}")
        
        # Process each scraped company
        matches_found = 0
        articles_added = 0
        
        for scraped_company in scraped_companies:
            company_name = scraped_company.get('company_name', 'Unknown')
            
            # Skip non-company entries
            if company_name in ['Airlines, Shipping, Logistics'] or len(company_name) < 3:
                continue
            
            # Find matching company in database
            matching_company = self.find_matching_company(companies_db, company_name)
            
            if matching_company:
                matches_found += 1
                print(f"✓ Found match: {company_name} -> {matching_company.get('name')}")
                
                # Create news article
                news_article = self.create_news_article(scraped_company)
                
                # Add to company's news articles
                if 'news_articles' not in matching_company:
                    matching_company['news_articles'] = []
                
                # Check for duplicates
                existing_titles = [article.get('title', '') for article in matching_company['news_articles']]
                if news_article['title'] not in existing_titles:
                    matching_company['news_articles'].append(news_article)
                    articles_added += 1
                    print(f"  Added news article to {matching_company.get('name')}")
                else:
                    print(f"  Article already exists for {matching_company.get('name')}")
            else:
                print(f"✗ No match found for: {company_name}")
        
        # Save updated database
        try:
            with open(self.companies_db_path, 'w', encoding='utf-8') as f:
                json.dump(companies_db, f, indent=2, ensure_ascii=False)
            
            print("\n" + "=" * 50)
            print("INTEGRATION COMPLETE")
            print("=" * 50)
            print(f"Companies processed: {len(scraped_companies)}")
            print(f"Matches found: {matches_found}")
            print(f"News articles added: {articles_added}")
            print(f"Database updated: {self.companies_db_path}")
            print(f"Backup created: {backup_path}")
            
            return True
            
        except Exception as e:
            print(f"Error saving database: {e}")
            return False

def main():
    """Main entry point"""
    integrator = NewsIntegrator()
    success = integrator.integrate_news_articles()
    
    if success:
        print("\n🎉 News integration completed successfully!")
        print("You can now view the updated companies in the visualization.")
    else:
        print("\n❌ News integration failed. Check the error messages above.")

if __name__ == "__main__":
    main()