/**
 * Unit tests for SankeyRenderer
 */

import { SankeyRenderer, createRenderer } from '../../src/core/sankeyRenderer.js';

// Mock D3
const mockD3 = {
  select: jest.fn(() => mockD3),
  selectAll: jest.fn(() => mockD3),
  append: jest.fn(() => mockD3),
  attr: jest.fn(() => mockD3),
  style: jest.fn(() => mockD3),
  text: jest.fn(() => mockD3),
  html: jest.fn(() => mockD3),
  on: jest.fn(() => mockD3),
  datum: jest.fn(() => mockD3),
  remove: jest.fn(() => mockD3),
  empty: jest.fn(() => false),
  node: jest.fn(() => ({ getAttribute: jest.fn() }))
};

global.d3 = mockD3;

const mockContainer = {
  querySelector: jest.fn(() => mockContainer),
  appendChild: jest.fn(),
  removeChild: jest.fn()
};

// Mock DOM
global.document = {
  querySelector: jest.fn(() => mockContainer),
  createElement: jest.fn(() => mockContainer)
};

const testData = {
  sources: [
    { id: 'source-1', name: 'Test Source', value: 100, color: '#ff0000' }
  ],
  companies: [
    { id: 'company-1', name: 'Test Company', value: 80, color: '#00ff00' }
  ],
  targets: [
    { id: 'target-1', name: 'Test Target', value: 60, color: '#0000ff' }
  ],
  flows: [
    { from: 'source-1', to: 'company-1', value: 50 },
    { from: 'company-1', to: 'target-1', value: 40 }
  ]
};

