# Other Genocides Treemap

This directory contains an interactive treemap visualization of documented genocides and atrocities committed by various countries around the world.

## Files

- `index.html` - Interactive D3.js treemap visualization of global genocides and atrocities
- `othercountriesgeno.json` - Data file containing documented atrocities by 10 countries
- `README.md` - This documentation file

## Data Structure

The `othercountriesgeno.json` file contains an array of countries with the following structure:

```json
[
  {
    "country": "Country Name",
    "atrocities": [
      "Description of documented atrocity or genocide...",
      "Another documented atrocity..."
    ],
    "resources": [
      {
        "title": "Source Title",
        "url": "https://source-url.com"
      }
    ]
  }
]
```

## Features

### Interactive Treemap Visualization
- **Proportional Layout**: Countries sized by impact score based on death tolls and ongoing relevance
- **Color-Coded Countries**: Each country has a distinct color for easy identification
- **Impact Scoring**: Algorithm considers death tolls, ongoing conflicts, and genocide classification
- **Responsive Design**: Works on desktop and mobile devices

### Filtering and Search
- **Text Search**: Search through countries and their documented atrocities
- **Region Filter**: Filter by Asia, Europe, Middle East, or Africa
- **Atrocity Type Filter**: Filter by genocide, war crimes, ethnic cleansing, crimes against humanity, or ongoing atrocities
- **Scale Filter**: Filter by massive (>1M deaths), major (100K-1M), or significant (<100K) impact
- **Real-time Updates**: Filters update the visualization immediately

### Detailed Information System
- **Click for Details**: Click any country rectangle to see comprehensive information
- **Modal Interface**: Professional modal with detailed atrocity descriptions
- **Source Verification**: Direct links to credible sources for each country
- **Educational Context**: Clear explanations of each atrocity type

### Statistics Dashboard
- **Total Countries**: Count of all documented countries (10)
- **Total Atrocities**: Count of all documented atrocities
- **Ongoing Crises**: Count of countries with current ongoing atrocities
- **Filtered Results**: Count of currently visible countries

## Countries Documented

### Asia-Pacific Region
1. **China** - Great Leap Forward (15-55M deaths), Cultural Revolution, Uyghur genocide, Tibet occupation
2. **Myanmar** - Rohingya genocide (9K-43K deaths), military coups, ethnic conflicts
3. **Cambodia** - Khmer Rouge genocide (1.5-3M deaths), Killing Fields
4. **North Korea** - Korean War, prison camps (80K-120K), famines (240K-3.5M deaths)

### Europe & Former USSR
5. **Russia** - Ukraine war (50K+ deaths), Chechnya wars, Soviet invasions, Chernobyl disaster

### Middle East
6. **Israel** - Gaza operations (54K-335K deaths), Palestinian displacement, settlements
7. **Iran** - Iran-Iraq War (1M+ deaths), proxy conflicts, domestic suppression
8. **Saudi Arabia** - Yemen intervention (250K+ deaths), human rights abuses

### Africa
9. **Sudan** - Darfur genocide (98K-500K deaths), civil wars, ongoing conflicts
10. **Rwanda** - 1994 genocide (800K-1M deaths), DRC massacres

## Impact Scoring Algorithm

The treemap uses a sophisticated algorithm to size countries based on:

1. **Death Toll Multipliers**: Direct casualties from documented atrocities
2. **Ongoing Conflict Bonus**: 3x multiplier for current atrocities (2023-present)
3. **Genocide Classification**: 5x multiplier for events classified as genocide
4. **Specific Event Bonuses**: Additional scoring for major historical events
5. **Minimum Visibility**: Ensures all countries remain visible regardless of scale

## Educational Purpose

This visualization serves to:
- **Document Global Atrocities**: Comprehensive record of genocides and crimes against humanity
- **Promote Accountability**: Highlight ongoing impunity and need for justice
- **Support Victims**: Acknowledge suffering and preserve historical memory
- **Prevent Future Atrocities**: Education as prevention through awareness
- **Encourage Action**: Inform advocacy and policy decisions

## Data Sources

All information is compiled from credible sources including:
- **Human Rights Organizations**: Human Rights Watch, Amnesty International
- **United Nations**: UN reports, fact-finding missions, expert panels
- **International Courts**: ICC indictments, international tribunal findings
- **Academic Research**: Peer-reviewed studies and historical documentation
- **Investigative Journalism**: Credible media investigations and witness testimonies

## Usage

1. Open `index.html` in a web browser
2. Explore countries sized by impact - larger rectangles represent more severe or ongoing atrocities
3. Use filters to focus on specific regions, atrocity types, or impact scales
4. Hover over rectangles for quick information
5. Click on rectangles for detailed information including sources
6. The visualization emphasizes ongoing atrocities and systematic crimes

## Technical Details

- Built with D3.js v7
- Responsive CSS Grid and Flexbox layout
- Accessible design with ARIA labels and keyboard navigation
- Dark/light theme support
- Mobile-optimized treemap interface
- Professional modal system for detailed information

## Contributing

To add new countries or update existing information:
1. Update `othercountriesgeno.json` with properly formatted data
2. Ensure all sources are credible and accessible
3. Follow the existing data structure
4. Test the visualization after updates
5. Verify all source links are working