/**
 * Sankey Renderer Module for FasaadGov v02
 * Modular D3-based flow visualization renderer
 */

export class SankeyRenderer {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? 
      document.querySelector(container) : container;
    
    if (!this.container) {
      throw new Error('Container element not found');
    }

    // Default configuration
    this.options = {
      width: 800,
      height: 500,
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
      nodeWidth: 150,
      nodeSpacing: { sources: 120, companies: 100, targets: 100 },
      positions: { sources: 50, companies: 300, targets: 550 },
      minNodeHeight: 30,
      nodeHeightScale: 2,
      minFlowWidth: 2,
      flowWidthScale: 3,
      borderRadius: 5,
      flowOpacity: 0.7,
      colors: {
        text: 'white',
        tooltip: 'rgba(0,0,0,0.8)'
      },
      animations: {
        enabled: true,
        duration: 200
      },
      ...options
    };

    // State
    this.svg = null;
    this.data = null;
    this.tooltip = null;
    this.eventHandlers = {
      nodeClick: null,
      nodeHover: null,
      flowClick: null,
      flowHover: null
    };

    // Initialize tooltip
    this.initializeTooltip();
  }

  /**
   * Initialize tooltip element
   */
  initializeTooltip() {
    // Look for existing tooltip or create new one
    this.tooltip = d3.select('#tooltip');
    
    if (this.tooltip.empty()) {
      this.tooltip = d3.select('body')
        .append('div')
        .attr('id', 'tooltip')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('background', this.options.colors.tooltip)
        .style('color', 'white')
        .style('padding', '10px')
        .style('border-radius', '5px')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('transition', 'opacity 0.2s')
        .style('z-index', 1000);
    }
  }

  /**
   * Render the visualization
   * @param {Object} data - Flow data to visualize
   */
  render(data) {
    if (!data) {
      throw new Error('Data is required for rendering');
    }

    this.data = this.processData(data);
    this.clear();
    this.createSvg();
    this.renderNodes();
    this.renderFlows();
    this.attachEventListeners();

    return this;
  }

  /**
   * Process and validate data
   * @param {Object} rawData - Raw data input
   * @returns {Object} Processed data
   */
  processData(rawData) {
    const processed = {
      sources: rawData.sources || [],
      companies: rawData.companies || [],
      targets: rawData.targets || [],
      flows: rawData.flows || []
    };

    // Validate required fields
    ['sources', 'companies', 'targets'].forEach(nodeType => {
      processed[nodeType].forEach((node, index) => {
        if (!node.id || !node.name || typeof node.value !== 'number' || !node.color) {
          console.warn(`Invalid ${nodeType} node at index ${index}:`, node);
        }
      });
    });

    processed.flows.forEach((flow, index) => {
      if (!flow.from || !flow.to || typeof flow.value !== 'number') {
        console.warn(`Invalid flow at index ${index}:`, flow);
      }
    });

    return processed;
  }

  /**
   * Create SVG container
   */
  createSvg() {
    this.svg = d3.select(this.container)
      .append('svg')
      .attr('width', this.options.width)
      .attr('height', this.options.height)
      .attr('viewBox', `0 0 ${this.options.width} ${this.options.height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('max-width', '100%')
      .style('height', 'auto');

    // Add accessibility attributes
    this.svg
      .attr('role', 'img')
      .attr('aria-label', 'Corporate complicity flow visualization showing money trail from funding sources through companies to operations');
  }

  /**
   * Render all nodes (sources, companies, targets)
   */
  renderNodes() {
    this.renderNodeGroup('sources', this.data.sources, this.options.positions.sources, this.options.nodeSpacing.sources);
    this.renderNodeGroup('companies', this.data.companies, this.options.positions.companies, this.options.nodeSpacing.companies);
    this.renderNodeGroup('targets', this.data.targets, this.options.positions.targets, this.options.nodeSpacing.targets);
  }

  /**
   * Render a group of nodes
   * @param {String} groupType - Type of nodes (sources, companies, targets)
   * @param {Array} nodes - Node data
   * @param {Number} x - X position
   * @param {Number} spacing - Vertical spacing between nodes
   */
  renderNodeGroup(groupType, nodes, x, spacing) {
    const nodeGroup = this.svg.append('g')
      .attr('class', `${groupType}-group`)
      .attr('data-group', groupType);

    nodes.forEach((node, i) => {
      const y = 50 + i * spacing;
      const height = Math.max(this.options.minNodeHeight, node.value * this.options.nodeHeightScale);
      
      // Create node group
      const nodeElement = nodeGroup.append('g')
        .attr('class', 'node')
        .attr('data-id', node.id)
        .attr('data-type', groupType)
        .attr('tabindex', '0') // Keyboard accessibility
        .style('cursor', 'pointer');

      // Node rectangle
      nodeElement.append('rect')
        .attr('class', 'flow-rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', this.options.nodeWidth)
        .attr('height', height)
        .attr('fill', node.color)
        .attr('rx', this.options.borderRadius)
        .style('transition', this.options.animations.enabled ? 'opacity 0.2s' : 'none');

      // Node name text
      nodeElement.append('text')
        .attr('class', 'node-name')
        .attr('x', x + this.options.nodeWidth / 2)
        .attr('y', y + height / 2)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', this.options.colors.text)
        .style('font-weight', 'bold')
        .style('font-size', '14px')
        .text(this.truncateText(node.name, this.options.nodeWidth - 20));

      // Node value text
      nodeElement.append('text')
        .attr('class', 'node-value')
        .attr('x', x + this.options.nodeWidth / 2)
        .attr('y', y + height / 2 + 15)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', this.options.colors.text)
        .style('font-size', '12px')
        .text(`${node.value}B`);

      // Store position data for flow rendering
      node._position = { x, y, height };
    });
  }

  /**
   * Render flow connections
   */
  renderFlows() {
    const flowGroup = this.svg.append('g')
      .attr('class', 'flows-group');

    this.data.flows.forEach((flow, index) => {
      const fromNode = this.findNode(flow.from);
      const toNode = this.findNode(flow.to);

      if (!fromNode || !toNode) {
        console.warn(`Flow ${index}: Could not find nodes for flow from "${flow.from}" to "${flow.to}"`);
        return;
      }

      const { fromX, fromY, toX, toY } = this.calculateFlowPositions(fromNode, toNode, flow);
      const strokeWidth = Math.max(this.options.minFlowWidth, flow.value / this.options.flowWidthScale);

      const flowElement = flowGroup.append('line')
        .attr('class', 'flow-line')
        .attr('data-from', flow.from)
        .attr('data-to', flow.to)
        .attr('x1', fromX)
        .attr('y1', fromY)
        .attr('x2', toX)
        .attr('y2', toY)
        .attr('stroke', fromNode.color)
        .attr('stroke-width', strokeWidth)
        .attr('opacity', this.options.flowOpacity)
        .style('cursor', 'pointer')
        .style('transition', this.options.animations.enabled ? 'stroke-width 0.2s' : 'none');

      // Store flow data for event handling
      flowElement.datum({ flow, fromNode, toNode });
    });
  }

  /**
   * Find node by ID across all node types
   * @param {String} nodeId - Node ID to find
   * @returns {Object|null} Found node or null
   */
  findNode(nodeId) {
    const allNodes = [...this.data.sources, ...this.data.companies, ...this.data.targets];
    return allNodes.find(node => node.id === nodeId) || null;
  }

  /**
   * Calculate flow line positions
   * @param {Object} fromNode - Source node
   * @param {Object} toNode - Target node
   * @param {Object} flow - Flow data
   * @returns {Object} Position coordinates
   */
  calculateFlowPositions(fromNode, toNode, flow) {
    const fromPos = fromNode._position;
    const toPos = toNode._position;

    // Determine if source is on left or right side of target
    const fromX = fromPos.x < toPos.x ? 
      fromPos.x + this.options.nodeWidth : // Right edge of source
      fromPos.x; // Left edge of source

    const toX = fromPos.x < toPos.x ? 
      toPos.x : // Left edge of target
      toPos.x + this.options.nodeWidth; // Right edge of target

    // Center vertically on nodes
    const fromY = fromPos.y + fromPos.height / 2;
    const toY = toPos.y + toPos.height / 2;

    return { fromX, fromY, toX, toY };
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Node events
    this.svg.selectAll('.node')
      .on('mouseover', (event, d) => this.handleNodeHover(event, d))
      .on('mouseout', () => this.hideTooltip())
      .on('click', (event, d) => this.handleNodeClick(event, d))
      .on('keydown', (event, d) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.handleNodeClick(event, d);
        }
      });

    // Flow events
    this.svg.selectAll('.flow-line')
      .on('mouseover', (event, d) => this.handleFlowHover(event, d))
      .on('mouseout', () => this.hideTooltip())
      .on('click', (event, d) => this.handleFlowClick(event, d));

    // Hover effects
    if (this.options.animations.enabled) {
      this.svg.selectAll('.flow-rect')
        .on('mouseover', function() {
          d3.select(this).style('opacity', 0.8);
        })
        .on('mouseout', function() {
          d3.select(this).style('opacity', 1);
        });

      this.svg.selectAll('.flow-line')
        .on('mouseover', function() {
          const currentWidth = d3.select(this).attr('stroke-width');
          d3.select(this).attr('stroke-width', Math.max(4, currentWidth * 1.5));
        })
        .on('mouseout', function(event, d) {
          const originalWidth = Math.max(2, d.flow.value / 3);
          d3.select(this).attr('stroke-width', originalWidth);
        });
    }
  }

  /**
   * Handle node hover events
   * @param {Event} event - Mouse event
   * @param {Object} nodeData - Node data
   */
  handleNodeHover(event, nodeData) {
    const node = d3.select(event.currentTarget).datum() || 
                 this.findNodeByElement(event.currentTarget);
    
    if (node) {
      this.showNodeTooltip(event, node);
      
      if (this.eventHandlers.nodeHover) {
        this.eventHandlers.nodeHover(event, node);
      }
    }
  }

  /**
   * Handle node click events
   * @param {Event} event - Click event
   * @param {Object} nodeData - Node data
   */
  handleNodeClick(event, nodeData) {
    const node = d3.select(event.currentTarget).datum() || 
                 this.findNodeByElement(event.currentTarget);
    
    if (node && this.eventHandlers.nodeClick) {
      this.eventHandlers.nodeClick(event, node);
    }
  }

  /**
   * Handle flow hover events
   * @param {Event} event - Mouse event
   * @param {Object} flowData - Flow data
   */
  handleFlowHover(event, flowData) {
    this.showFlowTooltip(event, flowData);
    
    if (this.eventHandlers.flowHover) {
      this.eventHandlers.flowHover(event, flowData);
    }
  }

  /**
   * Handle flow click events
   * @param {Event} event - Click event
   * @param {Object} flowData - Flow data
   */
  handleFlowClick(event, flowData) {
    if (this.eventHandlers.flowClick) {
      this.eventHandlers.flowClick(event, flowData);
    }
  }

  /**
   * Find node data by DOM element
   * @param {Element} element - DOM element
   * @returns {Object|null} Node data
   */
  findNodeByElement(element) {
    const nodeId = element.getAttribute('data-id');
    const nodeType = element.getAttribute('data-type');
    
    if (nodeId && nodeType && this.data[nodeType]) {
      return this.data[nodeType].find(node => node.id === nodeId);
    }
    
    return null;
  }

  /**
   * Show node tooltip
   * @param {Event} event - Mouse event
   * @param {Object} node - Node data
   */
  showNodeTooltip(event, node) {
    const content = this.formatNodeTooltip(node);
    this.showTooltip(event, content);
  }

  /**
   * Show flow tooltip
   * @param {Event} event - Mouse event
   * @param {Object} flowData - Flow data with fromNode and toNode
   */
  showFlowTooltip(event, flowData) {
    const content = this.formatFlowTooltip(flowData);
    this.showTooltip(event, content);
  }

  /**
   * Show tooltip at event position
   * @param {Event} event - Mouse event
   * @param {String} content - HTML content
   */
  showTooltip(event, content) {
    this.tooltip
      .style('opacity', 1)
      .html(content)
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY - 10) + 'px');
  }

  /**
   * Hide tooltip
   */
  hideTooltip() {
    this.tooltip.style('opacity', 0);
  }

  /**
   * Format node tooltip content
   * @param {Object} node - Node data
   * @returns {String} HTML content
   */
  formatNodeTooltip(node) {
    let content = `<strong>${node.name}</strong><br>Value: ${node.value}B`;
    
    if (node.type) {
      content += `<br>Type: ${node.type}`;
    }
    
    if (node.confidence) {
      content += `<br>Confidence: ${node.confidence}`;
    }
    
    return content;
  }

  /**
   * Format flow tooltip content
   * @param {Object} flowData - Flow data with nodes
   * @returns {String} HTML content
   */
  formatFlowTooltip(flowData) {
    const { flow, fromNode, toNode } = flowData;
    
    let content = `<strong>Flow: ${flow.value}B</strong><br>From: ${fromNode.name}<br>To: ${toNode.name}`;
    
    if (flow.type) {
      content += `<br>Type: ${flow.type}`;
    }
    
    if (flow.confidence) {
      content += `<br>Confidence: ${flow.confidence}`;
    }
    
    return content;
  }

  /**
   * Truncate text to fit within specified width
   * @param {String} text - Text to truncate
   * @param {Number} maxWidth - Maximum width in pixels
   * @returns {String} Truncated text
   */
  truncateText(text, maxWidth) {
    // Simple truncation - could be enhanced with actual text measurement
    const avgCharWidth = 8; // Approximate character width
    const maxChars = Math.floor(maxWidth / avgCharWidth);
    
    if (text.length <= maxChars) {
      return text;
    }
    
    return text.substring(0, maxChars - 3) + '...';
  }

  /**
   * Set event handler
   * @param {String} eventType - Event type (nodeClick, nodeHover, flowClick, flowHover)
   * @param {Function} handler - Event handler function
   */
  on(eventType, handler) {
    if (this.eventHandlers.hasOwnProperty(eventType)) {
      this.eventHandlers[eventType] = handler;
    } else {
      console.warn(`Unknown event type: ${eventType}`);
    }
    return this;
  }

  /**
   * Update visualization with new data
   * @param {Object} newData - New data to render
   */
  update(newData) {
    return this.render(newData);
  }

  /**
   * Clear the visualization
   */
  clear() {
    if (this.svg) {
      this.svg.remove();
      this.svg = null;
    }
  }

  /**
   * Destroy the renderer and clean up
   */
  destroy() {
    this.clear();
    
    if (this.tooltip && !this.tooltip.empty()) {
      this.tooltip.remove();
    }
    
    this.container = null;
    this.data = null;
    this.eventHandlers = {};
  }

  /**
   * Get current data
   * @returns {Object} Current data
   */
  getData() {
    return this.data;
  }

  /**
   * Get SVG element
   * @returns {Object} D3 selection of SVG
   */
  getSvg() {
    return this.svg;
  }

  /**
   * Resize the visualization
   * @param {Number} width - New width
   * @param {Number} height - New height
   */
  resize(width, height) {
    if (this.svg) {
      this.options.width = width;
      this.options.height = height;
      
      this.svg
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`);
      
      // Re-render with new dimensions
      if (this.data) {
        this.render(this.data);
      }
    }
  }
}

/**
 * Factory function to create renderer
 * @param {String|Element} container - Container selector or element
 * @param {Object} options - Configuration options
 * @returns {SankeyRenderer} Renderer instance
 */
export function createRenderer(container, options = {}) {
  return new SankeyRenderer(container, options);
}