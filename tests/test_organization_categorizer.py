"""
Unit tests for OrganizationCategorizer class.

Tests cover sector classification, manual overrides, validation,
and batch processing functionality.
"""

import unittest
import tempfile
import json
import os
from pipeline.nlp.organization_categorizer import OrganizationCategorizer


class TestOrganizationCategorizer(unittest.TestCase):
    """Test cases for OrganizationCategorizer class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.categorizer = OrganizationCategorizer()
    
    def test_categorize_by_company_name(self):
        """Test categorization by known company names."""
        # Test military company
        result = self.categorizer.categorize_organization("Raytheon")
        self.assertEqual(result['category'], 'military')
        self.assertGreater(result['confidence'], 0.8)
        self.assertEqual(result['method'], 'company_name_match')
        
        # Test technology company
        result = self.categorizer.categorize_organization("Microsoft")
        self.assertEqual(result['category'], 'technology')
        self.assertGreater(result['confidence'], 0.8)
        
        # Test finance company
        result = self.categorizer.categorize_organization("Goldman Sachs")
        self.assertEqual(result['category'], 'finance')
        self.assertGreater(result['confidence'], 0.8)
    
    def test_categorize_by_keywords(self):
        """Test categorization by keyword analysis."""
        # Test military keywords
        result = self.categorizer.categorize_organization(
            "Defense Solutions Inc", 
            "A defense contractor specializing in missile systems"
        )
        self.assertEqual(result['category'], 'military')
        self.assertGreater(result['confidence'], 0.3)
        
        # Test technology keywords
        result = self.categorizer.categorize_organization(
            "AI Systems Corp", 
            "Artificial intelligence and machine learning solutions"
        )
        self.assertEqual(result['category'], 'technology')
        self.assertGreater(result['confidence'], 0.3)
        
        # Test finance keywords
        result = self.categorizer.categorize_organization(
            "Capital Management LLC", 
            "Investment fund and asset management services"
        )
        self.assertEqual(result['category'], 'finance')
        self.assertGreater(result['confidence'], 0.3)
    
    def test_categorize_by_patterns(self):
        """Test categorization by pattern matching."""
        # Test defense contractor pattern
        result = self.categorizer.categorize_organization(
            "Advanced Defense Corp", 
            "A military contractor providing weapons systems"
        )
        self.assertEqual(result['category'], 'military')
        
        # Test tech company pattern
        result = self.categorizer.categorize_organization(
            "DataTech Solutions", 
            "A software company developing AI algorithms"
        )
        self.assertEqual(result['category'], 'technology')
    
    def test_manual_overrides(self):
        """Test manual categorization overrides."""
        # Add manual override
        success = self.categorizer.add_manual_override(
            "Test Company", "military", "Manual classification for testing"
        )
        self.assertTrue(success)
        
        # Test override is applied
        result = self.categorizer.categorize_organization("Test Company")
        self.assertEqual(result['category'], 'military')
        self.assertEqual(result['confidence'], 1.0)
        self.assertEqual(result['method'], 'manual_override')
        
        # Remove override
        removed = self.categorizer.remove_manual_override("Test Company")
        self.assertTrue(removed)
        
        # Test override is removed
        result = self.categorizer.categorize_organization("Test Company")
        self.assertNotEqual(result['method'], 'manual_override')
    
    def test_invalid_category_override(self):
        """Test that invalid categories are rejected for overrides."""
        success = self.categorizer.add_manual_override(
            "Test Company", "invalid_category", "Should fail"
        )
        self.assertFalse(success)
    
    def test_batch_categorization(self):
        """Test batch categorization of multiple organizations."""
        organizations = [
            {'name': 'Raytheon', 'context': 'Defense contractor'},
            {'name': 'Microsoft', 'context': 'Software company'},
            {'name': 'Goldman Sachs', 'context': 'Investment bank'},
            {'name': 'Unknown Corp', 'context': 'No clear indicators'}
        ]
        
        categorized = self.categorizer.categorize_organizations_batch(organizations)
        
        self.assertEqual(len(categorized), 4)
        
        # Check that categorization fields are added
        for org in categorized:
            self.assertIn('category', org)
            self.assertIn('category_confidence', org)
            self.assertIn('category_reasoning', org)
            self.assertIn('category_method', org)
            self.assertIn('validation', org)
        
        # Check specific categorizations
        raytheon = next(org for org in categorized if org['name'] == 'Raytheon')
        self.assertEqual(raytheon['category'], 'military')
        
        microsoft = next(org for org in categorized if org['name'] == 'Microsoft')
        self.assertEqual(microsoft['category'], 'technology')
    
    def test_confidence_threshold(self):
        """Test confidence threshold filtering."""
        # Test with high threshold
        result = self.categorizer.categorize_organization(
            "Vague Corp", "Some business activities", confidence_threshold=0.8
        )
        # Should default to 'other' if confidence is too low
        self.assertEqual(result['category'], 'other')
        
        # Test with low threshold
        result = self.categorizer.categorize_organization(
            "Tech Solutions", "Software development", confidence_threshold=0.1
        )
        # Should categorize as technology
        self.assertEqual(result['category'], 'technology')
    
    def test_category_statistics(self):
        """Test category statistics generation."""
        organizations = [
            {'name': 'Raytheon', 'category': 'military', 'category_confidence': 0.9, 'category_method': 'company_name_match'},
            {'name': 'Microsoft', 'category': 'technology', 'category_confidence': 0.8, 'category_method': 'company_name_match'},
            {'name': 'Unknown Corp', 'category': 'other', 'category_confidence': 0.2, 'category_method': 'default'}
        ]
        
        stats = self.categorizer.get_category_statistics(organizations)
        
        self.assertEqual(stats['total_organizations'], 3)
        self.assertEqual(stats['category_distribution']['military'], 1)
        self.assertEqual(stats['category_distribution']['technology'], 1)
        self.assertEqual(stats['category_distribution']['other'], 1)
        self.assertGreater(stats['average_confidence'], 0.0)
    
    def test_validation(self):
        """Test categorization validation."""
        # Test valid categorization
        result = self.categorizer.categorize_organization("Raytheon")
        validation = result['validation']
        self.assertTrue(validation['is_valid'])
        self.assertEqual(len(validation['issues']), 0)
        
        # Test low confidence warning
        result = self.categorizer.categorize_organization("Vague Corp", confidence_threshold=0.0)
        validation = result['validation']
        if result['confidence'] < 0.3:
            self.assertIn('Low confidence categorization', validation['warnings'])
    
    def test_export_import_overrides(self):
        """Test exporting and importing manual overrides."""
        # Add some overrides
        self.categorizer.add_manual_override("Company A", "military", "Test override 1")
        self.categorizer.add_manual_override("Company B", "technology", "Test override 2")
        
        # Export to temporary file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            temp_path = f.name
        
        try:
            # Export overrides
            success = self.categorizer.export_overrides(temp_path)
            self.assertTrue(success)
            
            # Create new categorizer and import
            new_categorizer = OrganizationCategorizer()
            success = new_categorizer.import_overrides(temp_path)
            self.assertTrue(success)
            
            # Test that overrides were imported
            result = new_categorizer.categorize_organization("Company A")
            self.assertEqual(result['category'], 'military')
            self.assertEqual(result['method'], 'manual_override')
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
    
    def test_combined_categorization(self):
        """Test combination of multiple categorization methods."""
        # Test organization that matches both company name and keywords
        result = self.categorizer.categorize_organization(
            "Lockheed Martin", 
            "Defense contractor specializing in aerospace and military systems"
        )
        
        # Should have high confidence due to multiple matching methods
        self.assertEqual(result['category'], 'military')
        self.assertGreater(result['confidence'], 0.6)
        
        # Check that it used combined method or high-confidence single method
        self.assertIn(result['method'], ['company_name_match', 'combined'])
    
    def test_subcategories(self):
        """Test subcategory assignment in manual overrides."""
        # Add override with subcategories
        success = self.categorizer.add_manual_override(
            "Specialized Defense Corp", 
            "military", 
            "Specialized defense contractor",
            subcategories=['aerospace', 'cybersecurity']
        )
        self.assertTrue(success)
        
        # Test subcategories are included
        result = self.categorizer.categorize_organization("Specialized Defense Corp")
        self.assertEqual(result['subcategories'], ['aerospace', 'cybersecurity'])
    
    def test_edge_cases(self):
        """Test edge cases and error handling."""
        # Test empty organization name
        result = self.categorizer.categorize_organization("")
        self.assertEqual(result['category'], 'other')
        
        # Test None organization name
        result = self.categorizer.categorize_organization(None)
        self.assertEqual(result['category'], 'other')
        
        # Test very long organization name
        long_name = "A" * 1000
        result = self.categorizer.categorize_organization(long_name)
        self.assertIsInstance(result, dict)
        self.assertIn('category', result)
    
    def test_case_insensitive_matching(self):
        """Test that matching is case insensitive."""
        # Test different cases
        result1 = self.categorizer.categorize_organization("RAYTHEON")
        result2 = self.categorizer.categorize_organization("raytheon")
        result3 = self.categorizer.categorize_organization("Raytheon")
        
        # All should categorize as military
        self.assertEqual(result1['category'], 'military')
        self.assertEqual(result2['category'], 'military')
        self.assertEqual(result3['category'], 'military')
    
    def test_partial_name_matching(self):
        """Test partial name matching for known companies."""
        # Test partial matches
        result = self.categorizer.categorize_organization("Raytheon Technologies")
        self.assertEqual(result['category'], 'military')
        
        result = self.categorizer.categorize_organization("Microsoft Corporation")
        self.assertEqual(result['category'], 'technology')
    
    def test_multiple_sector_indicators(self):
        """Test handling of organizations with multiple sector indicators."""
        # Test organization with both tech and finance indicators
        result = self.categorizer.categorize_organization(
            "FinTech Solutions", 
            "Financial technology company providing banking software"
        )
        
        # Should categorize (likely as technology due to 'tech' in name)
        self.assertIn(result['category'], ['technology', 'finance'])
        self.assertGreater(result['confidence'], 0.0)


if __name__ == '__main__':
    unittest.main()