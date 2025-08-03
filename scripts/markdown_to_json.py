#!/usr/bin/env python3
"""
Markdown to JSON Converter for US Atrocities Data

This script processes the us_atrocity.md file and converts it to JSON format
for the treemap visualization, excluding the LGBTQ section.
"""

import re
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

class MarkdownProcessor:
    def __init__(self, markdown_file: str = "us_atrocity.md", data_folder: str = "data"):
        self.markdown_file = Path(markdown_file)
        self.data_folder = Path(data_folder)
        self.data_folder.mkdir(exist_ok=True)
        self.json_file = self.data_folder / "us_interventions.json"
        
        # Load existing news articles if any
        self.existing_data = self.load_existing_data()
    
    def load_existing_data(self) -> Dict:
        """Load existing JSON data (news articles) if it exists"""
        if self.json_file.exists():
            with open(self.json_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            return {
                "categories": [],
                "metadata": {
                    "lastUpdated": datetime.now().isoformat(),
                    "totalEvents": 0,
                    "totalCategories": 0,
                    "newsArticlesCount": 0,
                    "markdownEventsCount": 0
                }
            }
    
    def parse_markdown(self) -> Dict:
        """Parse the markdown file and extract structured data"""
        with open(self.markdown_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Split into sections
        sections = self.split_into_sections(content)
        
        # Process each section
        categories = []
        total_events = 0
        
        for section_name, section_content in sections.items():
            if self.should_exclude_section(section_name):
                print(f"Excluding section: {section_name}")
                continue
            
            events = self.extract_events_from_section(section_content, section_name)
            if events:
                category = {
                    "id": f"md_{len(categories)}",
                    "name": section_name,
                    "events": events
                }
                categories.append(category)
                total_events += len(events)
                print(f"Processed {len(events)} events from {section_name}")
        
        # Merge with existing news articles
        existing_categories = self.existing_data.get("categories", [])
        news_count = sum(len(cat["events"]) for cat in existing_categories)
        
        # Combine categories
        all_categories = existing_categories + categories
        
        return {
            "categories": all_categories,
            "metadata": {
                "lastUpdated": datetime.now().isoformat(),
                "totalEvents": total_events + news_count,
                "totalCategories": len(all_categories),
                "newsArticlesCount": news_count,
                "markdownEventsCount": total_events
            }
        }
    
    def split_into_sections(self, content: str) -> Dict[str, str]:
        """Split markdown content into sections based on H2 and H3 headers"""
        sections = {}
        
        # Find all H2 sections (## Header)
        h2_pattern = r'^## (.+)$'
        h2_matches = list(re.finditer(h2_pattern, content, re.MULTILINE))
        
        for i, match in enumerate(h2_matches):
            section_name = match.group(1).strip()
            start_pos = match.end()
            
            # Find the end of this section (next H2 or end of file)
            if i + 1 < len(h2_matches):
                end_pos = h2_matches[i + 1].start()
            else:
                end_pos = len(content)
            
            section_content = content[start_pos:end_pos].strip()
            
            # Further split by H3 if this is a major section
            if section_name in ["Imperialism", "Internal Repression"]:
                h3_sections = self.split_h3_sections(section_content)
                sections.update(h3_sections)
            else:
                sections[section_name] = section_content
        
        return sections
    
    def split_h3_sections(self, content: str) -> Dict[str, str]:
        """Split content into H3 subsections"""
        sections = {}
        
        # Find all H3 sections (### Header)
        h3_pattern = r'^### (.+)$'
        h3_matches = list(re.finditer(h3_pattern, content, re.MULTILINE))
        
        for i, match in enumerate(h3_matches):
            section_name = match.group(1).strip()
            start_pos = match.end()
            
            # Find the end of this section
            if i + 1 < len(h3_matches):
                end_pos = h3_matches[i + 1].start()
            else:
                end_pos = len(content)
            
            section_content = content[start_pos:end_pos].strip()
            sections[section_name] = section_content
        
        return sections
    
    def should_exclude_section(self, section_name: str) -> bool:
        """Check if a section should be excluded"""
        exclude_sections = [
            "LGBTQ People",
            "Sources / Starting points",
            "Contents"
        ]
        return section_name in exclude_sections
    
    def extract_events_from_section(self, content: str, section_name: str) -> List[Dict]:
        """Extract individual events from a section"""
        events = []
        
        # Split content into bullet points or paragraphs
        lines = content.split('\n')
        current_event = []
        
        for line in lines:
            line = line.strip()
            if not line:
                if current_event:
                    event = self.process_event_text('\n'.join(current_event), section_name)
                    if event:
                        events.append(event)
                    current_event = []
                continue
            
            # Start of new bullet point
            if line.startswith('- '):
                if current_event:
                    event = self.process_event_text('\n'.join(current_event), section_name)
                    if event:
                        events.append(event)
                current_event = [line[2:]]  # Remove '- '
            else:
                if current_event:
                    current_event.append(line)
        
        # Process last event
        if current_event:
            event = self.process_event_text('\n'.join(current_event), section_name)
            if event:
                events.append(event)
        
        return events
    
    def process_event_text(self, text: str, section_name: str) -> Optional[Dict]:
        """Process a single event text and extract structured data"""
        if len(text.strip()) < 20:  # Skip very short entries
            return None
        
        # Extract date patterns
        date = self.extract_date(text)
        
        # Extract title (first sentence or up to first period)
        title = self.extract_title(text)
        
        # Create summary (first 200 characters)
        summary = text[:300] + "..." if len(text) > 300 else text
        
        # Extract casualty numbers
        casualties = self.extract_casualties(text)
        
        # Generate unique ID
        event_id = f"md_{hash(text) % 100000}"
        
        return {
            "id": event_id,
            "title": title,
            "summary": summary,
            "date": date,
            "region": self.map_section_to_region(section_name),
            "casualties": casualties,
            "source": f"US Atrocities Documentation",
            "sourceUrl": None,
            "type": "markdown",
            "originalTimestamp": None,
            "processedTimestamp": datetime.now().isoformat(),
            "tags": ["historical", "documented"]
        }
    
    def extract_date(self, text: str) -> str:
        """Extract date from text"""
        # Look for various date patterns
        patterns = [
            r'(\d{4})',  # Just year
            r'(\w+ \d{1,2}, \d{4})',  # Month DD, YYYY
            r'(\d{1,2}/\d{1,2}/\d{4})',  # MM/DD/YYYY
            r'(\d{4}-\d{2}-\d{2})',  # YYYY-MM-DD
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1)
        
        return "Unknown"
    
    def extract_title(self, text: str) -> str:
        """Extract a title from the event text"""
        # Take first sentence or first 100 characters
        sentences = re.split(r'[.!?]', text)
        if sentences:
            title = sentences[0].strip()
            if len(title) > 100:
                title = title[:100] + "..."
            return title
        return text[:100] + "..." if len(text) > 100 else text
    
    def extract_casualties(self, text: str) -> Optional[int]:
        """Extract casualty numbers from text"""
        # Look for death/casualty numbers
        patterns = [
            r'killed (\d+)',
            r'(\d+) killed',
            r'(\d+) dead',
            r'(\d+) deaths',
            r'(\d+) civilians',
            r'(\d+) people'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    return int(match.group(1))
                except ValueError:
                    continue
        
        return None
    
    def map_section_to_region(self, section_name: str) -> str:
        """Map section names to regions"""
        region_mapping = {
            "Middle East": "Middle East",
            "Western hemisphere": "Latin America", 
            "Africa": "Africa",
            "Asia": "Asia",
            "Europe": "Europe",
            "Native Americans": "North America",
            "Black people": "North America",
            "Latinos": "North America",
            "Asians": "North America",
            "Women": "North America",
            "Workers and the Poor": "North America",
            "Children": "North America",
            "Prisoners": "North America",
            "Religious minorities": "North America",
            "Pervasive": "North America"
        }
        
        return region_mapping.get(section_name, "Global")
    
    def save_json(self, data: Dict):
        """Save the processed data to JSON file"""
        with open(self.json_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"Saved JSON data to {self.json_file}")
        print(f"Total events: {data['metadata']['totalEvents']}")
        print(f"Total categories: {data['metadata']['totalCategories']}")
        print(f"Markdown events: {data['metadata']['markdownEventsCount']}")
        print(f"News articles: {data['metadata']['newsArticlesCount']}")

def main():
    processor = MarkdownProcessor()
    
    print("Processing us_atrocity.md...")
    data = processor.parse_markdown()
    processor.save_json(data)
    print("Processing complete!")

if __name__ == "__main__":
    main()