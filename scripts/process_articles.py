#!/usr/bin/env python3
"""
News Article Processing Script

This script processes news articles from the news/ folder and converts them
to JSON format for integration with the US Atrocities Treemap visualization.

Usage:
    python scripts/process_articles.py
    python scripts/process_articles.py --watch  # Monitor folder for changes
"""

import os
import json
import re
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import argparse
from bs4 import BeautifulSoup
import dateutil.parser

class ArticleProcessor:
    def __init__(self, news_folder: str = "news", data_folder: str = "data"):
        self.news_folder = Path(news_folder)
        self.data_folder = Path(data_folder)
        self.data_folder.mkdir(exist_ok=True)
        self.json_file = self.data_folder / "us_interventions.json"
        self.processed_file = self.data_folder / "processed_articles.json"
        
        # Load existing data
        self.data = self.load_existing_data()
        self.processed_articles = self.load_processed_articles()
    
    def load_existing_data(self) -> Dict:
        """Load existing JSON data or create empty structure"""
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
    
    def load_processed_articles(self) -> Dict:
        """Load list of already processed articles to avoid duplicates"""
        if self.processed_file.exists():
            with open(self.processed_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            return {"processed": []}
    
    def get_file_hash(self, file_path: Path) -> str:
        """Generate hash of file content for duplicate detection"""
        with open(file_path, 'rb') as f:
            return hashlib.md5(f.read()).hexdigest()
    
    def parse_text_article(self, file_path: Path) -> Optional[Dict]:
        """Parse a plain text article file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read().strip()
            
            if not content:
                return None
            
            lines = content.split('\n')
            title = lines[0].strip() if lines else "Untitled Article"
            
            # Try to extract date from filename or content
            date_str = self.extract_date_from_filename(file_path.name)
            if not date_str:
                date_str = self.extract_date_from_content(content)
            
            # Extract summary (first few sentences or paragraphs)
            summary = self.extract_summary(content)
            
            return {
                "title": title,
                "summary": summary,
                "date": date_str,
                "content": content,
                "source": f"News Article: {file_path.name}",
                "sourceUrl": None
            }
        except Exception as e:
            print(f"Error parsing text file {file_path}: {e}")
            return None
    
    def parse_html_article(self, file_path: Path) -> Optional[Dict]:
        """Parse an HTML article file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            soup = BeautifulSoup(content, 'html.parser')
            
            # Extract title
            title = None
            if soup.title:
                title = soup.title.get_text().strip()
            elif soup.find('h1'):
                title = soup.find('h1').get_text().strip()
            else:
                title = f"Article from {file_path.name}"
            
            # Extract main content
            text_content = soup.get_text()
            summary = self.extract_summary(text_content)
            
            # Try to extract date
            date_str = self.extract_date_from_filename(file_path.name)
            if not date_str:
                date_str = self.extract_date_from_content(text_content)
            
            # Try to extract source URL from meta tags or links
            source_url = None
            canonical = soup.find('link', {'rel': 'canonical'})
            if canonical and canonical.get('href'):
                source_url = canonical.get('href')
            
            return {
                "title": title,
                "summary": summary,
                "date": date_str,
                "content": text_content,
                "source": f"News Article: {file_path.name}",
                "sourceUrl": source_url
            }
        except Exception as e:
            print(f"Error parsing HTML file {file_path}: {e}")
            return None
    
    def extract_date_from_filename(self, filename: str) -> Optional[str]:
        """Extract date from filename patterns like 2024-01-15_article.txt"""
        date_pattern = r'(\d{4}-\d{2}-\d{2})'
        match = re.search(date_pattern, filename)
        if match:
            return match.group(1)
        return None
    
    def extract_date_from_content(self, content: str) -> Optional[str]:
        """Try to extract date from article content"""
        # Look for common date patterns
        date_patterns = [
            r'(\d{1,2}/\d{1,2}/\d{4})',  # MM/DD/YYYY
            r'(\d{4}-\d{2}-\d{2})',      # YYYY-MM-DD
            r'(\w+ \d{1,2}, \d{4})',     # Month DD, YYYY
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, content)
            if match:
                try:
                    parsed_date = dateutil.parser.parse(match.group(1))
                    return parsed_date.strftime('%Y-%m-%d')
                except:
                    continue
        
        return datetime.now().strftime('%Y-%m-%d')  # Default to today
    
    def extract_summary(self, content: str, max_length: int = 300) -> str:
        """Extract a summary from article content"""
        # Clean up the content
        content = re.sub(r'\s+', ' ', content).strip()
        
        # Take first few sentences
        sentences = re.split(r'[.!?]+', content)
        summary = ""
        for sentence in sentences:
            if len(summary + sentence) < max_length:
                summary += sentence + ". "
            else:
                break
        
        return summary.strip()
    
    def categorize_article(self, article_data: Dict) -> str:
        """Determine the appropriate category for the article"""
        title_lower = article_data["title"].lower()
        content_lower = article_data["content"].lower()
        
        # Keywords for different categories
        us_keywords = ["united states", "us military", "american", "pentagon", "cia", "drone", "airstrike"]
        israel_keywords = ["israel", "israeli", "idf", "gaza", "palestine", "west bank"]
        middle_east_keywords = ["syria", "iraq", "afghanistan", "yemen", "iran"]
        
        combined_text = title_lower + " " + content_lower
        
        if any(keyword in combined_text for keyword in israel_keywords):
            return "Israel Atrocities"
        elif any(keyword in combined_text for keyword in middle_east_keywords):
            return "Middle East"
        elif any(keyword in combined_text for keyword in us_keywords):
            return "US Military Operations"
        else:
            return "Recent Atrocities"  # Default category
    
    def process_article(self, file_path: Path) -> Optional[Dict]:
        """Process a single article file"""
        # Check if already processed
        file_hash = self.get_file_hash(file_path)
        if file_hash in [item["hash"] for item in self.processed_articles["processed"]]:
            print(f"Skipping already processed file: {file_path.name}")
            return None
        
        print(f"Processing: {file_path.name}")
        
        # Parse based on file extension
        if file_path.suffix.lower() in ['.txt']:
            article_data = self.parse_text_article(file_path)
        elif file_path.suffix.lower() in ['.html', '.htm']:
            article_data = self.parse_html_article(file_path)
        else:
            print(f"Unsupported file type: {file_path.suffix}")
            return None
        
        if not article_data:
            return None
        
        # Categorize the article
        category_name = self.categorize_article(article_data)
        
        # Create event object
        event = {
            "id": f"news_{file_hash[:8]}",
            "title": article_data["title"],
            "summary": article_data["summary"],
            "date": article_data["date"],
            "region": "Global",  # Could be enhanced with location detection
            "casualties": None,  # Could be enhanced with casualty extraction
            "source": article_data["source"],
            "sourceUrl": article_data["sourceUrl"],
            "type": "news_article",
            "originalTimestamp": None,
            "processedTimestamp": datetime.now().isoformat(),
            "tags": ["news", "recent"]
        }
        
        # Add to processed list
        self.processed_articles["processed"].append({
            "filename": file_path.name,
            "hash": file_hash,
            "processed_at": datetime.now().isoformat(),
            "category": category_name
        })
        
        return {"event": event, "category": category_name}
    
    def add_event_to_data(self, event: Dict, category_name: str):
        """Add an event to the appropriate category in the data structure"""
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
        self.data["metadata"]["newsArticlesCount"] += 1
        self.data["metadata"]["totalCategories"] = len(self.data["categories"])
        self.data["metadata"]["lastUpdated"] = datetime.now().isoformat()
    
    def save_data(self):
        """Save the updated data to JSON files"""
        with open(self.json_file, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, indent=2, ensure_ascii=False)
        
        with open(self.processed_file, 'w', encoding='utf-8') as f:
            json.dump(self.processed_articles, f, indent=2, ensure_ascii=False)
    
    def process_all_articles(self):
        """Process all articles in the news folder"""
        if not self.news_folder.exists():
            print(f"News folder {self.news_folder} does not exist")
            return
        
        processed_count = 0
        
        # Process all supported files
        for file_path in self.news_folder.iterdir():
            if file_path.is_file() and file_path.suffix.lower() in ['.txt', '.html', '.htm']:
                result = self.process_article(file_path)
                if result:
                    self.add_event_to_data(result["event"], result["category"])
                    processed_count += 1
        
        if processed_count > 0:
            self.save_data()
            print(f"Successfully processed {processed_count} new articles")
        else:
            print("No new articles to process")

def main():
    parser = argparse.ArgumentParser(description="Process news articles for US Atrocities Treemap")
    parser.add_argument("--watch", action="store_true", help="Watch folder for changes (not implemented yet)")
    parser.add_argument("--news-folder", default="news", help="Path to news articles folder")
    parser.add_argument("--data-folder", default="data", help="Path to data output folder")
    
    args = parser.parse_args()
    
    processor = ArticleProcessor(args.news_folder, args.data_folder)
    
    if args.watch:
        print("Watch mode not implemented yet. Processing existing articles...")
    
    processor.process_all_articles()

if __name__ == "__main__":
    main()