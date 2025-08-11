/**
 * Accessibility Utilities for FasaadGov v02
 * Provides comprehensive accessibility enhancements for the visualization
 */

export class AccessibilityManager {
  constructor(renderer, options = {}) {
    this.renderer = renderer;
    this.options = {
      enableKeyboardNavigation: true,
      enableScreenReader: true,
      enableHighContrast: false,
      enableReducedMotion: false,
      announceChanges: true,
      focusIndicatorColor: '#1976d2',
      ...options
    };
    
    this.currentFocusIndex = -1;
    this.focusableElements = [];
    this.announcer = null;
    this.keyboardListeners = [];
    
    this.initialize();
  }

  /**
   * Initialize accessibility features
   */
  initialize() {
    this.createAnnouncer();
    this.setupKeyboardNavigation();
    this.setupScreenReaderSupport();
    this.setupFocusManagement();
    this.checkUserPreferences();
  }

  /**
   * Create live region for screen reader announcements
   */
  createAnnouncer() {
    this.announcer = document.createElement('div');
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.announcer.setAttribute('class', 'sr-only');
    this.announcer.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;
    
    document.body.appendChild(this.announcer);
  }

  /**
   * Setup keyboard navigation
   */
  setupKeyboardNavigation() {
    if (!this.options.enableKeyboardNavigation) return;

    const svg = this.renderer.getSvg();
    if (!svg) return;

    // Make SVG focusable
    svg.attr('tabindex', '0')
       .attr('role', 'application')
       .attr('aria-label', 'Interactive corporate complicity flow diagram. Use arrow keys to navigate between nodes, Enter to select, Escape to exit navigation mode.');

    // Add keyboard event listeners
    const keyboardHandler = (event) => this.handleKeyboardNavigation(event);
    svg.on('keydown', keyboardHandler);
    
    this.keyboardListeners.push({
      element: svg.node(),
      handler: keyboardHandler
    });

    // Update focusable elements when data changes
    this.updateFocusableElements();
  }

  /**
   * Setup screen reader support
   */
  setupScreenReaderSupport() {
    if (!this.options.enableScreenReader) return;

    const svg = this.renderer.getSvg();
    if (!svg) return;

    // Add description
    const desc = svg.append('desc')
      .text(this.generateVisualizationDescription());

    // Add title
    const title = svg.append('title')
      .text('Corporate Complicity Flow Visualization');

    // Add node descriptions
    this.addNodeDescriptions();
    
    // Add flow descriptions
    this.addFlowDescriptions();
  }

  /**
   * Setup focus management
   */
  setupFocusManagement() {
    const svg = this.renderer.getSvg();
    if (!svg) return;

    // Add focus indicators
    this.addFocusIndicators();
    
    // Handle focus events
    svg.selectAll('.node')
      .on('focus', (event, d) => this.handleNodeFocus(event, d))
      .on('blur', (event, d) => this.handleNodeBlur(event, d));
  }

  /**
   * Check user preferences for accessibility
   */
  checkUserPreferences() {
    // Check for reduced motion preference
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.options.enableReducedMotion = true;
      this.disableAnimations();
    }

