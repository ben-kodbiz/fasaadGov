"""
Entity extraction module for article processing pipeline.

This module provides the EntityExtractor class for extracting organizations,
locations, persons, and their relationships from processed text using spaCy.
"""

import re
from typing import Dict, List, Any, Optional, Tuple
import spacy
from spacy.tokens import Doc, Span
from collections import defaultdict, Counter
from .organization_categorizer import OrganizationCategorizer


class EntityExtractor:
    """
    Extracts entities and relationships from text using spaCy NLP models.
    
    Focuses on organizations, locations, persons, and their relationships
    for accountability and complicity analysis.
    """
    
    def __init__(self, model_name: str = "en_core_web_sm"):
        """
        Initialize the EntityExtractor with spaCy model.
        
        Args:
            model_name: Name of the spaCy model to use
        """
        self.model_name = model_name
        try:
            self.nlp = spacy.load(model_name)
        except OSError:
            print(f"Warning: Model {model_name} not found. Using blank English model.")
            self.nlp = spacy.blank("en")
        
        # Organization sector keywords for categorization
        self.sector_keywords = {
            'military': [
                'defense', 'military', 'army', 'navy', 'air force', 'marines',
                'weapons', 'arms', 'missile', 'tank', 'fighter', 'bomber',
                'surveillance', 'intelligence', 'security', 'contractor'
            ],
            'technology': [
                'tech', 'software', 'ai', 'artificial intelligence', 'cyber',
                'data', 'analytics', 'cloud', 'computing', 'digital',
                'platform', 'algorithm', 'spyware', 'malware'
            ],
            'finance': [
                'bank', 'financial', 'investment', 'fund', 'capital',
                'asset', 'equity', 'credit', 'loan', 'insurance',
                'trading', 'securities', 'hedge fund'
            ],
            'energy': [
                'oil', 'gas', 'petroleum', 'energy', 'coal', 'mining',
                'drilling', 'refinery', 'pipeline', 'fossil fuel',
                'renewable', 'solar', 'wind'
            ],
            'telecommunications': [
                'telecom', 'communications', 'network', 'internet',
                'mobile', 'cellular', 'broadband', 'fiber', 'satellite'
            ],
            'pharmaceutical': [
                'pharma', 'pharmaceutical', 'drug', 'medicine', 'healthcare',
                'biotech', 'medical', 'hospital', 'clinic'
            ],
            'media': [
                'media', 'news', 'broadcasting', 'television', 'radio',
                'newspaper', 'journalism', 'publishing', 'entertainment'
            ]
        }
        
        # Geographic validation patterns
        self.country_patterns = [
            r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b',  # Capitalized country names
        ]
        
        # Role identification patterns
        self.role_patterns = {
            'ceo': r'\b(?:ceo|chief executive officer)\b',
            'president': r'\b(?:president|pres\.?)\b',
            'director': r'\b(?:director|dir\.?)\b',
            'manager': r'\b(?:manager|mgr\.?)\b',
            'minister': r'\b(?:minister|min\.?)\b',
            'general': r'\b(?:general|gen\.?)\b',
            'colonel': r'\b(?:colonel|col\.?)\b',
            'admiral': r'\b(?:admiral|adm\.?)\b'
        }
        
        # Initialize organization categorizer
        self.org_categorizer = OrganizationCategorizer()
    
    def _setup_blank_model(self):
        """Set up pattern-based entity recognition for blank model."""
        from spacy.matcher import Matcher
        
        self.matcher = Matcher(self.nlp.vocab)
        
        # Add organization patterns
        org_patterns = [
            [{"TEXT": {"REGEX": r"^[A-Z][a-zA-Z]*$"}}, {"TEXT": {"REGEX": r"^(?:Inc|Corp|LLC|Ltd|Company|Group|Systems)\.?$"}}],
            [{"TEXT": "Microsoft"}],
            [{"TEXT": "Apple"}],
            [{"TEXT": "Google"}],
            [{"TEXT": "Raytheon"}],
            [{"TEXT": "Lockheed"}, {"TEXT": "Martin"}],
            [{"TEXT": "NSO"}, {"TEXT": "Group"}]
        ]
        self.matcher.add("ORG", org_patterns)
        
        # Add person patterns
        person_patterns = [
            [{"TEXT": {"REGEX": r"^[A-Z][a-z]+$"}}, {"TEXT": {"REGEX": r"^[A-Z][a-z]+$"}}],
            [{"TEXT": {"REGEX": r"^(?:Mr|Ms|Mrs|Dr)\.?$"}}, {"TEXT": {"REGEX": r"^[A-Z][a-z]+$"}}]
        ]
        self.matcher.add("PERSON", person_patterns)
        
        # Add location patterns
        location_patterns = [
            [{"TEXT": "California"}],
            [{"TEXT": "Gaza"}],
            [{"TEXT": "Palestine"}],
            [{"TEXT": "Israel"}],
            [{"TEXT": "Syria"}],
            [{"TEXT": "Lebanon"}],
            [{"TEXT": "Jordan"}],
            [{"TEXT": "Cupertino"}]
        ]
        self.matcher.add("GPE", location_patterns)
    
    def _add_pattern_entities(self, doc: Doc):
        """Add pattern-based entities to doc when using blank model."""
        matches = self.matcher(doc)
        
        # Create entity spans from matches
        entities = []
        for match_id, start, end in matches:
            label = self.nlp.vocab.strings[match_id]
            span = doc[start:end]
            entities.append((span.start_char, span.end_char, label))
        
        # Set entities on the doc
        from spacy.tokens import Span
        ents = []
        for start_char, end_char, label in entities:
            # Find token boundaries
            start_token = None
            end_token = None
            for i, token in enumerate(doc):
                if token.idx <= start_char < token.idx + len(token.text):
                    start_token = i
                if token.idx < end_char <= token.idx + len(token.text):
                    end_token = i + 1
                    break
            
            if start_token is not None and end_token is not None:
                ent = Span(doc, start_token, end_token, label=label)
                ents.append(ent)
        
        # Remove overlapping entities and set on doc
        doc.ents = list(set(ents))
    
    def extract_entities(self, text: str) -> Dict[str, Any]:
        """
        Extract all entities from text with confidence scoring.
        
        Args:
            text: Preprocessed text to analyze
            
        Returns:
            Dictionary containing extracted entities with confidence scores
        """
        if not text or not isinstance(text, str):
            return self._empty_extraction_result()
        
        try:
            # Process text with spaCy
            doc = self.nlp(text)
            
            # If using blank model, add pattern-based entities
            if hasattr(self, 'matcher'):
                self._add_pattern_entities(doc)
            
            # Extract different entity types
            organizations = self._extract_organizations(doc)
            locations = self._extract_locations(doc)
            persons = self._extract_persons(doc)
            
            # Extract relationships between entities
            relationships = self._extract_relationships(doc, organizations, locations, persons)
            
            # Calculate overall confidence scores
            confidence_scores = self._calculate_confidence_scores(
                organizations, locations, persons
            )
            
            return {
                'organizations': organizations,
                'locations': locations,
                'persons': persons,
                'relationships': relationships,
                'confidence_scores': confidence_scores,
                'total_entities': len(organizations) + len(locations) + len(persons),
                'total_relationships': len(relationships),
                'processing_metadata': {
                    'model_used': self.model_name,
                    'text_length': len(text),
                    'sentences_processed': len(list(doc.sents))
                }
            }
            
        except Exception as e:
            print(f"Error extracting entities: {e}")
            return self._empty_extraction_result()
    
    def _extract_organizations(self, doc: Doc) -> List[Dict[str, Any]]:
        """Extract organization entities with categorization."""
        organizations = []
        seen_orgs = set()
        
        # First, extract entities found by spaCy
        for ent in doc.ents:
            if ent.label_ in ['ORG', 'PERSON']:  # PERSON can sometimes be org names
                org_name = ent.text.strip()
                
                # Skip if already processed or too short
                if org_name.lower() in seen_orgs or len(org_name) < 3:
                    continue
                
                seen_orgs.add(org_name.lower())
                
                # Get context around the entity
                context = self._get_entity_context(ent, doc)
                
                # Categorize organization
                category = self._categorize_organization(org_name, context)
                
                # Calculate confidence based on various factors
                confidence = self._calculate_org_confidence(ent, context)
                
                organizations.append({
                    'name': org_name,
                    'category': category,
                    'confidence': confidence,
                    'context': context,
                    'start_char': ent.start_char,
                    'end_char': ent.end_char,
                    'label': ent.label_
                })
        
        # Second, look for known organizations that spaCy might have missed
        known_orgs = [
            'Raytheon', 'Lockheed Martin', 'Boeing', 'Northrop Grumman', 
            'General Dynamics', 'BAE Systems', 'Thales', 'Airbus',
            'NSO Group', 'Cellebrite', 'Palantir', 'Clearview AI'
        ]
        
        text_lower = doc.text.lower()
        for known_org in known_orgs:
            if known_org.lower() in text_lower and known_org.lower() not in seen_orgs:
                # Find the position in the text
                start_pos = text_lower.find(known_org.lower())
                if start_pos != -1:
                    end_pos = start_pos + len(known_org)
                    
                    # Get the actual case from the original text
                    actual_name = doc.text[start_pos:end_pos]
                    
                    # Get context
                    context_start = max(0, start_pos - 50)
                    context_end = min(len(doc.text), end_pos + 50)
                    context = doc.text[context_start:context_end].strip()
                    
                    # Categorize organization
                    category = self._categorize_organization(actual_name, context)
                    
                    # Calculate confidence (slightly lower since not found by NER)
                    confidence = 0.8
                    
                    organizations.append({
                        'name': actual_name,
                        'category': category,
                        'confidence': confidence,
                        'context': context,
                        'start_char': start_pos,
                        'end_char': end_pos,
                        'label': 'ORG'
                    })
                    
                    seen_orgs.add(known_org.lower())
        
        # Sort by confidence score
        organizations.sort(key=lambda x: x['confidence'], reverse=True)
        return organizations
    
    def _extract_locations(self, doc: Doc) -> List[Dict[str, Any]]:
        """Extract location entities with geographic validation."""
        locations = []
        seen_locations = set()
        
        for ent in doc.ents:
            if ent.label_ in ['GPE', 'LOC']:  # Geopolitical entities and locations
                location_name = ent.text.strip()
                
                # Skip if already processed or too short
                if location_name.lower() in seen_locations or len(location_name) < 2:
                    continue
                
                seen_locations.add(location_name.lower())
                
                # Determine location type
                location_type = self._determine_location_type(ent, doc)
                
                # Get context
                context = self._get_entity_context(ent, doc)
                
                # Calculate confidence
                confidence = self._calculate_location_confidence(ent, context)
                
                locations.append({
                    'name': location_name,
                    'type': location_type,
                    'confidence': confidence,
                    'context': context,
                    'start_char': ent.start_char,
                    'end_char': ent.end_char,
                    'label': ent.label_
                })
        
        # Sort by confidence score
        locations.sort(key=lambda x: x['confidence'], reverse=True)
        return locations
    
    def _extract_persons(self, doc: Doc) -> List[Dict[str, Any]]:
        """Extract person entities with role identification."""
        persons = []
        seen_persons = set()
        
        for ent in doc.ents:
            if ent.label_ == 'PERSON':
                person_name = ent.text.strip()
                
                # Skip if already processed or too short
                if person_name.lower() in seen_persons or len(person_name) < 3:
                    continue
                
                seen_persons.add(person_name.lower())
                
                # Get context
                context = self._get_entity_context(ent, doc)
                
                # Identify role
                role = self._identify_person_role(person_name, context)
                
                # Find associated organization
                organization = self._find_associated_organization(ent, doc)
                
                # Calculate confidence
                confidence = self._calculate_person_confidence(ent, context, role)
                
                persons.append({
                    'name': person_name,
                    'role': role,
                    'organization': organization,
                    'confidence': confidence,
                    'context': context,
                    'start_char': ent.start_char,
                    'end_char': ent.end_char,
                    'label': ent.label_
                })
        
        # Sort by confidence score
        persons.sort(key=lambda x: x['confidence'], reverse=True)
        return persons
    
    def _categorize_organization(self, org_name: str, context: str) -> str:
        """Categorize organization by sector based on name and context."""
        # Use the enhanced organization categorizer
        result = self.org_categorizer.categorize_organization(org_name, context)
        return result['category']
    
    def _determine_location_type(self, ent: Span, doc: Doc) -> str:
        """Determine if location is country, city, region, etc."""
        location_name = ent.text.lower()
        
        # Simple heuristics for location type
        if ent.label_ == 'GPE':
            # Check if it's likely a country (common country indicators)
            country_indicators = ['republic', 'kingdom', 'states', 'federation']
            if any(indicator in location_name for indicator in country_indicators):
                return 'country'
            
            # Check context for country indicators
            context = self._get_entity_context(ent, doc).lower()
            if any(word in context for word in ['country', 'nation', 'government']):
                return 'country'
            
            return 'city'  # Default for GPE
        
        return 'location'  # Default for LOC
    
    def _identify_person_role(self, person_name: str, context: str) -> Optional[str]:
        """Identify person's role from context."""
        context_lower = context.lower()
        
        for role, pattern in self.role_patterns.items():
            if re.search(pattern, context_lower, re.IGNORECASE):
                return role
        
        return None
    
    def _find_associated_organization(self, person_ent: Span, doc: Doc) -> Optional[str]:
        """Find organization associated with a person."""
        # Look for organizations in the same sentence
        sent = person_ent.sent
        
        for ent in sent.ents:
            if ent.label_ == 'ORG' and ent != person_ent:
                return ent.text.strip()
        
        return None
    
    def _get_entity_context(self, ent: Span, doc: Doc, window: int = 50) -> str:
        """Get context around an entity."""
        start = max(0, ent.start_char - window)
        end = min(len(doc.text), ent.end_char + window)
        return doc.text[start:end].strip()
    
    def _calculate_org_confidence(self, ent: Span, context: str) -> float:
        """Calculate confidence score for organization extraction."""
        confidence = 0.5  # Base confidence
        
        # Boost confidence for proper capitalization
        if ent.text[0].isupper():
            confidence += 0.1
        
        # Boost confidence for known organization indicators
        org_indicators = ['inc', 'corp', 'ltd', 'llc', 'company', 'group', 'systems']
        if any(indicator in ent.text.lower() for indicator in org_indicators):
            confidence += 0.2
        
        # Boost confidence for context indicators
        context_indicators = ['company', 'corporation', 'firm', 'organization']
        if any(indicator in context.lower() for indicator in context_indicators):
            confidence += 0.1
        
        return min(1.0, confidence)
    
    def _calculate_location_confidence(self, ent: Span, context: str) -> float:
        """Calculate confidence score for location extraction."""
        confidence = 0.6  # Base confidence for locations
        
        # Boost confidence for proper capitalization
        if ent.text[0].isupper():
            confidence += 0.1
        
        # Boost confidence for geographic context
        geo_indicators = ['in', 'from', 'to', 'at', 'near', 'country', 'city']
        if any(indicator in context.lower() for indicator in geo_indicators):
            confidence += 0.2
        
        return min(1.0, confidence)
    
    def _calculate_person_confidence(self, ent: Span, context: str, role: Optional[str]) -> float:
        """Calculate confidence score for person extraction."""
        confidence = 0.4  # Base confidence
        
        # Boost confidence for proper name format
        name_parts = ent.text.split()
        if len(name_parts) >= 2 and all(part[0].isupper() for part in name_parts):
            confidence += 0.2
        
        # Boost confidence if role is identified
        if role:
            confidence += 0.3
        
        # Boost confidence for person context indicators
        person_indicators = ['said', 'stated', 'according to', 'spokesperson']
        if any(indicator in context.lower() for indicator in person_indicators):
            confidence += 0.1
        
        return min(1.0, confidence)
    
    def _calculate_confidence_scores(self, organizations: List, locations: List, persons: List) -> Dict[str, float]:
        """Calculate overall confidence scores for each entity type."""
        def avg_confidence(entities):
            if not entities:
                return 0.0
            return sum(e['confidence'] for e in entities) / len(entities)
        
        return {
            'organizations': avg_confidence(organizations),
            'locations': avg_confidence(locations),
            'persons': avg_confidence(persons),
            'overall': avg_confidence(organizations + locations + persons)
        }
    
    def _empty_extraction_result(self) -> Dict[str, Any]:
        """Return empty extraction result structure."""
        return {
            'organizations': [],
            'locations': [],
            'persons': [],
            'relationships': [],
            'confidence_scores': {
                'organizations': 0.0,
                'locations': 0.0,
                'persons': 0.0,
                'overall': 0.0
            },
            'total_entities': 0,
            'total_relationships': 0,
            'processing_metadata': {
                'model_used': self.model_name,
                'text_length': 0,
                'sentences_processed': 0
            }
        }
    
    def categorize_organizations(self, organizations: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """Group organizations by category."""
        categorized = defaultdict(list)
        
        for org in organizations:
            category = org.get('category', 'other')
            categorized[category].append(org)
        
        return dict(categorized)
    
    def validate_extractions(self, entities: Dict[str, Any]) -> Dict[str, Any]:
        """Validate extracted entities and provide quality metrics."""
        validation_result = {
            'is_valid': True,
            'quality_score': 0.0,
            'issues': [],
            'recommendations': []
        }
        
        # Check if any entities were extracted
        if entities['total_entities'] == 0:
            validation_result['issues'].append('No entities extracted')
            validation_result['recommendations'].append('Check text quality and preprocessing')
        
        # Check confidence scores
        overall_confidence = entities['confidence_scores']['overall']
        if overall_confidence < 0.5:
            validation_result['issues'].append('Low overall confidence in extractions')
            validation_result['recommendations'].append('Consider manual review of results')
        
        # Calculate quality score
        quality_factors = [
            entities['confidence_scores']['overall'],
            min(1.0, entities['total_entities'] / 10),  # Normalize entity count
            1.0 if entities['total_entities'] > 0 else 0.0
        ]
        
        validation_result['quality_score'] = sum(quality_factors) / len(quality_factors)
        
        return validation_result
    
    def _extract_relationships(self, doc: Doc, organizations: List[Dict], locations: List[Dict], persons: List[Dict]) -> List[Dict[str, Any]]:
        """Extract relationships between entities using dependency parsing and patterns."""
        relationships = []
        
        # Create entity lookup for quick access
        entity_lookup = self._create_entity_lookup(organizations, locations, persons)
        
        # Extract relationships using different methods
        relationships.extend(self._extract_dependency_relationships(doc, entity_lookup))
        relationships.extend(self._extract_pattern_relationships(doc, entity_lookup))
        relationships.extend(self._extract_proximity_relationships(doc, entity_lookup))
        
        # Remove duplicates and sort by confidence
        relationships = self._deduplicate_relationships(relationships)
        relationships.sort(key=lambda x: x['confidence'], reverse=True)
        
        return relationships
    
    def _create_entity_lookup(self, organizations: List[Dict], locations: List[Dict], persons: List[Dict]) -> Dict[str, Dict]:
        """Create a lookup dictionary for entities by their text spans."""
        entity_lookup = {}
        
        for org in organizations:
            key = f"{org['start_char']}-{org['end_char']}"
            entity_lookup[key] = {
                'name': org['name'],
                'type': 'organization',
                'category': org.get('category', 'other'),
                'start_char': org['start_char'],
                'end_char': org['end_char']
            }
        
        for loc in locations:
            key = f"{loc['start_char']}-{loc['end_char']}"
            entity_lookup[key] = {
                'name': loc['name'],
                'type': 'location',
                'category': loc.get('type', 'location'),
                'start_char': loc['start_char'],
                'end_char': loc['end_char']
            }
        
        for person in persons:
            key = f"{person['start_char']}-{person['end_char']}"
            entity_lookup[key] = {
                'name': person['name'],
                'type': 'person',
                'category': person.get('role', 'person'),
                'start_char': person['start_char'],
                'end_char': person['end_char']
            }
        
        return entity_lookup
    
    def _extract_dependency_relationships(self, doc: Doc, entity_lookup: Dict) -> List[Dict[str, Any]]:
        """Extract relationships using dependency parsing."""
        relationships = []
        
        # Skip if no dependency parser available (blank model)
        if not doc.has_annotation("DEP"):
            return relationships
        
        for sent in doc.sents:
            for token in sent:
                # Look for relationship patterns in dependencies
                if token.dep_ in ['nsubj', 'dobj', 'pobj', 'compound']:
                    # Find entities connected by this dependency
                    head_entity = self._find_entity_at_position(token.head.idx, entity_lookup)
                    child_entity = self._find_entity_at_position(token.idx, entity_lookup)
                    
                    if head_entity and child_entity and head_entity != child_entity:
                        relationship = self._create_relationship(
                            head_entity, child_entity, token.dep_, 
                            self._get_relationship_context(token, doc), 0.7
                        )
                        relationships.append(relationship)
        
        return relationships
    
    def _extract_pattern_relationships(self, doc: Doc, entity_lookup: Dict) -> List[Dict[str, Any]]:
        """Extract relationships using pattern matching."""
        relationships = []
        
        # Define relationship patterns
        patterns = [
            (r'(\w+)\s+(?:is|was)\s+(?:a|an|the)?\s*(?:subsidiary|division|part)\s+of\s+(\w+)', 'subsidiary_of', 0.8),
            (r'(\w+)\s+(?:owns|acquired|bought)\s+(\w+)', 'owns', 0.8),
            (r'(\w+)\s+(?:CEO|president|director)\s+(\w+)', 'leads', 0.7),
            (r'(\w+)\s+(?:works|worked)\s+(?:at|for)\s+(\w+)', 'employed_by', 0.6),
            (r'(\w+)\s+(?:based|located|headquartered)\s+in\s+(\w+)', 'located_in', 0.8),
            (r'(\w+)\s+(?:operates|has\s+operations)\s+in\s+(\w+)', 'operates_in', 0.7),
            (r'(\w+)\s+(?:supplies|provides|sells)\s+(?:to|for)\s+(\w+)', 'supplies_to', 0.7),
            (r'(\w+)\s+(?:partners|partnered|collaborates)\s+with\s+(\w+)', 'partners_with', 0.6)
        ]
        
        text = doc.text
        for pattern, relation_type, confidence in patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                entity1_text = match.group(1)
                entity2_text = match.group(2)
                
                # Find corresponding entities
                entity1 = self._find_entity_by_name(entity1_text, entity_lookup)
                entity2 = self._find_entity_by_name(entity2_text, entity_lookup)
                
                if entity1 and entity2:
                    relationship = self._create_relationship(
                        entity1, entity2, relation_type,
                        match.group(0), confidence
                    )
                    relationships.append(relationship)
        
        return relationships
    
    def _extract_proximity_relationships(self, doc: Doc, entity_lookup: Dict) -> List[Dict[str, Any]]:
        """Extract relationships based on entity proximity in text."""
        relationships = []
        entities = list(entity_lookup.values())
        
        # Sort entities by position
        entities.sort(key=lambda x: x['start_char'])
        
        # Look for entities in close proximity (same sentence or nearby)
        for i, entity1 in enumerate(entities):
            for j, entity2 in enumerate(entities[i+1:], i+1):
                # Skip if entities are too far apart (more than 100 characters)
                if entity2['start_char'] - entity1['end_char'] > 100:
                    break
                
                # Check if entities are in the same sentence
                sent1 = self._find_sentence_containing_position(doc, entity1['start_char'])
                sent2 = self._find_sentence_containing_position(doc, entity2['start_char'])
                
                if sent1 and sent2 and sent1 == sent2:
                    # Create a proximity-based relationship
                    context = sent1.text
                    confidence = 0.4  # Lower confidence for proximity-based relationships
                    
                    relationship = self._create_relationship(
                        entity1, entity2, 'mentioned_with',
                        context, confidence
                    )
                    relationships.append(relationship)
        
        return relationships
    
    def _find_entity_at_position(self, char_pos: int, entity_lookup: Dict) -> Optional[Dict]:
        """Find entity that contains the given character position."""
        for entity in entity_lookup.values():
            if entity['start_char'] <= char_pos < entity['end_char']:
                return entity
        return None
    
    def _find_entity_by_name(self, name: str, entity_lookup: Dict) -> Optional[Dict]:
        """Find entity by name (case-insensitive partial match)."""
        name_lower = name.lower()
        for entity in entity_lookup.values():
            if name_lower in entity['name'].lower() or entity['name'].lower() in name_lower:
                return entity
        return None
    
    def _find_sentence_containing_position(self, doc: Doc, char_pos: int) -> Optional[Span]:
        """Find the sentence that contains the given character position."""
        for sent in doc.sents:
            if sent.start_char <= char_pos < sent.end_char:
                return sent
        return None
    
    def _create_relationship(self, entity1: Dict, entity2: Dict, relation_type: str, context: str, confidence: float) -> Dict[str, Any]:
        """Create a relationship dictionary."""
        return {
            'source': {
                'name': entity1['name'],
                'type': entity1['type'],
                'category': entity1['category']
            },
            'target': {
                'name': entity2['name'],
                'type': entity2['type'],
                'category': entity2['category']
            },
            'relation_type': relation_type,
            'context': context.strip(),
            'confidence': confidence,
            'source_span': f"{entity1['start_char']}-{entity1['end_char']}",
            'target_span': f"{entity2['start_char']}-{entity2['end_char']}"
        }
    
    def _get_relationship_context(self, token, doc: Doc, window: int = 30) -> str:
        """Get context around a relationship token."""
        start = max(0, token.idx - window)
        end = min(len(doc.text), token.idx + len(token.text) + window)
        return doc.text[start:end].strip()
    
    def _deduplicate_relationships(self, relationships: List[Dict]) -> List[Dict]:
        """Remove duplicate relationships based on entities and relation type."""
        seen = set()
        unique_relationships = []
        
        for rel in relationships:
            # Create a key based on source, target, and relation type
            key = (
                rel['source']['name'].lower(),
                rel['target']['name'].lower(),
                rel['relation_type']
            )
            
            if key not in seen:
                seen.add(key)
                unique_relationships.append(rel)
        
        return unique_relationships
    
    def get_detailed_categorization(self, organizations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Get detailed categorization information for organizations.
        
        Args:
            organizations: List of organization dictionaries
            
        Returns:
            List of organizations with detailed categorization data
        """
        return self.org_categorizer.categorize_organizations_batch(organizations)
    
    def add_categorization_override(self, org_name: str, category: str, reason: str = "") -> bool:
        """
        Add a manual categorization override.
        
        Args:
            org_name: Name of the organization
            category: Sector category to assign
            reason: Reason for the override
            
        Returns:
            True if override was added successfully
        """
        return self.org_categorizer.add_manual_override(org_name, category, reason)
    
    def get_categorization_statistics(self, organizations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Get statistics about organization categorization.
        
        Args:
            organizations: List of organizations with categorization data
            
        Returns:
            Dictionary with categorization statistics
        """
        return self.org_categorizer.get_category_statistics(organizations)