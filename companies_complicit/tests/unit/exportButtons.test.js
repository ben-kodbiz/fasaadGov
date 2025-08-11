/**
 * Unit tests for ExportSystem
 */

import { ExportSystem, createExportSystem, quickExport } from '../../src/ui/exportButtons.js';

// Mock DOM APIs
global.XMLSerializer = jest.fn().mockImplementation(() => ({
  serializeToString: jest.fn(() => '<svg>mock-svg-content</svg>')
}));

global.URL = {
  createObjectURL: jest.fn(() => 'mock-object-url'),
  revokeObjectURL: jest.fn()
};

global.Blob = jest.fn().mockImplementation((content, options) => ({
  content,
  options,
  type: options?.type || 'application/octet-stream'
}));

// Mock canvas
const mockCanvas = {
  width: 800,
  height: 500,
  getContext: jest.fn(() => ({
    scale: jest.fn(),
    drawImage: jest.fn()
  })),
  toBlob: jest.fn((callback) => {
    callback(new Blob(['fake-image-data'], { type: 'image/png' }));
  })
};

global.HTMLCanvasElement = jest.fn(() => mockCanvas);
Object.setPrototypeOf(mockCanvas, HTMLCanvasElement.prototype);

// Mock Image
global.Image = jest.fn().mockImplementation(() => ({
  onload: null,
  onerror: null,
  src: '',
  addEventListener: jest.fn()
}));

// Mock document
const mockElement = {
  innerHTML: '',
  textContent: '',
  disabled: false,
  style: { display: 'block' },
  click: jest.fn(),
  addEventListener: jest.fn(),
  querySelector: jest.fn(),
  appendChild: jest.fn(),
  removeChild: jest.fn(),
  getBoundingClientRect: jest.fn(() => ({ width: 800, height: 500 })),
  getAttribute: jest.fn((attr) => attr === 'width' ? '800' : '500'),
  cloneNode: jest.fn(() => mockElement),
  insertBefore: jest.fn()
};

global.document = {
  querySelector: jest.fn(() => mockElement),
  getElementById: jest.fn(() => mockElement),
  createElement: jest.fn(() => mockElement),
  createElementNS: jest.fn(() => mockElement),
  body: mockElement,
  styleSheets: []
};

// Mock renderer
const mockRenderer = {
  getData: jest.fn(() => ({
    sources: [{ id: 'source-1', name: 'Test Source', value: 100, color: '#ff0000' }],
    companies: [{ id: 'company-1', name: 'Test Company', value: 80, color: '#00ff00' }],
    targets: [{ id: 'target-1', name: 'Test Target', value: 60, color: '#0000ff' }],
    flows: [{ from: 'source-1', to: 'company-1', value: 50 }]
  })),
  getSvg: jest.fn(() => ({ node: () => mockElement }))
};

