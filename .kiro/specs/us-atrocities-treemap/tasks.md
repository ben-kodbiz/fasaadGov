# Implementation Plan

- [ ] 1. Set up project structure and create data extraction script
  - Create directory structure for data/, scripts/, and visual/ components
  - Write Python script to parse us_atrocity.md and extract categories from H2 headers
  - Implement event extraction from H3 headers and bullet points under each category
  - Add section exclusion logic to filter out LGBTQ section and irrelevant footers
  - Generate structured JSON output with title, summary, date, region, and unique IDs for each event
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.3_

- [ ] 2. Generate JSON data file from markdown source
  - Run the Python conversion script to create us_interventions.json
  - Validate JSON structure matches the expected schema for the visualization
  - Ensure data includes all required fields: title, summary, date, region, casualties
  - _Requirements: 2.1, 2.2, 2.4, 2.5_

- [x] 3. Basic HTML structure and D3.js treemap visualization
  - ~~Build index.html with responsive layout structure~~
  - ~~Add D3.js v7 CDN integration and basic styling~~
  - ~~Implement core treemap rendering with categories and events~~
  - ~~Add hover tooltips and basic filtering~~
  - _Requirements: 1.1, 1.2, 1.4, 3.1_

- [x] 4. Enhance visualization to match design requirements
  - Update treemap to use proper hierarchical structure with categories as main rectangles
  - Implement consistent D3.js color scale for category identification
  - Add click event handlers for event boxes with sidebar detail display
  - Improve tooltip content to show event title and short summary
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 5. Add comprehensive filtering and search functionality
  - Create search box component with keyword filtering for titles and summaries
  - Enhance region filter to work with the actual data structure
  - Add legend component showing category colors and meanings
  - Implement real-time filter updates that properly refresh the treemap
  - _Requirements: 3.2, 3.3, 5.1, 5.3_

- [ ] 6. Implement enhanced user interface features
  - Add date slider for filtering events by year range
  - Create event counter display showing total events, categories, and casualties
  - Add dark mode toggle with CSS custom properties for theme switching
  - Improve mobile responsiveness with proper CSS grid and breakpoints
  - _Requirements: 5.2, 5.4, 5.5, 3.4_

- [ ] 7. Add error handling and performance optimizations
  - Implement graceful error handling for data loading failures with user-friendly messages
  - Add JSON data validation and schema compliance checking
  - Create fallback rendering for browsers without JavaScript support
  - Optimize performance for large datasets
  - _Requirements: 1.1, 2.4, 4.4_

- [ ] 8. Create deployment setup and automation
  - Write command-line interface for the markdown-to-JSON conversion script
  - Add script execution instructions and error handling for data processing failures
  - Create .nojekyll file and configure project for GitHub Pages hosting
  - Test end-to-end data flow from markdown update to visualization refresh
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 9. Implement news article processing system
  - Create news/ folder structure for drag-and-drop article storage
  - Write Python script to detect and parse text/HTML article files
  - Implement content extraction for title, date, summary, and source URL
  - Add automatic categorization logic for US/Israel atrocities
  - Create duplicate detection system to prevent redundant entries
  - Integrate article processing with existing JSON data structure
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [ ] 10. Add article processing automation and monitoring
  - Implement file system watcher for automatic article processing
  - Create command-line interface for manual article processing
  - Add timestamp preservation for original article dates
  - Implement error handling for malformed or unreadable articles
  - Create logging system for article processing activities
  - Add validation for processed article data before JSON integration
  - _Requirements: 6.1, 6.2, 6.6, 6.7_

- [ ] 11. Enhance visualization for news article integration
  - Update treemap visualization to display both markdown and news article events
  - Add visual indicators to distinguish between data sources (markdown vs news)
  - Implement filtering options for event source type
  - Add source attribution display in tooltips and detail views
  - Update legend to include news article indicators
  - Ensure proper color coding for mixed data sources
  - _Requirements: 6.5, 6.6_

- [ ] 12. Write documentation and tests
  - Create README.md with setup instructions, usage examples, and deployment guide
  - Add unit tests for markdown parsing functions and JSON schema validation
  - Write integration tests for end-to-end data flow from markdown to visualization
  - Add unit tests for news article parsing and processing functions
  - Create integration tests for article drag-and-drop workflow
  - Document the project structure, update process, and news article workflow
  - _Requirements: 4.3, 4.4, 6.1, 6.2_