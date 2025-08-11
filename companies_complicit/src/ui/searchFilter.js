/**
 * Search and Filter Module for FasaadGov v02
 * Provides real-time search and filtering capabilities for the visualization
 */

export class SearchFilter {
  constructor(renderer, options = {}) {
    this.renderer = renderer;
    this.options = {
      enableRealTimeSearch: true,
      searchDelay: 300, // ms delay for search input
      caseSensitive: false,
      highlightColor: '#ffeb3b',
      dimmedOpacity: 0.2,
      normalOpacity: 1.0,
      animationDuration: 200,
      t: (key, params = {}) => key, // Default translation function (fallback)
      ...options
    };
    
    this.searchTerm = '';
    this.activeFilters = {
      types: new Set(),
      confidence: new Set(),
      custom: new Map()
    };
    
    this.searchTimeout = null;
    this.originalData = null;
    this.filteredData = null;
    this.searchResults = [];
    
    // Event callbacks
    this.onSearchChange = null;
    this.onFilterChange = null;
    this.onResultsUpdate = null;
  }

  /**
   * Create search and filter UI
   * @returns {String} HTML for search and filter interface
   */
  createUI() {
    const { t } = this.options;
    
    return `
      <div class="search-filter-panel">
        <div class="search-section">
          <div class="search-input-group">
            <input 
              type="text" 
              id="search-input" 
              class="search-input"
              data-i18n-placeholder="search.placeholder"
              placeholder="${t('search.placeholder')}"
              aria-label="${t('search.placeholder')}"
              autocomplete="off"
            >
            <button 
              id="clear-search" 
              class="clear-search-btn"
              data-i18n-title="search.clear"
              title="${t('search.clear')}"
              aria-label="${t('search.clear')}"
            >
              ✕
            </button>
          </div>
          <div class="search-results-info" id="search-results-info">
            <!-- Search results count will appear here -->
          </div>
        </div>
        
        <div class="filter-section">
          <div class="filter-group">
            <label class="filter-label">
              <span data-i18n="filters.filter_by_type">${t('filters.filter_by_type')}</span>
              <select id="type-filter" class="filter-select" multiple aria-label="${t('filters.filter_by_type')}">
                <option value="military" data-i18n="types.military">${t('types.military')}</option>
                <option value="surveillance" data-i18n="types.surveillance">${t('types.surveillance')}</option>
                <option value="construction" data-i18n="types.construction">${t('types.construction')}</option>
                <option value="finance" data-i18n="types.finance">${t('types.finance')}</option>
                <option value="government" data-i18n="types.government">${t('types.government')}</option>
                <option value="other" data-i18n="types.other">${t('types.other')}</option>
              </select>
            </label>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">
              <span data-i18n="filters.filter_by_confidence">${t('filters.filter_by_confidence')}</span>
              <select id="confidence-filter" class="filter-select" multiple aria-label="${t('filters.filter_by_confidence')}">
                <option value="high" data-i18n="confidence.high">${t('confidence.high')}</option>
                <option value="medium" data-i18n="confidence.medium">${t('confidence.medium')}</option>
                <option value="low" data-i18n="confidence.low">${t('confidence.low')}</option>
              </select>
            </label>
          </div>
          
          <div class="filter-actions">
            <button id="apply-filters" class="btn filter-btn" data-i18n="filters.apply_filters">${t('filters.apply_filters')}</button>
            <button id="clear-filters" class="btn filter-btn secondary" data-i18n="filters.clear_all">${t('filters.clear_all')}</button>
          </div>
        </div>
        
        <div class="filter-summary" id="filter-summary">
          <!-- Active filters summary will appear here -->
        </div>
      </div>
    `;
  }

  /**
   * Initialize search and filter system
   * @param {String|Element} container - Container for the UI
   */
  initialize(container) {
    const containerEl = typeof container === 'string' ? 
      document.querySelector(container) : container;
    
    if (!containerEl) {
      throw new Error('Search filter container not found');
    }

    // Store original data
    this.originalData = this.renderer.getData();
    if (!this.originalData) {
      throw new Error('No data available from renderer');
    }

    // Insert UI
    containerEl.innerHTML = this.createUI();

    // Attach event listeners
    this.attachEventListeners(containerEl);

    // Initialize filter options based on data
    this.populateFilterOptions();

    // Set initial state
    this.updateResultsInfo();
  }