describe('ExportSystem', () => {
  let exportSystem;

  beforeEach(() => {
    exportSystem = new ExportSystem(mockRenderer);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('should create export system with renderer', () => {
      expect(exportSystem).toBeInstanceOf(ExportSystem);
      expect(exportSystem.renderer).toBe(mockRenderer);
    });

    test('should apply custom options', () => {
      const customOptions = { defaultFilename: 'custom-export', imageQuality: 0.8 };
      const customExportSystem = new ExportSystem(mockRenderer, customOptions);
      
      expect(customExportSystem.options.defaultFilename).toBe('custom-export');
      expect(customExportSystem.options.imageQuality).toBe(0.8);
    });

    test('should initialize with default options', () => {
      expect(exportSystem.options.defaultFilename).toBe('fasaad-flow');
      expect(exportSystem.options.imageQuality).toBe(1.0);
      expect(exportSystem.options.jsonIndent).toBe(2);
    });
  });

  describe('createUI', () => {
    test('should return HTML for export buttons', () => {
      const html = exportSystem.createUI();
      
      expect(html).toContain('export-panel');
      expect(html).toContain('export-svg');
      expect(html).toContain('export-png');
      expect(html).toContain('export-json');
      expect(html).toContain('export-csv');
    });

    test('should include accessibility attributes', () => {
      const html = exportSystem.createUI();
      
      expect(html).toContain('title=');
      expect(html).toContain('Export as SVG');
      expect(html).toContain('Export as PNG');
    });
  });

  describe('initialize', () => {
    test('should initialize with container element', () => {
      const container = mockElement;
      
      exportSystem.initialize(container);
      
      expect(container.innerHTML).toContain('export-panel');
    });

    test('should initialize with container selector', () => {
      exportSystem.initialize('#export-container');
      
      expect(document.querySelector).toHaveBeenCalledWith('#export-container');
    });

    test('should throw error for invalid container', () => {
      document.querySelector.mockReturnValueOnce(null);
      
      expect(() => exportSystem.initialize('#invalid')).toThrow('Export container not found');
    });
  });

  describe('exportSVG', () => {
    test('should export SVG successfully', async () => {
      mockRenderer.getSvg.mockReturnValue({ node: () => mockElement });
      
      await exportSystem.exportSVG();
      
      expect(XMLSerializer).toHaveBeenCalled();
      expect(Blob).toHaveBeenCalledWith(
        expect.any(Array),
        { type: 'image/svg+xml;charset=utf-8' }
      );
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    test('should use custom filename', async () => {
      const customFilename = 'custom-export.svg';
      
      await exportSystem.exportSVG(customFilename);
      
      // Verify download was called with custom filename
      expect(mockElement.download).toBe(customFilename);
    });

    test('should handle missing SVG element', async () => {
      mockRenderer.getSvg.mockReturnValue(null);
      
      await exportSystem.exportSVG();
      
      // Should handle error gracefully
      expect(exportSystem.isExporting).toBe(false);
    });

    test('should prevent concurrent exports', async () => {
      exportSystem.isExporting = true;
      
      await exportSystem.exportSVG();
      
      // Should not proceed with export
      expect(XMLSerializer).not.toHaveBeenCalled();
    });
  });

  describe('exportPNG', () => {
    test('should export PNG successfully', async () => {
      mockRenderer.getSvg.mockReturnValue({ node: () => mockElement });
      
      // Mock successful image loading
      const mockImage = { onload: null, onerror: null };
      global.Image.mockImplementation(() => mockImage);
      
      const exportPromise = exportSystem.exportPNG();
      
      // Simulate image load
      if (mockImage.onload) {
        mockImage.onload();
      }
      
      await exportPromise;
      
      expect(document.createElement).toHaveBeenCalledWith('canvas');
      expect(mockCanvas.toBlob).toHaveBeenCalled();
    });

    test('should use custom scale factor', async () => {
      const scale = 3;
      
      await exportSystem.exportPNG(null, scale);
      
      expect(mockCanvas.width).toBe(800 * scale);
      expect(mockCanvas.height).toBe(500 * scale);
    });

    test('should handle canvas conversion errors', async () => {
      mockRenderer.getSvg.mockReturnValue({ node: () => mockElement });
      
      // Mock image error
      const mockImage = { onload: null, onerror: null };
      global.Image.mockImplementation(() => mockImage);
      
      const exportPromise = exportSystem.exportPNG();
      
      // Simulate image error
      if (mockImage.onerror) {
        mockImage.onerror();
      }
      
      await exportPromise;
      
      expect(exportSystem.isExporting).toBe(false);
    });
  });

  describe('exportJSON', () => {
    test('should export JSON successfully', async () => {
      await exportSystem.exportJSON();
      
      expect(mockRenderer.getData).toHaveBeenCalled();
      expect(Blob).toHaveBeenCalledWith(
        expect.any(Array),
        { type: 'application/json' }
      );
    });

    test('should include export metadata', async () => {
      await exportSystem.exportJSON();
      
      const blobCall = Blob.mock.calls[0];
      const jsonContent = blobCall[0][0];
      const parsedData = JSON.parse(jsonContent);
      
      expect(parsedData._export).toBeDefined();
      expect(parsedData._export.version).toBe('2.0.0');
      expect(parsedData._export.format).toBe('fasaad-flow-json');
    });

    test('should handle missing data', async () => {
      mockRenderer.getData.mockReturnValue(null);
      
      await exportSystem.exportJSON();
      
      expect(exportSystem.isExporting).toBe(false);
    });

    test('should use custom filename', async () => {
      const customFilename = 'custom-data.json';
      
      await exportSystem.exportJSON(customFilename);
      
      expect(mockElement.download).toBe(customFilename);
    });
  });

  describe('exportCSV', () => {
    test('should export CSV successfully', async () => {
      await exportSystem.exportCSV();
      
      expect(mockRenderer.getData).toHaveBeenCalled();
      expect(Blob).toHaveBeenCalledWith(
        expect.any(Array),
        { type: 'text/csv;charset=utf-8' }
      );
    });

    test('should handle missing data', async () => {
      mockRenderer.getData.mockReturnValue(null);
      
      await exportSystem.exportCSV();
      
      expect(exportSystem.isExporting).toBe(false);
    });
  });

  describe('convertToCSV', () => {
    test('should convert data to CSV format', () => {
      const testData = {
        sources: [
          { id: 'source-1', name: 'Test Source', value: 100 }
        ],
        flows: [
          { from: 'source-1', to: 'company-1', value: 50 }
        ]
      };
      
      const csv = exportSystem.convertToCSV(testData);
      
      expect(csv).toContain('SOURCES');
      expect(csv).toContain('FLOWS');
      expect(csv).toContain('id,name,value');
      expect(csv).toContain('source-1,Test Source,100');
    });

    test('should escape CSV special characters', () => {
      const testData = {
        sources: [
          { id: 'test', name: 'Name, with comma', value: 100 }
        ]
      };
      
      const csv = exportSystem.convertToCSV(testData);
      
      expect(csv).toContain('"Name, with comma"');
    });

    test('should handle empty arrays', () => {
      const testData = {
        sources: [],
        companies: [{ id: 'test', name: 'Test', value: 100 }]
      };
      
      const csv = exportSystem.convertToCSV(testData);
      
      expect(csv).not.toContain('SOURCES');
      expect(csv).toContain('COMPANIES');
    });
  });

  describe('svgToCanvas', () => {
    test('should convert SVG to canvas', async () => {
      const svgElement = mockElement;
      
      // Mock successful conversion
      const mockImage = { onload: null, onerror: null };
      global.Image.mockImplementation(() => mockImage);
      
      const canvasPromise = exportSystem.svgToCanvas(svgElement, 2);
      
      // Simulate image load
      if (mockImage.onload) {
        mockImage.onload();
      }
      
      const canvas = await canvasPromise;
      
      expect(canvas).toBeDefined();
      expect(canvas.width).toBe(1600); // 800 * 2
      expect(canvas.height).toBe(1000); // 500 * 2
    });

    test('should handle conversion errors', async () => {
      const svgElement = mockElement;
      
      // Mock image error
      const mockImage = { onload: null, onerror: null };
      global.Image.mockImplementation(() => mockImage);
      
      const canvasPromise = exportSystem.svgToCanvas(svgElement);
      
      // Simulate image error
      if (mockImage.onerror) {
        mockImage.onerror();
      }
      
      await expect(canvasPromise).rejects.toThrow('Failed to load SVG image');
    });
  });

  describe('getStats', () => {
    test('should return export statistics', () => {
      const stats = exportSystem.getStats();
      
      expect(stats).toEqual({
        sources: 1,
        companies: 1,
        targets: 1,
        flows: 1,
        totalNodes: 3
      });
    });

    test('should handle missing data', () => {
      mockRenderer.getData.mockReturnValue(null);
      
      const stats = exportSystem.getStats();
      
      expect(stats).toBeNull();
    });
  });

  describe('static methods', () => {
    test('checkSupport should return support status', () => {
      const support = ExportSystem.checkSupport();
      
      expect(support).toHaveProperty('svg');
      expect(support).toHaveProperty('png');
      expect(support).toHaveProperty('json');
      expect(support).toHaveProperty('csv');
      expect(support).toHaveProperty('download');
    });
  });

  describe('utility methods', () => {
    test('should set button state', () => {
      exportSystem.setButtonState('test-button', 'New Text', true);
      
      expect(mockElement.textContent).toBe('New Text');
      expect(mockElement.disabled).toBe(true);
    });

    test('should show error messages', () => {
      exportSystem.showError('Test error message');
      
      expect(mockElement.innerHTML).toContain('Test error message');
    });

    test('should destroy export system', () => {
      exportSystem.destroy();
      
      expect(exportSystem.renderer).toBeNull();
      expect(exportSystem.isExporting).toBe(false);
    });
  });
});

describe('Factory functions', () => {
  test('createExportSystem should return ExportSystem instance', () => {
    const exportSystem = createExportSystem(mockRenderer);
    expect(exportSystem).toBeInstanceOf(ExportSystem);
  });

  test('quickExport should export in specified format', async () => {
    await quickExport(mockRenderer, 'json', 'test.json');
    
    expect(Blob).toHaveBeenCalledWith(
      expect.any(Array),
      { type: 'application/json' }
    );
  });

  test('quickExport should throw error for unsupported format', async () => {
    await expect(quickExport(mockRenderer, 'invalid')).rejects.toThrow('Unsupported export format');
  });
});