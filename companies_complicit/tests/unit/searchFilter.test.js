/**
 * Unit tests for SearchFilter
 */

import { SearchFilter, createSearchFilter, quickSearch } from '../../src/ui/searchFilter.js';

// Mock DOM
const mockElement = {
  innerHTML: '',
  textContent: '',
  style: { display: 'block', opacity: '1', filter: null },
  querySelector: jest.fn(() => mockElement),
  querySelectorAll: jest.fn(() => [mockElement]),
  addEventListener: jest.fn(),
  setAttribute: jest.fn(),
  getAttribute: jest.fn(() => 'test-id'),
  value: '',
  selectedOptions: [],
  selectedIndex: -1,
  options: [],
  appendChild: jest.fn(),
  closest: jest.fn(() => mockElement),
  dataset: { type: 'node', value: 'test' }
};

global.document = {
  querySelector: jest.fn(() => mockElement),
  querySelectorAll: jest.fn(() => [mockElement]),
  createElement: jest.fn(() => mockElement)
};

global.clearTimeout = jest.fn();
global.setTimeout = jest.fn((fn, delay) => {
  fn();
  return 123;
});

// Mock D3
const mockD3Selection = {
  selectAll: jest.fn(() => mockD3Selection),
  select: jest.fn(() => mockD3Selection),
  style: jest.fn(() => mockD3Selection),
  attr: jest.fn(() => mockElement.getAttribute()),
  empty: jest.fn(() => false),
  each: jest.fn((callback) => {
    callback(null, 0, [mockElement]);
  })
};

global.d3 = {
  select: jest.fn(() => mockD3Selection)
};

// Mock renderer
const mockRenderer = {
  getData: jest.fn(() => ({
    sources: [
      { id: 'source-1', name: 'Test Source', value: 100, color: '#ff0000', type: 'government', confidence: 'high' }
    ],
    companies: [
      { id: 'company-1', name: 'Military Corp', value: 80, color: '#00ff00', type: 'military', confidence: 'medium' }
    ],
    targets: [
      { id: 'target-1', name: 'Operations', value: 60, color: '#0000ff', type: 'military', confidence: 'high' }
    ],
    flows: [
      { from: 'source-1', to: 'company-1', value: 50, type: 'funding', confidence: 'high' }
    ]
  })),
  getSvg: jest.fn(() => mockD3Selection)
};