  /**
   * Attach event listeners to UI elements
   * @param {Element} container - Container element
   */
  attachEventListeners(container) {
    const searchInput = container.querySelector('#search-input');
    const clearSearchBtn = container.querySelector('#clear-search');
    const typeFilter = container.querySelector('#type-filter');
    const confidenceFilter = container.querySelector('#confidence-filter');
    const applyFiltersBtn = container.querySelector('#apply-filters');
    const clearFiltersBtn = container.querySelector('#clear-filters');

    // Search input events
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearchInput(e));
      searchInput.addEventListener('keydown', (e) => this.handleSearchKeydown(e));
    }

    // Clear search button
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => this.clearSearch());
    }

    // Filter events
    if (typeFilter) {
      typeFilter.addEventListener('change', () => this.handleFilterChange());
    }

    if (confidenceFilter) {
      confidenceFilter.addEventListener('change', () => this.handleFilterChange());
    }

    // Filter action buttons
    if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener('click', () => this.applyFilters());
    }

    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => this.clearAllFilters());
    }
  }

  /**
   * Populate filter options based on available data
   */
  populateFilterOptions() {
    if (!this.originalData) return;

    // Get unique types from all nodes
    const types = new Set();
    const confidence = new Set();

    ['sources', 'companies', 'targets'].forEach(nodeType => {
      if (this.originalData[nodeType]) {
        this.originalData[nodeType].forEach(node => {
          if (node.type) types.add(node.type);
          if (node.confidence) confidence.add(node.confidence);
        });
      }
    });

    // Update type filter options
    const typeFilter = document.querySelector('#type-filter');
    if (typeFilter && types.size > 0) {
      typeFilter.innerHTML = '';
      Array.from(types).sort().forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = this.formatTypeLabel(type);
        typeFilter.appendChild(option);
      });
    }

    // Update confidence filter options
    const confidenceFilter = document.querySelector('#confidence-filter');
    if (confidenceFilter && confidence.size > 0) {
      confidenceFilter.innerHTML = '';
      ['high', 'medium', 'low'].forEach(level => {
        if (confidence.has(level)) {
          const option = document.createElement('option');
          option.value = level;
          option.textContent = this.formatConfidenceLabel(level);
          confidenceFilter.appendChild(option);
        }
      });
    }
  }

  /**
   * Handle search input events
   * @param {Event} event - Input event
   */
  handleSearchInput(event) {
    const searchTerm = event.target.value.trim();
    
    // Clear previous timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Debounce search
    if (this.options.enableRealTimeSearch) {
      this.searchTimeout = setTimeout(() => {
        this.performSearch(searchTerm);
      }, this.options.searchDelay);
    } else {
      this.searchTerm = searchTerm;
    }

    // Update clear button visibility
    this.updateClearButtonVisibility(searchTerm);
  }

  /**
   * Handle search keydown events
   * @param {Event} event - Keydown event
   */
  handleSearchKeydown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.performSearch(event.target.value.trim());
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.clearSearch();
    }
  }

  /**
   * Perform search operation
   * @param {String} searchTerm - Search term
   */
  performSearch(searchTerm) {
    this.searchTerm = searchTerm;
    
    if (!searchTerm) {
      this.clearSearchHighlights();
      this.updateResultsInfo();
      return;
    }

    // Find matching elements
    this.searchResults = this.findMatches(searchTerm);
    
    // Apply visual highlighting
    this.applySearchHighlights();
    
    // Update results info
    this.updateResultsInfo();
    
    // Trigger callback
    if (this.onSearchChange) {
      this.onSearchChange(searchTerm, this.searchResults);
    }
  }

  /**
   * Find matches in the data
   * @param {String} searchTerm - Search term
   * @returns {Array} Array of matching elements
   */
  findMatches(searchTerm) {
    if (!searchTerm || !this.originalData) return [];

    const matches = [];
    const term = this.options.caseSensitive ? searchTerm : searchTerm.toLowerCase();

    // Search in nodes
    ['sources', 'companies', 'targets'].forEach(nodeType => {
      if (this.originalData[nodeType]) {
        this.originalData[nodeType].forEach(node => {
          const searchableText = this.getSearchableText(node);
          const compareText = this.options.caseSensitive ? searchableText : searchableText.toLowerCase();
          
          if (compareText.includes(term)) {
            matches.push({
              type: 'node',
              nodeType,
              element: node,
              matchedText: this.highlightMatches(searchableText, term)
            });
          }
        });
      }
    });

    // Search in flows
    if (this.originalData.flows) {
      this.originalData.flows.forEach(flow => {
        const fromNode = this.findNodeById(flow.from);
        const toNode = this.findNodeById(flow.to);
        
        const searchableText = `${fromNode?.name || ''} ${toNode?.name || ''} ${flow.type || ''}`;
        const compareText = this.options.caseSensitive ? searchableText : searchableText.toLowerCase();
        
        if (compareText.includes(term)) {
          matches.push({
            type: 'flow',
            element: flow,
            fromNode,
            toNode,
            matchedText: this.highlightMatches(searchableText, term)
          });
        }
      });
    }

    return matches;
  }

  /**
   * Get searchable text from a node
   * @param {Object} node - Node object
   * @returns {String} Searchable text
   */
  getSearchableText(node) {
    const searchFields = [
      node.name || '',
      node.type || '',
      node.headquarters || '',
      node.involvement || '',
      node.source || ''
    ];

    return searchFields.join(' ').trim();
  }

  /**
   * Find node by ID
   * @param {String} nodeId - Node ID
   * @returns {Object|null} Node object or null
   */
  findNodeById(nodeId) {
    if (!this.originalData) return null;

    const allNodes = [
      ...(this.originalData.sources || []),
      ...(this.originalData.companies || []),
      ...(this.originalData.targets || [])
    ];

    return allNodes.find(node => node.id === nodeId) || null;
  }

  /**
   * Highlight matches in text
   * @param {String} text - Original text
   * @param {String} term - Search term
   * @returns {String} Text with highlighted matches
   */
  highlightMatches(text, term) {
    if (!term) return text;

    const regex = new RegExp(`(${this.escapeRegExp(term)})`, this.options.caseSensitive ? 'g' : 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  /**
   * Escape special regex characters
   * @param {String} string - String to escape
   * @returns {String} Escaped string
   */
  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Apply search highlights to visualization
   */
  applySearchHighlights() {
    if (!this.renderer || !this.searchResults.length) return;

    const svg = this.renderer.getSvg();
    if (!svg) return;

    // Reset all elements to dimmed state
    svg.selectAll('.node, .flow-line')
      .style('opacity', this.options.dimmedOpacity);

    // Highlight matching elements
    this.searchResults.forEach(result => {
      if (result.type === 'node') {
        const nodeElement = svg.select(`[data-id="${result.element.id}"]`);
        if (!nodeElement.empty()) {
          nodeElement.style('opacity', this.options.normalOpacity);
          this.addHighlightEffect(nodeElement);
        }
      } else if (result.type === 'flow') {
        const flowElement = svg.select(`[data-from="${result.element.from}"][data-to="${result.element.to}"]`);
        if (!flowElement.empty()) {
          flowElement.style('opacity', this.options.normalOpacity);
          this.addHighlightEffect(flowElement);
        }
      }
    });
  }

  /**
   * Add highlight effect to element
   * @param {Object} element - D3 selection
   */
  addHighlightEffect(element) {
    // Add a subtle glow effect
    element.style('filter', 'drop-shadow(0 0 3px rgba(255, 235, 59, 0.8))');
  }

  /**
   * Clear search highlights
   */
  clearSearchHighlights() {
    if (!this.renderer) return;

    const svg = this.renderer.getSvg();
    if (!svg) return;

    // Reset all elements to normal state
    svg.selectAll('.node, .flow-line')
      .style('opacity', this.options.normalOpacity)
      .style('filter', null);
  }

  /**
   * Handle filter change events
   */
  handleFilterChange() {
    // Update active filters from UI
    this.updateActiveFilters();
    
    // Update filter summary
    this.updateFilterSummary();
    
    // Trigger callback
    if (this.onFilterChange) {
      this.onFilterChange(this.activeFilters);
    }
  }

  /**
   * Update active filters from UI state
   */
  updateActiveFilters() {
    const typeFilter = document.querySelector('#type-filter');
    const confidenceFilter = document.querySelector('#confidence-filter');

    // Update type filters
    this.activeFilters.types.clear();
    if (typeFilter) {
      Array.from(typeFilter.selectedOptions).forEach(option => {
        this.activeFilters.types.add(option.value);
      });
    }

    // Update confidence filters
    this.activeFilters.confidence.clear();
    if (confidenceFilter) {
      Array.from(confidenceFilter.selectedOptions).forEach(option => {
        this.activeFilters.confidence.add(option.value);
      });
    }
  }

  /**
   * Apply filters to visualization
   */
  applyFilters() {
    this.updateActiveFilters();
    
    if (!this.hasActiveFilters()) {
      this.clearFilters();
      return;
    }

    // Filter data
    this.filteredData = this.filterData(this.originalData);
    
    // Apply visual filtering
    this.applyVisualFilters();
    
    // Update results info
    this.updateResultsInfo();
    
    // Trigger callback
    if (this.onResultsUpdate) {
      this.onResultsUpdate(this.filteredData, this.activeFilters);
    }
  }

  /**
   * Filter data based on active filters
   * @param {Object} data - Original data
   * @returns {Object} Filtered data
   */
  filterData(data) {
    if (!this.hasActiveFilters()) return data;

    const filtered = {
      sources: this.filterNodes(data.sources || []),
      companies: this.filterNodes(data.companies || []),
      targets: this.filterNodes(data.targets || []),
      flows: []
    };

    // Filter flows based on remaining nodes
    const remainingNodeIds = new Set([
      ...filtered.sources.map(n => n.id),
      ...filtered.companies.map(n => n.id),
      ...filtered.targets.map(n => n.id)
    ]);

    filtered.flows = (data.flows || []).filter(flow => 
      remainingNodeIds.has(flow.from) && remainingNodeIds.has(flow.to)
    );

    return filtered;
  }

  /**
   * Filter nodes based on active filters
   * @param {Array} nodes - Array of nodes
   * @returns {Array} Filtered nodes
   */
  filterNodes(nodes) {
    return nodes.filter(node => {
      // Type filter
      if (this.activeFilters.types.size > 0) {
        if (!node.type || !this.activeFilters.types.has(node.type)) {
          return false;
        }
      }

      // Confidence filter
      if (this.activeFilters.confidence.size > 0) {
        if (!node.confidence || !this.activeFilters.confidence.has(node.confidence)) {
          return false;
        }
      }

      // Custom filters
      for (const [filterName, filterValue] of this.activeFilters.custom) {
        if (!this.applyCustomFilter(node, filterName, filterValue)) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Apply visual filters to the visualization
   */
  applyVisualFilters() {
    if (!this.renderer) return;

    const svg = this.renderer.getSvg();
    if (!svg) return;

    // Get filtered node IDs
    const visibleNodeIds = new Set();
    if (this.filteredData) {
      ['sources', 'companies', 'targets'].forEach(nodeType => {
        this.filteredData[nodeType].forEach(node => {
          visibleNodeIds.add(node.id);
        });
      });
    }

    // Update node visibility
    svg.selectAll('.node').each((d, i, nodes) => {
      const element = d3.select(nodes[i]);
      const nodeId = element.attr('data-id');
      
      if (visibleNodeIds.has(nodeId)) {
        element.style('opacity', this.options.normalOpacity);
      } else {
        element.style('opacity', this.options.dimmedOpacity);
      }
    });

    // Update flow visibility
    svg.selectAll('.flow-line').each((d, i, nodes) => {
      const element = d3.select(nodes[i]);
      const fromId = element.attr('data-from');
      const toId = element.attr('data-to');
      
      if (visibleNodeIds.has(fromId) && visibleNodeIds.has(toId)) {
        element.style('opacity', this.options.normalOpacity);
      } else {
        element.style('opacity', this.options.dimmedOpacity);
      }
    });
  }

  /**
   * Clear search
   */
  clearSearch() {
    const searchInput = document.querySelector('#search-input');
    if (searchInput) {
      searchInput.value = '';
    }

    this.searchTerm = '';
    this.searchResults = [];
    
    this.clearSearchHighlights();
    this.updateClearButtonVisibility('');
    this.updateResultsInfo();

    if (this.onSearchChange) {
      this.onSearchChange('', []);
    }
  }

  /**
   * Clear all filters
   */
  clearAllFilters() {
    // Clear UI selections
    const typeFilter = document.querySelector('#type-filter');
    const confidenceFilter = document.querySelector('#confidence-filter');

    if (typeFilter) {
      typeFilter.selectedIndex = -1;
    }

    if (confidenceFilter) {
      confidenceFilter.selectedIndex = -1;
    }

    // Clear internal state
    this.activeFilters.types.clear();
    this.activeFilters.confidence.clear();
    this.activeFilters.custom.clear();

    // Clear visual filters
    this.clearFilters();
    
    // Update UI
    this.updateFilterSummary();
    this.updateResultsInfo();

    if (this.onFilterChange) {
      this.onFilterChange(this.activeFilters);
    }
  }

  /**
   * Clear visual filters
   */
  clearFilters() {
    if (!this.renderer) return;

    const svg = this.renderer.getSvg();
    if (!svg) return;

    // Reset all elements to normal state
    svg.selectAll('.node, .flow-line')
      .style('opacity', this.options.normalOpacity);

    this.filteredData = null;
  }

  /**
   * Check if there are active filters
   * @returns {Boolean} True if filters are active
   */
  hasActiveFilters() {
    return this.activeFilters.types.size > 0 || 
           this.activeFilters.confidence.size > 0 || 
           this.activeFilters.custom.size > 0;
  }

  /**
   * Update clear button visibility
   * @param {String} searchTerm - Current search term
   */
  updateClearButtonVisibility(searchTerm) {
    const clearBtn = document.querySelector('#clear-search');
    if (clearBtn) {
      clearBtn.style.display = searchTerm ? 'block' : 'none';
    }
  }

  /**
   * Update search results information
   */
  updateResultsInfo() {
    const resultsInfo = document.querySelector('#search-results-info');
    if (!resultsInfo) return;

    const { t } = this.options;
    let message = '';

    if (this.searchTerm) {
      const count = this.searchResults.length;
      if (count > 0) {
        message = t('search.results_found', { 
          count, 
          plural: count !== 1 ? 's' : '', 
          term: this.searchTerm 
        });
      } else {
        message = t('search.no_results', { term: this.searchTerm });
      }
    } else if (this.hasActiveFilters()) {
      const visibleCount = this.getVisibleElementCount();
      const totalCount = this.getTotalElementCount();
      message = t('statistics.showing_elements', { visible: visibleCount, total: totalCount });
    }

    resultsInfo.textContent = message;
  }

  /**
   * Update filter summary
   */
  updateFilterSummary() {
    const summary = document.querySelector('#filter-summary');
    if (!summary) return;

    const activeTags = [];

    // Add type filters
    this.activeFilters.types.forEach(type => {
      activeTags.push({
        type: 'type',
        value: type,
        label: this.formatTypeLabel(type)
      });
    });

    // Add confidence filters
    this.activeFilters.confidence.forEach(confidence => {
      activeTags.push({
        type: 'confidence',
        value: confidence,
        label: this.formatConfidenceLabel(confidence)
      });
    });

    if (activeTags.length === 0) {
      summary.innerHTML = '';
      return;
    }

    const tagsHtml = activeTags.map(tag => 
      `<span class="filter-tag" data-type="${tag.type}" data-value="${tag.value}">
        ${tag.label}
        <button class="remove-filter" aria-label="Remove ${tag.label} filter">×</button>
      </span>`
    ).join('');

    summary.innerHTML = `<div class="active-filters">Active filters: ${tagsHtml}</div>`;

    // Attach remove filter events
    summary.querySelectorAll('.remove-filter').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tag = e.target.closest('.filter-tag');
        this.removeFilter(tag.dataset.type, tag.dataset.value);
      });
    });
  }

  /**
   * Remove specific filter
   * @param {String} filterType - Type of filter
   * @param {String} filterValue - Filter value
   */
  removeFilter(filterType, filterValue) {
    if (filterType === 'type') {
      this.activeFilters.types.delete(filterValue);
    } else if (filterType === 'confidence') {
      this.activeFilters.confidence.delete(filterValue);
    }

    // Update UI
    this.updateFilterSelections();
    this.applyFilters();
  }

  /**
   * Update filter UI selections to match internal state
   */
  updateFilterSelections() {
    const typeFilter = document.querySelector('#type-filter');
    const confidenceFilter = document.querySelector('#confidence-filter');

    if (typeFilter) {
      Array.from(typeFilter.options).forEach(option => {
        option.selected = this.activeFilters.types.has(option.value);
      });
    }

    if (confidenceFilter) {
      Array.from(confidenceFilter.options).forEach(option => {
        option.selected = this.activeFilters.confidence.has(option.value);
      });
    }
  }

  /**
   * Get count of visible elements
   * @returns {Number} Count of visible elements
   */
  getVisibleElementCount() {
    if (!this.filteredData) return this.getTotalElementCount();

    return (this.filteredData.sources?.length || 0) +
           (this.filteredData.companies?.length || 0) +
           (this.filteredData.targets?.length || 0) +
           (this.filteredData.flows?.length || 0);
  }

  /**
   * Get total count of elements
   * @returns {Number} Total count of elements
   */
  getTotalElementCount() {
    if (!this.originalData) return 0;

    return (this.originalData.sources?.length || 0) +
           (this.originalData.companies?.length || 0) +
           (this.originalData.targets?.length || 0) +
           (this.originalData.flows?.length || 0);
  }

  /**
   * Format type label for display
   * @param {String} type - Type value
   * @returns {String} Formatted label
   */
  formatTypeLabel(type) {
    const { t } = this.options;
    return t(`types.${type}`) || type.charAt(0).toUpperCase() + type.slice(1);
  }

  /**
   * Format confidence label for display
   * @param {String} confidence - Confidence value
   * @returns {String} Formatted label
   */
  formatConfidenceLabel(confidence) {
    const { t } = this.options;
    return t(`confidence.${confidence}`) || (confidence.charAt(0).toUpperCase() + confidence.slice(1) + ' Confidence');
  }

  /**
   * Apply custom filter
   * @param {Object} node - Node to filter
   * @param {String} filterName - Filter name
   * @param {*} filterValue - Filter value
   * @returns {Boolean} True if node passes filter
   */
  applyCustomFilter(node, filterName, filterValue) {
    // Override this method to implement custom filtering logic
    return true;
  }

  /**
   * Add custom filter
   * @param {String} name - Filter name
   * @param {*} value - Filter value
   */
  addCustomFilter(name, value) {
    this.activeFilters.custom.set(name, value);
    this.applyFilters();
  }

  /**
   * Remove custom filter
   * @param {String} name - Filter name
   */
  removeCustomFilter(name) {
    this.activeFilters.custom.delete(name);
    this.applyFilters();
  }

  /**
   * Get current search results
   * @returns {Array} Current search results
   */
  getSearchResults() {
    return this.searchResults;
  }

  /**
   * Get filtered data
   * @returns {Object} Filtered data
   */
  getFilteredData() {
    return this.filteredData || this.originalData;
  }

  /**
   * Update data when renderer data changes
   * @param {Object} newData - New data from renderer
   */
  updateData(newData) {
    this.originalData = newData;
    this.populateFilterOptions();
    
    // Re-apply current search and filters
    if (this.searchTerm) {
      this.performSearch(this.searchTerm);
    }
    
    if (this.hasActiveFilters()) {
      this.applyFilters();
    }
  }

  /**
   * Destroy search filter and clean up
   */
  destroy() {
    // Clear timeouts
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Clear references
    this.renderer = null;
    this.originalData = null;
    this.filteredData = null;
    this.searchResults = [];
    this.activeFilters = { types: new Set(), confidence: new Set(), custom: new Map() };
  }
}

/**
 * Factory function to create search filter
 * @param {Object} renderer - Sankey renderer instance
 * @param {Object} options - Configuration options
 * @returns {SearchFilter} Search filter instance
 */
export function createSearchFilter(renderer, options = {}) {
  return new SearchFilter(renderer, options);
}

/**
 * Quick search function for simple use cases
 * @param {Object} renderer - Sankey renderer
 * @param {String} searchTerm - Search term
 * @returns {Array} Search results
 */
export function quickSearch(renderer, searchTerm) {
  const searchFilter = new SearchFilter(renderer);
  return searchFilter.findMatches(searchTerm);
}