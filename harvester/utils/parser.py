"""
HTML parsing utilities for AFSC Company Scraper
"""

from bs4 import BeautifulSoup, Tag
from typing import Dict, List, Any, Optional
import re
import logging

logger = logging.getLogger(__name__)


class HTMLParser:
    """Handles HTML parsing and content extraction"""
    
    def __init__(self):
        self.soup = None
        
    def parse_html(self, html_content: str) -> BeautifulSoup:
        """Parse HTML content with BeautifulSoup"""
        self.soup = BeautifulSoup(html_content, 'lxml')
        return self.soup
    
    def find_company_sections(self, soup: BeautifulSoup) -> List[Tag]:
        """Find all company sections using navigation links as guide"""
        company_sections = []
        
        # Step 1: Extract all company names from navigation
        nav_companies = self._extract_nav_companies(soup)
        logger.info(f"Found {len(nav_companies)} companies in navigation")
        
        # Step 2: Find content sections for each company
        for company_name in nav_companies:
            section = self._find_company_content(soup, company_name)
            if section:
                company_sections.append(section)
                logger.info(f"Found content for: {company_name}")
            else:
                logger.warning(f"No content found for: {company_name}")
        
        logger.info(f"Successfully found {len(company_sections)} company sections")
        return company_sections
    
    def _extract_nav_companies(self, soup: BeautifulSoup) -> List[str]:
        """Extract company names from navigation links"""
        companies = []
        
        # Find all navigation links with anchors
        nav_links = soup.find_all('a', href=True)
        
        for link in nav_links:
            href = link.get('href', '')
            if href.startswith('#') and len(href) > 1:
                span = link.find('span')
                if span:
                    company_name = span.get_text().strip()
                    
                    # Clean up the company name
                    company_name = re.sub(r'\([^)]*\)', '', company_name).strip()  # Remove stock symbols
                    company_name = company_name.lstrip('*').strip()  # Remove asterisk
                    
                    # Filter out non-company entries
                    if (len(company_name) > 2 and 
                        company_name not in ['Our Work', 'Strategic Goals', 'Programs', 'Issues'] and
                        not company_name.startswith('Economic') and
                        not company_name.startswith('Global') and
                        not company_name.startswith('Migration')):
                        companies.append(company_name)
        
        return companies
    
    def _find_company_content(self, soup: BeautifulSoup, company_name: str) -> Optional[Tag]:
        """Find the content section for a specific company"""
        
        # Create possible ID variations for the company
        company_id_variations = self._generate_id_variations(company_name)
        
        # Method 1: Look for elements with matching IDs
        for variation in company_id_variations:
            element = soup.find(id=variation)
            if element:
                content = element.get_text().strip()
                if len(content) > 100:  # Must have substantial content
                    return element
        
        # Method 2: Look for elements containing the company name
        # Search in all elements for company name mentions
        all_elements = soup.find_all(['div', 'section', 'article'])
        
        for element in all_elements:
            text = element.get_text().strip()
            
            # Check if this element contains the company name and substantial content
            if (len(text) > 200 and 
                self._company_name_matches(company_name, text) and
                any(keyword in text.lower() for keyword in ['military', 'weapons', 'israel', 'gaza', 'company', 'corporation', 'systems'])):
                
                # Make sure it's not a navigation or menu element
                if not self._is_navigation_element(element):
                    return element
        
        # Method 3: Look for text that starts with asterisk and company name
        for element in all_elements:
            text = element.get_text().strip()
            if (text.startswith('*') and 
                len(text) > 100 and
                self._company_name_matches(company_name, text)):
                return element
        
        return None
    
    def _generate_id_variations(self, company_name: str) -> List[str]:
        """Generate possible ID variations for a company name"""
        variations = []
        
        # Basic transformations
        base = company_name.lower()
        
        # Replace common patterns
        base = base.replace('&', '').replace('/', '').replace('(', '').replace(')', '')
        base = base.replace('.', '').replace(',', '').replace("'", '')
        
        variations.extend([
            base.replace(' ', '-'),
            base.replace(' ', ''),
            base.replace(' ', '_'),
            company_name.replace(' ', '-'),
            company_name.replace(' ', ''),
        ])
        
        # Add stock symbol variations if present
        if 'nasdaq' in company_name.lower() or 'nyse' in company_name.lower():
            clean_name = re.sub(r'\([^)]*\)', '', company_name).strip()
            variations.extend([
                clean_name.lower().replace(' ', '-'),
                clean_name.lower().replace(' ', ''),
            ])
        
        return list(set(variations))  # Remove duplicates
    
    def _company_name_matches(self, company_name: str, text: str) -> bool:
        """Check if company name appears in text"""
        text_lower = text.lower()
        company_lower = company_name.lower()
        
        # Direct match
        if company_lower in text_lower:
            return True
        
        # Check individual words for multi-word company names
        words = company_name.split()
        if len(words) > 1:
            # All words must appear in text
            return all(word.lower() in text_lower for word in words)
        
        return False
    
    def _is_navigation_element(self, element: Tag) -> bool:
        """Check if element is likely a navigation/menu element"""
        # Check for navigation-related classes or IDs
        classes = element.get('class', [])
        element_id = element.get('id', '')
        
        nav_indicators = ['nav', 'menu', 'sidebar', 'toc', 'breadcrumb', 'header', 'footer']
        
        for indicator in nav_indicators:
            if (any(indicator in str(cls).lower() for cls in classes) or
                indicator in element_id.lower()):
                return True
        
        # Check if it's mostly links (navigation characteristic)
        links = element.find_all('a')
        text_length = len(element.get_text().strip())
        
        if links and text_length > 0:
            link_text_length = sum(len(link.get_text().strip()) for link in links)
            # If more than 80% of content is links, it's likely navigation
            if link_text_length / text_length > 0.8:
                return True
        
        return False
    
    def _is_company_heading(self, text: str) -> bool:
        """Check if text looks like a company heading"""
        # Company name patterns
        company_indicators = [
            'inc', 'corp', 'corporation', 'company', 'ltd', 'llc',
            'systems', 'technologies', 'industries', 'group',
            'boeing', 'lockheed', 'raytheon', 'general dynamics',
            'caterpillar', 'elbit', 'microsoft', 'google', 'amazon',
            'rtx', 'bae', 'palantir', 'nvidia', 'intel'
        ]
        
        text_lower = text.lower()
        
        # Must be reasonable length
        if len(text) < 3 or len(text) > 200:
            return False
        
        # Check for company indicators
        return any(indicator in text_lower for indicator in company_indicators)
    
    def _is_company_text(self, text: str) -> bool:
        """Check if text starting with * is a company description"""
        # Remove the asterisk and check
        clean_text = text.lstrip('*').strip()
        
        # Must have substantial content
        if len(clean_text) < 50:
            return False
        
        # Check for company indicators in the first part
        first_line = clean_text.split('\n')[0] if '\n' in clean_text else clean_text[:200]
        
        return self._is_company_heading(first_line)
    
    def _create_company_section(self, element: Tag, company_text: str) -> Optional[Tag]:
        """Create a company section from an element and text"""
        try:
            # Create a wrapper div for the company section
            wrapper = self.soup.new_tag('div', **{'class': 'company-section'})
            
            # Extract company name from the text
            if company_text.startswith('*'):
                # Remove asterisk and get first line as name
                clean_text = company_text.lstrip('*').strip()
                first_line = clean_text.split('\n')[0] if '\n' in clean_text else clean_text.split('.')[0]
                
                # Create a heading for the company name
                heading = self.soup.new_tag('h3')
                heading.string = first_line.strip()
                wrapper.append(heading)
                
                # Add the full text as description
                desc_p = self.soup.new_tag('p')
                desc_p.string = clean_text
                wrapper.append(desc_p)
            else:
                # Use the element's content
                wrapper.append(element.extract() if hasattr(element, 'extract') else element)
            
            return wrapper
            
        except Exception as e:
            logger.error(f"Error creating company section: {e}")
            return None
    
    def _get_company_section(self, heading_element: Tag) -> Optional[Tag]:
        """Get the full section for a company based on its heading"""
        # Try to find the parent section that contains all company info
        current = heading_element
        
        # Look for a parent div or section that contains substantial content
        while current and current.parent:
            parent = current.parent
            
            # Check if this parent contains enough content to be a company section
            text_content = parent.get_text().strip()
            if len(text_content) > 200:  # Substantial content
                return parent
            
            current = parent
        
        # Fallback: return the heading and try to get following siblings
        section_content = [heading_element]
        next_sibling = heading_element.next_sibling
        
        while next_sibling:
            if hasattr(next_sibling, 'name'):
                if next_sibling.name in ['h1', 'h2', 'h3']:
                    # Stop at next heading
                    break
                section_content.append(next_sibling)
            next_sibling = next_sibling.next_sibling
        
        # Create a wrapper div for the section
        wrapper = self.soup.new_tag('div', **{'class': 'company-section'})
        for element in section_content:
            if hasattr(element, 'extract'):
                wrapper.append(element.extract())
        
        return wrapper
    
    def extract_company_data(self, section: Tag) -> Dict[str, Any]:
        """Extract structured data from a company section"""
        data = {
            'name': '',
            'description': '',
            'sources': []
        }
        
        try:
            # Get all text content
            all_text = section.get_text().strip()
            
            # Extract company name from the beginning of the text
            if all_text.startswith('*'):
                # Remove asterisk and get first line as company name
                clean_text = all_text.lstrip('*').strip()
                
                # Company name is usually the first line or until first newline
                lines = clean_text.split('\n')
                if lines:
                    # First line is the company name
                    company_name = lines[0].strip()
                    
                    # Clean up common patterns in company names
                    # Remove stock symbols like (NYSE: BA)
                    import re
                    company_name = re.sub(r'\([^)]*\)', '', company_name).strip()
                    
                    data['name'] = company_name
                    
                    # Rest is description
                    if len(lines) > 1:
                        data['description'] = '\n'.join(lines[1:]).strip()
                    else:
                        data['description'] = clean_text
                else:
                    data['name'] = clean_text[:100]  # Fallback
                    data['description'] = clean_text
            else:
                # If no asterisk, try to find company name in other ways
                lines = all_text.split('\n')
                if lines:
                    # Look for a line that looks like a company name
                    for line in lines[:3]:  # Check first 3 lines
                        line = line.strip()
                        if self._is_company_heading(line):
                            data['name'] = line
                            # Remove this line from description
                            remaining_lines = [l for l in lines if l.strip() != line]
                            data['description'] = '\n'.join(remaining_lines).strip()
                            break
                
                # If still no name found, use first line
                if not data['name'] and lines:
                    data['name'] = lines[0].strip()
                    data['description'] = '\n'.join(lines[1:]).strip() if len(lines) > 1 else all_text
            
            # Extract links as sources
            links = section.find_all('a', href=True)
            for link in links:
                href = link.get('href')
                title = link.get_text().strip()
                
                if href and href.startswith('http'):
                    data['sources'].append({
                        'url': href,
                        'title': title or 'Reference Link'
                    })
            
            logger.info(f"Extracted data for company: {data['name'][:50]}...")
            
        except Exception as e:
            logger.error(f"Error extracting company data: {e}")
        
        return data
    
    def extract_all_companies(self, html_content: str) -> List[Dict[str, Any]]:
        """Extract all company data from HTML content"""
        soup = self.parse_html(html_content)
        
        # Get company names from navigation first
        nav_companies = self._extract_nav_companies(soup)
        
        companies_data = []
        for company_name in nav_companies:
            # Find the content section for this specific company
            section = self._find_company_content(soup, company_name)
            if section:
                # Extract data with the known company name
                company_data = self.extract_company_data_with_name(section, company_name)
                if company_data['name']:  # Only add if we found a name
                    companies_data.append(company_data)
            else:
                logger.warning(f"No content section found for: {company_name}")
        
        logger.info(f"Successfully extracted {len(companies_data)} companies")
        return companies_data
    
    def extract_company_data_with_name(self, section: Tag, company_name: str) -> Dict[str, Any]:
        """Extract structured data from a company section with known company name"""
        data = {
            'name': company_name,  # Use the name from navigation
            'description': '',
            'sources': []
        }
        
        try:
            # Get all text content
            all_text = section.get_text().strip()
            
            # Use the full text as description
            data['description'] = all_text
            
            # Extract links as sources
            links = section.find_all('a', href=True)
            for link in links:
                href = link.get('href')
                title = link.get_text().strip()
                
                if href and href.startswith('http'):
                    data['sources'].append({
                        'url': href,
                        'title': title or 'Reference Link'
                    })
            
            logger.info(f"Extracted data for company: {company_name}")
            
        except Exception as e:
            logger.error(f"Error extracting company data for {company_name}: {e}")
        
        return data