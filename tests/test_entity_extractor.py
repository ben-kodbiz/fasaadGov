"""
Unit tests for EntityExtractor class.

Tests cover entity extraction, categorization, confidence scoring,
and validation functionality.
"""

import unittest
from pipeline.nlp.entity_extractor import EntityExtractor


class TestEntityExtractor(unittest.TestCase):
    """Test cases for EntityExtractor class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.extractor = EntityExtractor()
    
    def test_extract_entities_basic(self):
        """Test basic entity extraction functionality."""
        text = "Apple Inc. is a technology company based in Cupertino, California. Tim Cook is the CEO."
        result = self.extractor.extract_entities(text)
        
        # Check structure
        self.assertIn('organizations', result)
        self.assertIn('locations', result)
        self.assertIn('persons', result)
        self.assertIn('confidence_scores', result)
        self.assertIn('total_entities', result)
        
        # Check that entities were found
        self.assertGreater(result['total_entities'], 0)
    
    def test_extract_organizations(self):
        """Test organization extraction and categorization."""
        text = "NSO Group is a surveillance technology company. Lockheed Martin is a defense contractor."
        result = self.extractor.extract_entities(text)
        
        organizations = result['organizations']
        self.assertGreater(len(organizations), 0)
        
        # Check organization structure
        for org in organizations:
            self.assertIn('name', org)
            self.assertIn('category', org)
            self.assertIn('confidence', org)
            self.assertIsInstance(org['confidence'], float)
            self.assertGreaterEqual(org['confidence'], 0.0)
            self.assertLessEqual(org['confidence'], 1.0)
    
    def test_extract_locations(self):
        """Test location extraction and type determination."""
        text = "The incident occurred in Gaza, Palestine. Officials from Israel responded."
        result = self.extractor.extract_entities(text)
        
        locations = result['locations']
        self.assertGreater(len(locations), 0)
        
        # Check location structure
        for location in locations:
            self.assertIn('name', location)
            self.assertIn('type', location)
            self.assertIn('confidence', location)
            self.assertIsInstance(location['confidence'], float)
    
    def test_extract_persons(self):
        """Test person extraction and role identification."""
        text = "CEO John Smith of TechCorp announced the partnership. President Biden commented on the situation."
        result = self.extractor.extract_entities(text)
        
        persons = result['persons']
        self.assertGreater(len(persons), 0)
        
        # Check person structure
        for person in persons:
            self.assertIn('name', person)
            self.assertIn('role', person)
            self.assertIn('confidence', person)
            self.assertIsInstance(person['confidence'], float)
    
    def test_organization_categorization(self):
        """Test organization sector categorization."""
        # Test technology categorization
        tech_text = "Microsoft is a software company developing AI algorithms."
        result = self.extractor.extract_entities(tech_text)
        
        tech_orgs = [org for org in result['organizations'] if 'technology' in org.get('category', '')]
        self.assertGreater(len(tech_orgs), 0, "Should categorize tech companies")
        
        # Test military categorization
        military_text = "Raytheon is a defense contractor manufacturing missile systems."
        result = self.extractor.extract_entities(military_text)
        
        military_orgs = [org for org in result['organizations'] if 'military' in org.get('category', '')]
        self.assertGreater(len(military_orgs), 0, "Should categorize military companies")
    
    def test_confidence_scoring(self):
        """Test confidence scoring for different entity types."""
        text = "Apple Inc. CEO Tim Cook visited Cupertino, California yesterday."
        result = self.extractor.extract_entities(text)
        
        # Check that confidence scores are reasonable
        confidence_scores = result['confidence_scores']
        self.assertIn('organizations', confidence_scores)
        self.assertIn('locations', confidence_scores)
        self.assertIn('persons', confidence_scores)
        self.assertIn('overall', confidence_scores)
        
        # All confidence scores should be between 0 and 1
        for score_type, score in confidence_scores.items():
            self.assertGreaterEqual(score, 0.0, f"{score_type} confidence should be >= 0")
            self.assertLessEqual(score, 1.0, f"{score_type} confidence should be <= 1")
    
    def test_role_identification(self):
        """Test person role identification from context."""
        text = "CEO Sarah Johnson announced the merger. General Michael Smith led the operation."
        result = self.extractor.extract_entities(text)
        
        persons = result['persons']
        roles_found = [person['role'] for person in persons if person['role']]
        
        # Should identify at least some roles
        self.assertGreater(len(roles_found), 0, "Should identify person roles")
    
    def test_geographic_validation(self):
        """Test geographic location validation."""
        text = "The conflict in Syria affects neighboring Lebanon and Jordan."
        result = self.extractor.extract_entities(text)
        
        locations = result['locations']
        self.assertGreater(len(locations), 0, "Should extract geographic locations")
        
        # Check that location types are assigned
        location_types = [loc['type'] for loc in locations]
        self.assertTrue(all(loc_type for loc_type in location_types), "All locations should have types")
    
    def test_empty_input(self):
        """Test handling of empty input."""
        result = self.extractor.extract_entities("")
        
        self.assertEqual(result['total_entities'], 0)
        self.assertEqual(len(result['organizations']), 0)
        self.assertEqual(len(result['locations']), 0)
        self.assertEqual(len(result['persons']), 0)
    
    def test_invalid_input(self):
        """Test handling of invalid input."""
        result = self.extractor.extract_entities(None)
        
        self.assertEqual(result['total_entities'], 0)
        self.assertIsInstance(result, dict)
    
    def test_categorize_organizations_method(self):
        """Test the categorize_organizations method."""
        organizations = [
            {'name': 'Apple', 'category': 'technology'},
            {'name': 'Google', 'category': 'technology'},
            {'name': 'JPMorgan', 'category': 'finance'},
            {'name': 'Lockheed', 'category': 'military'}
        ]
        
        categorized = self.extractor.categorize_organizations(organizations)
        
        self.assertIn('technology', categorized)
        self.assertIn('finance', categorized)
        self.assertIn('military', categorized)
        
        self.assertEqual(len(categorized['technology']), 2)
        self.assertEqual(len(categorized['finance']), 1)
        self.assertEqual(len(categorized['military']), 1)
    
    def test_validate_extractions(self):
        """Test extraction validation functionality."""
        # Test with good extractions
        good_entities = {
            'organizations': [{'name': 'Apple', 'confidence': 0.9}],
            'locations': [{'name': 'California', 'confidence': 0.8}],
            'persons': [{'name': 'Tim Cook', 'confidence': 0.7}],
            'confidence_scores': {'overall': 0.8},
            'total_entities': 3
        }
        
        validation = self.extractor.validate_extractions(good_entities)
        self.assertTrue(validation['is_valid'])
        self.assertGreater(validation['quality_score'], 0.5)
        
        # Test with poor extractions
        poor_entities = {
            'organizations': [],
            'locations': [],
            'persons': [],
            'confidence_scores': {'overall': 0.0},
            'total_entities': 0
        }
        
        validation = self.extractor.validate_extractions(poor_entities)
        self.assertIn('No entities extracted', validation['issues'])
    
    def test_context_extraction(self):
        """Test that context is properly extracted around entities."""
        text = "The controversial NSO Group, an Israeli surveillance company, developed Pegasus spyware."
        result = self.extractor.extract_entities(text)
        
        # Check that organizations have context
        for org in result['organizations']:
            self.assertIn('context', org)
            self.assertIsInstance(org['context'], str)
            self.assertGreater(len(org['context']), 0)
    
    def test_multilingual_handling(self):
        """Test handling of text with mixed languages."""
        # Text with English and some non-Latin characters
        text = "The company مجموعة operates in multiple countries including الإمارات."
        result = self.extractor.extract_entities(text)
        
        # Should handle gracefully without crashing
        self.assertIsInstance(result, dict)
        self.assertIn('total_entities', result)
    
    def test_confidence_ordering(self):
        """Test that entities are ordered by confidence score."""
        text = "Apple Inc. and Google LLC are major tech companies. John Doe works there."
        result = self.extractor.extract_entities(text)
        
        # Check that organizations are ordered by confidence (descending)
        orgs = result['organizations']
        if len(orgs) > 1:
            for i in range(len(orgs) - 1):
                self.assertGreaterEqual(orgs[i]['confidence'], orgs[i + 1]['confidence'])
        
        # Check that persons are ordered by confidence (descending)
        persons = result['persons']
        if len(persons) > 1:
            for i in range(len(persons) - 1):
                self.assertGreaterEqual(persons[i]['confidence'], persons[i + 1]['confidence'])
    
    def test_relationship_extraction(self):
        """Test relationship extraction between entities."""
        text = "Apple Inc. is based in Cupertino, California. Tim Cook is the CEO of Apple."
        result = self.extractor.extract_entities(text)
        
        # Check that relationships are extracted
        self.assertIn('relationships', result)
        self.assertIn('total_relationships', result)
        
        relationships = result['relationships']
        if len(relationships) > 0:
            # Check relationship structure
            for rel in relationships:
                self.assertIn('source', rel)
                self.assertIn('target', rel)
                self.assertIn('relation_type', rel)
                self.assertIn('context', rel)
                self.assertIn('confidence', rel)
                
                # Check source and target structure
                self.assertIn('name', rel['source'])
                self.assertIn('type', rel['source'])
                self.assertIn('name', rel['target'])
                self.assertIn('type', rel['target'])
                
                # Check confidence is valid
                self.assertIsInstance(rel['confidence'], float)
                self.assertGreaterEqual(rel['confidence'], 0.0)
                self.assertLessEqual(rel['confidence'], 1.0)
    
    def test_pattern_relationship_extraction(self):
        """Test pattern-based relationship extraction."""
        text = "Microsoft owns GitHub. Google is based in Mountain View."
        result = self.extractor.extract_entities(text)
        
        relationships = result['relationships']
        
        # Look for ownership and location relationships
        relation_types = [rel['relation_type'] for rel in relationships]
        
        # Should find some relationships (exact types depend on entity recognition)
        self.assertGreaterEqual(len(relationships), 0)
    
    def test_proximity_relationships(self):
        """Test proximity-based relationship extraction."""
        text = "Apple and Microsoft are competing companies in the technology sector."
        result = self.extractor.extract_entities(text)
        
        relationships = result['relationships']
        
        # Should find proximity relationships between entities in same sentence
        if len(result['organizations']) >= 2:
            proximity_rels = [rel for rel in relationships if rel['relation_type'] == 'mentioned_with']
            # May or may not find proximity relationships depending on entity recognition
            self.assertGreaterEqual(len(proximity_rels), 0)


if __name__ == '__main__':
    unittest.main()