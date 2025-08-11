/**
 * Data Validation Module for FasaadGov v02
 * Provides comprehensive JSON schema validation with user-friendly error reporting
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';

export class DataValidator {
  constructor(schema) {
    this.ajv = new Ajv({ 
      allErrors: true,
      verbose: true,
      strict: false // Allow additional properties for backward compatibility
    });
    
    // Add format validators (date, date-time, uri, email, etc.)
    addFormats(this.ajv);
    
    this.schema = schema;
    this.validate = this.ajv.compile(schema);
  }

  /**
   * Validate data against the schema
   * @param {Object} data - Data to validate
   * @returns {Object} Validation result with valid flag and errors
   */
  validateData(data) {
    const valid = this.validate(data);
    
    return {
      valid,
      errors: this.validate.errors || [],
      data: valid ? data : null
    };
  }

  /**
   * Create user-friendly error messages from AJV errors
   * @param {Array} errors - AJV validation errors
   * @returns {String} Human-readable error message
   */
  getErrorMessage(errors) {
    if (!errors || errors.length === 0) {
      return 'No validation errors';
    }

    const errorMessages = errors.map(error => {
      const path = error.instancePath || 'root';
      const field = path.replace(/^\//, '').replace(/\//g, '.');
      
      switch (error.keyword) {
        case 'required':
          return `Missing required field: ${error.params.missingProperty}`;
        
        case 'type':
          return `Field "${field}" should be ${error.params.type}, got ${typeof error.data}`;
        
        case 'format':
          return `Field "${field}" has invalid format (expected ${error.params.format})`;
        
        case 'pattern':
          return `Field "${field}" doesn't match required pattern`;
        
        case 'enum':
          return `Field "${field}" must be one of: ${error.params.allowedValues.join(', ')}`;
        
        case 'minimum':
          return `Field "${field}" must be at least ${error.params.limit}`;
        
        case 'maximum':
          return `Field "${field}" must be at most ${error.params.limit}`;
        
        case 'minLength':
          return `Field "${field}" must be at least ${error.params.limit} characters`;
        
        case 'maxLength':
          return `Field "${field}" must be at most ${error.params.limit} characters`;
        
        case 'minItems':
          return `Array "${field}" must have at least ${error.params.limit} items`;
        
        case 'additionalProperties':
          return `Unexpected field "${error.params.additionalProperty}" in ${field}`;
        
        default:
          return `Validation error in "${field}": ${error.message}`;
      }
    });

    return errorMessages.join('; ');
  }

  /**
   * Get detailed error information for debugging
   * @param {Array} errors - AJV validation errors
   * @returns {Array} Detailed error objects
   */
  getDetailedErrors(errors) {
    if (!errors || errors.length === 0) {
      return [];
    }

    return errors.map(error => ({
      field: error.instancePath || 'root',
      keyword: error.keyword,
      message: error.message,
      allowedValues: error.params?.allowedValues,
      limit: error.params?.limit,
      format: error.params?.format,
      data: error.data,
      severity: this.getErrorSeverity(error.keyword)
    }));
  }

  /**
   * Determine error severity for prioritization
   * @param {String} keyword - AJV error keyword
   * @returns {String} Severity level
   */
  getErrorSeverity(keyword) {
    const criticalErrors = ['required', 'type'];
    const warningErrors = ['format', 'pattern', 'additionalProperties'];
    
    if (criticalErrors.includes(keyword)) {
      return 'critical';
    } else if (warningErrors.includes(keyword)) {
      return 'warning';
    } else {
      return 'info';
    }
  }

  /**
   * Validate specific node types
   * @param {Array} nodes - Array of nodes to validate
   * @param {String} nodeType - Type of nodes (sources, companies, targets)
   * @returns {Object} Validation result
   */
  validateNodes(nodes, nodeType) {
    if (!Array.isArray(nodes)) {
      return {
        valid: false,
        errors: [`${nodeType} must be an array`]
      };
    }

    const nodeSchema = this.schema.properties[nodeType];
    if (!nodeSchema) {
      return {
        valid: false,
        errors: [`Unknown node type: ${nodeType}`]
      };
    }

    const validator = this.ajv.compile(nodeSchema);
    const valid = validator(nodes);

    return {
      valid,
      errors: validator.errors || [],
      nodeCount: nodes.length
    };
  }

  /**
   * Validate flow relationships
   * @param {Array} flows - Flow connections
   * @param {Object} allNodes - All available nodes by ID
   * @returns {Object} Validation result with relationship checks
   */
  validateFlows(flows, allNodes) {
    const errors = [];
    const validFlows = [];

    flows.forEach((flow, index) => {
      // Basic schema validation
      const flowSchema = this.schema.properties.flows.items;
      const validator = this.ajv.compile(flowSchema);
      
      if (!validator(flow)) {
        errors.push(`Flow ${index}: ${this.getErrorMessage(validator.errors)}`);
        return;
      }

      // Relationship validation
      if (!allNodes[flow.from]) {
        errors.push(`Flow ${index}: Source node "${flow.from}" not found`);
      }
      
      if (!allNodes[flow.to]) {
        errors.push(`Flow ${index}: Target node "${flow.to}" not found`);
      }

      // Value consistency check
      if (flow.value <= 0) {
        errors.push(`Flow ${index}: Value must be positive`);
      }

      if (errors.length === 0) {
        validFlows.push(flow);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      validFlows,
      totalFlows: flows.length,
      validFlowCount: validFlows.length
    };
  }

  /**
   * Comprehensive data validation with relationship checks
   * @param {Object} data - Complete dataset
   * @returns {Object} Comprehensive validation result
   */
  validateComplete(data) {
    // Basic schema validation
    const schemaResult = this.validateData(data);
    
    if (!schemaResult.valid) {
      return {
        valid: false,
        errors: schemaResult.errors,
        message: this.getErrorMessage(schemaResult.errors),
        details: this.getDetailedErrors(schemaResult.errors)
      };
    }

    // Build node lookup for relationship validation
    const allNodes = {};
    
    ['sources', 'companies', 'targets'].forEach(nodeType => {
      if (data[nodeType]) {
        data[nodeType].forEach(node => {
          if (allNodes[node.id]) {
            return {
              valid: false,
              errors: [`Duplicate node ID: ${node.id}`],
              message: `Node ID "${node.id}" appears multiple times`
            };
          }
          allNodes[node.id] = node;
        });
      }
    });

    // Validate flows with relationship checks
    const flowResult = this.validateFlows(data.flows || [], allNodes);
    
    if (!flowResult.valid) {
      return {
        valid: false,
        errors: flowResult.errors,
        message: flowResult.errors.join('; '),
        flowValidation: flowResult
      };
    }

    return {
      valid: true,
      message: 'Data validation successful',
      stats: {
        sources: data.sources?.length || 0,
        companies: data.companies?.length || 0,
        targets: data.targets?.length || 0,
        flows: data.flows?.length || 0,
        totalNodes: Object.keys(allNodes).length
      }
    };
  }
}

/**
 * Factory function to create validator with schema
 * @param {Object} schema - JSON schema object
 * @returns {DataValidator} Configured validator instance
 */
export function createValidator(schema) {
  return new DataValidator(schema);
}

/**
 * Quick validation function for simple use cases
 * @param {Object} data - Data to validate
 * @param {Object} schema - JSON schema
 * @returns {Boolean} True if valid
 */
export function isValid(data, schema) {
  const validator = new DataValidator(schema);
  return validator.validateData(data).valid;
}

/**
 * Error display helper for UI integration
 * @param {Array} errors - Validation errors
 * @returns {String} HTML formatted error message
 */
export function formatErrorsForDisplay(errors) {
  if (!errors || errors.length === 0) {
    return '<p class="success">✅ Data validation successful</p>';
  }

  const errorHtml = errors.map(error => {
    const severity = error.severity || 'info';
    const icon = severity === 'critical' ? '❌' : severity === 'warning' ? '⚠️' : 'ℹ️';
    return `<li class="error-${severity}">${icon} ${error.message || error}</li>`;
  }).join('');

  return `
    <div class="validation-errors">
      <p><strong>Data Validation Issues:</strong></p>
      <ul>${errorHtml}</ul>
    </div>
  `;
}