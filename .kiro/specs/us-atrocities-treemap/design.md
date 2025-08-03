# Design Document

## Overview

The US Atrocities Treemap is a web-based data visualization system that transforms markdown-formatted historical data into an interactive D3.js treemap. The system consists of three main components: a data extraction pipeline that converts markdown to JSON, a responsive web visualization built with D3.js, and an automated deployment system using GitHub Pages.

The visualization displays hierarchical data where main categories (like "Middle East", "Vietnam War") are represented as large rectangles, with individual events nested as smaller rectangles within each category. Users can interact with the visualization through hover tooltips, click events, and filtering controls.

## Architecture

### System Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Markdown      │    │   JSON Data      │    │   Web Client    │
│   Source        │───▶│   Storage        │───▶│   Visualization │
│   (us_atrocity.md)   │   (data/*.json)  │    │   (visual/)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       ▲                       │
         │              ┌────────┴────────┐              │
         └─────────────▶│  Python Parser  │              │
                        │  (scripts/)     │              │
                        └─────────────────┘              │
                                 ▲                       │
┌─────────────────┐              │                       │
│   News Articles │              │                       │
│   Folder        │──────────────┘                       │
│   (news/)       │                                      │
└─────────────────┘                                      │
         │                                               │
         │              ┌─────────────────┐              │
         └─────────────▶│  Article Parser │              │
                        │  & Processor    │              │
                        │  (scripts/)     │              │
                        └─────────────────┘              │
                                                         │
                        ┌─────────────────┐              │
                        │  GitHub Pages   │◀─────────────┘
                        │  Hosting        │
                        └─────────────────┘
```

### Data Flow

#### Primary Data Flow (Markdown Source)
1. **Source Data**: Markdown file containing structured atrocity data with H2 categories and H3/bullet point events
2. **Data Extraction**: Python script parses markdown, extracts structured data, excludes specified sections
3. **JSON Generation**: Structured data is serialized to JSON with consistent schema
4. **Visualization Loading**: D3.js loads JSON data and renders interactive treemap
5. **User Interaction**: Real-time filtering, tooltips, and navigation within the visualization

#### Secondary Data Flow (News Articles)
1. **Article Input**: Users drag and drop news articles (text/HTML files) into news/ folder
2. **File Detection**: File system watcher or manual script execution detects new articles
3. **Article Parsing**: Python script extracts title, date, content, and source from articles
4. **Content Processing**: Natural language processing to extract key information and categorize
5. **JSON Integration**: New events are added to existing JSON data structure
6. **Auto-Update**: Visualization automatically refreshes with new data

## Components and Interfaces

### Data Extraction Component

**Purpose**: Convert markdown source to structured JSON data

**Key Functions**:
- `parse_markdown(file_path)`: Main parsing function that processes the markdown file
- `extract_categories()`: Identifies H2 headers as main categories
- `extract_events()`: Processes H3 headers and bullet points as individual events
- `exclude_sections()`: Filters out LGBTQ section and irrelevant footers
- `generate_json()`: Serializes parsed data to JSON format

**Input**: `us_atrocity.md` (markdown file)
**Output**: `data/us_interventions.json` (structured JSON)

### Web Visualization Component

**Purpose**: Render interactive D3.js treemap visualization

**Key Modules**:
- `treemap.js`: Main visualization logic using D3.js v7
- `style.css`: Responsive styling and mobile-friendly layouts
- `index.html`: HTML structure and component integration

**Key Functions**:
- `loadData()`: Asynchronously loads JSON data
- `createTreemap()`: Initializes D3 treemap layout and hierarchy
- `renderNodes()`: Draws category and event rectangles
- `setupInteractions()`: Configures hover tooltips and click handlers
- `applyFilters()`: Implements search and region filtering
- `updateVisualization()`: Redraws treemap based on filtered data

### News Article Processing Component

**Purpose**: Automatically process drag-and-drop news articles and integrate them into the visualization

**Key Functions**:
- `watch_news_folder()`: Monitor news/ directory for new files
- `parse_article(file_path)`: Extract content from text/HTML files
- `extract_metadata()`: Parse title, date, source URL, and content
- `categorize_article()`: Determine appropriate category (US/Israel atrocities)
- `process_content()`: Extract key information and create summary
- `integrate_to_json()`: Add new events to existing JSON data structure
- `detect_duplicates()`: Prevent duplicate entries from same articles

**Input**: Text files, HTML files in news/ folder
**Output**: Updated JSON data with new events

**File Processing Logic**:
- **Text Files**: Parse plain text for title, date patterns, and content
- **HTML Files**: Extract structured data from HTML tags and meta information
- **Timestamp Handling**: Preserve original article timestamps and add processing timestamps
- **Source Attribution**: Maintain links to original articles and sources

### Deployment Component

**Purpose**: Automated hosting and updates via GitHub Pages

**Configuration**:
- Static file serving from repository root
- `.nojekyll` file to bypass Jekyll processing
- Automated deployment on repository updates

## Data Models

### JSON Schema

```json
{
  "categories": [
    {
      "id": "string",
      "name": "string",
      "events": [
        {
          "id": "string",
          "title": "string",
          "summary": "string",
          "date": "string",
          "region": "string",
          "casualties": "number|null",
          "source": "string",
          "sourceUrl": "string|null",
          "type": "markdown|news_article",
          "originalTimestamp": "ISO8601 timestamp|null",
          "processedTimestamp": "ISO8601 timestamp",
          "tags": ["string"]
        }
      ]
    }
  ],
  "metadata": {
    "lastUpdated": "ISO8601 timestamp",
    "totalEvents": "number",
    "totalCategories": "number",
    "newsArticlesCount": "number",
    "markdownEventsCount": "number"
  }
}
```

### D3.js Hierarchy Structure

```javascript
const hierarchyData = {
  name: "US Atrocities",
  children: [
    {
      name: "Category Name",
      children: [
        {
          name: "Event Title",
          value: 1, // For treemap sizing
          data: {
            summary: "Event description",
            date: "Date range",
            region: "Geographic region"
          }
        }
      ]
    }
  ]
}
```

## User Interface Design

### Layout Structure

```
┌─────────────────────────────────────────────────────┐
│                    Header                           │
│  Title | Search Box | Region Filter | Legend        │
├─────────────────────────────────────────────────────┤
│                                                     │
│                Treemap Visualization                │
│  ┌─────────────┐  ┌──────────┐  ┌─────────────┐    │
│  │  Category 1 │  │Category 2│  │  Category 3 │    │
│  │ ┌─────┐     │  │ ┌──────┐ │  │ ┌─────┐     │    │
│  │ │Event│     │  │ │Event │ │  │ │Event│     │    │
│  │ └─────┘     │  │ └──────┘ │  │ └─────┘     │    │
│  └─────────────┘  └──────────┘  └─────────────┘    │
│                                                     │
├─────────────────────────────────────────────────────┤
│                   Footer                            │
│  Statistics | Dark Mode Toggle | Data Source       │
└─────────────────────────────────────────────────────┘
```

### Color Scheme

- **Category Colors**: D3.js `d3.scaleOrdinal(d3.schemeCategory10)` for consistent category identification
- **Event Colors**: Lighter shades of category colors with opacity variations
- **Interactive States**: Hover highlighting with border emphasis and opacity changes
- **Dark Mode**: CSS custom properties for theme switching

### Responsive Design

- **Desktop**: Full treemap with sidebar details panel
- **Tablet**: Stacked layout with collapsible filters
- **Mobile**: Single-column layout with modal popups for event details

## Error Handling

### Data Processing Errors

- **Markdown Parsing Failures**: Log specific line numbers and continue with partial data
- **JSON Serialization Issues**: Validate data structure before serialization
- **Missing Required Fields**: Provide default values and warning messages

### Visualization Errors

- **Data Loading Failures**: Display user-friendly error message with retry option
- **D3.js Rendering Issues**: Graceful degradation to basic HTML list view
- **Browser Compatibility**: Feature detection and polyfills for older browsers

### User Input Validation

- **Search Queries**: Sanitize input and handle special characters
- **Filter Parameters**: Validate filter values and provide feedback
- **URL Parameters**: Parse and validate deep-linking parameters

## Testing Strategy

### Unit Testing

**Data Extraction Tests**:
- Test markdown parsing with various header structures
- Validate JSON schema compliance
- Test section exclusion functionality
- Verify data integrity and completeness

**Visualization Tests**:
- Test D3.js hierarchy creation
- Validate treemap layout calculations
- Test interactive event handlers
- Verify responsive layout behavior

### Integration Testing

- End-to-end data flow from markdown to visualization
- Cross-browser compatibility testing
- Mobile device testing across different screen sizes
- Performance testing with large datasets

### User Acceptance Testing

- Usability testing for navigation and filtering
- Accessibility testing for screen readers and keyboard navigation
- Visual design validation across different themes
- Content accuracy verification against source data

## Performance Considerations

### Data Optimization

- **JSON Compression**: Minimize JSON file size through efficient serialization
- **Lazy Loading**: Load event details on-demand for large datasets
- **Caching Strategy**: Browser caching for static JSON data with versioning

### Rendering Optimization

- **D3.js Performance**: Use efficient data binding and minimal DOM manipulation
- **Animation Throttling**: Debounce filter updates and smooth transitions
- **Memory Management**: Clean up event listeners and unused DOM elements

### Scalability

- **Data Pagination**: Support for large datasets through chunked loading
- **Virtual Scrolling**: Efficient rendering of large lists in mobile view
- **Progressive Enhancement**: Core functionality works without JavaScript