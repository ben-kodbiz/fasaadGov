# British Atrocities Timeline

This directory contains an interactive timeline visualization of documented British atrocities and war crimes from 1962 to the present day.

## Files

- `index.html` - Interactive D3.js treemap visualization of modern British atrocities (1962-present)
- `british_india_treemap.html` - Interactive D3.js treemap visualization of British colonial genocide in India (1769-1947)
- `british.json` - Data file containing documented modern British atrocities
- `british_india.json` - Data file containing documented British colonial atrocities in India
- `README.md` - This documentation file

## Data Structure

The `british.json` file contains an array of events with the following structure:

```json
{
  "events": [
    {
      "name": "Event Name",
      "years": "YYYY-YYYY or YYYY-present",
      "description": "Detailed description of the atrocity or war crime",
      "sources": [
        "https://source1.com",
        "https://source2.com"
      ]
    }
  ]
}
```

## Features

### Two Visualization Types

#### 1. Modern Atrocities Treemap (`index.html`)
- **Proportional Layout**: Events sized by impact and ongoing relevance (1962-present)
- **Event Categories**: Color-coded by type (Colonial Crimes, Military Operations, Covert Operations, Cover-ups, Current Complicity)
- **Impact Visualization**: Rectangle size represents scale, duration, and current relevance of atrocities
- **Interactive Filtering**: Filter by time period, event type, and impact scale

#### 2. British India Genocide Treemap (`british_india_treemap.html`)
- **Proportional Layout**: Events sized by death toll (1769-1947)
- **Event Categories**: Color-coded by type (Famines, Massacres, Colonial Policies, Revolt Suppression, Partition, Forced Labor)
- **Death Toll Visualization**: Visual representation of the scale of colonial genocide
- **Interactive Filtering**: Filter by time period, event type, and death toll scale

### Filtering and Search
- **Text Search**: Search through event names and descriptions
- **Time Period Filter**: Filter by decade (1960s, 1970s, etc.)
- **Event Type Filter**: Filter by category of atrocity
- **Real-time Updates**: Filters update the visualization immediately

### Statistics Dashboard
- **Total Events**: Count of all documented events
- **Time Span**: Years covered by the data
- **Ongoing Issues**: Events that continue to present day
- **Filtered Results**: Count of currently visible events

## Event Categories

### Modern Atrocities (1962-present)
1. **Colonial Crimes** - Atrocities during decolonization (Chagos Islands, Aden)
2. **Military Operations** - Direct military actions and war crimes
3. **Covert Operations** - Secret operations and undeclared wars
4. **Cover-ups** - Systematic concealment of crimes (Operation Legacy)
5. **Current Complicity** - Ongoing involvement in atrocities (Gaza, Yemen)

### British India Genocide (1769-1947)
1. **Famines** - Colonial policies causing mass starvation (Bengal Famine, Great Famine)
2. **Massacres** - Direct military violence against civilians (Jallianwala Bagh)
3. **Colonial Policies** - Systematic exploitation causing excess deaths (50-165 million)
4. **Revolt Suppression** - Brutal crushing of independence movements (1857 Revolt)
5. **Partition** - Deaths from hasty division of India (1-2 million)
6. **Forced Labor** - Indentured labor system deaths (200,000-500,000)

## Data Sources

All events are sourced from:
- Government documents and inquiries
- Academic research and books
- Credible news organizations
- Parliamentary records
- International investigations

## Usage

### Modern Atrocities Treemap
1. Open `index.html` in a web browser
2. Explore events sized by impact - larger rectangles represent more significant or ongoing atrocities
3. Use filters to focus on specific time periods, event types, or impact scales
4. Hover over rectangles for detailed information and click for comprehensive details
5. The visualization emphasizes ongoing atrocities and systematic crimes

### British India Genocide Treemap
1. Navigate to the "British India Genocide" tab or open `british_india_treemap.html`
2. Explore events sized by death toll - larger rectangles represent higher casualties
3. Use filters to focus on specific time periods, event types, or death toll scales
4. Hover over rectangles for detailed information including death toll estimates
5. The visualization shows the massive scale of British colonial genocide in India

## Educational Purpose

This visualization is created for educational purposes to promote historical awareness and accountability. All information is documented and sourced from credible sources.

## Technical Details

- Built with D3.js v7
- Responsive CSS Grid and Flexbox layout
- Accessible design with ARIA labels
- Dark/light theme support
- Mobile-optimized interface

## Contributing

To add new events:
1. Update `british.json` with properly formatted event data
2. Ensure all sources are credible and accessible
3. Follow the existing data structure
4. Test the visualization after updates