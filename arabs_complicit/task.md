# Arab Complicity Visualization Task

## Overview
Create an interactive D3.js sunburst visualization to analyze Arab countries' relationships and investments with Israel and the United States.

## Data Sources
- `arabs_complicit.json` - Contains relationship data, agreements, and cooperation details
- `arabs_investment.json` - Contains investment amounts and financial ties

## Visualization Requirements

### 1. Sunburst Chart Structure
- **Center**: "Arab Countries" 
- **Inner Ring**: Relationship categories (Direct/Indirect ties)
- **Outer Ring**: Individual countries
- **Alternative Views**: Investment levels, Timeline view

### 2. Interactive Features
- **Hover Effects**: Show detailed tooltips with country information
- **Click Events**: Display detailed country information in side panel
- **View Modes**: 
  - Relationships (Direct/Indirect ties)
  - Investment levels (High/Medium/Low)
  - Timeline view (by agreement dates)
- **Filters**: All countries, Direct ties only, Indirect ties only, Abraham Accords

### 3. Color Coding
- **Direct Israel ties**: Red (#e53e3e)
- **Indirect Israel ties**: Orange (#fd9853)  
- **Direct US ties**: Blue (#3182ce)
- **Indirect US ties**: Light blue (#63b3ed)
- **High investment (>$100B)**: Green (#38a169)
- **Medium investment ($1B-$100B)**: Light green (#68d391)
- **Low investment (<$1B)**: Very light green (#c6f6d5)

### 4. Layout Components
- **Header**: Title and description
- **Controls**: View mode selector, focus filter, reset button
- **Main Area**: 
  - Sunburst visualization (2/3 width)
  - Information panel (1/3 width)
- **Legend**: Color coding explanation
- **Responsive**: Mobile-friendly layout

### 5. Information Panel Content
When a country is selected, display:
- Country name
- Relationship status with Israel and US
- Key agreements and dates
- Investment amounts
- Public sentiment data
- Cooperation details

### 6. Data Processing
- Parse investment amounts from text (handle B/M suffixes)
- Filter countries based on selected criteria
- Create hierarchical data structure for sunburst
- Handle missing or incomplete data gracefully

### 7. Technical Implementation
- D3.js v7 for visualization
- Responsive CSS Grid/Flexbox layout
- CSS custom properties for theming
- Error handling for data loading
- Smooth transitions and animations

## Files Structure
```
arabs_complicit/
├── index.html          # Main visualization page
├── arabs_complicit.json # Relationship data
├── arabs_investment.json # Investment data
└── task.md             # This documentation
```

## Key Features Implemented
✅ Interactive sunburst chart with D3.js
✅ Multiple view modes (relationships, investments, timeline)
✅ Filtering capabilities
✅ Detailed tooltips and information panel
✅ Responsive design
✅ Color-coded categories
✅ Error handling
✅ Clean, modern UI design

## Usage
1. Open `index.html` in a web browser
2. Use controls to switch between view modes
3. Apply filters to focus on specific country groups
4. Hover over segments for quick information
5. Click segments for detailed country information
6. Use reset button to return to default view

## Data Quality Notes
- Investment amounts are estimates from various sources
- Some countries have limited data availability
- Public sentiment data is from Arab Barometer surveys (2021-2022)
- Timeline data focuses on major agreements and normalization events