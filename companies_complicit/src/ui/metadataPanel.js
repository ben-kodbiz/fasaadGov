/**
 * Metadata Panel Module for FasaadGov v02
 * Displays detailed provenance and source information for nodes and flows
 */

export class MetadataPanel {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? 
      document.querySelector(container) : container;
    
    if (!this.container) {
      throw new Error('Metadata panel container not found');
    }

    this.options = {
      position: 'right', // 'right', 'left', 'bottom', 'modal'
      width: 400,
      height: 'auto',
      showOnHover: false,
      showOnClick: true,
      autoHide: true,
      hideDelay: 5000,
      animationDuration: 300,
      maxSourcesDisplay: 10,
      maxEvidenceDisplay: 5,
      ...options
    };

    this.panel = null;
    this.currentData = null;
    this.hideTimeout = null;
    this.isVisible = false;
    this.isLocked = false; // Prevents auto-hide when user is interacting

    this.initialize();
  }

  /**
   * Initialize the metadata panel
   */
  initialize() {
    this.createPanel();
    this.attachEventListeners();
  }

  /**
   * Create the metadata panel DOM structure
   */
  createPanel() {
    this.panel = document.createElement('div');
    this.panel.className = `metadata-panel metadata-panel--${this.options.position}`;
    this.panel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: ${this.options.width}px;
      max-height: calc(100vh - 40px);
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      transform: translateX(100%);
      transition: transform ${this.options.animationDuration}ms ease-in-out;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `;

    this.panel.innerHTML = this.createPanelHTML();
    document.body.appendChild(this.panel);
  }  /**

   * Create the HTML structure for the panel
   * @returns {String} HTML content
   */
  createPanelHTML() {
    return `
      <div class="metadata-panel__header">
        <h3 class="metadata-panel__title">Element Information</h3>
        <div class="metadata-panel__controls">
          <button class="metadata-panel__pin" title="Pin panel" aria-label="Pin panel">
            📌
          </button>
          <button class="metadata-panel__close" title="Close panel" aria-label="Close panel">
            ✕
          </button>
        </div>
      </div>
      
      <div class="metadata-panel__content">
        <div class="metadata-panel__loading">
          <div class="loading-spinner"></div>
          <p>Loading information...</p>
        </div>
        
        <div class="metadata-panel__data" style="display: none;">
          <!-- Basic Information Section -->
          <section class="metadata-section">
            <h4 class="metadata-section__title">Basic Information</h4>
            <div class="metadata-section__content" id="basic-info">
              <!-- Basic info will be populated here -->
            </div>
          </section>
          
          <!-- Sources & Evidence Section -->
          <section class="metadata-section">
            <h4 class="metadata-section__title">Sources & Evidence</h4>
            <div class="metadata-section__content" id="sources-info">
              <!-- Sources info will be populated here -->
            </div>
          </section>
          
          <!-- Confidence & Verification Section -->
          <section class="metadata-section">
            <h4 class="metadata-section__title">Confidence & Verification</h4>
            <div class="metadata-section__content" id="confidence-info">
              <!-- Confidence info will be populated here -->
            </div>
          </section>
          
          <!-- Additional Details Section -->
          <section class="metadata-section">
            <h4 class="metadata-section__title">Additional Details</h4>
            <div class="metadata-section__content" id="additional-info">
              <!-- Additional info will be populated here -->
            </div>
          </section>
          
          <!-- News Articles Section -->
          <section class="metadata-section" id="news-section" style="display: none;">
            <h4 class="metadata-section__title">Related News & Reports</h4>
            <div class="metadata-section__content" id="news-info">
              <!-- News articles will be populated here -->
            </div>
          </section>
        </div>
        
        <div class="metadata-panel__error" style="display: none;">
          <div class="error-icon">⚠️</div>
          <p>Unable to load information for this element.</p>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners to panel elements
   */
  attachEventListeners() {
    const closeBtn = this.panel.querySelector('.metadata-panel__close');
    const pinBtn = this.panel.querySelector('.metadata-panel__pin');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }
    
    if (pinBtn) {
      pinBtn.addEventListener('click', () => this.togglePin());
    }

    // Prevent auto-hide when user is interacting with panel
    this.panel.addEventListener('mouseenter', () => {
      this.isLocked = true;
      this.clearHideTimeout();
    });

    this.panel.addEventListener('mouseleave', () => {
      this.isLocked = false;
      if (this.options.autoHide && this.isVisible) {
        this.scheduleHide();
      }
    });

    // Handle escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  /**
   * Show metadata for a node
   * @param {Object} nodeData - Node data object
   * @param {String} nodeType - Type of node (sources, companies, targets)
   */
  showNodeInfo(nodeData, nodeType = 'unknown') {
    if (!nodeData) {
      this.showError('No data available for this element');
      return;
    }

    this.currentData = { ...nodeData, _type: nodeType };
    this.show();
    this.populateNodeData(nodeData, nodeType);
  }

  /**
   * Show metadata for a flow
   * @param {Object} flowData - Flow data object with fromNode and toNode
   */
  showFlowInfo(flowData) {
    if (!flowData || !flowData.flow) {
      this.showError('No data available for this flow');
      return;
    }

    this.currentData = { ...flowData, _type: 'flow' };
    this.show();
    this.populateFlowData(flowData);
  }

  /**
   * Populate panel with node data
   * @param {Object} nodeData - Node data
   * @param {String} nodeType - Node type
   */
  populateNodeData(nodeData, nodeType) {
    this.showLoading();

    // Simulate loading delay for better UX
    setTimeout(() => {
      this.populateBasicInfo(nodeData, nodeType);
      this.populateSourcesInfo(nodeData);
      this.populateConfidenceInfo(nodeData);
      this.populateAdditionalInfo(nodeData, nodeType);
      this.populateNewsInfo(nodeData);
      
      this.hideLoading();
      this.showData();
    }, 300);
  }

  /**
   * Populate panel with flow data
   * @param {Object} flowData - Flow data with nodes
   */
  populateFlowData(flowData) {
    this.showLoading();

    setTimeout(() => {
      const { flow, fromNode, toNode } = flowData;
      
      this.populateBasicInfo(flow, 'flow', { fromNode, toNode });
      this.populateSourcesInfo(flow);
      this.populateConfidenceInfo(flow);
      this.populateAdditionalInfo(flow, 'flow');
      
      this.hideLoading();
      this.showData();
    }, 300);
  } 
 /**
   * Populate basic information section
   * @param {Object} data - Data object
   * @param {String} type - Data type
   * @param {Object} context - Additional context
   */
  populateBasicInfo(data, type, context = {}) {
    const basicInfo = this.panel.querySelector('#basic-info');
    let content = '';

    if (type === 'flow') {
      const { fromNode, toNode } = context;
      content = `
        <div class="info-item">
          <label>Flow Type:</label>
          <span class="info-value">${data.type || 'Unknown'}</span>
        </div>
        <div class="info-item">
          <label>From:</label>
          <span class="info-value">${fromNode?.name || 'Unknown'}</span>
        </div>
        <div class="info-item">
          <label>To:</label>
          <span class="info-value">${toNode?.name || 'Unknown'}</span>
        </div>
        <div class="info-item">
          <label>Value:</label>
          <span class="info-value">${data.value}B USD</span>
        </div>
        ${data.verification_date ? `
        <div class="info-item">
          <label>Verification Date:</label>
          <span class="info-value">${this.formatDate(data.verification_date)}</span>
        </div>
        ` : ''}
      `;
    } else {
      content = `
        <div class="info-item">
          <label>Name:</label>
          <span class="info-value">${data.name}</span>
        </div>
        <div class="info-item">
          <label>Type:</label>
          <span class="info-value info-badge info-badge--${data.type || 'unknown'}">${this.formatType(data.type)}</span>
        </div>
        <div class="info-item">
          <label>Value:</label>
          <span class="info-value">${data.value}B USD</span>
        </div>
        ${data.headquarters ? `
        <div class="info-item">
          <label>Headquarters:</label>
          <span class="info-value">${data.headquarters}</span>
        </div>
        ` : ''}
        ${data.revenue ? `
        <div class="info-item">
          <label>Revenue:</label>
          <span class="info-value">${data.revenue}</span>
        </div>
        ` : ''}
        ${data.updated_at ? `
        <div class="info-item">
          <label>Last Updated:</label>
          <span class="info-value">${this.formatDate(data.updated_at)}</span>
        </div>
        ` : ''}
      `;
    }

    basicInfo.innerHTML = content;
  }

  /**
   * Populate sources and evidence section
   * @param {Object} data - Data object
   */
  populateSourcesInfo(data) {
    const sourcesInfo = this.panel.querySelector('#sources-info');
    let content = '';

    // Primary source
    if (data.source) {
      content += `
        <div class="info-item">
          <label>Primary Source:</label>
          <span class="info-value">${data.source}</span>
        </div>
      `;
    }

    // Evidence links
    if (data.evidence && data.evidence.length > 0) {
      content += `
        <div class="info-item">
          <label>Evidence:</label>
          <div class="evidence-list">
      `;
      
      const evidenceToShow = data.evidence.slice(0, this.options.maxEvidenceDisplay);
      evidenceToShow.forEach((evidence, index) => {
        if (this.isValidUrl(evidence)) {
          content += `
            <a href="${evidence}" target="_blank" rel="noopener noreferrer" class="evidence-link">
              📄 Evidence ${index + 1}
            </a>
          `;
        } else {
          content += `<span class="evidence-text">${evidence}</span>`;
        }
      });

      if (data.evidence.length > this.options.maxEvidenceDisplay) {
        content += `<span class="evidence-more">+${data.evidence.length - this.options.maxEvidenceDisplay} more</span>`;
      }

      content += `
          </div>
        </div>
      `;
    }

    // If no sources available
    if (!data.source && (!data.evidence || data.evidence.length === 0)) {
      content = `
        <div class="info-item info-item--empty">
          <span class="info-empty">No source information available</span>
        </div>
      `;
    }

    sourcesInfo.innerHTML = content;
  }

  /**
   * Populate confidence and verification section
   * @param {Object} data - Data object
   */
  populateConfidenceInfo(data) {
    const confidenceInfo = this.panel.querySelector('#confidence-info');
    let content = '';

    if (data.confidence) {
      const confidenceLevel = data.confidence.toLowerCase();
      const confidenceColor = this.getConfidenceColor(confidenceLevel);
      
      content += `
        <div class="info-item">
          <label>Confidence Level:</label>
          <span class="info-value">
            <span class="confidence-badge confidence-badge--${confidenceLevel}" style="background-color: ${confidenceColor}">
              ${this.formatConfidence(data.confidence)}
            </span>
          </span>
        </div>
      `;

      // Add confidence explanation
      content += `
        <div class="info-item">
          <label>Confidence Meaning:</label>
          <span class="info-value info-description">${this.getConfidenceDescription(confidenceLevel)}</span>
        </div>
      `;
    }

    // Verification status
    if (data.verification_date || data.verified_by) {
      content += `
        <div class="info-item">
          <label>Verification:</label>
          <div class="verification-info">
            ${data.verification_date ? `<div>Date: ${this.formatDate(data.verification_date)}</div>` : ''}
            ${data.verified_by ? `<div>By: ${data.verified_by}</div>` : ''}
          </div>
        </div>
      `;
    }

    if (!content) {
      content = `
        <div class="info-item info-item--empty">
          <span class="info-empty">No confidence information available</span>
        </div>
      `;
    }

    confidenceInfo.innerHTML = content;
  }

  /**
   * Populate additional information section
   * @param {Object} data - Data object
   * @param {String} type - Data type
   */
  populateAdditionalInfo(data, type) {
    const additionalInfo = this.panel.querySelector('#additional-info');
    let content = '';

    if (type === 'companies' && data.involvement) {
      content += `
        <div class="info-item">
          <label>Involvement:</label>
          <span class="info-value info-description">${data.involvement}</span>
        </div>
      `;
    }

    if (data.notes) {
      content += `
        <div class="info-item">
          <label>Notes:</label>
          <span class="info-value info-description">${data.notes}</span>
        </div>
      `;
    }

    if (data.impact_assessment) {
      content += `
        <div class="info-item">
          <label>Impact Assessment:</label>
          <span class="info-value info-description">${data.impact_assessment}</span>
        </div>
      `;
    }

    // Add any custom fields that aren't covered elsewhere
    const standardFields = ['id', 'name', 'value', 'color', 'type', 'headquarters', 'revenue', 
                           'involvement', 'source', 'confidence', 'updated_at', 'evidence', 
                           'notes', 'impact_assessment', 'news_articles', 'verification_date', 'verified_by'];
    
    Object.keys(data).forEach(key => {
      if (!standardFields.includes(key) && !key.startsWith('_')) {
        content += `
          <div class="info-item">
            <label>${this.formatFieldName(key)}:</label>
            <span class="info-value">${data[key]}</span>
          </div>
        `;
      }
    });

    if (!content) {
      content = `
        <div class="info-item info-item--empty">
          <span class="info-empty">No additional information available</span>
        </div>
      `;
    }

    additionalInfo.innerHTML = content;
  }  /**
   *
 Populate news articles section
   * @param {Object} data - Data object
   */
  populateNewsInfo(data) {
    const newsInfo = this.panel.querySelector('#news-info');
    const newsSection = this.panel.querySelector('#news-section');

    if (!data.news_articles || data.news_articles.length === 0) {
      newsSection.style.display = 'none';
      return;
    }

    newsSection.style.display = 'block';
    let content = '';

    data.news_articles.forEach((article, index) => {
      const confidencePercent = article.confidence ? Math.round(article.confidence * 100) : null;
      
      content += `
        <div class="news-article">
          <div class="news-article__header">
            <h5 class="news-article__title">
              ${article.url ? 
                `<a href="${article.url}" target="_blank" rel="noopener noreferrer">${article.title}</a>` :
                article.title
              }
            </h5>
            ${confidencePercent ? 
              `<span class="news-article__confidence">${confidencePercent}% confidence</span>` : 
              ''
            }
          </div>
          <div class="news-article__meta">
            <span class="news-article__source">${article.source}</span>
            <span class="news-article__date">${this.formatDate(article.date)}</span>
            ${article.category ? `<span class="news-article__category">${article.category}</span>` : ''}
          </div>
          ${article.summary ? `
            <div class="news-article__summary">${article.summary}</div>
          ` : ''}
        </div>
      `;
    });

    newsInfo.innerHTML = content;
  }

  /**
   * Show the panel
   */
  show() {
    this.isVisible = true;
    this.panel.style.transform = 'translateX(0)';
    
    // Clear any existing hide timeout
    this.clearHideTimeout();
    
    // Schedule auto-hide if enabled
    if (this.options.autoHide && !this.isLocked) {
      this.scheduleHide();
    }
  }

  /**
   * Hide the panel
   */
  hide() {
    this.isVisible = false;
    this.panel.style.transform = 'translateX(100%)';
    this.clearHideTimeout();
  }

  /**
   * Toggle pin state
   */
  togglePin() {
    const pinBtn = this.panel.querySelector('.metadata-panel__pin');
    
    if (this.isLocked) {
      this.isLocked = false;
      pinBtn.textContent = '📌';
      pinBtn.title = 'Pin panel';
      if (this.options.autoHide) {
        this.scheduleHide();
      }
    } else {
      this.isLocked = true;
      pinBtn.textContent = '📍';
      pinBtn.title = 'Unpin panel';
      this.clearHideTimeout();
    }
  }

  /**
   * Show loading state
   */
  showLoading() {
    this.panel.querySelector('.metadata-panel__loading').style.display = 'block';
    this.panel.querySelector('.metadata-panel__data').style.display = 'none';
    this.panel.querySelector('.metadata-panel__error').style.display = 'none';
  }

  /**
   * Show data state
   */
  showData() {
    this.panel.querySelector('.metadata-panel__loading').style.display = 'none';
    this.panel.querySelector('.metadata-panel__data').style.display = 'block';
    this.panel.querySelector('.metadata-panel__error').style.display = 'none';
  }

  /**
   * Show error state
   * @param {String} message - Error message
   */
  showError(message) {
    const errorPanel = this.panel.querySelector('.metadata-panel__error');
    errorPanel.querySelector('p').textContent = message;
    
    this.panel.querySelector('.metadata-panel__loading').style.display = 'none';
    this.panel.querySelector('.metadata-panel__data').style.display = 'none';
    errorPanel.style.display = 'block';
    
    this.show();
  }

  /**
   * Schedule auto-hide
   */
  scheduleHide() {
    this.clearHideTimeout();
    this.hideTimeout = setTimeout(() => {
      if (!this.isLocked) {
        this.hide();
      }
    }, this.options.hideDelay);
  }

  /**
   * Clear hide timeout
   */
  clearHideTimeout() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  // Utility methods

  /**
   * Format date string
   * @param {String} dateString - Date string
   * @returns {String} Formatted date
   */
  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  }

  /**
   * Format type string
   * @param {String} type - Type string
   * @returns {String} Formatted type
   */
  formatType(type) {
    if (!type) return 'Unknown';
    
    const typeMap = {
      military: 'Military & Defense',
      surveillance: 'Surveillance & Tech',
      construction: 'Construction',
      finance: 'Finance',
      government: 'Government',
      other: 'Other'
    };
    
    return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
  }

  /**
   * Format confidence level
   * @param {String} confidence - Confidence level
   * @returns {String} Formatted confidence
   */
  formatConfidence(confidence) {
    return confidence.charAt(0).toUpperCase() + confidence.slice(1) + ' Confidence';
  }

  /**
   * Get confidence color
   * @param {String} level - Confidence level
   * @returns {String} Color code
   */
  getConfidenceColor(level) {
    const colors = {
      high: '#4caf50',
      medium: '#ff9800',
      low: '#f44336'
    };
    return colors[level] || '#9e9e9e';
  }

  /**
   * Get confidence description
   * @param {String} level - Confidence level
   * @returns {String} Description
   */
  getConfidenceDescription(level) {
    const descriptions = {
      high: 'Verified from multiple reliable sources',
      medium: 'Confirmed from single reliable source',
      low: 'Unverified or disputed information'
    };
    return descriptions[level] || 'Confidence level not specified';
  }

  /**
   * Format field name for display
   * @param {String} fieldName - Field name
   * @returns {String} Formatted field name
   */
  formatFieldName(fieldName) {
    return fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Check if string is valid URL
   * @param {String} string - String to check
   * @returns {Boolean} True if valid URL
   */
  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  /**
   * Update panel position
   * @param {String} position - New position
   */
  updatePosition(position) {
    this.options.position = position;
    this.panel.className = `metadata-panel metadata-panel--${position}`;
    
    // Update positioning styles based on position
    const styles = this.getPositionStyles(position);
    Object.assign(this.panel.style, styles);
  }

  /**
   * Get position styles
   * @param {String} position - Position
   * @returns {Object} Style object
   */
  getPositionStyles(position) {
    const styles = {
      right: {
        top: '20px',
        right: '20px',
        left: 'auto',
        bottom: 'auto',
        transform: 'translateX(100%)'
      },
      left: {
        top: '20px',
        left: '20px',
        right: 'auto',
        bottom: 'auto',
        transform: 'translateX(-100%)'
      },
      bottom: {
        bottom: '20px',
        left: '50%',
        right: 'auto',
        top: 'auto',
        transform: 'translate(-50%, 100%)',
        width: '90%',
        maxWidth: '600px'
      }
    };
    
    return styles[position] || styles.right;
  }

  /**
   * Get current data
   * @returns {Object} Current data
   */
  getCurrentData() {
    return this.currentData;
  }

  /**
   * Check if panel is visible
   * @returns {Boolean} True if visible
   */
  isOpen() {
    return this.isVisible;
  }

  /**
   * Destroy the metadata panel
   */
  destroy() {
    this.clearHideTimeout();
    
    if (this.panel && this.panel.parentNode) {
      this.panel.parentNode.removeChild(this.panel);
    }
    
    this.panel = null;
    this.container = null;
    this.currentData = null;
  }
}

/**
 * Factory function to create metadata panel
 * @param {String|Element} container - Container selector or element
 * @param {Object} options - Configuration options
 * @returns {MetadataPanel} Metadata panel instance
 */
export function createMetadataPanel(container, options = {}) {
  return new MetadataPanel(container, options);
}