/**
 * Export System Module for FasaadGov v02
 * Handles exporting visualizations and data in multiple formats
 */

export class ExportSystem {
  constructor(renderer, options = {}) {
    this.renderer = renderer;
    this.options = {
      defaultFilename: 'fasaad-flow',
      imageQuality: 1.0,
      svgStyles: true,
      jsonIndent: 2,
      t: (key, params = {}) => key, // Default translation function (fallback)
      ...options
    };
    
    this.isExporting = false;
  }

  /**
   * Create export UI buttons
   * @returns {String} HTML for export buttons
   */
  createUI() {
    const { t } = this.options;
    
    return `
      <div class="export-panel">
        <button id="export-svg" class="btn export-btn" data-i18n-title="export.export_svg" title="${t('export.export_svg')}">
          <span data-i18n="export.export_svg">${t('export.export_svg')}</span>
        </button>
        <button id="export-png" class="btn export-btn" data-i18n-title="export.export_png" title="${t('export.export_png')}">
          <span data-i18n="export.export_png">${t('export.export_png')}</span>
        </button>
        <button id="export-json" class="btn export-btn" data-i18n-title="export.export_json" title="${t('export.export_json')}">
          <span data-i18n="export.export_json">${t('export.export_json')}</span>
        </button>
        <button id="export-csv" class="btn export-btn" data-i18n-title="export.export_csv" title="${t('export.export_csv')}">
          <span data-i18n="export.export_csv">${t('export.export_csv')}</span>
        </button>
      </div>
    `;
  }

  /**
   * Initialize export system with DOM integration
   * @param {String|Element} container - Container for export buttons
   */
  initialize(container) {
    const containerEl = typeof container === 'string' ? 
      document.querySelector(container) : container;
    
    if (!containerEl) {
      throw new Error('Export container not found');
    }

    // Insert export UI
    containerEl.innerHTML = this.createUI();

    // Attach event listeners
    this.attachEventListeners(containerEl);
  }

  /**
   * Attach event listeners to export buttons
   * @param {Element} container - Container element
   */
  attachEventListeners(container) {
    const svgBtn = container.querySelector('#export-svg');
    const pngBtn = container.querySelector('#export-png');
    const jsonBtn = container.querySelector('#export-json');
    const csvBtn = container.querySelector('#export-csv');

    if (svgBtn) svgBtn.addEventListener('click', () => this.exportSVG());
    if (pngBtn) pngBtn.addEventListener('click', () => this.exportPNG());
    if (jsonBtn) jsonBtn.addEventListener('click', () => this.exportJSON());
    if (csvBtn) csvBtn.addEventListener('click', () => this.exportCSV());
  }

  /**
   * Export visualization as SVG
   * @param {String} filename - Optional filename
   */
  async exportSVG(filename = null) {
    if (this.isExporting) return;
    
    try {
      this.isExporting = true;
      this.setButtonState('export-svg', 'Exporting...', true);

      const svgElement = this.getSVGElement();
      if (!svgElement) {
        throw new Error('No SVG element found to export');
      }

      // Clone SVG to avoid modifying original
      const svgClone = svgElement.cloneNode(true);
      
      // Add styles if requested
      if (this.options.svgStyles) {
        this.embedStyles(svgClone);
      }

      // Serialize SVG
      const svgData = new XMLSerializer().serializeToString(svgClone);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });

      // Download
      const finalFilename = filename || `${this.options.defaultFilename}.svg`;
      this.downloadBlob(svgBlob, finalFilename);

