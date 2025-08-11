/**
 * Unit tests for DataLoader
 */

import { DataLoader, createDataLoader, loadData } from '../../src/core/dataLoader.js';
import { DataValidator } from '../../src/utils/validator.js';

// Mock fetch for URL loading tests
global.fetch = jest.fn();

const mockSchema = {
  type: 'object',
  required: ['sources', 'companies', 'targets', 'flows'],
  properties: {
    sources: { type: 'array' },
    companies: { type: 'array' },
    targets: { type: 'array' },
    flows: { type: 'array' },
    meta: { type: 'object' }
  }
};

const legacyData = {
  sources: [
    { id: 'source-1', name: 'Test Source', value: 100, color: '#ff0000' }
  ],
  companies: [
    { id: 'company-1', name: 'Military Corp', value: 80, color: '#00ff00' }
  ],
  targets: [
    { id: 'target-1', name: 'Military Operations', value: 60, color: '#0000ff' }
  ],
  flows: [
    { from: 'source-1', to: 'company-1', value: 50 }
  ]
};

const enhancedData = {
  ...legacyData,
  sources: [
    { 
      ...legacyData.sources[0], 
      type: 'government', 
      confidence: 'high',
      updated_at: '2024-01-01T00:00:00.000Z'
    }
  ],
  companies: [
    { 
      ...legacyData.companies[0], 
      type: 'military', 
      headquarters: 'USA',
      confidence: 'high'
    }
  ],
  meta: {
    version: '2.0.0',
    updated_at: '2024-01-01T00:00:00.000Z'
  }
};

