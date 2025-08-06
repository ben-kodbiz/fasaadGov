"""
Text preprocessing module for article processing pipeline.

This module provides the TextPreprocessor class for cleaning and normalizing
text input from various sources including HTML, PDF, and plain text.
"""

import re
import html
import unicodedata
from typing import Optional, Dict, Any
from bs4 import BeautifulSoup
import spacy
from spacy.lang.en import English
from spacy.lang.ar import Arabic
from spacy.lang.he import Hebrew


class TextPreprocessor:
    """
    Handles text preprocessing including HTML cleaning, normalization,
    and language detection for the article processing pipeline.
    """
    
    def __init__(self):
        """Initialize the TextPreprocessor with language models."""
        self.supported_languages = {
            'en': 'English',
            'ar': 'Arabic', 
            'he': 'Hebrew'
        }
        
        # Initialize lightweight language detection models
        self._lang_models = {}
        try:
            # Load lightweight models for language detection
            self._lang_models['en'] = English()
            self._lang_models['ar'] = Arabic()
            self._lang_models['he'] = Hebrew()
        except OSError as e:
            print(f"Warning: Some language models not available: {e}")
            # Fallback to English only
            self._lang_models['en'] = English()
    
    def clean_html(self, html_content: str) -> str:
        """
        Remove HTML tags and decode HTML entities from content.
        
        Args:
            html_content: Raw HTML content string
            
        Returns:
            Clean text with HTML tags removed and entities decoded
        """
        if not html_content or not isinstance(html_content, str):
            return ""
        
        try:
            # Parse HTML with BeautifulSoup
            soup = BeautifulSoup(html_content, 'lxml')
            
            # Remove script and style elements completely
            for script in soup(["script", "style", "meta", "link"]):
                script.decompose()
            
            # Get text content
            text = soup.get_text()
            
            # Decode HTML entities
            text = html.unescape(text)
            
            # Clean up whitespace
            text = re.sub(r'\s+', ' ', text)
            text = text.strip()
            
            return text
            
        except Exception as e:
            print(f"Error cleaning HTML: {e}")
            # Fallback: basic tag removal
            text = re.sub(r'<[^>]+>', '', html_content)
            text = html.unescape(text)
            return re.sub(r'\s+', ' ', text).strip()
    
    def normalize_text(self, text: str) -> str:
        """
        Normalize text by handling encoding, whitespace, and special characters.
        
        Args:
            text: Raw text string
            
        Returns:
            Normalized text string
        """
        if not text or not isinstance(text, str):
            return ""
        
        try:
            # Normalize Unicode characters (NFD normalization)
            text = unicodedata.normalize('NFD', text)
            
            # Remove control characters but keep newlines and tabs
            text = ''.join(char for char in text 
                          if unicodedata.category(char) != 'Cc' 
                          or char in '\n\t\r')
            
            # Normalize whitespace
            text = re.sub(r'[ \t]+', ' ', text)  # Multiple spaces/tabs to single space
            text = re.sub(r'\n\s*\n', '\n\n', text)  # Multiple newlines to double newline
            text = re.sub(r'\r\n', '\n', text)  # Windows line endings to Unix
            
            # Remove excessive whitespace at start/end of lines
            lines = text.split('\n')
            lines = [line.strip() for line in lines]
            text = '\n'.join(lines)
            
            # Remove leading/trailing whitespace
            text = text.strip()
            
            return text
            
        except Exception as e:
            print(f"Error normalizing text: {e}")
            # Fallback: basic whitespace cleanup
            return re.sub(r'\s+', ' ', text).strip()
    
    def detect_language(self, text: str) -> str:
        """
        Detect the primary language of the text using spaCy.
        
        Args:
            text: Text to analyze for language detection
            
        Returns:
            Language code ('en', 'ar', 'he') or 'en' as fallback
        """
        if not text or not isinstance(text, str):
            return 'en'
        
        # Use first 1000 characters for language detection
        sample_text = text[:1000].strip()
        if not sample_text:
            return 'en'
        
        try:
            # Simple heuristic-based detection
            language_scores = {}
            
            # Check for Arabic characters
            arabic_chars = len(re.findall(r'[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]', sample_text))
            if arabic_chars > 0:
                language_scores['ar'] = arabic_chars / len(sample_text)
            
            # Check for Hebrew characters
            hebrew_chars = len(re.findall(r'[\u0590-\u05FF]', sample_text))
            if hebrew_chars > 0:
                language_scores['he'] = hebrew_chars / len(sample_text)
            
            # Check for Latin characters (English and other Latin-based languages)
            latin_chars = len(re.findall(r'[a-zA-Z]', sample_text))
            if latin_chars > 0:
                language_scores['en'] = latin_chars / len(sample_text)
            
            # Return language with highest score, minimum threshold of 10%
            if language_scores:
                best_lang = max(language_scores.items(), key=lambda x: x[1])
                if best_lang[1] > 0.1:  # At least 10% of characters match
                    return best_lang[0]
            
            # Fallback to English
            return 'en'
            
        except Exception as e:
            print(f"Error detecting language: {e}")
            return 'en'
    
    def preprocess(self, text: str, source_type: str = 'text') -> Dict[str, Any]:
        """
        Complete preprocessing pipeline for input text.
        
        Args:
            text: Raw input text
            source_type: Type of source ('text', 'html', 'pdf')
            
        Returns:
            Dictionary containing processed text and metadata
        """
        if not text:
            return {
                'processed_text': '',
                'original_length': 0,
                'processed_length': 0,
                'language': 'en',
                'source_type': source_type,
                'preprocessing_steps': []
            }
        
        preprocessing_steps = []
        original_length = len(text)
        
        # Step 1: HTML cleaning if needed
        if source_type == 'html' or '<' in text:
            text = self.clean_html(text)
            preprocessing_steps.append('html_cleaning')
        
        # Step 2: Text normalization
        text = self.normalize_text(text)
        preprocessing_steps.append('text_normalization')
        
        # Step 3: Language detection
        detected_language = self.detect_language(text)
        preprocessing_steps.append('language_detection')
        
        processed_length = len(text)
        
        return {
            'processed_text': text,
            'original_length': original_length,
            'processed_length': processed_length,
            'language': detected_language,
            'source_type': source_type,
            'preprocessing_steps': preprocessing_steps,
            'compression_ratio': processed_length / original_length if original_length > 0 else 0
        }
    
    def validate_input(self, text: str, max_length: int = 50000) -> Dict[str, Any]:
        """
        Validate input text for processing constraints.
        
        Args:
            text: Input text to validate
            max_length: Maximum allowed text length
            
        Returns:
            Dictionary with validation results
        """
        validation_result = {
            'is_valid': True,
            'errors': [],
            'warnings': [],
            'text_length': len(text) if text else 0
        }
        
        # Check if text exists
        if not text:
            validation_result['is_valid'] = False
            validation_result['errors'].append('Empty text provided')
            return validation_result
        
        # Check text length
        if len(text) > max_length:
            validation_result['is_valid'] = False
            validation_result['errors'].append(f'Text length ({len(text)}) exceeds maximum ({max_length})')
        
        # Check for suspicious content patterns
        if len(re.findall(r'<script', text, re.IGNORECASE)) > 0:
            validation_result['warnings'].append('Potential script tags detected')
        
        # Check encoding issues
        try:
            text.encode('utf-8')
        except UnicodeEncodeError:
            validation_result['warnings'].append('Text contains encoding issues')
        
        return validation_result