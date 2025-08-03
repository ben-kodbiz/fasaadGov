#!/usr/bin/env python3
"""
Upload Processor API

This script provides a web API for processing uploaded documents
and integrating them into the US Atrocities Treemap.
"""

import os
import json
import tempfile
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
import argparse

# Document processing libraries
try:
    import PyPDF2
    from docx import Document
    from bs4 import BeautifulSoup
    import dateutil.parser
    PDF_SUPPORT = True
    DOCX_SUPPORT = True
except ImportError as e:
    print(f"Warning: Some document processing libraries not available: {e}")
    PDF_SUPPORT = False
    DOCX_SUPPORT = False

class DocumentProcessor:
    def __init__(self, data_folder: str = "data"):
        self.data_folder = Path(data_folder)
        self.data_folder.mkdir(exist_ok=True)
        self.json_file = self.data_folder / "us_interventions.json"
        self.processed_file = self.data_folder / "processed_uploads.json"
        
        # Load existing data
        self.data = self.load_existing_data()
        self.processed_uploads = self.load_processed_uploads()
    
    def load_existing_data(self) -> Dict:
        """Load existing JSON data"""
        if self.json_file.exists():
            with open(self.json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
                # Ensure metadata has all required fields
                if 'metadata' not in data:
                    data['metadata'] = {}
                
                metadata = data['metadata']
                
                # Add missing fields with default values
                default_metadata = {
                    "lastUpdated": datetime.now().isoformat(),
                    "totalEvents": 0,
                    "totalCategories": 0,
                    "newsArticlesCount": 0,
                    "markdownEventsCount": 0,
                    "uploadedFilesCount": 0
                }
                
                for key, default_value in default_metadata.items():
                    if key not in metadata:
                        metadata[key] = default_value
                
                return data
        else:
            return {
                "categories": [],
                "metadata": {
                    "lastUpdated": datetime.now().isoformat(),
                    "totalEvents": 0,
                    "totalCategories": 0,
                    "newsArticlesCount": 0,
                    "markdownEventsCount": 0,
                    "uploadedFilesCount": 0
                }
            }
    
    def load_processed_uploads(self) -> Dict:
        """Load list of processed uploads"""
        if self.processed_file.exists():
            with open(self.processed_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            return {"processed": []}
    
    def process_uploaded_file(self, file_path: Path, config: Dict) -> Dict:
        """Process an uploaded file with given configuration"""
        try:
            # Extract text content based on file type
            content = self.extract_text_content(file_path)
            if not content:
                raise ValueError("Could not extract text content from file")
            
            # Generate file hash for duplicate detection
            file_hash = self.get_file_hash(file_path)
            
            # Check for duplicates
            if self.is_duplicate(file_hash):
                return {"status": "skipped", "reason": "Duplicate file"}
            
            # Process the content
            article_data = self.process_content(content, file_path.name, config)
            
            # Create event object
            event = self.create_event(article_data, config, file_hash)
            
            # Add to data structure
            category_name = config.get('category', 'auto')
            if category_name == 'auto':
                category_name = self.auto_categorize(article_data)
            
            self.add_event_to_data(event, category_name)
            
            # Record as processed
            self.record_processed_upload(file_path.name, file_hash, category_name, config)
            
            # Save data
            self.save_data()
            
            return {
                "status": "success",
                "event_id": event["id"],
                "category": category_name,
                "title": event["title"]
            }
            
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    def extract_text_content(self, file_path: Path) -> Optional[str]:
        """Extract text content from various file types"""
        extension = file_path.suffix.lower()
        
        try:
            if extension == '.txt':
                return self.extract_from_txt(file_path)
            elif extension in ['.html', '.htm']:
                return self.extract_from_html(file_path)
            elif extension == '.pdf' and PDF_SUPPORT:
                return self.extract_from_pdf(file_path)
            elif extension in ['.doc', '.docx'] and DOCX_SUPPORT:
                return self.extract_from_docx(file_path)
            else:
                raise ValueError(f"Unsupported file type: {extension}")
        except Exception as e:
            print(f"Error extracting content from {file_path}: {e}")
            return None
    
    def extract_from_txt(self, file_path: Path) -> str:
        """Extract text from TXT file"""
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()
    
    def extract_from_html(self, file_path: Path) -> str:
        """Extract text from HTML file"""
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            soup = BeautifulSoup(f.read(), 'html.parser')
            return soup.get_text()
    
    def extract_from_pdf(self, file_path: Path) -> str:
        """Extract text from PDF file"""
        if not PDF_SUPPORT:
            raise ValueError("PDF support not available. Install PyPDF2.")
        
        text = ""
        with open(file_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text() + "\n"
        return text
    
    def extract_from_docx(self, file_path: Path) -> str:
        """Extract text from DOCX file"""
        if not DOCX_SUPPORT:
            raise ValueError("DOCX support not available. Install python-docx.")
        
        doc = Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    
    def process_content(self, content: str, filename: str, config: Dict) -> Dict:
        """Process extracted content to create article data"""
        # Extract title (first line or from filename)
        lines = content.strip().split('\n')
        title = lines[0].strip() if lines and len(lines[0].strip()) > 10 else filename
        
        # Create summary (first 300 characters)
        summary = content[:300] + "..." if len(content) > 300 else content
        
        # Extract or use custom date
        date_str = config.get('customDate')
        if not date_str:
            date_str = self.extract_date_from_content(content)
        
        # Extract casualty numbers
        casualties = self.extract_casualties(content)
        
        return {
            "title": title,
            "summary": summary,
            "content": content,
            "date": date_str,
            "casualties": casualties,
            "filename": filename
        }
    
    def extract_date_from_content(self, content: str) -> str:
        """Extract date from content"""
        import re
        
        # Look for various date patterns
        patterns = [
            r'(\d{4}-\d{2}-\d{2})',      # YYYY-MM-DD
            r'(\d{1,2}/\d{1,2}/\d{4})',  # MM/DD/YYYY
            r'(\w+ \d{1,2}, \d{4})',     # Month DD, YYYY
            r'(\d{1,2} \w+ \d{4})',      # DD Month YYYY
        ]
        
        for pattern in patterns:
            match = re.search(pattern, content)
            if match:
                try:
                    parsed_date = dateutil.parser.parse(match.group(1))
                    return parsed_date.strftime('%Y-%m-%d')
                except:
                    continue
        
        return datetime.now().strftime('%Y-%m-%d')
    
    def extract_casualties(self, content: str) -> Optional[int]:
        """Extract casualty numbers from content"""
        import re
        
        patterns = [
            r'killed (\d+)',
            r'(\d+) killed',
            r'(\d+) dead',
            r'(\d+) deaths',
            r'(\d+) casualties',
            r'(\d+) victims'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, content, re.IGNORECASE)
            if match:
                try:
                    return int(match.group(1))
                except ValueError:
                    continue
        
        return None
    
    def auto_categorize(self, article_data: Dict) -> str:
        """Automatically categorize the article"""
        content_lower = (article_data["title"] + " " + article_data["content"]).lower()
        
        # Keywords for different categories
        category_keywords = {
            "Israel Atrocities": ["israel", "israeli", "idf", "gaza", "palestine", "west bank"],
            "Middle East": ["syria", "iraq", "afghanistan", "yemen", "iran", "lebanon"],
            "Africa": ["africa", "libya", "somalia", "sudan", "congo", "nigeria"],
            "Asia": ["china", "vietnam", "korea", "cambodia", "laos", "philippines"],
            "Western hemisphere": ["latin america", "chile", "argentina", "nicaragua", "guatemala", "colombia"],
            "Europe": ["europe", "yugoslavia", "kosovo", "ukraine", "russia"],
        }
        
        for category, keywords in category_keywords.items():
            if any(keyword in content_lower for keyword in keywords):
                return category
        
        return "Recent Atrocities"  # Default category
    
    def create_event(self, article_data: Dict, config: Dict, file_hash: str) -> Dict:
        """Create an event object from processed data"""
        tags = config.get('tags', [])
        if isinstance(tags, str):
            tags = [t.strip() for t in tags.split(',') if t.strip()]
        
        tags.extend(["uploaded", "processed"])
        
        return {
            "id": f"upload_{file_hash[:8]}",
            "title": article_data["title"],
            "summary": article_data["summary"],
            "date": article_data["date"],
            "region": "Global",  # Could be enhanced with location detection
            "casualties": article_data["casualties"],
            "source": f"Uploaded File: {article_data['filename']}",
            "sourceUrl": config.get('sourceUrl'),
            "type": config.get('dataType', 'news_article'),
            "originalTimestamp": None,
            "processedTimestamp": datetime.now().isoformat(),
            "tags": tags
        }
    
    def add_event_to_data(self, event: Dict, category_name: str):
        """Add event to the data structure"""
        # Find or create category
        category = None
        for cat in self.data["categories"]:
            if cat["name"] == category_name:
                category = cat
                break
        
        if not category:
            category = {
                "id": f"cat_{len(self.data['categories'])}",
                "name": category_name,
                "events": []
            }
            self.data["categories"].append(category)
        
        # Add event to category
        category["events"].append(event)
        
        # Update metadata
        self.data["metadata"]["totalEvents"] += 1
        self.data["metadata"]["uploadedFilesCount"] += 1
        self.data["metadata"]["totalCategories"] = len(self.data["categories"])
        self.data["metadata"]["lastUpdated"] = datetime.now().isoformat()
    
    def get_file_hash(self, file_path: Path) -> str:
        """Generate hash of file content"""
        with open(file_path, 'rb') as f:
            return hashlib.md5(f.read()).hexdigest()
    
    def is_duplicate(self, file_hash: str) -> bool:
        """Check if file has already been processed"""
        return file_hash in [item["hash"] for item in self.processed_uploads["processed"]]
    
    def record_processed_upload(self, filename: str, file_hash: str, category: str, config: Dict):
        """Record the processed upload"""
        self.processed_uploads["processed"].append({
            "filename": filename,
            "hash": file_hash,
            "processed_at": datetime.now().isoformat(),
            "category": category,
            "config": config
        })
    
    def save_data(self):
        """Save updated data to files"""
        with open(self.json_file, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, indent=2, ensure_ascii=False)
        
        with open(self.processed_file, 'w', encoding='utf-8') as f:
            json.dump(self.processed_uploads, f, indent=2, ensure_ascii=False)

def process_file_command(file_path: str, **kwargs):
    """Command line interface for processing a single file"""
    processor = DocumentProcessor()
    
    config = {
        'dataType': kwargs.get('data_type', 'news_article'),
        'category': kwargs.get('category', 'auto'),
        'sourceUrl': kwargs.get('source_url'),
        'customDate': kwargs.get('custom_date'),
        'tags': kwargs.get('tags', [])
    }
    
    result = processor.process_uploaded_file(Path(file_path), config)
    print(json.dumps(result, indent=2))

def main():
    parser = argparse.ArgumentParser(description="Process uploaded documents")
    parser.add_argument("file_path", help="Path to the file to process")
    parser.add_argument("--data-type", default="news_article", 
                       choices=["news_article", "markdown"],
                       help="Type of data")
    parser.add_argument("--category", default="auto", help="Category for the event")
    parser.add_argument("--source-url", help="Source URL for the article")
    parser.add_argument("--custom-date", help="Custom date (YYYY-MM-DD)")
    parser.add_argument("--tags", nargs="*", help="Tags for the event")
    
    args = parser.parse_args()
    
    process_file_command(
        args.file_path,
        data_type=args.data_type,
        category=args.category,
        source_url=args.source_url,
        custom_date=args.custom_date,
        tags=args.tags or []
    )

if __name__ == "__main__":
    main()