describe('SankeyRenderer', () => {
  let renderer;
  let container;

  beforeEach(() => {
    container = mockContainer;
    renderer = new SankeyRenderer(container);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('should create renderer with container element', () => {
      expect(renderer).toBeInstanceOf(SankeyRenderer);
      expect(renderer.container).toBe(container);
    });

    test('should create renderer with container selector', () => {
      const renderer2 = new SankeyRenderer('#test-container');
      expect(renderer2.container).toBe(mockContainer);
    });

    test('should throw error for invalid container', () => {
      document.querySelector.mockReturnValueOnce(null);
      expect(() => new SankeyRenderer('#invalid')).toThrow('Container element not found');
    });

    test('should apply custom options', () => {
      const customOptions = { width: 1000, height: 600 };
      const customRenderer = new SankeyRenderer(container, customOptions);
      
      expect(customRenderer.options.width).toBe(1000);
      expect(customRenderer.options.height).toBe(600);
    });

    test('should initialize default options', () => {
      expect(renderer.options.width).toBe(800);
      expect(renderer.options.height).toBe(500);
      expect(renderer.options.nodeWidth).toBe(150);
    });
  });

  describe('render', () => {
    test('should render visualization with valid data', () => {
      const result = renderer.render(testData);
      
      expect(result).toBe(renderer);
      expect(renderer.data).toBeDefined();
      expect(mockD3.select).toHaveBeenCalled();
      expect(mockD3.append).toHaveBeenCalledWith('svg');
    });

    test('should throw error for missing data', () => {
      expect(() => renderer.render()).toThrow('Data is required for rendering');
    });

    test('should process data correctly', () => {
      renderer.render(testData);
      
      expect(renderer.data.sources).toHaveLength(1);
      expect(renderer.data.companies).toHaveLength(1);
      expect(renderer.data.targets).toHaveLength(1);
      expect(renderer.data.flows).toHaveLength(2);
    });

    test('should handle empty data sections', () => {
      const emptyData = { sources: [], companies: [], targets: [], flows: [] };
      
      expect(() => renderer.render(emptyData)).not.toThrow();
      expect(renderer.data.sources).toHaveLength(0);
    });
  });

  describe('processData', () => {
    test('should process valid data', () => {
      const processed = renderer.processData(testData);
      
      expect(processed.sources).toEqual(testData.sources);
      expect(processed.companies).toEqual(testData.companies);
      expect(processed.targets).toEqual(testData.targets);
      expect(processed.flows).toEqual(testData.flows);
    });

    test('should handle missing sections with defaults', () => {
      const incompleteData = { sources: testData.sources };
      const processed = renderer.processData(incompleteData);
      
      expect(processed.sources).toEqual(testData.sources);
      expect(processed.companies).toEqual([]);
      expect(processed.targets).toEqual([]);
      expect(processed.flows).toEqual([]);
    });

    test('should warn about invalid nodes', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const invalidData = {
        sources: [{ id: 'test' }], // Missing required fields
        companies: [],
        targets: [],
        flows: []
      };
      
      renderer.processData(invalidData);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid sources node'),
        expect.any(Object)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('createSvg', () => {
    test('should create SVG with correct attributes', () => {
      renderer.createSvg();
      
      expect(mockD3.append).toHaveBeenCalledWith('svg');
      expect(mockD3.attr).toHaveBeenCalledWith('width', 800);
      expect(mockD3.attr).toHaveBeenCalledWith('height', 500);
      expect(mockD3.attr).toHaveBeenCalledWith('role', 'img');
    });

    test('should set accessibility attributes', () => {
      renderer.createSvg();
      
      expect(mockD3.attr).toHaveBeenCalledWith('role', 'img');
      expect(mockD3.attr).toHaveBeenCalledWith('aria-label', expect.stringContaining('Corporate complicity'));
    });
  });

  describe('findNode', () => {
    beforeEach(() => {
      renderer.data = testData;
    });

    test('should find node by ID', () => {
      const node = renderer.findNode('source-1');
      expect(node).toEqual(testData.sources[0]);
    });

    test('should return null for non-existent node', () => {
      const node = renderer.findNode('non-existent');
      expect(node).toBeNull();
    });

    test('should find nodes across all types', () => {
      expect(renderer.findNode('source-1')).toBeTruthy();
      expect(renderer.findNode('company-1')).toBeTruthy();
      expect(renderer.findNode('target-1')).toBeTruthy();
    });
  });

  describe('calculateFlowPositions', () => {
    test('should calculate correct positions for left-to-right flow', () => {
      const fromNode = { _position: { x: 50, y: 100, height: 60 } };
      const toNode = { _position: { x: 300, y: 150, height: 40 } };
      const flow = { from: 'source', to: 'target', value: 50 };
      
      const positions = renderer.calculateFlowPositions(fromNode, toNode, flow);
      
      expect(positions.fromX).toBe(200); // 50 + 150 (nodeWidth)
      expect(positions.toX).toBe(300);
      expect(positions.fromY).toBe(130); // 100 + 60/2
      expect(positions.toY).toBe(170); // 150 + 40/2
    });
  });

  describe('event handling', () => {
    test('should set event handlers', () => {
      const clickHandler = jest.fn();
      const hoverHandler = jest.fn();
      
      renderer.on('nodeClick', clickHandler);
      renderer.on('nodeHover', hoverHandler);
      
      expect(renderer.eventHandlers.nodeClick).toBe(clickHandler);
      expect(renderer.eventHandlers.nodeHover).toBe(hoverHandler);
    });

    test('should warn about unknown event types', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      renderer.on('unknownEvent', jest.fn());
      
      expect(consoleSpy).toHaveBeenCalledWith('Unknown event type: unknownEvent');
      consoleSpy.mockRestore();
    });

    test('should return renderer for chaining', () => {
      const result = renderer.on('nodeClick', jest.fn());
      expect(result).toBe(renderer);
    });
  });

  describe('tooltip methods', () => {
    test('should format node tooltip', () => {
      const node = { name: 'Test Node', value: 100, type: 'military', confidence: 'high' };
      const content = renderer.formatNodeTooltip(node);
      
      expect(content).toContain('Test Node');
      expect(content).toContain('100B');
      expect(content).toContain('military');
      expect(content).toContain('high');
    });

    test('should format flow tooltip', () => {
      const flowData = {
        flow: { value: 50, type: 'funding', confidence: 'medium' },
        fromNode: { name: 'Source' },
        toNode: { name: 'Target' }
      };
      
      const content = renderer.formatFlowTooltip(flowData);
      
      expect(content).toContain('50B');
      expect(content).toContain('Source');
      expect(content).toContain('Target');
      expect(content).toContain('funding');
      expect(content).toContain('medium');
    });

    test('should show and hide tooltip', () => {
      const mockEvent = { pageX: 100, pageY: 200 };
      
      renderer.showTooltip(mockEvent, 'Test content');
      expect(mockD3.style).toHaveBeenCalledWith('opacity', 1);
      expect(mockD3.html).toHaveBeenCalledWith('Test content');
      
      renderer.hideTooltip();
      expect(mockD3.style).toHaveBeenCalledWith('opacity', 0);
    });
  });

  describe('utility methods', () => {
    test('should truncate long text', () => {
      const longText = 'This is a very long text that should be truncated';
      const truncated = renderer.truncateText(longText, 100);
      
      expect(truncated.length).toBeLessThan(longText.length);
      expect(truncated).toContain('...');
    });

    test('should not truncate short text', () => {
      const shortText = 'Short';
      const result = renderer.truncateText(shortText, 100);
      
      expect(result).toBe(shortText);
    });
  });

  describe('lifecycle methods', () => {
    test('should update with new data', () => {
      const newData = { ...testData, sources: [] };
      const result = renderer.update(newData);
      
      expect(result).toBe(renderer);
      expect(renderer.data.sources).toHaveLength(0);
    });

    test('should clear visualization', () => {
      renderer.svg = mockD3;
      renderer.clear();
      
      expect(mockD3.remove).toHaveBeenCalled();
      expect(renderer.svg).toBeNull();
    });

    test('should destroy renderer', () => {
      renderer.svg = mockD3;
      renderer.tooltip = mockD3;
      
      renderer.destroy();
      
      expect(mockD3.remove).toHaveBeenCalled();
      expect(renderer.container).toBeNull();
      expect(renderer.data).toBeNull();
    });

    test('should resize visualization', () => {
      renderer.svg = mockD3;
      renderer.data = testData;
      
      renderer.resize(1000, 600);
      
      expect(renderer.options.width).toBe(1000);
      expect(renderer.options.height).toBe(600);
      expect(mockD3.attr).toHaveBeenCalledWith('width', 1000);
      expect(mockD3.attr).toHaveBeenCalledWith('height', 600);
    });
  });

  describe('getters', () => {
    test('should get current data', () => {
      renderer.data = testData;
      expect(renderer.getData()).toBe(testData);
    });

    test('should get SVG element', () => {
      renderer.svg = mockD3;
      expect(renderer.getSvg()).toBe(mockD3);
    });
  });
});

describe('Factory function', () => {
  test('should create renderer instance', () => {
    const renderer = createRenderer(mockContainer);
    expect(renderer).toBeInstanceOf(SankeyRenderer);
  });

  test('should pass options to constructor', () => {
    const options = { width: 1000 };
    const renderer = createRenderer(mockContainer, options);
    expect(renderer.options.width).toBe(1000);
  });
});