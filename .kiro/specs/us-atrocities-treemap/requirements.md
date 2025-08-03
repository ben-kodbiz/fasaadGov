# Requirements Document

## Introduction

This feature involves building a scalable, auto-updatable D3.js treemap visualization that displays categorized US atrocities data sourced from a markdown file. The system must be future-proof, allowing updates from the same markdown source without requiring code rewrites. The visualization will be interactive, mobile-friendly, and hosted on GitHub Pages for public access.

## Requirements

### Requirement 1

**User Story:** As a researcher or educator, I want to visualize US atrocities data in an interactive treemap format, so that I can better understand the scope and categorization of historical events.

#### Acceptance Criteria

1. WHEN the system loads THEN it SHALL display a treemap visualization with categories as main rectangles and sub-events as nested boxes
2. WHEN a user hovers over an event box THEN the system SHALL show a tooltip with event title and short summary
3. WHEN a user clicks on an event box THEN the system SHALL optionally display full details in a sidebar
4. WHEN the visualization renders THEN it SHALL use distinct colors for each category using D3's color scale

### Requirement 2

**User Story:** As a data maintainer, I want the system to automatically convert markdown source data to JSON format, so that I can update the visualization without manual data transformation.

#### Acceptance Criteria

1. WHEN the markdown-to-JSON script runs THEN it SHALL parse H2 headers as categories (e.g., Vietnam War, Iraq Invasion)
2. WHEN parsing markdown THEN the system SHALL extract H3 headers or bullet points as sub-events under each category
3. WHEN converting data THEN the system SHALL exclude the LGBTQ section and irrelevant footers
4. WHEN generating JSON THEN each event SHALL include title, summary, date, region, and unique identifier
5. WHEN the script completes THEN it SHALL save output to data/us_interventions.json

### Requirement 3

**User Story:** As an end user, I want the visualization to be accessible on mobile devices and include filtering capabilities, so that I can explore the data effectively on any device.

#### Acceptance Criteria

1. WHEN viewing on mobile devices THEN the system SHALL provide a mobile-friendly CSS grid fallback
2. WHEN the page loads THEN it SHALL include a legend showing category colors
3. WHEN filtering options are available THEN users SHALL be able to filter by region
4. WHEN the visualization displays THEN it SHALL be responsive across different screen sizes

### Requirement 4

**User Story:** As a project maintainer, I want the system to be easily deployable and updatable, so that new data can be published without complex deployment processes.

#### Acceptance Criteria

1. WHEN deploying THEN the system SHALL be hostable via GitHub Pages
2. WHEN the markdown source is updated THEN running the conversion script SHALL regenerate the JSON data
3. WHEN the project structure is created THEN it SHALL follow the specified folder organization with data/, visual/, and scripts/ directories
4. WHEN updates are made THEN the system SHALL not require code rewrites for new data

### Requirement 5

**User Story:** As a user exploring the data, I want enhanced search and filtering capabilities, so that I can find specific events or patterns in the data.

#### Acceptance Criteria

1. WHEN a search box is provided THEN users SHALL be able to search by keyword in titles or summaries
2. WHEN date filtering is available THEN users SHALL be able to filter events by year using a date slider
3. WHEN region filtering is implemented THEN users SHALL be able to interactively filter by world region
4. WHEN viewing the interface THEN it SHALL display total counts of events, categories, and casualties
5. WHEN a dark mode toggle is provided THEN users SHALL be able to switch between light and dark themes

### Requirement 6

**User Story:** As a researcher or journalist, I want to drag and drop news articles about US/Israel atrocities into the system, so that I can quickly add new events to the visualization without manual data entry.

#### Acceptance Criteria

1. WHEN a news/ folder exists THEN users SHALL be able to drag and drop article files (text or HTML) into it
2. WHEN article files are detected THEN the system SHALL automatically parse them to extract relevant information
3. WHEN parsing articles THEN the system SHALL extract title, date/timestamp, content summary, and source URL
4. WHEN processing articles THEN the system SHALL categorize them appropriately (US atrocities, Israel atrocities, etc.)
5. WHEN new articles are processed THEN they SHALL be automatically converted to JSON format and integrated into the visualization
6. WHEN articles are added THEN the system SHALL preserve original timestamps and add processing timestamps
7. WHEN duplicate articles are detected THEN the system SHALL handle them gracefully without creating duplicates