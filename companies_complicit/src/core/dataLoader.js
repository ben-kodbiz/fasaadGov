/**
 * Data Loader Module for FasaadGov v02
 * Handles loading, validation, and enhancement of data with backward compatibility
 */

import { DataValidator } from '../utils/validator.js';

export class DataLoader {
  constructor(schema = null) {
    this.schema = schema;
    this.validator = schema ? new DataValidator(schema) : null;
    this.loadedData = null;
    this.originalData = null;
  }

  /**
   * Load and process data from various sources
   * @param {Object|String} source - Data object or URL to fetch from
   * @param {Object} options - Loading options
   * @returns {Promise<Object>} Processed data with validation results
   */
  async loadData(source, options = {}) {
    try {
      let rawData;

      // Handle different source types
      if (typeof source === 'string') {
        rawData = await this.fetchFromUrl(source);
      } else if (typeof source === 'object') {
        rawData = source;
      } else {
        throw new Error('Invalid data source type');
      }

      // Store original data for reference
      this.originalData = JSON.parse(JSON.stringify(rawData));

      // Detect and handle data format
      const formatInfo = this.detectDataFormat(rawData);
      let processedData;

      if (formatInfo.isLegacy) {
        console.log('📦 Detected legacy data format, enhancing...');
        processedData = this.enhanceLegacyData(rawData, options);
      } else {
        processedData = rawData;
      }

      // Validate if schema is available
      let validationResult = { valid: true, message: 'No validation performed' };
      if (this.validator) {
        validationResult = this.validator.validateComplete(processedData);
        
        if (!validationResult.valid && options.strict !== false) {
          throw new Error(`Data validation failed: ${validationResult.message}`);
        }
      }

      // Store processed data
      this.loadedData = processedData;

      return {
        success: true,
        data: processedData,
        validation: validationResult,
        format: formatInfo,
        originalData: this.originalData,
        enhanced: formatInfo.isLegacy
      };

    } catch (error) {
      console.error('Data loading failed:', error);
      
      return {
        success: false,
        error: error.message,
        data: null,
        validation: { valid: false, message: error.message }
      };
    }
  }

  /**
   * Fetch data from URL
   * @param {String} url - URL to fetch from
   * @returns {Promise<Object>} Parsed JSON data
   */
  async fetchFromUrl(url) {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('Response may not be JSON, attempting to parse anyway');
    }

