/**
 * Mobile Scroll Controller for D3.js Visualizations
 * 
 * Purpose: Handle scroll-driven storytelling with IntersectionObserver
 * and provide mobile-optimized D3 rendering
 */

(function() {
  'use strict';

  // ============================================
  // TASK 2.3 — Scroll Trigger Engine
  // ============================================
  
  class MobileScrollController {
    constructor(options = {}) {
      this.options = {
        threshold: 0.6,
        rootMargin: '0px',
        ...options
      };
      
      this.steps = [];
      this.currentStep = null;
      this.observers = new Map();
      this.isMobile = this.checkIsMobile();
      
      this.init();
    }
    
    checkIsMobile() {
      return window.innerWidth < 768;
    }
    
    init() {
      // Find all story steps
      this.steps = document.querySelectorAll('.story-step');
      
      if (this.steps.length === 0) {
        console.log('No story steps found, skipping scroll controller');
        return;
      }
      
      // Setup intersection observer
      this.setupObserver();
      
      // Setup resize listener
      this.setupResizeListener();
      
      console.log(`MobileScrollController initialized with ${this.steps.length} steps`);
    }
    
    setupObserver() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const stepId = entry.target.id;
            this.triggerStepChange(stepId, entry.target);
          }
        });
      }, {
        threshold: this.options.threshold,
        rootMargin: this.options.rootMargin
      });
      
      this.steps.forEach(step => {
        observer.observe(step);
      });
      
      this.observers.set('steps', observer);
    }
    
    triggerStepChange(stepId, stepElement) {
      if (this.currentStep === stepId) return;
      
      this.currentStep = stepId;
      console.log(`Step changed to: ${stepId}`);
      
      // Trigger custom event for D3 charts to listen to
      const event = new CustomEvent('stepChange', {
        detail: { stepId, stepElement }
      });
      document.dispatchEvent(event);
      
      // Call callback if provided
      if (this.options.onStepChange) {
        this.options.onStepChange(stepId, stepElement);
      }
    }
    
    setupResizeListener() {
      let resizeTimeout;
      
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          const wasMobile = this.isMobile;
          this.isMobile = this.checkIsMobile();
          
          if (wasMobile !== this.isMobile) {
            console.log(`Viewport changed: ${this.isMobile ? 'mobile' : 'desktop'}`);
            
            // Trigger re-render if needed
            const event = new CustomEvent('viewportChange', {
              detail: { isMobile: this.isMobile }
            });
            document.dispatchEvent(event);
          }
        }, 100);
      });
    }
    
    // Public method to manually trigger a step
    goToStep(stepId) {
      const step = document.getElementById(stepId);
      if (step) {
        step.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    
    // Destroy observer and cleanup
    destroy() {
      this.observers.forEach(observer => observer.disconnect());
      this.observers.clear();
    }
  }
  
  // ============================================
  // TASK 4.1, 4.2 & 4.3 — Responsive D3 Renderer with viewBox
  // ============================================
  
  class MobileD3Renderer {
    constructor(containerSelector, options = {}) {
      this.container = document.querySelector(containerSelector);
      this.options = {
        mobileHeight: window.innerHeight * 0.5,
        desktopHeight: window.innerHeight * 0.7,
        mobileMaxDataPoints: 7,
        maintainAspectRatio: true,
        ...options
      };
      
      this.isMobile = window.innerWidth < 768;
      this.svg = null;
      this.data = null;
      this.width = 0;
      this.height = 0;
      
      this.init();
    }
    
    init() {
      if (!this.container) {
        console.error('Container not found:', this.container);
        return;
      }
      
      this.setupDimensions();
      this.createSVG();
      this.setupResizeListener();
    }
    
    setupDimensions() {
      const rect = this.container.getBoundingClientRect();
      this.width = rect.width || 800;
      this.height = this.isMobile ? this.options.mobileHeight : this.options.desktopHeight;
    }
    
    // TASK 4.1 — Create SVG with viewBox (MANDATORY)
    createSVG() {
      // Clear existing SVG
      if (this.svg) {
        this.svg.remove();
      }
      
      // Create SVG with viewBox for responsive scaling
      this.svg = d3.select(this.container)
        .append('svg')
        .attr('viewBox', `0 0 ${this.width} ${this.height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('width', '100%')
        .style('height', 'auto')
        .style('max-width', '100%');
      
      return this.svg;
    }
    
    setupResizeListener() {
      let resizeTimeout;
      
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          const wasMobile = this.isMobile;
          this.isMobile = window.innerWidth < 768;
          
          if (wasMobile !== this.isMobile) {
            this.rerender();
          }
        }, 100);
      });
    }
    
    setData(newData) {
      this.data = newData;
      return this;
    }
    
    render(renderFunction) {
      if (!this.svg || !renderFunction) return this;
      
      // Simplify data for mobile if needed
      const dataToRender = this.isMobile && this.data 
        ? this.simplifyDataForMobile(this.data)
        : this.data;
      
      renderFunction(this.svg, dataToRender, this.width, this.height, this.isMobile);
      return this;
    }
    
    rerender() {
      this.setupDimensions();
      this.createSVG();
      
      if (this.lastRenderFunction) {
        this.render(this.lastRenderFunction);
      }
    }
    
    simplifyDataForMobile(data) {
      // Default: limit arrays to mobileMaxDataPoints
      if (Array.isArray(data)) {
        return data.slice(0, this.options.mobileMaxDataPoints);
      }
      
      // If object with children, simplify children
      if (data && typeof data === 'object' && data.children) {
        return {
          ...data,
          children: data.children.slice(0, this.options.mobileMaxDataPoints)
        };
      }
      
      return data;
    }
    
    // Store last render function for rerendering
    setRenderFunction(fn) {
      this.lastRenderFunction = fn;
      return this;
    }
  }
  
  // ============================================
  // PHASE 4 — D3 Chart Factory (Pre-built responsive charts)
  // ============================================
  
  const D3ChartFactory = {
    // Bar Chart - Mobile Optimized
    createBarChart: function(container, data, options = {}) {
      const config = {
        width: options.width || 400,
        height: options.height || 300,
        margin: options.margin || { top: 20, right: 20, bottom: 40, left: 50 },
        color: options.color || '#1976d2',
        labelColor: options.labelColor || '#1c1b1f',
        ...options
      };
      
      const { width, height, margin } = config;
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
      
      // Scales
      const x = d3.scaleBand()
        .domain(data.map(d => d.label))
        .range([0, innerWidth])
        .padding(0.3);
      
      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .nice()
        .range([innerHeight, 0]);
      
      // Bars
      g.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'mobile-chart-bar')
        .attr('x', d => x(d.label))
        .attr('y', d => y(d.value))
        .attr('width', x.bandwidth())
        .attr('height', d => innerHeight - y(d.value))
        .attr('fill', config.color)
        .attr('rx', 4);
      
      // X Axis
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end')
        .attr('dx', '-0.5em')
        .attr('dy', '0.5em')
        .style('font-size', '10px')
        .style('fill', config.labelColor);
      
      // Y Axis
      g.append('g')
        .call(d3.axisLeft(y).ticks(5))
        .style('font-size', '10px')
        .style('fill', config.labelColor);
      
      return svg;
    },
    
    // Pie/Donut Chart - Mobile Optimized
    createDonutChart: function(container, data, options = {}) {
      const config = {
        width: options.width || 300,
        height: options.height || 300,
        innerRadius: options.innerRadius || 0.6,
        colors: options.colors || ['#1976d2', '#42a5f5', '#64b5f6', '#90caf9', '#bbdefb'],
        ...options
      };
      
      const { width, height } = config;
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
        .domain(data.map(d => d.label))
        .range(config.colors);
      
      const pie = d3.pie()
        .value(d => d.value)
        .sort(null);
      
      const arc = d3.arc()
        .innerRadius(radius * config.innerRadius)
        .outerRadius(radius * 0.9);
      
      const arcs = g.selectAll('.arc')
        .data(pie(data))
        .enter()
        .append('g')
        .attr('class', 'arc');
      
      arcs.append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data.label))
        .attr('stroke', 'var(--surface-color, #fff)')
        .attr('stroke-width', 2);
      
      // Labels
      arcs.append('text')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', 'var(--surface-color, #fff)')
        .text(d => d.data.label);
      
      return svg;
    },
    
    // Line Chart - Mobile Optimized
    createLineChart: function(container, data, options = {}) {
      const config = {
        width: options.width || 400,
        height: options.height || 250,
        margin: options.margin || { top: 20, right: 20, bottom: 40, left: 50 },
        color: options.color || '#1976d2',
        ...options
      };
      
      const { width, height, margin } = config;
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
      
      // Scales
      const x = d3.scalePoint()
        .domain(data.map(d => d.label))
        .range([0, innerWidth]);
      
      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .nice()
        .range([innerHeight, 0]);
      
      // Line
      const line = d3.line()
        .x(d => x(d.label))
        .y(d => y(d.value))
        .curve(d3.curveMonotoneX);
      
      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', config.color)
        .attr('stroke-width', 3)
        .attr('d', line);
      
      // Points
      g.selectAll('.point')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'point')
        .attr('cx', d => x(d.label))
        .attr('cy', d => y(d.value))
        .attr('r', 5)
        .attr('fill', config.color)
        .attr('stroke', 'var(--surface-color, #fff)')
        .attr('stroke-width', 2);
      
      // Axes
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('font-size', '10px');
      
      g.append('g')
        .call(d3.axisLeft(y).ticks(5))
        .style('font-size', '10px');
      
      return svg;
    }
  };
  
  // ============================================
  // PHASE 6 — Performance: Debounce Scroll
  // ============================================
  
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // ============================================
  // Lazy Load Helper
  // ============================================
  
  function lazyLoadSections(selector = '.lazy-section') {
    const sections = document.querySelectorAll(selector);
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const section = entry.target;
          const dataUrl = section.dataset.loadUrl;
          
          if (dataUrl) {
            section.classList.add('skeleton');
            
            fetch(dataUrl)
              .then(response => response.json())
              .then(data => {
                section.dispatchEvent(new CustomEvent('dataLoaded', {
                  detail: { data }
                }));
                section.classList.remove('skeleton');
              })
              .catch(error => {
                console.error('Lazy load error:', error);
                section.classList.remove('skeleton');
              });
          }
          
          observer.unobserve(section);
        }
      });
    }, { threshold: 0.1 });
    
    sections.forEach(section => observer.observe(section));
  }
  
  // ============================================
  // Export to global scope
  // ============================================
  
  window.MobileScrollController = MobileScrollController;
  window.MobileD3Renderer = MobileD3Renderer;
  window.D3ChartFactory = D3ChartFactory;
  window.lazyLoadSections = lazyLoadSections;
  window.debounceScroll = debounce;
  
  // ============================================
  // Auto-initialize if DOM is ready
  // ============================================
  
  function autoInit() {
    // Initialize scroll controller if story steps exist
    const storySteps = document.querySelectorAll('.story-step');
    if (storySteps.length > 0) {
      window.scrollController = new MobileScrollController({
        onStepChange: (stepId, stepElement) => {
          console.log('Auto-init: Step changed to', stepId);
        }
      });
    }
    
    // Initialize lazy loading
    lazyLoadSections();
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
  
})();