      console.log('✅ SVG export completed');

    } catch (error) {
      console.error('SVG export failed:', error);
      this.showError(this.options.t('export.export_failed', { error: error.message }));
    } finally {
      this.isExporting = false;
      this.setButtonState('export-svg', this.options.t('export.export_svg'), false);
    }
  }

  /**
   * Export visualization as PNG
   * @param {String} filename - Optional filename
   * @param {Number} scale - Scale factor for resolution
   */
  async exportPNG(filename = null, scale = 2) {
    if (this.isExporting) return;
    
    try {
      this.isExporting = true;
      this.setButtonState('export-png', this.options.t('export.converting'), true);

      const svgElement = this.getSVGElement();
      if (!svgElement) {
        throw new Error('No SVG element found to export');
      }

      // Convert SVG to PNG using canvas
      const canvas = await this.svgToCanvas(svgElement, scale);
      
      // Create blob and download
      canvas.toBlob((blob) => {
        const finalFilename = filename || `${this.options.defaultFilename}.png`;
        this.downloadBlob(blob, finalFilename);
        console.log('✅ PNG export completed');
      }, 'image/png', this.options.imageQuality);

    } catch (error) {
      console.error('PNG export failed:', error);
      this.showError(this.options.t('export.export_failed', { error: error.message }));
    } finally {
      this.isExporting = false;
      this.setButtonState('export-png', this.options.t('export.export_png'), false);
    }
  }

  /**
   * Export data as JSON
   * @param {String} filename - Optional filename
   */
  async exportJSON(filename = null) {
    if (this.isExporting) return;
    
    try {
      this.isExporting = true;
      this.setButtonState('export-json', this.options.t('export.preparing'), true);

      const data = this.renderer.getData();
      if (!data) {
        throw new Error('No data available to export');
      }

      // Add export metadata
      const exportData = {
        ...data,
        _export: {
          timestamp: new Date().toISOString(),
          version: '2.0.0',
          format: 'fasaad-flow-json',
          generator: 'FasaadGov v02 Export System'
        }
      };

      const jsonString = JSON.stringify(exportData, null, this.options.jsonIndent);
      const jsonBlob = new Blob([jsonString], { type: 'application/json' });

      const finalFilename = filename || `${this.options.defaultFilename}.json`;
      this.downloadBlob(jsonBlob, finalFilename);

      console.log('✅ JSON export completed');

    } catch (error) {
      console.error('JSON export failed:', error);
      this.showError(this.options.t('export.export_failed', { error: error.message }));
    } finally {
      this.isExporting = false;
      this.setButtonState('export-json', this.options.t('export.export_json'), false);
    }
  }

  /**
   * Export data as CSV
   * @param {String} filename - Optional filename
   */
  async exportCSV(filename = null) {
    if (this.isExporting) return;
    
    try {
      this.isExporting = true;
      this.setButtonState('export-csv', this.options.t('export.converting'), true);

      const data = this.renderer.getData();
      if (!data) {
        throw new Error('No data available to export');
      }

      const csvContent = this.convertToCSV(data);
      const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });

      const finalFilename = filename || `${this.options.defaultFilename}.csv`;
      this.downloadBlob(csvBlob, finalFilename);

      console.log('✅ CSV export completed');

    } catch (error) {
      console.error('CSV export failed:', error);
      this.showError(this.options.t('export.export_failed', { error: error.message }));
    } finally {
      this.isExporting = false;
      this.setButtonState('export-csv', this.options.t('export.export_csv'), false);
    }
  }

  /**
   * Get SVG element from renderer
   * @returns {Element} SVG element
   */
  getSVGElement() {
    const svg = this.renderer.getSvg();
    return svg ? svg.node() : null;
  }

  /**
   * Convert SVG to Canvas
   * @param {Element} svgElement - SVG element
   * @param {Number} scale - Scale factor
   * @returns {Promise<HTMLCanvasElement>} Canvas element
   */
  svgToCanvas(svgElement, scale = 1) {
    return new Promise((resolve, reject) => {
      try {
        // Get SVG dimensions
        const svgRect = svgElement.getBoundingClientRect();
        const width = svgRect.width || parseInt(svgElement.getAttribute('width')) || 800;
        const height = svgRect.height || parseInt(svgElement.getAttribute('height')) || 500;

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');

        // Scale context for high resolution
        ctx.scale(scale, scale);

        // Create image from SVG
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height);
          URL.revokeObjectURL(url);
          resolve(canvas);
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load SVG image'));
        };

        img.src = url;

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Embed CSS styles into SVG
   * @param {Element} svgElement - SVG element to modify
   */
  embedStyles(svgElement) {
    // Get computed styles from the page
    const styleSheets = Array.from(document.styleSheets);
    let cssRules = '';

    styleSheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || sheet.rules || []);
        rules.forEach(rule => {
          if (rule.selectorText && (
            rule.selectorText.includes('.flow-rect') ||
            rule.selectorText.includes('.flow-line') ||
            rule.selectorText.includes('.node') ||
            rule.selectorText.includes('text')
          )) {
            cssRules += rule.cssText + '\n';
          }
        });
      } catch (e) {
        // Skip stylesheets that can't be accessed (CORS)
        console.warn('Could not access stylesheet:', e);
      }
    });

    if (cssRules) {
      const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      styleElement.textContent = cssRules;
      svgElement.insertBefore(styleElement, svgElement.firstChild);
    }
  }

  /**
   * Convert data to CSV format
   * @param {Object} data - Data to convert
   * @returns {String} CSV content
   */
  convertToCSV(data) {
    const sections = [];

    // Helper function to escape CSV values
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Helper function to convert array to CSV section
    const arrayToCSV = (array, sectionName) => {
      if (!array || array.length === 0) return '';
      
      const headers = Object.keys(array[0]);
      const headerRow = headers.map(escapeCSV).join(',');
      const dataRows = array.map(item => 
        headers.map(header => escapeCSV(item[header])).join(',')
      );
      
      return `${sectionName}\n${headerRow}\n${dataRows.join('\n')}\n`;
    };

    // Export each data section
    if (data.sources) sections.push(arrayToCSV(data.sources, 'SOURCES'));
    if (data.companies) sections.push(arrayToCSV(data.companies, 'COMPANIES'));
    if (data.targets) sections.push(arrayToCSV(data.targets, 'TARGETS'));
    if (data.flows) sections.push(arrayToCSV(data.flows, 'FLOWS'));

    // Add metadata
    const timestamp = new Date().toISOString();
    const metadata = `EXPORT_INFO\nTimestamp,${escapeCSV(timestamp)}\nVersion,2.0.0\nFormat,FasaadGov CSV Export\n`;

    return metadata + '\n' + sections.join('\n');
  }

  /**
   * Download blob as file
   * @param {Blob} blob - Blob to download
   * @param {String} filename - Filename
   */
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  /**
   * Set button state (text and disabled status)
   * @param {String} buttonId - Button ID
   * @param {String} text - Button text
   * @param {Boolean} disabled - Disabled state
   */
  setButtonState(buttonId, text, disabled) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.textContent = text;
      button.disabled = disabled;
    }
  }

  /**
   * Show error message
   * @param {String} message - Error message
   */
  showError(message) {
    // Try to find a status element to show the error
    const statusEl = document.getElementById('status-message') || 
                    document.querySelector('.status') ||
                    document.querySelector('.error-display');
    
    if (statusEl) {
      statusEl.innerHTML = `<div class="error">❌ ${message}</div>`;
      setTimeout(() => {
        statusEl.innerHTML = '';
      }, 5000);
    } else {
      // Fallback to alert
      alert('Export Error: ' + message);
    }
  }

  /**
   * Get export statistics
   * @returns {Object} Export statistics
   */
  getStats() {
    const data = this.renderer.getData();
    if (!data) return null;

    return {
      sources: data.sources?.length || 0,
      companies: data.companies?.length || 0,
      targets: data.targets?.length || 0,
      flows: data.flows?.length || 0,
      totalNodes: (data.sources?.length || 0) + (data.companies?.length || 0) + (data.targets?.length || 0)
    };
  }

  /**
   * Check if export is supported
   * @returns {Object} Support status for different formats
   */
  static checkSupport() {
    return {
      svg: typeof XMLSerializer !== 'undefined',
      png: typeof HTMLCanvasElement !== 'undefined' && 
           HTMLCanvasElement.prototype.toBlob !== 'undefined',
      json: typeof JSON !== 'undefined',
      csv: true,
      download: typeof URL !== 'undefined' && 
                URL.createObjectURL !== 'undefined'
    };
  }

  /**
   * Destroy export system and clean up
   */
  destroy() {
    this.renderer = null;
    this.isExporting = false;
  }
}

/**
 * Factory function to create export system
 * @param {Object} renderer - Sankey renderer instance
 * @param {Object} options - Configuration options
 * @returns {ExportSystem} Export system instance
 */
export function createExportSystem(renderer, options = {}) {
  return new ExportSystem(renderer, options);
}

/**
 * Quick export function for simple use cases
 * @param {Object} renderer - Sankey renderer
 * @param {String} format - Export format (svg, png, json, csv)
 * @param {String} filename - Optional filename
 */
export async function quickExport(renderer, format, filename = null) {
  const exportSystem = new ExportSystem(renderer);
  
  switch (format.toLowerCase()) {
    case 'svg':
      return await exportSystem.exportSVG(filename);
    case 'png':
      return await exportSystem.exportPNG(filename);
    case 'json':
      return await exportSystem.exportJSON(filename);
    case 'csv':
      return await exportSystem.exportCSV(filename);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}