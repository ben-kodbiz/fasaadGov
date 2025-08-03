#!/usr/bin/env python3
"""
GitHub Repository Setup Script

This script helps you set up the repository for GitHub Pages deployment.
"""

import subprocess
import sys
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e.stderr}")
        return False

def check_git_installed():
    """Check if git is installed"""
    try:
        subprocess.run(['git', '--version'], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def main():
    print("🚀 GitHub Pages Setup for US Atrocities Treemap")
    print("=" * 50)
    
    # Check if git is installed
    if not check_git_installed():
        print("❌ Git is not installed. Please install Git first:")
        print("   - Windows: https://git-scm.com/download/win")
        print("   - Mac: brew install git")
        print("   - Linux: sudo apt install git")
        return
    
    print("✅ Git is installed")
    
    # Check if already in a git repository
    if Path('.git').exists():
        print("ℹ️  Already in a git repository")
    else:
        # Initialize git repository
        if not run_command('git init', 'Initializing git repository'):
            return
    
    # Create initial commit if needed
    try:
        subprocess.run(['git', 'rev-parse', 'HEAD'], capture_output=True, check=True)
        print("ℹ️  Repository already has commits")
    except subprocess.CalledProcessError:
        # No commits yet, create initial commit
        if not run_command('git add .', 'Adding files to git'):
            return
        if not run_command('git commit -m "Initial commit: US Atrocities Treemap"', 'Creating initial commit'):
            return
    
    print("\n📋 Next Steps:")
    print("=" * 30)
    print("1. Create a new repository on GitHub:")
    print("   - Go to https://github.com/new")
    print("   - Repository name: fasaadGov")
    print("   - Make it public")
    print("   - Don't initialize with README (we already have files)")
    print()
    print("2. Connect your local repository to GitHub:")
    print("   git remote add origin https://github.com/ben-kodbiz/fasaadGov.git")
    print("   git branch -M main")
    print("   git push -u origin main")
    print()
    print("3. Enable GitHub Pages:")
    print("   - Go to your repository settings")
    print("   - Scroll to 'Pages' section")
    print("   - Source: Deploy from a branch")
    print("   - Branch: main / (root)")
    print("   - Save")
    print()
    print("4. Deploy your treemap:")
    print("   python deploy.py")
    print()
    print("5. Your live site will be at:")
    print("   https://YOUR_USERNAME.github.io/fasaadGov/")
    
    print("\n💡 Tips:")
    print("- Replace YOUR_USERNAME with your actual GitHub username")
    print("- It takes 1-5 minutes for GitHub Pages to update after pushing")
    print("- Add new articles to news/ folder and run 'python deploy.py' to update")

if __name__ == "__main__":
    main()