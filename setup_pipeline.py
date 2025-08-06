#!/usr/bin/env python3
"""
Setup script for the Article Pipeline.
Installs dependencies and downloads required models.
"""
import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and handle errors."""
    print(f"\n{description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✓ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def main():
    """Main setup function."""
    print("Setting up Article Pipeline...")
    
    # Install Python dependencies
    if not run_command("pip install -r requirements.txt", "Installing Python dependencies"):
        print("Failed to install dependencies. Please check your Python environment.")
        return False
    
    # Download spaCy model
    if not run_command("python -m spacy download en_core_web_sm", "Downloading spaCy English model"):
        print("Failed to download spaCy model. You may need to install it manually.")
        print("Run: python -m spacy download en_core_web_sm")
    
    # Create .env file if it doesn't exist
    if not os.path.exists('.env'):
        print("\nCreating .env file from template...")
        try:
            with open('.env.example', 'r') as template:
                with open('.env', 'w') as env_file:
                    env_file.write(template.read())
            print("✓ Created .env file. Please update it with your configuration.")
        except Exception as e:
            print(f"✗ Failed to create .env file: {e}")
    
    print("\n" + "="*50)
    print("Setup completed!")
    print("To start the pipeline, run: python run_pipeline.py")
    print("Or use: python -m pipeline.app")
    print("="*50)

if __name__ == '__main__':
    main()