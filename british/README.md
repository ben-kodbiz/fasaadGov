# British Atrocities Timeline

This directory contains an interactive timeline visualization of documented British atrocities and war crimes from 1962 to the present day.

## Files

- `index.html` - Interactive D3.js timeline visualization
- `british.json` - Data file containing documented British atrocities
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

### Interactive Timeline
- **Chronological Layout**: Events are displayed on a timeline from 1962 to present
- **Event Categories**: Color-coded by type (Colonial Crimes, Military Operations, Covert Operations, Cover-ups, Current Complicity)
- **Hover Details**: Detailed information appears on hover with sources
- **Responsive Design**: Works on desktop and mobile devices

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

1. **Colonial Crimes** - Atrocities during decolonization (Chagos Islands, Aden)
2. **Military Operations** - Direct military actions and war crimes
3. **Covert Operations** - Secret operations and undeclared wars
4. **Cover-ups** - Systematic concealment of crimes (Operation Legacy)
5. **Current Complicity** - Ongoing involvement in atrocities (Gaza, Yemen)

## Data Sources

All events are sourced from:
- Government documents and inquiries
- Academic research and books
- Credible news organizations
- Parliamentary records
- International investigations

## Usage

1. Open `index.html` in a web browser
2. Use the search and filter controls to explore specific events
3. Hover over events for detailed information
4. Click on source links to verify information

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