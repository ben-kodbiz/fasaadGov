/**
 * Unit tests for DataValidator
 */

import { DataValidator, createValidator, isValid, formatErrorsForDisplay } from '../../src/utils/validator.js';

// Mock schema for testing
const mockSchema = {
  type: 'object',
  required: ['sources', 'companies', 'targets', 'flows'],
  properties: {
    sources: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'name', 'value', 'color'],
        properties: {
          id: { type: 'string', pattern: '^[a-z0-9-_]+$' },
          name: { type: 'string', minLength: 1 },
          value: { type: 'number', minimum: 0 },
          color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] }
        }
      }
    },
    companies: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'name', 'value', 'color'],
        properties: {
          id: { type: 'string', pattern: '^[a-z0-9-_]+$' },
          name: { type: 'string', minLength: 1 },
          value: { type: 'number', minimum: 0 },
          color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
          type: { type: 'string' }
        }
      }
    },
    targets: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'name', 'value', 'color'],
        properties: {
          id: { type: 'string', pattern: '^[a-z0-9-_]+$' },
          name: { type: 'string', minLength: 1 },
          value: { type: 'number', minimum: 0 },
          color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' }
        }
      }
    },
    flows: {
      type: 'array',
      items: {
        type: 'object',
        required: ['from', 'to', 'value'],
        properties: {
          from: { type: 'string' },
          to: { type: 'string' },
          value: { type: 'number', minimum: 0 }
        }
      }
    }
  }
};

const validData = {
  sources: [
    { id: 'source-1', name: 'Test Source', value: 100, color: '#ff0000', confidence: 'high' }
  ],
  companies: [
    { id: 'company-1', name: 'Test Company', value: 80, color: '#00ff00', type: 'military' }
  ],
  targets: [
    { id: 'target-1', name: 'Test Target', value: 60, color: '#0000ff' }
  ],
  flows: [
    { from: 'source-1', to: 'company-1', value: 50 },
    { from: 'company-1', to: 'target-1', value: 40 }
  ]
};