    return await response.json();
  }

  /**
   * Detect data format (legacy vs enhanced)
   * @param {Object} data - Raw data object
   * @returns {Object} Format information
   */
  detectDataFormat(data) {
    const hasLegacyStructure = (
      data.sources && Array.isArray(data.sources) &&
      data.companies && Array.isArray(data.companies) &&
      data.targets && Array.isArray(data.targets) &&
      data.flows && Array.isArray(data.flows)
    );

    if (!hasLegacyStructure) {
      return {
        isLegacy: false,
        version: 'unknown',
        confidence: 'low'
      };
    }

    // Check for v02 enhanced fields
    const hasEnhancedFields = this.checkForEnhancedFields(data);
    
    if (hasEnhancedFields) {
      return {
        isLegacy: false,
        version: '2.0',
        confidence: 'high'
      };
    }

    // Check for basic legacy structure
    const hasBasicFields = this.checkForBasicFields(data);
    
    return {
      isLegacy: hasBasicFields,
      version: hasBasicFields ? '1.0' : 'unknown',
      confidence: hasBasicFields ? 'high' : 'medium'
    };
  }

  /**
   * Check for enhanced v02 fields
   * @param {Object} data - Data to check
   * @returns {Boolean} True if enhanced fields found
   */
  checkForEnhancedFields(data) {
    // Check sources for enhanced fields
    if (data.sources && data.sources.length > 0) {
      const firstSource = data.sources[0];
      if (firstSource.confidence || firstSource.evidence || firstSource.updated_at) {
        return true;
      }
    }

    // Check companies for enhanced fields
    if (data.companies && data.companies.length > 0) {
      const firstCompany = data.companies[0];
      if (firstCompany.type || firstCompany.headquarters || firstCompany.news_articles) {
        return true;
      }
    }

    // Check for meta section
    if (data.meta && (data.meta.version || data.meta.updated_at)) {
      return true;
    }

    return false;
  }

  /**
   * Check for basic legacy fields
   * @param {Object} data - Data to check
   * @returns {Boolean} True if basic structure is valid
   */
  checkForBasicFields(data) {
    const requiredSections = ['sources', 'companies', 'targets', 'flows'];
    
    for (const section of requiredSections) {
      if (!data[section] || !Array.isArray(data[section])) {
        return false;
      }

      // Check first item has required fields
      if (data[section].length > 0) {
        const firstItem = data[section][0];
        if (section === 'flows') {
          if (!firstItem.from || !firstItem.to || typeof firstItem.value !== 'number') {
            return false;
          }
        } else {
          if (!firstItem.id || !firstItem.name || typeof firstItem.value !== 'number' || !firstItem.color) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Enhance legacy data with default values and structure
   * @param {Object} legacyData - Legacy format data
   * @param {Object} options - Enhancement options
   * @returns {Object} Enhanced data
   */
  enhanceLegacyData(legacyData, options = {}) {
    const enhanced = JSON.parse(JSON.stringify(legacyData));
    const timestamp = new Date().toISOString();

    // Enhance sources
    if (enhanced.sources) {
      enhanced.sources = enhanced.sources.map(source => ({
        ...source,
        type: options.defaultSourceType || 'other',
        confidence: options.defaultConfidence || 'medium',
        updated_at: timestamp,
        source: options.defaultAttribution || 'Legacy data import',
        ...this.extractAdditionalFields(source, 'source')
      }));
    }

    // Enhance companies
    if (enhanced.companies) {
      enhanced.companies = enhanced.companies.map(company => ({
        ...company,
        type: this.inferCompanyType(company.name) || options.defaultCompanyType || 'other',
        confidence: options.defaultConfidence || 'medium',
        updated_at: timestamp,
        source: options.defaultAttribution || 'Legacy data import',
        ...this.extractAdditionalFields(company, 'company')
      }));
    }

    // Enhance targets
    if (enhanced.targets) {
      enhanced.targets = enhanced.targets.map(target => ({
        ...target,
        type: this.inferTargetType(target.name) || options.defaultTargetType || 'other',
        confidence: options.defaultConfidence || 'medium',
        updated_at: timestamp,
        ...this.extractAdditionalFields(target, 'target')
      }));
    }

    // Enhance flows
    if (enhanced.flows) {
      enhanced.flows = enhanced.flows.map(flow => ({
        ...flow,
        type: options.defaultFlowType || 'funding',
        confidence: options.defaultConfidence || 'medium',
        verification_date: timestamp.split('T')[0], // Date only
        ...this.extractAdditionalFields(flow, 'flow')
      }));
    }

    // Add meta section
    enhanced.meta = {
      version: '2.0.0',
      updated_at: timestamp,
      source_notice: options.sourceNotice || 'Data enhanced from legacy format',
      disclaimer: options.disclaimer || 'This data has been automatically enhanced from legacy format. Verify accuracy before use.',
      methodology: 'Automatic enhancement with default values applied to legacy data structure',
      ...(legacyData.meta || {})
    };

    return enhanced;
  }

  /**
   * Extract additional fields that might exist in legacy data
   * @param {Object} item - Data item
   * @param {String} type - Item type
   * @returns {Object} Additional fields
   */
  extractAdditionalFields(item, type) {
    const additional = {};
    const knownFields = {
      source: ['id', 'name', 'value', 'color'],
      company: ['id', 'name', 'value', 'color'],
      target: ['id', 'name', 'value', 'color'],
      flow: ['from', 'to', 'value']
    };

    const known = knownFields[type] || [];
    
    Object.keys(item).forEach(key => {
      if (!known.includes(key)) {
        additional[key] = item[key];
      }
    });

    return additional;
  }

  /**
   * Infer company type from name
   * @param {String} name - Company name
   * @returns {String} Inferred type
   */
  inferCompanyType(name) {
    const patterns = {
      military: /military|defense|weapons|arms|aerospace|lockheed|boeing|raytheon|general dynamics/i,
      surveillance: /surveillance|tech|google|microsoft|amazon|palantir|nso/i,
      construction: /construction|caterpillar|hyundai|engineering/i,
      finance: /bank|financial|investment|fund|capital/i
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(name)) {
        return type;
      }
    }

    return 'other';
  }

  /**
   * Infer target type from name
   * @param {String} name - Target name
   * @returns {String} Inferred type
   */
  inferTargetType(name) {
    const patterns = {
      military: /military|operations|combat|warfare/i,
      surveillance: /surveillance|monitoring|intelligence/i,
      infrastructure: /infrastructure|destruction|demolition/i,
      settlements: /settlement|expansion|colony/i
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(name)) {
        return type;
      }
    }

    return 'other';
  }

  /**
   * Get loaded data
   * @returns {Object} Currently loaded data
   */
  getData() {
    return this.loadedData;
  }

  /**
   * Get original data before enhancement
   * @returns {Object} Original data
   */
  getOriginalData() {
    return this.originalData;
  }

  /**
   * Reload data with different options
   * @param {Object} options - New loading options
   * @returns {Promise<Object>} Reloaded data
   */
  async reload(options = {}) {
    if (!this.originalData) {
      throw new Error('No original data available for reload');
    }

    return await this.loadData(this.originalData, options);
  }

  /**
   * Export enhanced data
   * @param {String} format - Export format ('json', 'csv')
   * @returns {String} Exported data
   */
  export(format = 'json') {
    if (!this.loadedData) {
      throw new Error('No data loaded');
    }

    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(this.loadedData, null, 2);
      
      case 'csv':
        return this.exportToCsv(this.loadedData);
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Export data to CSV format
   * @param {Object} data - Data to export
   * @returns {String} CSV formatted data
   */
  exportToCsv(data) {
    const csvSections = [];

    // Export sources
    if (data.sources && data.sources.length > 0) {
      const headers = Object.keys(data.sources[0]).join(',');
      const rows = data.sources.map(source => 
        Object.values(source).map(val => 
          typeof val === 'string' && val.includes(',') ? `"${val}"` : val
        ).join(',')
      );
      csvSections.push('SOURCES\n' + headers + '\n' + rows.join('\n'));
    }

    // Export companies
    if (data.companies && data.companies.length > 0) {
      const headers = Object.keys(data.companies[0]).join(',');
      const rows = data.companies.map(company => 
        Object.values(company).map(val => 
          typeof val === 'string' && val.includes(',') ? `"${val}"` : val
        ).join(',')
      );
      csvSections.push('COMPANIES\n' + headers + '\n' + rows.join('\n'));
    }

    // Export flows
    if (data.flows && data.flows.length > 0) {
      const headers = Object.keys(data.flows[0]).join(',');
      const rows = data.flows.map(flow => 
        Object.values(flow).map(val => 
          typeof val === 'string' && val.includes(',') ? `"${val}"` : val
        ).join(',')
      );
      csvSections.push('FLOWS\n' + headers + '\n' + rows.join('\n'));
    }

    return csvSections.join('\n\n');
  }
}

/**
 * Factory function to create data loader with schema
 * @param {Object} schema - JSON schema for validation
 * @returns {DataLoader} Configured data loader
 */
export function createDataLoader(schema) {
  return new DataLoader(schema);
}

/**
 * Quick load function for simple use cases
 * @param {Object|String} source - Data source
 * @param {Object} schema - Optional schema for validation
 * @param {Object} options - Loading options
 * @returns {Promise<Object>} Loaded data
 */
export async function loadData(source, schema = null, options = {}) {
  const loader = new DataLoader(schema);
  const result = await loader.loadData(source, options);
  
  if (!result.success) {
    throw new Error(result.error);
  }
  
  return result.data;
}