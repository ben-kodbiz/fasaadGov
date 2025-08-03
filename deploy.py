#!/usr/bin/env python3
"""
GitHub Pages Deployment Script

This script processes new articles and deploys the updated treemap to GitHub Pages.
"""

import os
import sys
import subprocess
import json
from datetime import datetime
from pathlib import Path

class GitHubDeployer:
    def __init__(self):
        self.repo_root = Path.cwd()
        self.data_file = self.repo_root / "data" / "us_interventions.json"
        self.news_folder = self.repo_root / "news"
        
    def check_git_status(self):
        """Check if we're in a git repository"""
        try:
            result = subprocess.run(['git', 'status'], capture_output=True, text=True)
            return result.returncode == 0
        except FileNotFoundError:
            print("❌ Git not found. Please install Git first.")
            return False
    
    def process_articles(self):
        """Process new articles using existing scripts"""
        print("📄 Processing articles...")
        
        # Check if there are new articles
        if not self.news_folder.exists() or not any(self.news_folder.iterdir()):
            print("⚠️  No articles found in news/ folder")
            return False
        
        # Process markdown to JSON (historical data)
        markdown_script = self.repo_root / "scripts" / "markdown_to_json.py"
        if markdown_script.exists():
            print("📚 Processing historical data...")
            try:
                subprocess.run([sys.executable, str(markdown_script)], check=True)
                print("✅ Historical data processed")
            except subprocess.CalledProcessError:
                print("⚠️  Historical data processing failed, continuing...")
        
        # Process news articles
        articles_script = self.repo_root / "scripts" / "process_articles.py"
        if articles_script.exists():
            print("📰 Processing news articles...")
            try:
                subprocess.run([sys.executable, str(articles_script)], check=True)
                print("✅ News articles processed")
                return True
            except subprocess.CalledProcessError:
                print("❌ News articles processing failed")
                return False
        else:
            print("⚠️  Article processing script not found")
            return False
    
    def get_data_stats(self):
        """Get statistics about the current data"""
        if not self.data_file.exists():
            return {"totalEvents": 0, "totalCategories": 0}
        
        try:
            with open(self.data_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            metadata = data.get('metadata', {})
            return {
                "totalEvents": metadata.get('totalEvents', 0),
                "totalCategories": metadata.get('totalCategories', 0),
                "newsArticles": metadata.get('newsArticlesCount', 0),
                "historicalEvents": metadata.get('markdownEventsCount', 0)
            }
        except Exception as e:
            print(f"⚠️  Error reading data file: {e}")
            return {"totalEvents": 0, "totalCategories": 0}
    
    def create_nojekyll(self):
        """Create .nojekyll file for GitHub Pages"""
        nojekyll_file = self.repo_root / ".nojekyll"
        if not nojekyll_file.exists():
            nojekyll_file.touch()
            print("✅ Created .nojekyll file")
    
    def git_add_commit_push(self, stats):
        """Add, commit, and push changes to GitHub"""
        print("📤 Deploying to GitHub...")
        
        try:
            # Add all changes
            subprocess.run(['git', 'add', '.'], check=True)
            
            # Check if there are changes to commit
            result = subprocess.run(['git', 'diff', '--cached', '--quiet'], capture_output=True)
            if result.returncode == 0:
                print("ℹ️  No changes to commit")
                return True
            
            # Create commit message
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
            commit_msg = f"Update treemap data - {timestamp}\n\n"
            commit_msg += f"📊 Total Events: {stats['totalEvents']}\n"
            commit_msg += f"📂 Categories: {stats['totalCategories']}\n"
            commit_msg += f"📰 News Articles: {stats['newsArticles']}\n"
            commit_msg += f"📚 Historical Events: {stats['historicalEvents']}"
            
            # Commit changes
            subprocess.run(['git', 'commit', '-m', commit_msg], check=True)
            print("✅ Changes committed")
            
            # Push to GitHub
            subprocess.run(['git', 'push'], check=True)
            print("✅ Changes pushed to GitHub")
            
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Git operation failed: {e}")
            return False
    
    def get_github_pages_url(self):
        """Get the GitHub Pages URL for this repository"""
        try:
            # Get remote URL
            result = subprocess.run(['git', 'remote', 'get-url', 'origin'], 
                                  capture_output=True, text=True, check=True)
            remote_url = result.stdout.strip()
            
            # Parse GitHub username and repo name
            if 'github.com' in remote_url:
                if remote_url.startswith('https://'):
                    # https://github.com/username/repo.git
                    parts = remote_url.replace('https://github.com/', '').replace('.git', '').split('/')
                elif remote_url.startswith('git@'):
                    # git@github.com:username/repo.git
                    parts = remote_url.replace('git@github.com:', '').replace('.git', '').split('/')
                else:
                    return None
                
                if len(parts) >= 2:
                    username, repo = parts[0], parts[1]
                    return f"https://{username}.github.io/{repo}/"
            
            return None
            
        except subprocess.CalledProcessError:
            return None
    
    def deploy(self):
        """Main deployment function"""
        print("🚀 GitHub Pages Deployment")
        print("=" * 40)
        
        # Check git status
        if not self.check_git_status():
            return False
        
        # Process articles
        if not self.process_articles():
            print("❌ Article processing failed")
            return False
        
        # Get data statistics
        stats = self.get_data_stats()
        
        # Create .nojekyll file
        self.create_nojekyll()
        
        # Deploy to GitHub
        if not self.git_add_commit_push(stats):
            return False
        
        # Get GitHub Pages URL
        pages_url = self.get_github_pages_url()
        
        # Success message
        print("\n🎉 Deployment Successful!")
        print("=" * 40)
        print(f"📊 Total Events: {stats['totalEvents']}")
        print(f"📂 Categories: {stats['totalCategories']}")
        print(f"📰 News Articles: {stats['newsArticles']}")
        print(f"📚 Historical Events: {stats['historicalEvents']}")
        
        if pages_url:
            print(f"\n🌐 Live Site: {pages_url}")
            print("⏱️  Changes will be live in 1-5 minutes")
        else:
            print("\n⚠️  Could not determine GitHub Pages URL")
            print("   Check your repository settings to enable GitHub Pages")
        
        print("\n💡 Next Steps:")
        print("   1. Wait 1-5 minutes for GitHub Pages to update")
        print("   2. Visit your live site to see the changes")
        print("   3. Add more articles to news/ folder and run 'python deploy.py' again")
        
        return True

def main():
    """Main entry point"""
    deployer = GitHubDeployer()
    
    if len(sys.argv) > 1 and sys.argv[1] == '--help':
        print("GitHub Pages Deployment Script")
        print("Usage: python deploy.py")
        print("\nThis script will:")
        print("1. Process articles from news/ folder")
        print("2. Update the treemap data")
        print("3. Commit and push changes to GitHub")
        print("4. Deploy to GitHub Pages")
        return
    
    success = deployer.deploy()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()