describe('DataValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new DataValidator(mockSchema);
  });

  describe('constructor', () => {
    test('should create validator with schema', () => {
      expect(validator).toBeInstanceOf(DataValidator);
      expect(validator.schema).toBe(mockSchema);
      expect(validator.validate).toBeFunction();
    });
  });

  describe('validateData', () => {
    test('should validate correct data', () => {
      const result = validator.validateData(validData);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toBe(validData);
    });

    test('should reject data missing required fields', () => {
      const invalidData = {
        sources: [],
        companies: [],
        targets: []
        // missing flows
      };

      const result = validator.validateData(invalidData);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.data).toBeNull();
    });

    test('should reject invalid field types', () => {
      const invalidData = {
        ...validData,
        sources: [
          { id: 'source-1', name: 'Test', value: 'not-a-number', color: '#ff0000' }
        ]
      };

      const result = validator.validateData(invalidData);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should reject invalid color format', () => {
      const invalidData = {
        ...validData,
        sources: [
          { id: 'source-1', name: 'Test', value: 100, color: 'red' }
        ]
      };

      const result = validator.validateData(invalidData);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.keyword === 'pattern')).toBe(true);
    });

    test('should reject invalid ID format', () => {
      const invalidData = {
        ...validData,
        sources: [
          { id: 'Source 1', name: 'Test', value: 100, color: '#ff0000' }
        ]
      };

      const result = validator.validateData(invalidData);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.keyword === 'pattern')).toBe(true);
    });
  });

  describe('getErrorMessage', () => {
    test('should return no errors message for empty array', () => {
      const message = validator.getErrorMessage([]);
      expect(message).toBe('No validation errors');
    });

    test('should format required field errors', () => {
      const errors = [{
        keyword: 'required',
        params: { missingProperty: 'flows' },
        instancePath: ''
      }];

      const message = validator.getErrorMessage(errors);
      expect(message).toContain('Missing required field: flows');
    });

    test('should format type errors', () => {
      const errors = [{
        keyword: 'type',
        params: { type: 'number' },
        instancePath: '/sources/0/value',
        data: 'string'
      }];

      const message = validator.getErrorMessage(errors);
      expect(message).toContain('should be number');
    });

    test('should format enum errors', () => {
      const errors = [{
        keyword: 'enum',
        params: { allowedValues: ['high', 'medium', 'low'] },
        instancePath: '/sources/0/confidence'
      }];

      const message = validator.getErrorMessage(errors);
      expect(message).toContain('must be one of: high, medium, low');
    });
  });

  describe('getDetailedErrors', () => {
    test('should return empty array for no errors', () => {
      const details = validator.getDetailedErrors([]);
      expect(details).toHaveLength(0);
    });

    test('should return detailed error objects', () => {
      const errors = [{
        keyword: 'required',
        params: { missingProperty: 'flows' },
        instancePath: '',
        message: 'must have required property flows'
      }];

      const details = validator.getDetailedErrors(errors);
      
      expect(details).toHaveLength(1);
      expect(details[0]).toMatchObject({
        field: 'root',
        keyword: 'required',
        message: 'must have required property flows',
        severity: 'critical'
      });
    });
  });

  describe('getErrorSeverity', () => {
    test('should classify critical errors', () => {
      expect(validator.getErrorSeverity('required')).toBe('critical');
      expect(validator.getErrorSeverity('type')).toBe('critical');
    });

    test('should classify warning errors', () => {
      expect(validator.getErrorSeverity('format')).toBe('warning');
      expect(validator.getErrorSeverity('pattern')).toBe('warning');
    });

    test('should classify info errors', () => {
      expect(validator.getErrorSeverity('minimum')).toBe('info');
      expect(validator.getErrorSeverity('unknown')).toBe('info');
    });
  });

  describe('validateFlows', () => {
    test('should validate flows with existing nodes', () => {
      const flows = [
        { from: 'source-1', to: 'company-1', value: 50 }
      ];
      const allNodes = {
        'source-1': { id: 'source-1', name: 'Source' },
        'company-1': { id: 'company-1', name: 'Company' }
      };

      const result = validator.validateFlows(flows, allNodes);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.validFlows).toHaveLength(1);
    });

    test('should reject flows with missing nodes', () => {
      const flows = [
        { from: 'missing-source', to: 'company-1', value: 50 }
      ];
      const allNodes = {
        'company-1': { id: 'company-1', name: 'Company' }
      };

      const result = validator.validateFlows(flows, allNodes);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes('missing-source'))).toBe(true);
    });

    test('should reject flows with invalid values', () => {
      const flows = [
        { from: 'source-1', to: 'company-1', value: -10 }
      ];
      const allNodes = {
        'source-1': { id: 'source-1', name: 'Source' },
        'company-1': { id: 'company-1', name: 'Company' }
      };

      const result = validator.validateFlows(flows, allNodes);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes('must be positive'))).toBe(true);
    });
  });

  describe('validateComplete', () => {
    test('should validate complete valid dataset', () => {
      const result = validator.validateComplete(validData);
      
      expect(result.valid).toBe(true);
      expect(result.message).toBe('Data validation successful');
      expect(result.stats).toMatchObject({
        sources: 1,
        companies: 1,
        targets: 1,
        flows: 2,
        totalNodes: 3
      });
    });

    test('should reject dataset with duplicate node IDs', () => {
      const invalidData = {
        ...validData,
        sources: [
          { id: 'duplicate', name: 'Source 1', value: 100, color: '#ff0000' }
        ],
        companies: [
          { id: 'duplicate', name: 'Company 1', value: 80, color: '#00ff00', type: 'military' }
        ]
      };

      const result = validator.validateComplete(invalidData);
      
      expect(result.valid).toBe(false);
      expect(result.message).toContain('duplicate');
    });
  });
});

describe('Factory functions', () => {
  test('createValidator should return DataValidator instance', () => {
    const validator = createValidator(mockSchema);
    expect(validator).toBeInstanceOf(DataValidator);
  });

  test('isValid should return boolean', () => {
    expect(isValid(validData, mockSchema)).toBe(true);
    expect(isValid({}, mockSchema)).toBe(false);
  });
});

describe('formatErrorsForDisplay', () => {
  test('should format success message for no errors', () => {
    const html = formatErrorsForDisplay([]);
    expect(html).toContain('✅ Data validation successful');
  });

  test('should format error list with icons', () => {
    const errors = [
      { message: 'Critical error', severity: 'critical' },
      { message: 'Warning error', severity: 'warning' },
      { message: 'Info error', severity: 'info' }
    ];

    const html = formatErrorsForDisplay(errors);
    
    expect(html).toContain('❌ Critical error');
    expect(html).toContain('⚠️ Warning error');
    expect(html).toContain('ℹ️ Info error');
    expect(html).toContain('class="error-critical"');
    expect(html).toContain('class="error-warning"');
    expect(html).toContain('class="error-info"');
  });

  test('should handle string errors', () => {
    const errors = ['Simple error message'];
    const html = formatErrorsForDisplay(errors);
    
    expect(html).toContain('Simple error message');
    expect(html).toContain('class="error-info"');
  });
});