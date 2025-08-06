"""
Organization categorization module for article processing pipeline.

This module provides the OrganizationCategorizer class for classifying
organizations by sector, with keyword-based categorization, manual overrides,
and validation capabilities.
"""

import json
import re
from typing import Dict, List, Any, Optional, Set, Tuple
from collections import defaultdict, Counter
from pathlib import Path


class OrganizationCategorizer:
    """
    Categorizes organizations by sector using multiple classification methods.
    
    Supports keyword-based categorization, manual overrides, and validation
    for accountability and complicity analysis.
    """
    
    def __init__(self, config_path: Optional[str] = None):
        """
        Initialize the OrganizationCategorizer.
        
        Args:
            config_path: Path to configuration file for categorization rules
        """
        self.config_path = config_path
        self.manual_overrides = {}
        self.validation_rules = {}
        
        # Enhanced sector keywords with weights
        self.sector_keywords = {
            'military': {
                'primary': [
                    'defense', 'military', 'army', 'navy', 'air force', 'marines',
                    'weapons', 'arms', 'missile', 'tank', 'fighter', 'bomber',
                    'surveillance', 'intelligence', 'security', 'contractor',
                    'aerospace', 'defense contractor', 'military contractor'
                ],
                'secondary': [
                    'radar', 'satellite', 'drone', 'unmanned', 'combat',
                    'warfare', 'tactical', 'strategic', 'ballistic', 'nuclear',
                    'cybersecurity', 'homeland security', 'border security'
                ],
                'companies': [
                    'raytheon', 'lockheed martin', 'boeing', 'northrop grumman',
                    'general dynamics', 'bae systems', 'thales', 'rafael',
                    'elbit systems', 'israel aerospace industries'
                ]
            },
            'technology': {
                'primary': [
                    'tech', 'software', 'ai', 'artificial intelligence', 'cyber',
                    'data', 'analytics', 'cloud', 'computing', 'digital',
                    'platform', 'algorithm', 'spyware', 'malware', 'internet'
                ],
                'secondary': [
                    'machine learning', 'deep learning', 'neural network',
                    'blockchain', 'cryptocurrency', 'fintech', 'edtech',
                    'healthtech', 'biotech', 'nanotech', 'quantum'
                ],
                'companies': [
                    'microsoft', 'apple', 'google', 'amazon', 'facebook', 'meta',
                    'tesla', 'nvidia', 'intel', 'ibm', 'oracle', 'salesforce',
                    'nso group', 'cellebrite', 'palantir'
                ]
            },
            'finance': {
                'primary': [
                    'bank', 'financial', 'investment', 'fund', 'capital',
                    'asset', 'equity', 'credit', 'loan', 'insurance',
                    'trading', 'securities', 'hedge fund', 'private equity'
                ],
                'secondary': [
                    'wealth management', 'asset management', 'venture capital',
                    'mutual fund', 'pension fund', 'sovereign wealth',
                    'investment banking', 'commercial banking', 'retail banking'
                ],
                'companies': [
                    'jpmorgan', 'goldman sachs', 'morgan stanley', 'blackrock',
                    'vanguard', 'fidelity', 'wells fargo', 'bank of america',
                    'citigroup', 'hsbc', 'deutsche bank', 'ubs'
                ]
            },
            'energy': {
                'primary': [
                    'oil', 'gas', 'petroleum', 'energy', 'coal', 'mining',
                    'drilling', 'refinery', 'pipeline', 'fossil fuel',
                    'renewable', 'solar', 'wind', 'nuclear', 'hydroelectric'
                ],
                'secondary': [
                    'exploration', 'production', 'upstream', 'downstream',
                    'midstream', 'lng', 'natural gas', 'crude oil',
                    'shale', 'fracking', 'offshore drilling'
                ],
                'companies': [
                    'exxonmobil', 'chevron', 'bp', 'shell', 'total',
                    'conocophillips', 'eni', 'equinor', 'petrobras',
                    'saudi aramco', 'gazprom', 'rosneft'
                ]
            },
            'telecommunications': {
                'primary': [
                    'telecom', 'telecommunications', 'communications', 'network',
                    'internet', 'mobile', 'cellular', 'broadband', 'fiber',
                    'satellite', '5g', 'wireless', 'cable'
                ],
                'secondary': [
                    'infrastructure', 'connectivity', 'bandwidth', 'spectrum',
                    'tower', 'base station', 'data center', 'cloud services'
                ],
                'companies': [
                    'verizon', 'at&t', 'comcast', 'vodafone', 'orange',
                    'deutsche telekom', 'telefonica', 'bt group',
                    'china mobile', 'ntt', 'softbank'
                ]
            },
            'pharmaceutical': {
                'primary': [
                    'pharma', 'pharmaceutical', 'drug', 'medicine', 'healthcare',
                    'biotech', 'medical', 'hospital', 'clinic', 'therapeutic'
                ],
                'secondary': [
                    'clinical trial', 'fda approval', 'patent', 'generic',
                    'biosimilar', 'vaccine', 'treatment', 'diagnosis',
                    'medical device', 'life sciences'
                ],
                'companies': [
                    'pfizer', 'johnson & johnson', 'roche', 'novartis',
                    'merck', 'abbvie', 'bristol myers squibb', 'astrazeneca',
                    'glaxosmithkline', 'sanofi', 'gilead', 'amgen'
                ]
            },
            'media': {
                'primary': [
                    'media', 'news', 'broadcasting', 'television', 'radio',
                    'newspaper', 'journalism', 'publishing', 'entertainment',
                    'streaming', 'content', 'production'
                ],
                'secondary': [
                    'documentary', 'film', 'movie', 'series', 'podcast',
                    'social media', 'digital media', 'print media',
                    'advertising', 'marketing', 'public relations'
                ],
                'companies': [
                    'disney', 'netflix', 'warner bros', 'universal',
                    'paramount', 'sony pictures', 'fox', 'cbs', 'nbc',
                    'abc', 'cnn', 'bbc', 'reuters', 'bloomberg'
                ]
            },
            'retail': {
                'primary': [
                    'retail', 'store', 'shopping', 'consumer', 'merchandise',
                    'e-commerce', 'online shopping', 'marketplace', 'chain',
                    'supermarket', 'department store'
                ],
                'secondary': [
                    'fashion', 'apparel', 'clothing', 'footwear', 'accessories',
                    'home goods', 'electronics retail', 'grocery', 'luxury'
                ],
                'companies': [
                    'walmart', 'amazon', 'target', 'costco', 'home depot',
                    'lowes', 'macys', 'nordstrom', 'best buy', 'staples',
                    'alibaba', 'jd.com', 'zalando'
                ]
            },
            'automotive': {
                'primary': [
                    'automotive', 'car', 'vehicle', 'automobile', 'truck',
                    'motorcycle', 'electric vehicle', 'ev', 'autonomous',
                    'self-driving', 'manufacturing'
                ],
                'secondary': [
                    'assembly', 'parts', 'components', 'engine', 'battery',
                    'charging', 'dealership', 'service', 'maintenance'
                ],
                'companies': [
                    'toyota', 'volkswagen', 'general motors', 'ford',
                    'honda', 'nissan', 'hyundai', 'bmw', 'mercedes-benz',
                    'audi', 'tesla', 'ferrari', 'porsche'
                ]
            }
        }
        
        # Load configuration if provided
        if config_path and Path(config_path).exists():
            self._load_config(config_path)
    
    def categorize_organization(self, org_name: str, context: str = "", 
                              confidence_threshold: float = 0.3) -> Dict[str, Any]:
        """
        Categorize a single organization by sector.
        
        Args:
            org_name: Name of the organization
            context: Surrounding text context
            confidence_threshold: Minimum confidence for categorization
            
        Returns:
            Dictionary with category, confidence, and reasoning
        """
        # Handle edge cases
        if not org_name or org_name is None:
            return {
                'category': 'other',
                'confidence': 0.0,
                'reasoning': 'Empty or None organization name',
                'method': 'default'
            }
        
        # Check for manual override first
        org_key = org_name.lower().strip()
        if org_key in self.manual_overrides:
            override = self.manual_overrides[org_key]
            return {
                'category': override['category'],
                'confidence': 1.0,
                'reasoning': f"Manual override: {override.get('reason', 'No reason provided')}",
                'method': 'manual_override',
                'subcategories': override.get('subcategories', [])
            }
        
        # Perform multi-method categorization
        results = []
        
        # Method 1: Company name matching
        company_result = self._categorize_by_company_name(org_name)
        if company_result:
            results.append(company_result)
        
        # Method 2: Keyword analysis
        keyword_result = self._categorize_by_keywords(org_name, context)
        if keyword_result:
            results.append(keyword_result)
        
        # Method 3: Pattern matching
        pattern_result = self._categorize_by_patterns(org_name, context)
        if pattern_result:
            results.append(pattern_result)
        
        # Combine results and select best category
        final_result = self._combine_categorization_results(results, confidence_threshold)
        
        # Validate the result
        validation = self._validate_categorization(org_name, final_result)
        final_result['validation'] = validation
        
        return final_result
    
    def categorize_organizations_batch(self, organizations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Categorize multiple organizations in batch.
        
        Args:
            organizations: List of organization dictionaries with 'name' and optional 'context'
            
        Returns:
            List of organizations with added categorization information
        """
        categorized = []
        
        for org in organizations:
            org_name = org.get('name', '')
            context = org.get('context', '')
            
            # Get categorization
            categorization = self.categorize_organization(org_name, context)
            
            # Add categorization to organization data
            enhanced_org = org.copy()
            enhanced_org.update({
                'category': categorization['category'],
                'category_confidence': categorization['confidence'],
                'category_reasoning': categorization['reasoning'],
                'category_method': categorization['method'],
                'subcategories': categorization.get('subcategories', []),
                'validation': categorization.get('validation', {})
            })
            
            categorized.append(enhanced_org)
        
        return categorized
    
    def add_manual_override(self, org_name: str, category: str, reason: str = "", 
                           subcategories: List[str] = None) -> bool:
        """
        Add a manual categorization override.
        
        Args:
            org_name: Name of the organization
            category: Sector category to assign
            reason: Reason for the override
            subcategories: Optional subcategories
            
        Returns:
            True if override was added successfully
        """
        if not self._is_valid_category(category):
            return False
        
        org_key = org_name.lower().strip()
        self.manual_overrides[org_key] = {
            'category': category,
            'reason': reason,
            'subcategories': subcategories or [],
            'added_timestamp': self._get_timestamp()
        }
        
        return True
    
    def remove_manual_override(self, org_name: str) -> bool:
        """Remove a manual categorization override."""
        org_key = org_name.lower().strip()
        if org_key in self.manual_overrides:
            del self.manual_overrides[org_key]
            return True
        return False
    
    def get_category_statistics(self, organizations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Get statistics about organization categorization.
        
        Args:
            organizations: List of categorized organizations
            
        Returns:
            Dictionary with categorization statistics
        """
        stats = {
            'total_organizations': len(organizations),
            'category_distribution': defaultdict(int),
            'confidence_distribution': defaultdict(int),
            'method_distribution': defaultdict(int),
            'validation_issues': defaultdict(int),
            'average_confidence': 0.0
        }
        
        confidences = []
        
        for org in organizations:
            category = org.get('category', 'unknown')
            confidence = org.get('category_confidence', 0.0)
            method = org.get('category_method', 'unknown')
            validation = org.get('validation', {})
            
            stats['category_distribution'][category] += 1
            stats['method_distribution'][method] += 1
            
            # Confidence buckets
            if confidence >= 0.8:
                stats['confidence_distribution']['high'] += 1
            elif confidence >= 0.5:
                stats['confidence_distribution']['medium'] += 1
            else:
                stats['confidence_distribution']['low'] += 1
            
            confidences.append(confidence)
            
            # Validation issues
            if not validation.get('is_valid', True):
                for issue in validation.get('issues', []):
                    stats['validation_issues'][issue] += 1
        
        if confidences:
            stats['average_confidence'] = sum(confidences) / len(confidences)
        
        return dict(stats)
    
    def export_overrides(self, filepath: str) -> bool:
        """Export manual overrides to JSON file."""
        try:
            with open(filepath, 'w') as f:
                json.dump(self.manual_overrides, f, indent=2)
            return True
        except Exception as e:
            print(f"Error exporting overrides: {e}")
            return False
    
    def import_overrides(self, filepath: str) -> bool:
        """Import manual overrides from JSON file."""
        try:
            with open(filepath, 'r') as f:
                overrides = json.load(f)
            
            # Validate overrides before importing
            for org_name, override_data in overrides.items():
                if not self._is_valid_category(override_data.get('category')):
                    print(f"Invalid category for {org_name}: {override_data.get('category')}")
                    continue
                self.manual_overrides[org_name] = override_data
            
            return True
        except Exception as e:
            print(f"Error importing overrides: {e}")
            return False
    
    def _categorize_by_company_name(self, org_name: str) -> Optional[Dict[str, Any]]:
        """Categorize by exact company name matching."""
        org_name_lower = org_name.lower().strip()
        
        for sector, keywords in self.sector_keywords.items():
            companies = keywords.get('companies', [])
            for company in companies:
                if company.lower() in org_name_lower or org_name_lower in company.lower():
                    return {
                        'category': sector,
                        'confidence': 0.9,
                        'reasoning': f"Matched known company: {company}",
                        'method': 'company_name_match'
                    }
        
        return None
    
    def _categorize_by_keywords(self, org_name: str, context: str) -> Optional[Dict[str, Any]]:
        """Categorize by keyword analysis."""
        combined_text = f"{org_name} {context}".lower()
        sector_scores = {}
        
        for sector, keywords in self.sector_keywords.items():
            score = 0
            matched_keywords = []
            
            # Primary keywords (higher weight)
            for keyword in keywords.get('primary', []):
                if keyword in combined_text:
                    score += 3
                    matched_keywords.append(keyword)
            
            # Secondary keywords (lower weight)
            for keyword in keywords.get('secondary', []):
                if keyword in combined_text:
                    score += 1
                    matched_keywords.append(keyword)
            
            if score > 0:
                sector_scores[sector] = {
                    'score': score,
                    'keywords': matched_keywords
                }
        
        if sector_scores:
            best_sector = max(sector_scores.items(), key=lambda x: x[1]['score'])
            sector_name = best_sector[0]
            sector_data = best_sector[1]
            
            # Calculate confidence based on score
            # Use a more generous confidence calculation
            base_confidence = 0.3 + (sector_data['score'] * 0.1)
            confidence = min(0.8, base_confidence)
            
            return {
                'category': sector_name,
                'confidence': confidence,
                'reasoning': f"Matched keywords: {', '.join(sector_data['keywords'][:3])}",
                'method': 'keyword_analysis'
            }
        
        return None
    
    def _categorize_by_patterns(self, org_name: str, context: str) -> Optional[Dict[str, Any]]:
        """Categorize by pattern matching."""
        patterns = [
            (r'\b(?:defense|military|weapons?|arms?)\s+(?:contractor|company|corp|inc)\b', 'military', 0.8),
            (r'\b(?:tech|software|ai|data)\s+(?:company|corp|inc|solutions?)\b', 'technology', 0.7),
            (r'\b(?:bank|financial|investment)\s+(?:group|corp|inc|services?)\b', 'finance', 0.8),
            (r'\b(?:oil|gas|energy|petroleum)\s+(?:company|corp|inc)\b', 'energy', 0.8),
            (r'\b(?:pharma|pharmaceutical|biotech)\s+(?:company|corp|inc)\b', 'pharmaceutical', 0.8),
            (r'\b(?:telecom|communications?)\s+(?:company|corp|inc)\b', 'telecommunications', 0.7)
        ]
        
        combined_text = f"{org_name} {context}".lower()
        
        for pattern, category, confidence in patterns:
            if re.search(pattern, combined_text, re.IGNORECASE):
                return {
                    'category': category,
                    'confidence': confidence,
                    'reasoning': f"Matched pattern: {pattern}",
                    'method': 'pattern_matching'
                }
        
        return None
    
    def _combine_categorization_results(self, results: List[Dict], threshold: float) -> Dict[str, Any]:
        """Combine multiple categorization results."""
        if not results:
            return {
                'category': 'other',
                'confidence': 0.0,
                'reasoning': 'No categorization methods matched',
                'method': 'default'
            }
        
        # If only one result, return it
        if len(results) == 1:
            return results[0]
        
        # Combine multiple results by weighted average
        category_scores = defaultdict(list)
        
        for result in results:
            category = result['category']
            confidence = result['confidence']
            method = result['method']
            
            # Weight by method reliability
            method_weights = {
                'manual_override': 1.0,
                'company_name_match': 0.9,
                'keyword_analysis': 0.7,
                'pattern_matching': 0.6
            }
            
            weighted_confidence = confidence * method_weights.get(method, 0.5)
            category_scores[category].append({
                'confidence': weighted_confidence,
                'original_confidence': confidence,
                'method': method,
                'reasoning': result['reasoning']
            })
        
        # Select category with highest weighted confidence
        best_category = None
        best_score = 0
        best_details = None
        
        for category, scores in category_scores.items():
            avg_score = sum(s['confidence'] for s in scores) / len(scores)
            if avg_score > best_score:
                best_score = avg_score
                best_category = category
                best_details = scores
        
        if best_score < threshold:
            return {
                'category': 'other',
                'confidence': best_score,
                'reasoning': f'Confidence {best_score:.2f} below threshold {threshold}',
                'method': 'threshold_filter'
            }
        
        # Create combined reasoning
        methods = [d['method'] for d in best_details]
        reasoning_parts = [d['reasoning'] for d in best_details]
        
        return {
            'category': best_category,
            'confidence': best_score,
            'reasoning': f"Combined from {', '.join(set(methods))}: {'; '.join(reasoning_parts[:2])}",
            'method': 'combined',
            'contributing_methods': methods
        }
    
    def _validate_categorization(self, org_name: str, result: Dict[str, Any]) -> Dict[str, Any]:
        """Validate categorization result."""
        validation = {
            'is_valid': True,
            'issues': [],
            'warnings': []
        }
        
        category = result.get('category', '')
        confidence = result.get('confidence', 0.0)
        
        # Check if category is valid
        if not self._is_valid_category(category):
            validation['is_valid'] = False
            validation['issues'].append(f"Invalid category: {category}")
        
        # Check confidence level
        if confidence < 0.3:
            validation['warnings'].append("Low confidence categorization")
        
        # Check for conflicting indicators
        if self._has_conflicting_indicators(org_name, category):
            validation['warnings'].append("Potential conflicting sector indicators")
        
        return validation
    
    def _is_valid_category(self, category: str) -> bool:
        """Check if category is valid."""
        valid_categories = set(self.sector_keywords.keys()) | {'other', 'unknown'}
        return category in valid_categories
    
    def _has_conflicting_indicators(self, org_name: str, assigned_category: str) -> bool:
        """Check for conflicting sector indicators."""
        org_name_lower = org_name.lower()
        
        # Simple check for obvious conflicts
        conflicts = {
            'military': ['bank', 'financial', 'media', 'retail'],
            'finance': ['defense', 'military', 'pharma'],
            'technology': ['oil', 'gas', 'petroleum']
        }
        
        if assigned_category in conflicts:
            conflicting_terms = conflicts[assigned_category]
            return any(term in org_name_lower for term in conflicting_terms)
        
        return False
    
    def _load_config(self, config_path: str):
        """Load configuration from file."""
        try:
            with open(config_path, 'r') as f:
                config = json.load(f)
            
            # Update sector keywords if provided
            if 'sector_keywords' in config:
                self.sector_keywords.update(config['sector_keywords'])
            
            # Load manual overrides if provided
            if 'manual_overrides' in config:
                self.manual_overrides.update(config['manual_overrides'])
            
            # Load validation rules if provided
            if 'validation_rules' in config:
                self.validation_rules.update(config['validation_rules'])
                
        except Exception as e:
            print(f"Error loading config: {e}")
    
    def _get_timestamp(self) -> str:
        """Get current timestamp."""
        from datetime import datetime
        return datetime.now().isoformat()