describe('DataLoader', () => {
  let dataLoader;

  beforeEach(() => {
    dataLoader = new DataLoader(mockSchema);
    fetch.mockClear();
  });

  describe('constructor', () => {
    test('should create loader with schema', () => {
      expect(dataLoader).toBeInstanceOf(DataLoader);
      expect(dataLoader.schema).toBe(mockSchema);
      expect(dataLoader.validator).toBeInstanceOf(DataValidator);
    });

    test('should create loader without schema', () => {
      const loader = new DataLoader();
      expect(loader.validator).toBeNull();
    });
  });

  describe('loadData', () => {
    test('should load object data successfully', async () => {
      const result = await dataLoader.loadData(legacyData);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.enhanced).toBe(true);
      expect(result.format.isLegacy).toBe(true);
    });

    test('should load enhanced data without modification', async () => {
      const result = await dataLoader.loadData(enhancedData);
      
      expect(result.success).toBe(true);
      expect(result.enhanced).toBe(false);
      expect(result.format.isLegacy).toBe(false);
    });

    test('should handle invalid data gracefully', async () => {
      const invalidData = { invalid: 'structure' };
      
      const result = await dataLoader.loadData(invalidData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should load from URL', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(legacyData)
      });

      const result = await dataLoader.loadData('http://example.com/data.json');
      
      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledWith('http://example.com/data.json');
    });

    test('should handle fetch errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const result = await dataLoader.loadData('http://example.com/missing.json');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('404');
    });
  });

  describe('detectDataFormat', () => {
    test('should detect legacy format', () => {
      const format = dataLoader.detectDataFormat(legacyData);
      
      expect(format.isLegacy).toBe(true);
      expect(format.version).toBe('1.0');
      expect(format.confidence).toBe('high');
    });

    test('should detect enhanced format', () => {
      const format = dataLoader.detectDataFormat(enhancedData);
      
      expect(format.isLegacy).toBe(false);
      expect(format.version).toBe('2.0');
      expect(format.confidence).toBe('high');
    });

    test('should handle invalid format', () => {
      const format = dataLoader.detectDataFormat({ invalid: 'data' });
      
      expect(format.isLegacy).toBe(false);
      expect(format.version).toBe('unknown');
      expect(format.confidence).toBe('low');
    });
  });

  describe('checkForEnhancedFields', () => {
    test('should detect enhanced source fields', () => {
      const dataWithEnhanced = {
        sources: [{ id: 'test', name: 'Test', value: 100, color: '#ff0000', confidence: 'high' }],
        companies: [],
        targets: [],
        flows: []
      };
      
      expect(dataLoader.checkForEnhancedFields(dataWithEnhanced)).toBe(true);
    });

    test('should detect enhanced company fields', () => {
      const dataWithEnhanced = {
        sources: [],
        companies: [{ id: 'test', name: 'Test', value: 100, color: '#ff0000', type: 'military' }],
        targets: [],
        flows: []
      };
      
      expect(dataLoader.checkForEnhancedFields(dataWithEnhanced)).toBe(true);
    });

    test('should detect meta section', () => {
      const dataWithMeta = {
        sources: [],
        companies: [],
        targets: [],
        flows: [],
        meta: { version: '2.0.0' }
      };
      
      expect(dataLoader.checkForEnhancedFields(dataWithMeta)).toBe(true);
    });

    test('should return false for basic data', () => {
      expect(dataLoader.checkForEnhancedFields(legacyData)).toBe(false);
    });
  });

  describe('enhanceLegacyData', () => {
    test('should enhance legacy data with defaults', () => {
      const enhanced = dataLoader.enhanceLegacyData(legacyData);
      
      expect(enhanced.sources[0]).toHaveProperty('type');
      expect(enhanced.sources[0]).toHaveProperty('confidence');
      expect(enhanced.sources[0]).toHaveProperty('updated_at');
      expect(enhanced.companies[0]).toHaveProperty('type');
      expect(enhanced.flows[0]).toHaveProperty('type');
      expect(enhanced.meta).toBeDefined();
      expect(enhanced.meta.version).toBe('2.0.0');
    });

    test('should preserve existing fields', () => {
      const enhanced = dataLoader.enhanceLegacyData(legacyData);
      
      expect(enhanced.sources[0].id).toBe(legacyData.sources[0].id);
      expect(enhanced.sources[0].name).toBe(legacyData.sources[0].name);
      expect(enhanced.sources[0].value).toBe(legacyData.sources[0].value);
      expect(enhanced.sources[0].color).toBe(legacyData.sources[0].color);
    });

    test('should apply custom options', () => {
      const options = {
        defaultConfidence: 'low',
        defaultSourceType: 'corporate',
        sourceNotice: 'Custom notice'
      };
      
      const enhanced = dataLoader.enhanceLegacyData(legacyData, options);
      
      expect(enhanced.sources[0].confidence).toBe('low');
      expect(enhanced.sources[0].type).toBe('corporate');
      expect(enhanced.meta.source_notice).toBe('Custom notice');
    });
  });

  describe('inferCompanyType', () => {
    test('should infer military type', () => {
      expect(dataLoader.inferCompanyType('Lockheed Martin')).toBe('military');
      expect(dataLoader.inferCompanyType('Defense Corp')).toBe('military');
      expect(dataLoader.inferCompanyType('Boeing')).toBe('military');
    });

    test('should infer surveillance type', () => {
      expect(dataLoader.inferCompanyType('Google')).toBe('surveillance');
      expect(dataLoader.inferCompanyType('Microsoft')).toBe('surveillance');
      expect(dataLoader.inferCompanyType('Palantir')).toBe('surveillance');
    });

    test('should infer construction type', () => {
      expect(dataLoader.inferCompanyType('Caterpillar')).toBe('construction');
      expect(dataLoader.inferCompanyType('Hyundai Construction')).toBe('construction');
    });

    test('should return other for unknown', () => {
      expect(dataLoader.inferCompanyType('Unknown Corp')).toBe('other');
    });
  });

  describe('inferTargetType', () => {
    test('should infer military type', () => {
      expect(dataLoader.inferTargetType('Military Operations')).toBe('military');
      expect(dataLoader.inferTargetType('Combat Systems')).toBe('military');
    });

    test('should infer surveillance type', () => {
      expect(dataLoader.inferTargetType('Surveillance Systems')).toBe('surveillance');
      expect(dataLoader.inferTargetType('Intelligence Operations')).toBe('surveillance');
    });

    test('should return other for unknown', () => {
      expect(dataLoader.inferTargetType('Unknown Target')).toBe('other');
    });
  });

  describe('getData and getOriginalData', () => {
    test('should return loaded data', async () => {
      await dataLoader.loadData(legacyData);
      
      const data = dataLoader.getData();
      expect(data).toBeDefined();
      expect(data.sources).toBeDefined();
    });

    test('should return original data', async () => {
      await dataLoader.loadData(legacyData);
      
      const original = dataLoader.getOriginalData();
      expect(original).toEqual(legacyData);
    });
  });

  describe('reload', () => {
    test('should reload with different options', async () => {
      await dataLoader.loadData(legacyData);
      
      const reloaded = await dataLoader.reload({ defaultConfidence: 'low' });
      
      expect(reloaded.success).toBe(true);
      expect(reloaded.data.sources[0].confidence).toBe('low');
    });

    test('should throw error if no original data', async () => {
      await expect(dataLoader.reload()).rejects.toThrow('No original data available');
    });
  });

  describe('export', () => {
    beforeEach(async () => {
      await dataLoader.loadData(legacyData);
    });

    test('should export as JSON', () => {
      const exported = dataLoader.export('json');
      
      expect(typeof exported).toBe('string');
      expect(() => JSON.parse(exported)).not.toThrow();
    });

    test('should export as CSV', () => {
      const exported = dataLoader.export('csv');
      
      expect(typeof exported).toBe('string');
      expect(exported).toContain('SOURCES');
      expect(exported).toContain('COMPANIES');
      expect(exported).toContain('FLOWS');
    });

    test('should throw error for unsupported format', () => {
      expect(() => dataLoader.export('xml')).toThrow('Unsupported export format');
    });

    test('should throw error if no data loaded', () => {
      const emptyLoader = new DataLoader();
      expect(() => emptyLoader.export()).toThrow('No data loaded');
    });
  });
});

describe('Factory functions', () => {
  test('createDataLoader should return DataLoader instance', () => {
    const loader = createDataLoader(mockSchema);
    expect(loader).toBeInstanceOf(DataLoader);
    expect(loader.schema).toBe(mockSchema);
  });

  test('loadData should load and return data', async () => {
    const data = await loadData(legacyData, mockSchema);
    expect(data).toBeDefined();
    expect(data.sources).toBeDefined();
  });

  test('loadData should throw on error', async () => {
    await expect(loadData({ invalid: 'data' }, mockSchema))
      .rejects.toThrow();
  });
});