describe('SearchFilter', () => {
  let searchFilter;

  beforeEach(() => {
    searchFilter = new SearchFilter(mockRenderer);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('should create search filter with renderer', () => {
      expect(searchFilter).toBeInstanceOf(SearchFilter);
      expect(searchFilter.renderer).toBe(mockRenderer);
    });

    test('should apply custom options', () => {
      const customOptions = { searchDelay: 500, caseSensitive: true };
      const customFilter = new SearchFilter(mockRenderer, customOptions);
      
      expect(customFilter.options.searchDelay).toBe(500);
      expect(customFilter.options.caseSensitive).toBe(true);
    });

    test('should initialize with default options', () => {
      expect(searchFilter.options.enableRealTimeSearch).toBe(true);
      expect(searchFilter.options.searchDelay).toBe(300);
      expect(searchFilter.options.caseSensitive).toBe(false);
    });

    test('should initialize empty state', () => {
      expect(searchFilter.searchTerm).toBe('');
      expect(searchFilter.activeFilters.types.size).toBe(0);
      expect(searchFilter.activeFilters.confidence.size).toBe(0);
      expect(searchFilter.searchResults).toEqual([]);
    });
  });

  describe('createUI', () => {
    test('should return HTML for search and filter interface', () => {
      const html = searchFilter.createUI();
      
      expect(html).toContain('search-filter-panel');
      expect(html).toContain('search-input');
      expect(html).toContain('type-filter');
      expect(html).toContain('confidence-filter');
      expect(html).toContain('apply-filters');
      expect(html).toContain('clear-filters');
    });

    test('should include accessibility attributes', () => {
      const html = searchFilter.createUI();
      
      expect(html).toContain('aria-label');
      expect(html).toContain('Search visualization elements');
      expect(html).toContain('Filter by node type');
      expect(html).toContain('Filter by confidence level');
    });
  });

  describe('initialize', () => {
    test('should initialize with container element', () => {
      const container = mockElement;
      
      searchFilter.initialize(container);
      
      expect(container.innerHTML).toContain('search-filter-panel');
      expect(searchFilter.originalData).toBeDefined();
    });

    test('should initialize with container selector', () => {
      searchFilter.initialize('#search-container');
      
      expect(document.querySelector).toHaveBeenCalledWith('#search-container');
    });

    test('should throw error for invalid container', () => {
      document.querySelector.mockReturnValueOnce(null);
      
      expect(() => searchFilter.initialize('#invalid')).toThrow('Search filter container not found');
    });

    test('should throw error if no data available', () => {
      mockRenderer.getData.mockReturnValueOnce(null);
      
      expect(() => searchFilter.initialize(mockElement)).toThrow('No data available from renderer');
    });
  });

  describe('findMatches', () => {
    beforeEach(() => {
      searchFilter.originalData = mockRenderer.getData();
    });

    test('should find matches in node names', () => {
      const matches = searchFilter.findMatches('military');
      
      expect(matches).toHaveLength(2); // company name and target type
      expect(matches[0].type).toBe('node');
      expect(matches[0].element.name).toContain('Military');
    });

    test('should find matches in node types', () => {
      const matches = searchFilter.findMatches('government');
      
      expect(matches).toHaveLength(1);
      expect(matches[0].element.type).toBe('government');
    });

    test('should find matches in flows', () => {
      const matches = searchFilter.findMatches('funding');
      
      expect(matches).toHaveLength(1);
      expect(matches[0].type).toBe('flow');
      expect(matches[0].element.type).toBe('funding');
    });

    test('should handle case insensitive search by default', () => {
      const matches = searchFilter.findMatches('MILITARY');
      
      expect(matches.length).toBeGreaterThan(0);
    });

    test('should handle case sensitive search when enabled', () => {
      searchFilter.options.caseSensitive = true;
      
      const matches = searchFilter.findMatches('MILITARY');
      expect(matches).toHaveLength(0);
      
      const matchesLower = searchFilter.findMatches('Military');
      expect(matchesLower.length).toBeGreaterThan(0);
    });

    test('should return empty array for empty search term', () => {
      const matches = searchFilter.findMatches('');
      expect(matches).toEqual([]);
    });

    test('should return empty array for no matches', () => {
      const matches = searchFilter.findMatches('nonexistent');
      expect(matches).toEqual([]);
    });
  });

  describe('getSearchableText', () => {
    test('should extract searchable text from node', () => {
      const node = {
        name: 'Test Company',
        type: 'military',
        headquarters: 'USA',
        involvement: 'weapons',
        source: 'report'
      };
      
      const text = searchFilter.getSearchableText(node);
      
      expect(text).toContain('Test Company');
      expect(text).toContain('military');
      expect(text).toContain('USA');
      expect(text).toContain('weapons');
      expect(text).toContain('report');
    });

    test('should handle missing fields gracefully', () => {
      const node = { name: 'Test' };
      
      const text = searchFilter.getSearchableText(node);
      
      expect(text).toBe('Test');
    });
  });

  describe('highlightMatches', () => {
    test('should highlight matches in text', () => {
      const text = 'Military Corporation';
      const highlighted = searchFilter.highlightMatches(text, 'military');
      
      expect(highlighted).toContain('<mark>Military</mark>');
    });

    test('should handle multiple matches', () => {
      const text = 'Military and military operations';
      const highlighted = searchFilter.highlightMatches(text, 'military');
      
      expect(highlighted).toContain('<mark>Military</mark>');
      expect(highlighted).toContain('<mark>military</mark>');
    });

    test('should escape regex special characters', () => {
      const text = 'Cost: $100 (estimated)';
      const highlighted = searchFilter.highlightMatches(text, '$100');
      
      expect(highlighted).toContain('<mark>$100</mark>');
    });
  });

  describe('performSearch', () => {
    beforeEach(() => {
      searchFilter.originalData = mockRenderer.getData();
    });

    test('should update search term and results', () => {
      searchFilter.performSearch('military');
      
      expect(searchFilter.searchTerm).toBe('military');
      expect(searchFilter.searchResults.length).toBeGreaterThan(0);
    });

    test('should clear highlights for empty search', () => {
      searchFilter.performSearch('');
      
      expect(searchFilter.searchTerm).toBe('');
      expect(searchFilter.searchResults).toEqual([]);
    });

    test('should call onSearchChange callback', () => {
      const callback = jest.fn();
      searchFilter.onSearchChange = callback;
      
      searchFilter.performSearch('test');
      
      expect(callback).toHaveBeenCalledWith('test', expect.any(Array));
    });
  });

  describe('filtering', () => {
    beforeEach(() => {
      searchFilter.originalData = mockRenderer.getData();
    });

    test('should filter nodes by type', () => {
      searchFilter.activeFilters.types.add('military');
      
      const filtered = searchFilter.filterData(searchFilter.originalData);
      
      expect(filtered.companies).toHaveLength(1);
      expect(filtered.companies[0].type).toBe('military');
      expect(filtered.sources).toHaveLength(0); // government type filtered out
    });

    test('should filter nodes by confidence', () => {
      searchFilter.activeFilters.confidence.add('high');
      
      const filtered = searchFilter.filterData(searchFilter.originalData);
      
      expect(filtered.sources).toHaveLength(1); // high confidence
      expect(filtered.companies).toHaveLength(0); // medium confidence filtered out
    });

    test('should filter flows based on remaining nodes', () => {
      searchFilter.activeFilters.types.add('military');
      
      const filtered = searchFilter.filterData(searchFilter.originalData);
      
      expect(filtered.flows).toHaveLength(0); // no flows between remaining nodes
    });

    test('should return original data when no filters active', () => {
      const filtered = searchFilter.filterData(searchFilter.originalData);
      
      expect(filtered).toEqual(searchFilter.originalData);
    });
  });

  describe('hasActiveFilters', () => {
    test('should return false when no filters active', () => {
      expect(searchFilter.hasActiveFilters()).toBe(false);
    });

    test('should return true when type filters active', () => {
      searchFilter.activeFilters.types.add('military');
      expect(searchFilter.hasActiveFilters()).toBe(true);
    });

    test('should return true when confidence filters active', () => {
      searchFilter.activeFilters.confidence.add('high');
      expect(searchFilter.hasActiveFilters()).toBe(true);
    });

    test('should return true when custom filters active', () => {
      searchFilter.activeFilters.custom.set('test', 'value');
      expect(searchFilter.hasActiveFilters()).toBe(true);
    });
  });

  describe('clearSearch', () => {
    test('should clear search term and results', () => {
      searchFilter.searchTerm = 'test';
      searchFilter.searchResults = [{ type: 'node' }];
      
      searchFilter.clearSearch();
      
      expect(searchFilter.searchTerm).toBe('');
      expect(searchFilter.searchResults).toEqual([]);
    });

    test('should call onSearchChange callback', () => {
      const callback = jest.fn();
      searchFilter.onSearchChange = callback;
      
      searchFilter.clearSearch();
      
      expect(callback).toHaveBeenCalledWith('', []);
    });
  });

  describe('clearAllFilters', () => {
    test('should clear all filter sets', () => {
      searchFilter.activeFilters.types.add('military');
      searchFilter.activeFilters.confidence.add('high');
      searchFilter.activeFilters.custom.set('test', 'value');
      
      searchFilter.clearAllFilters();
      
      expect(searchFilter.activeFilters.types.size).toBe(0);
      expect(searchFilter.activeFilters.confidence.size).toBe(0);
      expect(searchFilter.activeFilters.custom.size).toBe(0);
    });

    test('should call onFilterChange callback', () => {
      const callback = jest.fn();
      searchFilter.onFilterChange = callback;
      
      searchFilter.clearAllFilters();
      
      expect(callback).toHaveBeenCalledWith(searchFilter.activeFilters);
    });
  });

  describe('formatTypeLabel', () => {
    test('should format known types', () => {
      expect(searchFilter.formatTypeLabel('military')).toBe('Military & Defense');
      expect(searchFilter.formatTypeLabel('surveillance')).toBe('Surveillance & Tech');
      expect(searchFilter.formatTypeLabel('construction')).toBe('Construction');
      expect(searchFilter.formatTypeLabel('finance')).toBe('Finance');
    });

    test('should capitalize unknown types', () => {
      expect(searchFilter.formatTypeLabel('unknown')).toBe('Unknown');
      expect(searchFilter.formatTypeLabel('custom')).toBe('Custom');
    });
  });

  describe('formatConfidenceLabel', () => {
    test('should format confidence levels', () => {
      expect(searchFilter.formatConfidenceLabel('high')).toBe('High Confidence');
      expect(searchFilter.formatConfidenceLabel('medium')).toBe('Medium Confidence');
      expect(searchFilter.formatConfidenceLabel('low')).toBe('Low Confidence');
    });
  });

  describe('custom filters', () => {
    test('should add custom filter', () => {
      searchFilter.addCustomFilter('testFilter', 'testValue');
      
      expect(searchFilter.activeFilters.custom.get('testFilter')).toBe('testValue');
    });

    test('should remove custom filter', () => {
      searchFilter.activeFilters.custom.set('testFilter', 'testValue');
      
      searchFilter.removeCustomFilter('testFilter');
      
      expect(searchFilter.activeFilters.custom.has('testFilter')).toBe(false);
    });
  });

  describe('updateData', () => {
    test('should update original data and re-apply filters', () => {
      const newData = { sources: [], companies: [], targets: [], flows: [] };
      
      searchFilter.updateData(newData);
      
      expect(searchFilter.originalData).toBe(newData);
    });

    test('should re-apply search when data updates', () => {
      searchFilter.searchTerm = 'test';
      const spy = jest.spyOn(searchFilter, 'performSearch');
      
      searchFilter.updateData(mockRenderer.getData());
      
      expect(spy).toHaveBeenCalledWith('test');
    });
  });

  describe('getters', () => {
    test('should get search results', () => {
      const results = [{ type: 'node' }];
      searchFilter.searchResults = results;
      
      expect(searchFilter.getSearchResults()).toBe(results);
    });

    test('should get filtered data', () => {
      const filtered = { sources: [] };
      searchFilter.filteredData = filtered;
      
      expect(searchFilter.getFilteredData()).toBe(filtered);
    });

    test('should return original data when no filtered data', () => {
      searchFilter.originalData = mockRenderer.getData();
      
      expect(searchFilter.getFilteredData()).toBe(searchFilter.originalData);
    });
  });

  describe('destroy', () => {
    test('should clean up resources', () => {
      searchFilter.searchTimeout = 123;
      searchFilter.originalData = {};
      searchFilter.searchResults = [{}];
      
      searchFilter.destroy();
      
      expect(clearTimeout).toHaveBeenCalledWith(123);
      expect(searchFilter.renderer).toBeNull();
      expect(searchFilter.originalData).toBeNull();
      expect(searchFilter.searchResults).toEqual([]);
    });
  });
});

describe('Factory functions', () => {
  test('createSearchFilter should return SearchFilter instance', () => {
    const searchFilter = createSearchFilter(mockRenderer);
    expect(searchFilter).toBeInstanceOf(SearchFilter);
  });

  test('quickSearch should return search results', () => {
    const results = quickSearch(mockRenderer, 'military');
    expect(Array.isArray(results)).toBe(true);
  });
});