    // Check for high contrast preference
    if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
      this.options.enableHighContrast = true;
      this.enableHighContrast();
    }

    // Listen for preference changes
    if (window.matchMedia) {
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      reducedMotionQuery.addListener((e) => {
        this.options.enableReducedMotion = e.matches;
        if (e.matches) {
          this.disableAnimations();
        }
      });

      const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
      highContrastQuery.addListener((e) => {
        this.options.enableHighContrast = e.matches;
        if (e.matches) {
          this.enableHighContrast();
        }
      });
    }
  }

  /**
   * Handle keyboard navigation
   * @param {Event} event - Keyboard event
   */
  handleKeyboardNavigation(event) {
    const { key, ctrlKey, shiftKey } = event;

    switch (key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        this.focusNext();
        break;
        
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        this.focusPrevious();
        break;
        
      case 'Home':
        event.preventDefault();
        this.focusFirst();
        break;
        
      case 'End':
        event.preventDefault();
        this.focusLast();
        break;
        
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.activateCurrentElement();
        break;
        
      case 'Escape':
        event.preventDefault();
        this.exitNavigationMode();
        break;
        
      case 'Tab':
        if (!shiftKey) {
          this.focusNext();
        } else {
          this.focusPrevious();
        }
        event.preventDefault();
        break;
        
      case 'h':
        if (ctrlKey) {
          event.preventDefault();
          this.showHelp();
        }
        break;
    }
  }

  /**
   * Update list of focusable elements
   */
  updateFocusableElements() {
    const svg = this.renderer.getSvg();
    if (!svg) return;

    this.focusableElements = [];
    
    // Add all nodes
    svg.selectAll('.node').each((d, i, nodes) => {
      const element = nodes[i];
      element.setAttribute('tabindex', '-1');
      element.setAttribute('role', 'button');
      
      this.focusableElements.push({
        element,
        type: 'node',
        data: this.getNodeData(element)
      });
    });

    // Add all flows (optional, for detailed navigation)
    svg.selectAll('.flow-line').each((d, i, nodes) => {
      const element = nodes[i];
      element.setAttribute('tabindex', '-1');
      element.setAttribute('role', 'button');
      
      this.focusableElements.push({
        element,
        type: 'flow',
        data: d
      });
    });
  }

  /**
   * Focus next element
   */
  focusNext() {
    if (this.focusableElements.length === 0) return;
    
    this.currentFocusIndex = (this.currentFocusIndex + 1) % this.focusableElements.length;
    this.focusElement(this.currentFocusIndex);
  }

  /**
   * Focus previous element
   */
  focusPrevious() {
    if (this.focusableElements.length === 0) return;
    
    this.currentFocusIndex = this.currentFocusIndex <= 0 ? 
      this.focusableElements.length - 1 : 
      this.currentFocusIndex - 1;
    this.focusElement(this.currentFocusIndex);
  }

  /**
   * Focus first element
   */
  focusFirst() {
    if (this.focusableElements.length === 0) return;
    
    this.currentFocusIndex = 0;
    this.focusElement(this.currentFocusIndex);
  }

  /**
   * Focus last element
   */
  focusLast() {
    if (this.focusableElements.length === 0) return;
    
    this.currentFocusIndex = this.focusableElements.length - 1;
    this.focusElement(this.currentFocusIndex);
  }

  /**
   * Focus specific element by index
   * @param {Number} index - Element index
   */
  focusElement(index) {
    if (index < 0 || index >= this.focusableElements.length) return;

    const focusableItem = this.focusableElements[index];
    const element = focusableItem.element;
    
    // Remove previous focus
    this.clearFocus();
    
    // Set focus
    element.focus();
    element.setAttribute('tabindex', '0');
    
    // Add visual focus indicator
    this.addFocusIndicator(element);
    
    // Announce to screen reader
    this.announceElement(focusableItem);
  }

  /**
   * Clear focus from all elements
   */
  clearFocus() {
    this.focusableElements.forEach(item => {
      item.element.setAttribute('tabindex', '-1');
      this.removeFocusIndicator(item.element);
    });
  }

  /**
   * Activate currently focused element
   */
  activateCurrentElement() {
    if (this.currentFocusIndex < 0 || this.currentFocusIndex >= this.focusableElements.length) return;

    const focusableItem = this.focusableElements[this.currentFocusIndex];
    const element = focusableItem.element;
    
    // Trigger click event
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    
    element.dispatchEvent(clickEvent);
    
    // Announce activation
    this.announce(`Activated ${this.getElementDescription(focusableItem)}`);
  }

  /**
   * Exit navigation mode
   */
  exitNavigationMode() {
    this.clearFocus();
    this.currentFocusIndex = -1;
    
    // Return focus to SVG container
    const svg = this.renderer.getSvg();
    if (svg) {
      svg.node().focus();
    }
    
    this.announce('Exited navigation mode');
  }

  /**
   * Add focus indicators to elements
   */
  addFocusIndicators() {
    const svg = this.renderer.getSvg();
    if (!svg) return;

    // Create focus indicator group
    const focusGroup = svg.append('g')
      .attr('class', 'focus-indicators')
      .style('pointer-events', 'none');
  }

  /**
   * Add focus indicator to specific element
   * @param {Element} element - Element to add indicator to
   */
  addFocusIndicator(element) {
    const svg = this.renderer.getSvg();
    if (!svg) return;

    // Remove existing indicators
    svg.selectAll('.focus-indicator').remove();

    // Get element bounds
    const bbox = element.getBBox();
    
    // Add focus indicator
    svg.select('.focus-indicators')
      .append('rect')
      .attr('class', 'focus-indicator')
      .attr('x', bbox.x - 3)
      .attr('y', bbox.y - 3)
      .attr('width', bbox.width + 6)
      .attr('height', bbox.height + 6)
      .attr('fill', 'none')
      .attr('stroke', this.options.focusIndicatorColor)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .style('pointer-events', 'none');
  }

  /**
   * Remove focus indicator from element
   * @param {Element} element - Element to remove indicator from
   */
  removeFocusIndicator(element) {
    const svg = this.renderer.getSvg();
    if (!svg) return;

    svg.selectAll('.focus-indicator').remove();
  }

  /**
   * Add node descriptions for screen readers
   */
  addNodeDescriptions() {
    const svg = this.renderer.getSvg();
    if (!svg) return;

    svg.selectAll('.node').each((d, i, nodes) => {
      const element = nodes[i];
      const nodeData = this.getNodeData(element);
      
      if (nodeData) {
        const description = this.generateNodeDescription(nodeData);
        element.setAttribute('aria-label', description);
        element.setAttribute('aria-describedby', `node-desc-${nodeData.id}`);
        
        // Add detailed description
        const desc = document.createElement('div');
        desc.id = `node-desc-${nodeData.id}`;
        desc.className = 'sr-only';
        desc.textContent = this.generateDetailedNodeDescription(nodeData);
        document.body.appendChild(desc);
      }
    });
  }

  /**
   * Add flow descriptions for screen readers
   */
  addFlowDescriptions() {
    const svg = this.renderer.getSvg();
    if (!svg) return;

    svg.selectAll('.flow-line').each((d, i, nodes) => {
      const element = nodes[i];
      
      if (d && d.flow) {
        const description = this.generateFlowDescription(d);
        element.setAttribute('aria-label', description);
      }
    });
  }

  /**
   * Generate visualization description
   * @returns {String} Description text
   */
  generateVisualizationDescription() {
    const data = this.renderer.getData();
    if (!data) return 'Corporate complicity flow visualization';

    const sourceCount = data.sources?.length || 0;
    const companyCount = data.companies?.length || 0;
    const targetCount = data.targets?.length || 0;
    const flowCount = data.flows?.length || 0;

    return `Interactive flow diagram showing ${sourceCount} funding sources, ${companyCount} companies, ${targetCount} targets, and ${flowCount} connections. Use arrow keys to navigate between elements, Enter to interact, and Escape to exit navigation.`;
  }

  /**
   * Generate node description
   * @param {Object} nodeData - Node data
   * @returns {String} Description text
   */
  generateNodeDescription(nodeData) {
    if (!nodeData) return 'Unknown node';

    let description = `${nodeData.name}, value ${nodeData.value} billion`;
    
    if (nodeData.type) {
      description += `, type ${nodeData.type}`;
    }
    
    if (nodeData.confidence) {
      description += `, confidence level ${nodeData.confidence}`;
    }

    return description;
  }

  /**
   * Generate detailed node description
   * @param {Object} nodeData - Node data
   * @returns {String} Detailed description
   */
  generateDetailedNodeDescription(nodeData) {
    if (!nodeData) return 'No additional information available';

    let description = `Detailed information for ${nodeData.name}: `;
    description += `Financial value of ${nodeData.value} billion dollars. `;
    
    if (nodeData.type) {
      description += `Category: ${nodeData.type}. `;
    }
    
    if (nodeData.confidence) {
      description += `Data confidence level: ${nodeData.confidence}. `;
    }
    
    if (nodeData.source) {
      description += `Source: ${nodeData.source}. `;
    }

    return description;
  }

  /**
   * Generate flow description
   * @param {Object} flowData - Flow data
   * @returns {String} Description text
   */
  generateFlowDescription(flowData) {
    if (!flowData || !flowData.flow) return 'Unknown flow';

    const { flow, fromNode, toNode } = flowData;
    
    let description = `Flow of ${flow.value} billion from ${fromNode?.name || 'unknown source'} to ${toNode?.name || 'unknown target'}`;
    
    if (flow.type) {
      description += `, type ${flow.type}`;
    }
    
    if (flow.confidence) {
      description += `, confidence ${flow.confidence}`;
    }

    return description;
  }

  /**
   * Get node data from DOM element
   * @param {Element} element - DOM element
   * @returns {Object} Node data
   */
  getNodeData(element) {
    const nodeId = element.getAttribute('data-id');
    const nodeType = element.getAttribute('data-type');
    
    if (!nodeId || !nodeType) return null;

    const data = this.renderer.getData();
    if (!data || !data[nodeType]) return null;

    return data[nodeType].find(node => node.id === nodeId);
  }

  /**
   * Get element description for announcements
   * @param {Object} focusableItem - Focusable item
   * @returns {String} Description
   */
  getElementDescription(focusableItem) {
    if (focusableItem.type === 'node') {
      return this.generateNodeDescription(focusableItem.data);
    } else if (focusableItem.type === 'flow') {
      return this.generateFlowDescription(focusableItem.data);
    }
    
    return 'element';
  }

  /**
   * Handle node focus event
   * @param {Event} event - Focus event
   * @param {Object} nodeData - Node data
   */
  handleNodeFocus(event, nodeData) {
    const element = event.target;
    this.addFocusIndicator(element);
    
    if (this.options.announceChanges) {
      const description = this.generateNodeDescription(nodeData);
      this.announce(`Focused on ${description}`);
    }
  }

  /**
   * Handle node blur event
   * @param {Event} event - Blur event
   * @param {Object} nodeData - Node data
   */
  handleNodeBlur(event, nodeData) {
    const element = event.target;
    this.removeFocusIndicator(element);
  }

  /**
   * Announce text to screen readers
   * @param {String} text - Text to announce
   */
  announce(text) {
    if (!this.options.announceChanges || !this.announcer) return;

    this.announcer.textContent = text;
    
    // Clear after announcement
    setTimeout(() => {
      this.announcer.textContent = '';
    }, 1000);
  }

  /**
   * Announce element information
   * @param {Object} focusableItem - Focusable item
   */
  announceElement(focusableItem) {
    const description = this.getElementDescription(focusableItem);
    this.announce(`Navigated to ${description}`);
  }

  /**
   * Show keyboard help
   */
  showHelp() {
    const helpText = `
      Keyboard Navigation Help:
      - Arrow keys: Navigate between elements
      - Enter or Space: Activate element
      - Home: Go to first element
      - End: Go to last element
      - Escape: Exit navigation mode
      - Ctrl+H: Show this help
    `;
    
    this.announce(helpText);
    
    // Also show visual help if possible
    if (typeof alert !== 'undefined') {
      alert(helpText);
    }
  }

  /**
   * Disable animations for reduced motion
   */
  disableAnimations() {
    const svg = this.renderer.getSvg();
    if (!svg) return;

    // Add CSS to disable transitions and animations
    const style = document.createElement('style');
    style.textContent = `
      .flow-rect, .flow-line, .node {
        transition: none !important;
        animation: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Enable high contrast mode
   */
  enableHighContrast() {
    const svg = this.renderer.getSvg();
    if (!svg) return;

    // Add high contrast styles
    const style = document.createElement('style');
    style.textContent = `
      .flow-rect {
        stroke: #000 !important;
        stroke-width: 2px !important;
      }
      .flow-line {
        stroke: #000 !important;
        stroke-width: 3px !important;
      }
      .focus-indicator {
        stroke: #ff0000 !important;
        stroke-width: 3px !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Update accessibility features when data changes
   */
  update() {
    this.updateFocusableElements();
    this.addNodeDescriptions();
    this.addFlowDescriptions();
    
    // Reset focus
    this.currentFocusIndex = -1;
    this.clearFocus();
  }

  /**
   * Destroy accessibility manager and clean up
   */
  destroy() {
    // Remove event listeners
    this.keyboardListeners.forEach(({ element, handler }) => {
      element.removeEventListener('keydown', handler);
    });
    
    // Remove announcer
    if (this.announcer && this.announcer.parentNode) {
      this.announcer.parentNode.removeChild(this.announcer);
    }
    
    // Remove descriptions
    document.querySelectorAll('[id^="node-desc-"]').forEach(el => {
      el.parentNode.removeChild(el);
    });
    
    // Clear references
    this.renderer = null;
    this.focusableElements = [];
    this.keyboardListeners = [];
  }
}

/**
 * Factory function to create accessibility manager
 * @param {Object} renderer - Sankey renderer instance
 * @param {Object} options - Configuration options
 * @returns {AccessibilityManager} Accessibility manager instance
 */
export function createAccessibilityManager(renderer, options = {}) {
  return new AccessibilityManager(renderer, options);
}

/**
 * Quick setup function for basic accessibility
 * @param {Object} renderer - Sankey renderer
 * @returns {AccessibilityManager} Configured accessibility manager
 */
export function setupAccessibility(renderer) {
  return new AccessibilityManager(renderer, {
    enableKeyboardNavigation: true,
    enableScreenReader: true,
    announceChanges: true
  });
}