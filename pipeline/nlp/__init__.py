"""
NLP module for article processing pipeline.

This module contains classes for text preprocessing, entity extraction,
and relationship extraction from journalistic articles.
"""

from .text_preprocessor import TextPreprocessor
from .entity_extractor import EntityExtractor

__all__ = ['TextPreprocessor', 'EntityExtractor']