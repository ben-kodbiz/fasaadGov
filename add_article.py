#!/usr/bin/env python3
"""
Quick script to add a news article to the treemap visualization.

Usage:
    python add_article.py "Article Title" "Article content here..." [--date YYYY-MM-DD] [--source "Source Name"]
"""

import argparse
import os
from datetime import datetime
from pathlib import Path
import subprocess

def create_article_file(title, content, date=None, source=None):
    """Create a new article file in the news folder"""
    
    # Use provided date or current date
    if not date:
        date = datetime.now().strftime('%Y-%m-%d')
    
    # Create filename from title and date
    safe_title = "".join(c for c in title if c.isalnum() or c in (' ', '-', '_')).rstrip()
    safe_title = safe_title.replace(' ', '_').lower()[:50]  # Limit length
    filename = f"{date}_{safe_title}.txt"
    
    # Create full article content
    full_content = f"{title}\n\n"
    if date:
        full_content += f"Date: {date}\n\n"
    full_content += content
    if source:
        full_content += f"\n\nSource: {source}"
    
    # Write to news folder
    news_folder = Path("news")
    news_folder.mkdir(exist_ok=True)
    
    file_path = news_folder / filename
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(full_content)
    
    print(f"Created article file: {file_path}")
    return file_path

def process_articles():
    """Run the article processing script"""
    try:
        result = subprocess.run(['python', 'scripts/process_articles.py'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("Successfully processed articles!")
            print(result.stdout)
        else:
            print("Error processing articles:")
            print(result.stderr)
    except Exception as e:
        print(f"Error running processing script: {e}")

def main():
    parser = argparse.ArgumentParser(description="Add a news article to the treemap")
    parser.add_argument("title", help="Article title")
    parser.add_argument("content", help="Article content")
    parser.add_argument("--date", help="Article date (YYYY-MM-DD)")
    parser.add_argument("--source", help="Article source")
    parser.add_argument("--no-process", action="store_true", 
                       help="Don't automatically process the article")
    
    args = parser.parse_args()
    
    # Create the article file
    file_path = create_article_file(args.title, args.content, args.date, args.source)
    
    # Process articles unless --no-process is specified
    if not args.no_process:
        print("\nProcessing articles...")
        process_articles()
    else:
        print(f"\nArticle created but not processed. Run 'python scripts/process_articles.py' to process.")

if __name__ == "__main__":
    main()