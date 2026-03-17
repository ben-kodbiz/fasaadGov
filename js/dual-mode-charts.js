/**
 * Dual-Mode Visualization Adapter
 * 
 * Enables existing D3 visualizations to switch between 
 * mobile (simplified) and desktop (full-featured) modes
 * 
 * Usage:
 * const adapter = new DualModeAdapter(existingVisualization, {
 *   mobileConfig: { maxDataPoints: 5, showLabels: true },
 *   desktopConfig: { maxDataPoints: 50, showLabels: false }
 * });
 */

(function() {
  'use strict';
  
  class DualModeAdapter {
    constructor(visualization, options = {}) {
      this.visualization = visualization;
      this.options = {
        breakpoint: 768,
        mobileConfig: {
          maxDataPoints: 5,
          simplifyLabels: true,
          showTooltips: true,
          reduceAnimations: true,
          chartHeight: window.innerHeight * 0.5
        },
        desktopConfig: {
          maxDataPoints: Infinity,
          simplifyLabels: false,
          showTooltips: true,
          reduceAnimations: false,
          chartHeight: window.innerHeight * 0.7
        },
        onModeChange: null,
        ...options
      };
      
      this.isMobile = window.innerWidth < this.options.breakpoint;
      this.currentConfig = this.isMobile 
        ? this.options.mobileConfig 
        : this.options.desktopConfig;
      
      this.init();
    }
    
    init() {
      this.setupResizeListener();
      console.log(`DualModeAdapter initialized: ${this.isMobile ? 'mobile' : 'desktop'} mode`);
    }
    
    setupResizeListener() {
      let resizeTimeout;
      
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          const wasMobile = this.isMobile;
          this.isMobile = window.innerWidth < this.options.breakpoint;
          
          if (wasMobile !== this.isMobile) {
            this.switchMode(this.isMobile ? 'mobile' : 'desktop');
          }
        }, 100);
      });
    }
    
    switchMode(mode) {
      const oldMode = this.isMobile ? 'mobile' : 'desktop';
      this.isMobile = mode === 'mobile';
      this.currentConfig = this.isMobile 
        ? this.options.mobileConfig 
        : this.options.desktopConfig;
      
      console.log(`Mode switched: ${oldMode} → ${mode}`);
      
      if (this.options.onModeChange) {
        this.options.onModeChange(mode, this.currentConfig);
      }
      
      // Trigger re-render
      if (this.visualization && typeof this.visualization.render === 'function') {
        this.visualization.render();
      }
    }
    
    getConfig() {
      return this.currentConfig;
    }
    
    isMobileMode() {
      return this.isMobile;
    }
    
    // Simplify data based on mode
    simplifyData(data) {
      if (!this.isMobile) return data;
      
      const maxPoints = this.currentConfig.maxDataPoints;
      
      if (Array.isArray(data)) {
        return data.slice(0, maxPoints);
      }
      
      if (data && typeof data === 'object' && data.children) {
        return {
          ...data,
          children: data.children.slice(0, maxPoints)
        };
      }
      
      return data;
    }
    
    // Get simplified label for mobile
    simplifyLabel(label) {
      if (!this.isMobile || !this.currentConfig.simplifyLabels) return label;
      
      // Truncate long labels
      if (label.length > 15) {
        return label.substring(0, 12) + '...';
      }
      return label;
    }
  }
  
  // ============================================
  // Mobile-First Chart Renderers
  // These replace complex desktop charts on mobile
  // ============================================
  
  const MobileChartRenderers = {
    // Replace complex treemap with simple bar chart on mobile
    treemapToBarChart: function(container, data, options = {}) {
      // Simplify data for mobile
      const simplifiedData = data.slice(0, 7);
      
      const width = options.width || 400;
      const height = options.height || 300;
      const margin = { top: 20, right: 20, bottom: 60, left: 50 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
      
      const svg = d3.select(container)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('width', '100%')
        .style('height', 'auto');
      
      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
      
      const x = d3.scaleBand()
        .domain(simplifiedData.map(d => d.name))
        .range([0, innerWidth])
        .padding(0.3);
      
      const y = d3.scaleLinear()
        .domain([0, d3.max(simplifiedData, d => d.value)])
        .nice()
        .range([innerHeight, 0]);
      
      g.selectAll('.bar')
        .data(simplifiedData)
        .enter()
        .append('rect')
        .attr('x', d => x(d.name))
        .attr('y', d => y(d.value))
        .attr('width', x.bandwidth())
        .attr('height', d => innerHeight - y(d.value))
        .attr('fill', d => d.color || '#1976d2')
        .attr('rx', 4);
      
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end')
        .style('font-size', '10px');
      
      g.append('g')
        .call(d3.axisLeft(y).ticks(5))
        .style('font-size', '10px');
      
      return svg;
    },
    
    // Replace force-directed graph with static list on mobile
    networkToList: function(container, nodes, options = {}) {
      const maxNodes = options.maxNodes || 10;
      const simplifiedNodes = nodes.slice(0, maxNodes);
      
      const list = d3.select(container)
        .append('div')
        .attr('class', 'mobile-network-list')
        .style('display', 'flex')
        .style('flex-direction', 'column')
        .style('gap', '12px');
      
      simplifiedNodes.forEach(node => {
        const item = list.append('div')
          .attr('class', 'network-item')
          .style('display', 'flex')
          .style('align-items', 'center')
          .style('gap', '12px')
          .style('padding', '12px')
          .style('background', 'var(--surface-color, #fff)')
          .style('border-radius', '8px')
          .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)');
        
        // Color indicator
        item.append('div')
          .style('width', '16px')
          .style('height', '16px')
          .style('border-radius', '50%')
          .style('background', node.color || '#1976d2')
          .style('flex-shrink', '0');
        
        // Node info
        const info = item.append('div')
          .style('flex', '1');
        
        info.append('div')
          .attr('class', 'network-item-name')
          .style('font-weight', '600')
          .style('font-size', '0.9rem')
          .text(node.name);
        
        if (node.value) {
          info.append('div')
            .attr('class', 'network-item-value')
            .style('font-size', '0.8rem')
            .style('color', 'var(--on-surface-variant, #666)')
            .text(node.value);
        }
      });
      
      return list;
    },
    
    // Replace sunburst with pie chart on mobile
    sunburstToPie: function(container, data, options = {}) {
      const width = options.width || 300;
      const height = options.height || 300;
      const radius = Math.min(width, height) / 2;
      
      const svg = d3.select(container)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('width', '100%')
        .style('height', 'auto');
      
      const g = svg.append('g')
        .attr('transform', `translate(${width/2},${height/2})`);
      
      const color = d3.scaleOrdinal()
        .domain(data.children.map(d => d.name))
        .range(d3.schemeCategory10);
      
      const pie = d3.pie()
        .value(d => d.value)
        .sort(null);
      
      const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius * 0.9);
      
      const arcs = g.selectAll('.arc')
        .data(pie(data))
        .enter()
        .append('g');
      
      arcs.append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data.name))
        .attr('stroke', 'var(--surface-color, #fff)')
        .attr('stroke-width', 2);
      
      arcs.append('text')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', 'var(--surface-color, #fff)')
        .text(d => d.data.name);
      
      return svg;
    }
  };
  
  // ============================================
  // Helper: Detect chart type and apply mobile optimization
  // ============================================
  
  function optimizeForMobile(chartType, container, data, options = {}) {
    const isMobile = window.innerWidth < 768;
    
    if (!isMobile) {
      // Render desktop version
      if (options.desktopRenderer) {
        return options.desktopRenderer(container, data, options);
      }
      return null;
    }
    
    // Render mobile-optimized version
    switch(chartType) {
      case 'treemap':
        return MobileChartRenderers.treemapToBarChart(container, data, options);
      case 'network':
        return MobileChartRenderers.networkToList(container, data, options);
      case 'sunburst':
        return MobileChartRenderers.sunburstToPie(container, data, options);
      default:
        console.warn('Unknown chart type:', chartType);
        return null;
    }
  }
  
  // Export to global scope
  window.DualModeAdapter = DualModeAdapter;
  window.MobileChartRenderers = MobileChartRenderers;
  window.optimizeForMobile = optimizeForMobile;
  
})();
