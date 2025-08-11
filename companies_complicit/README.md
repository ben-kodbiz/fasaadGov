# FasaadGov v02 - Enhanced Corporate Complicity Visualization

An enhanced Sankey flow visualization showing the money trail from funding sources through corporate intermediaries to military operations. This v02 enhancement provides a modular, maintainable, and feature-rich application while preserving all existing functionality.

## Features

### ✨ New in v02

- **Modular Architecture**: Clean separation of concerns with reusable components
- **Data Validation**: Formal JSON schema with comprehensive validation
- **Export Functionality**: Export visualizations as SVG, PNG, or JSON
- **Search & Filtering**: Find and filter nodes by name, type, or confidence level
- **Accessibility**: Full keyboard navigation and screen reader support
- **Mobile Responsive**: Optimized for all device sizes
- **Internationalization**: Support for multiple languages (English, Malay)
- **Metadata Display**: Detailed provenance and source information
- **Performance Optimization**: Web Worker support for large datasets
- **Legal Compliance**: Comprehensive disclaimers and source attribution

### 🔄 Preserved from v01

- Identical visual appearance and user interface
- Full backward compatibility with existing data
- All original functionality and interactions

## Quick Start

### Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Validate data
npm run validate

# Build for production
npm run build
```

### Usage

1. Open `sankey.html` in your browser
2. The visualization will load with the current corporate complicity data
3. Use the search box to find specific companies or entities
4. Click on nodes to see detailed metadata and sources
5. Use export buttons to save the visualization or data

## Project Structure

```
companies_complicit/
├── src/                    # Source code modules
│   ├── core/              # Core rendering engine
│   ├── ui/                # User interface components
│   ├── utils/             # Utility functions
│   └── styles/            # CSS stylesheets
├── data/                  # Data and configuration
│   ├── schema/            # JSON schemas
│   └── i18n/              # Translation files
├── tests/                 # Test suites
├── docs/                  # Documentation
├── scripts/               # Build and utility scripts
└── sankey.html           # Main application file
```

## Data Format

The application supports both legacy and enhanced data formats:

### Enhanced Format (v02)

```json
{
  "sources": [{
    "id": "string",
    "name": "string", 
    "value": "number",
    "color": "#hex",
    "source": "string (optional)",
    "confidence": "high|medium|low (optional)"
  }],
  "companies": [{
    "id": "string",
    "name": "string",
    "value": "number", 
    "color": "#hex",
    "type": "string",
    "headquarters": "string (optional)",
    "revenue": "string (optional)",
    "news_articles": "array (optional)"
  }],
  "flows": [{
    "from": "string",
    "to": "string", 
    "value": "number",
    "evidence": "array (optional)",
    "confidence": "high|medium|low (optional)"
  }]
}
```

### Legacy Format (v01)

The original simple format is still fully supported:

```json
{
  "sources": [{"id", "name", "value", "color"}],
  "companies": [{"id", "name", "value", "color"}], 
  "targets": [{"id", "name", "value", "color"}],
  "flows": [{"from", "to", "value"}]
}
```

## Development

### Adding New Features

1. Create modules in appropriate `src/` subdirectories
2. Add unit tests in `tests/unit/`
3. Update the main application integration
4. Run the full test suite

### Data Updates

1. Validate new data: `npm run validate`
2. Test with the visualization
3. Update documentation if schema changes

### Contributing

1. Follow the existing code style
2. Add tests for new functionality  
3. Update documentation
4. Ensure backward compatibility

## Legal Notice

This visualization presents data about corporate involvement in military operations. All data sources are attributed and confidence levels are indicated. For questions about data accuracy or removal requests, please see our [Legal Notice](docs/LEGAL_NOTICE.md).

## License

MIT License - see LICENSE file for details.

## Version History

- **v02**: Enhanced modular architecture with advanced features
- **v01**: Original Sankey visualization implementation