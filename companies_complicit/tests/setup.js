/**
 * Jest test setup file
 * Global test configuration and utilities
 */

// Mock DOM APIs that might not be available in jsdom
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock canvas context for export functionality
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  drawImage: jest.fn(),
  getImageData: jest.fn(),
  putImageData: jest.fn(),
  createImageData: jest.fn(),
  setTransform: jest.fn(),
  resetTransform: jest.fn(),
  measureText: jest.fn(() => ({ width: 100 })),
  fillText: jest.fn(),
  strokeText: jest.fn(),
}));

HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
  callback(new Blob(['fake-image-data'], { type: 'image/png' }));
});

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = jest.fn();

// Mock XMLSerializer for SVG export
global.XMLSerializer = jest.fn().mockImplementation(() => ({
  serializeToString: jest.fn(() => '<svg>mock-svg-content</svg>'),
}));

// Mock performance API
global.performance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
};

// Global test utilities
global.createMockSVGElement = () => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '800');
  svg.setAttribute('height', '500');
  return svg;
};

global.createMockData = () => ({
  sources: [
    { id: 'test-source', name: 'Test Source', value: 100, color: '#ff0000' }
  ],
  companies: [
    { id: 'test-company', name: 'Test Company', value: 80, color: '#00ff00', type: 'military' }
  ],
  targets: [
    { id: 'test-target', name: 'Test Target', value: 60, color: '#0000ff' }
  ],
  flows: [
    { from: 'test-source', to: 'test-company', value: 50 }
  ]
});

// Suppress console warnings during tests unless explicitly testing them
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes && args[0].includes('test-specific-warning')) {
    originalWarn(...args);
  }
};