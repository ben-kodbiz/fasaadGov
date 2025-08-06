"""
Unit tests for TextPreprocessor class.

Tests cover HTML cleaning, text normalization, language detection,
and input validation functionality.
"""

import unittest
from pipeline.nlp.text_preprocessor import TextPreprocessor


class TestTextPreprocessor(unittest.TestCase):
    """Test cases for TextPreprocessor class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.preprocessor = TextPreprocessor()
    
    def test_clean_html_basic(self):
        """Test basic HTML tag removal."""
        html_content = "<p>This is a <strong>test</strong> paragraph.</p>"
        expected = "This is a test paragraph."
        result = self.preprocessor.clean_html(html_content)
        self.assertEqual(result, expected)
    
    def test_clean_html_with_scripts(self):
        """Test removal of script and style tags."""
        html_content = """
        <html>
            <head>
                <script>alert('malicious');</script>
                <style>body { color: red; }</style>
            </head>
            <body>
                <p>Clean content</p>
            </body>
        </html>
        """
        result = self.preprocessor.clean_html(html_content)
        self.assertNotIn("alert", result)
        self.assertNotIn("color: red", result)
        self.assertIn("Clean content", result)
    
    def test_clean_html_entities(self):
        """Test HTML entity decoding."""
        html_content = "<p>This &amp; that &lt;test&gt; &quot;quote&quot;</p>"
        expected = 'This & that <test> "quote"'
        result = self.preprocessor.clean_html(html_content)
        self.assertEqual(result, expected)
    
    def test_clean_html_empty_input(self):
        """Test handling of empty or None input."""
        self.assertEqual(self.preprocessor.clean_html(""), "")
        self.assertEqual(self.preprocessor.clean_html(None), "")
    
    def test_normalize_text_whitespace(self):
        """Test whitespace normalization."""
        text = "This   has    multiple   spaces\n\n\nand\t\ttabs"
        result = self.preprocessor.normalize_text(text)
        self.assertNotIn("   ", result)  # No triple spaces
        self.assertNotIn("\t\t", result)  # No double tabs
        self.assertIn("multiple spaces", result)
    
    def test_normalize_text_unicode(self):
        """Test Unicode normalization."""
        text = "Café naïve résumé"  # Text with accented characters
        result = self.preprocessor.normalize_text(text)
        self.assertIsInstance(result, str)
        self.assertTrue(len(result) > 0)
    
    def test_normalize_text_line_endings(self):
        """Test line ending normalization."""
        text = "Line 1\r\nLine 2\r\nLine 3"
        result = self.preprocessor.normalize_text(text)
        self.assertNotIn("\r\n", result)
        self.assertIn("Line 1\nLine 2\nLine 3", result)
    
    def test_detect_language_english(self):
        """Test English language detection."""
        text = "This is a sample English text with many English words."
        result = self.preprocessor.detect_language(text)
        self.assertEqual(result, 'en')
    
    def test_detect_language_arabic(self):
        """Test Arabic language detection."""
        text = "هذا نص تجريبي باللغة العربية"
        result = self.preprocessor.detect_language(text)
        self.assertEqual(result, 'ar')
    
    def test_detect_language_hebrew(self):
        """Test Hebrew language detection."""
        text = "זהו טקסט לדוגמה בעברית"
        result = self.preprocessor.detect_language(text)
        self.assertEqual(result, 'he')
    
    def test_detect_language_mixed(self):
        """Test mixed language content."""
        text = "This is English text with some Arabic: مرحبا"
        result = self.preprocessor.detect_language(text)
        # Should detect English as primary language
        self.assertEqual(result, 'en')
    
    def test_detect_language_empty(self):
        """Test language detection with empty input."""
        result = self.preprocessor.detect_language("")
        self.assertEqual(result, 'en')  # Default fallback
    
    def test_preprocess_complete_pipeline(self):
        """Test complete preprocessing pipeline."""
        html_text = """
        <html>
            <body>
                <h1>Article Title</h1>
                <p>This is a <strong>sample</strong> article with HTML.</p>
                <script>alert('test');</script>
            </body>
        </html>
        """
        
        result = self.preprocessor.preprocess(html_text, source_type='html')
        
        # Check structure
        self.assertIn('processed_text', result)
        self.assertIn('original_length', result)
        self.assertIn('processed_length', result)
        self.assertIn('language', result)
        self.assertIn('preprocessing_steps', result)
        
        # Check content
        self.assertIn('Article Title', result['processed_text'])
        self.assertIn('sample article', result['processed_text'])
        self.assertNotIn('<html>', result['processed_text'])
        self.assertNotIn('alert', result['processed_text'])
        
        # Check metadata
        self.assertEqual(result['language'], 'en')
        self.assertIn('html_cleaning', result['preprocessing_steps'])
        self.assertIn('text_normalization', result['preprocessing_steps'])
        self.assertIn('language_detection', result['preprocessing_steps'])
    
    def test_preprocess_plain_text(self):
        """Test preprocessing of plain text."""
        text = "This is plain text   with   extra spaces."
        result = self.preprocessor.preprocess(text, source_type='text')
        
        self.assertEqual(result['source_type'], 'text')
        self.assertNotIn('html_cleaning', result['preprocessing_steps'])
        self.assertIn('text_normalization', result['preprocessing_steps'])
    
    def test_validate_input_valid(self):
        """Test input validation with valid text."""
        text = "This is a valid article text."
        result = self.preprocessor.validate_input(text)
        
        self.assertTrue(result['is_valid'])
        self.assertEqual(len(result['errors']), 0)
        self.assertEqual(result['text_length'], len(text))
    
    def test_validate_input_empty(self):
        """Test input validation with empty text."""
        result = self.preprocessor.validate_input("")
        
        self.assertFalse(result['is_valid'])
        self.assertIn('Empty text provided', result['errors'])
    
    def test_validate_input_too_long(self):
        """Test input validation with text exceeding length limit."""
        long_text = "a" * 60000  # Exceeds default 50,000 limit
        result = self.preprocessor.validate_input(long_text)
        
        self.assertFalse(result['is_valid'])
        self.assertTrue(any('exceeds maximum' in error for error in result['errors']))
    
    def test_validate_input_suspicious_content(self):
        """Test input validation with suspicious script content."""
        text = "Normal text with <script>alert('test')</script> embedded."
        result = self.preprocessor.validate_input(text)
        
        # Should still be valid but with warnings
        self.assertTrue(result['is_valid'])
        self.assertTrue(any('script tags' in warning for warning in result['warnings']))
    
    def test_preprocess_empty_input(self):
        """Test preprocessing with empty input."""
        result = self.preprocessor.preprocess("")
        
        self.assertEqual(result['processed_text'], '')
        self.assertEqual(result['original_length'], 0)
        self.assertEqual(result['processed_length'], 0)
        self.assertEqual(result['language'], 'en')


if __name__ == '__main__':
    unittest.main()