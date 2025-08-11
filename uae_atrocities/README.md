# UAE Atrocities Treemap

This directory contains an interactive treemap visualization of alleged atrocities committed by the United Arab Emirates (UAE) in various countries and regions.

## Files

- `index.html` - Interactive D3.js treemap visualization of UAE atrocities by region
- `UAE_atro.json` - Comprehensive data file containing documented atrocities across 4 major regions
- `UAE_README.md` - This documentation file

## Data Structure

The `UAE_atro.json` file contains detailed information about UAE's alleged involvement in atrocities across multiple regions:

```json
{
  "title": "Alleged Atrocities Committed by the United Arab Emirates (UAE) in Other Countries",
  "introduction": "Comprehensive overview based on research from diverse sources...",
  "atrocities": {
    "region_name": {
      "period": "Time period of involvement",
      "description": "Overview of UAE's role and allegations",
      "points": [
        {
          "title": "Specific atrocity type",
          "details": "Detailed description of the atrocity"
        }
      ],
      "uae_response": "Official UAE response to allegations"
    }
  },
  "resources": {
    "reports_and_articles": [...],
    "videos": [...]
  }
}
```

## Features

### Interactive Treemap Visualization
- **Proportional Layout**: Regions sized by impact score based on severity, ongoing status, and atrocity count
- **Color-Coded Regions**: Each region has a distinct color for easy identification
- **Impact Scoring**: Algorithm considers death tolls, ongoing conflicts, genocide classification, and systematic patterns
- **Responsive Design**: Works on desktop and mobile devices

### Filtering and Search
- **Text Search**: Search through regions and their documented atrocities
- **Region Filter**: Filter by Sudan, Yemen, Libya, or Other African Countries
- **Atrocity Type Filter**: Filter by genocide, war crimes, torture, mercenaries, or arms embargo violations
- **Time Period Filter**: Filter by ongoing (2019-Present), recent (2015-2024), or historical periods
- **Real-time Updates**: Filters update the visualization immediately

### Detailed Information System
- **Click for Details**: Click any region rectangle to see comprehensive information
- **Modal Interface**: Professional modal with detailed atrocity descriptions and UAE responses
- **Educational Context**: Clear explanations of each atrocity type and time period

### Statistics Dashboard
- **Total Regions**: Count of all documented regions (4)
- **Total Atrocities**: Count of all documented atrocity points (12)
- **Ongoing Crises**: Count of regions with current ongoing atrocities
- **Filtered Results**: Count of currently visible regions

## Regions Documented

### 1. Sudan (2019-Present)
- **Primary Focus**: RSF backing enabling genocide in Darfur
- **Key Atrocities**: Arms supply violations, ethnic cleansing, mercenary operations
- **Impact**: 150,000+ killed, 12 million displaced, ICJ case filed

### 2. Yemen (2015-Present)
- **Primary Focus**: Saudi-led coalition participation
- **Key Atrocities**: Torture centers, mercenary recruitment, humanitarian blockades
- **Impact**: World's worst humanitarian crisis

### 3. Libya (2014-Present)
- **Primary Focus**: Support for General Haftar
- **Key Atrocities**: Arms embargo violations, civilian airstrikes, mercenary deployment
- **Impact**: Mass graves, ethnic violence, summary executions

### 4. Other African Countries (2010s-Present)
- **Primary Focus**: Neo-colonial interventions and migrant abuses
- **Key Atrocities**: Military bases, Wagner funding, migrant detention, resource extraction
- **Impact**: Regional destabilization, human rights violations

## Impact Scoring Algorithm

The treemap uses a sophisticated algorithm to size regions based on:

1. **Base Score**: 1000 points for each region
2. **Atrocity Count Multiplier**: 20,000 points per documented atrocity
3. **Ongoing Conflict Bonus**: 2.5x multiplier for current atrocities (2019-Present)
4. **Genocide Classification**: 3x multiplier for events involving genocide or ethnic cleansing
5. **War Crimes Multiplier**: 2x multiplier for documented war crimes or torture
6. **Regional Specific Bonuses**: Additional points for major ongoing crises
7. **Maximum Cap**: 500,000 points to prevent extreme dominance

## Educational Purpose

This visualization serves to:
- **Document UAE Atrocities**: Comprehensive record of alleged crimes across multiple regions
- **Promote Accountability**: Highlight patterns of UAE involvement in regional conflicts
- **Support Victims**: Acknowledge suffering and preserve documented evidence
- **Encourage Transparency**: Provide access to credible sources and UAE responses
- **Inform Policy**: Support evidence-based discussions on regional security

## Data Sources

All information is compiled from credible sources including:
- **Human Rights Organizations**: Amnesty International, Human Rights Watch
- **United Nations**: UN reports, arms embargo monitoring, fact-finding missions
- **International Courts**: ICJ filings, international tribunal evidence
- **Investigative Journalism**: Guardian, leaked UN reports, eyewitness testimonies
- **Official Statements**: UAE Ministry of Foreign Affairs responses
- **Academic Research**: Think tank analyses and regional security studies

## UAE Official Responses

The UAE consistently denies direct involvement in atrocities across all regions:
- **Sudan**: Claims humanitarian aid only, calls ICJ case "publicity stunt"
- **Yemen**: Emphasizes counter-terrorism and development focus
- **Libya**: Positions support as anti-Islamist stability efforts
- **Africa**: Highlights economic partnerships with 24+ nations

## Usage

1. Open `index.html` in a web browser
2. Explore regions sized by impact - larger rectangles represent more severe or ongoing atrocities
3. Use filters to focus on specific regions, atrocity types, or time periods
4. Hover over rectangles for quick information
5. Click on rectangles for detailed information including UAE responses
6. Review sources and documentation in the dedicated resources section

## Technical Details

- Built with D3.js v7
- Responsive CSS Grid and Flexbox layout
- Accessible design with ARIA labels and keyboard navigation
- Dark/light theme support
- Mobile-optimized treemap interface
- Professional modal system for detailed information
- Comprehensive resources section with direct links

## Contributing

To update information or add new regions:
1. Update `UAE_atro.json` with properly formatted data
2. Ensure all sources are credible and accessible
3. Include UAE official responses where available
4. Follow the existing data structure
5. Test the visualization after updates
6. Verify all source links are working

## Disclaimers

- **Educational Purpose**: Created for educational and analytical purposes
- **Source Verification**: All information sourced from credible organizations
- **Allegations vs. Convictions**: Many events are based on credible allegations and investigations
- **Multiple Perspectives**: Includes UAE official responses alongside allegations
- **Ongoing Situations**: Information may evolve as situations develop
- **Bias Considerations**: Multiple viewpoints included to provide balanced coverage