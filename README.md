# Accountability Hub - Data Visualizations

**WORK IN PROGRESS - ALPHA STAGE**

This project is currently under active development and in alpha stage. Data, visualizations, and documentation are subject to significant changes. Users should expect incomplete features, potential inaccuracies, and ongoing updates as the project evolves.

---

A comprehensive platform documenting networks of complicity that enable oppression, occupation, and human rights violations through interactive D3.js data visualizations.

## Site Architecture

```
Accountability Hub
├── Main Hub (index.html)
│   ├── US Atrocities Treemap
│   ├── Arab Complicity Analysis  
│   ├── Corporate Network
│   └── Israel Timeline
│
├── US Atrocities Section
│   ├── Interactive Treemap (index.html)
│   ├── Data: us_interventions.json (1,338 events)
│   ├── Search & Filter System
│   └── Regional/Category Views
│
├── Arab Complicity Section (arabs_complicit/)
│   ├── Sunburst Visualization (index.html)
│   ├── Investment Data (arabs_investment.json)
│   ├── Relationship Data (arabs_complicit.json)
│   └── Financial Flow Analysis
│
├── Corporate Network Section (companies_complicit/)
│   ├── Network Graph (index.html)
│   ├── Treemap View (treemap.html)
│   ├── Company Data (companies_enhanced.json)
│   └── News Integration System
│
├── Israel Documentation Section (israel/)
│   ├── Incident Treemap (simple_treemap.html)
│   │   ├── 14 documented incidents (1996-2025)
│   │   ├── Equal-sized visualization
│   │   └── Source: atro_israel.json
│   │
│   └── Casualties Timeline (timeline.html)
│       ├── 30-year historical data (2000-2025)
│       ├── Interactive bar chart
│       ├── Linear/Log scale toggle
│       ├── Lancet study integration
│       └── Source: casualties_data.json
│
├── Data Processing Pipeline
│   ├── Python validation scripts
│   ├── JSON data formats
│   ├── Source verification system
│   └── Automated updates
│
└── Technical Infrastructure
    ├── D3.js v7 visualizations
    ├── Responsive CSS design
    ├── Cross-browser compatibility
    └── Static site deployment
```

## Navigation Flow

```
Main Hub
    ├── US Atrocities → Treemap Visualization
    ├── Arab Complicity → Sunburst Analysis
    ├── Corporate Network → Network Graph ↔ Treemap View
    └── Israel Timeline → Incident Treemap ↔ Casualties Timeline
```

## Data Sources Integration

```
Primary Sources
├── UN Human Rights Council Reports
├── Gaza Health Ministry Records
├── B'Tselem Documentation
├── OCHA Casualty Data
├── Congressional Research Service
├── Academic Research Papers
└── Government Documents

Processing Pipeline
├── Source Verification
├── Data Standardization  
├── Cross-Reference Validation
├── JSON Format Conversion
└── Automated Quality Checks

Visualization Output
├── Interactive Charts
├── Searchable Databases
├── Filtered Views
└── Detailed Information Panels
```

## Overview

The Accountability Hub consists of three data visualizations that reveal different aspects of systemic complicity and accountability gaps in international relations, corporate behavior, and geopolitical dynamics.

## Visualizations

### 1. US Atrocities Treemap

An interactive treemap visualization documenting US interventions and military actions worldwide from 1945 to present. Based on comprehensive research compiled by dessalines.

**Data Coverage:**
- 1,338 documented events across 75+ years
- 47 categories of interventions and military actions
- Detailed casualty data and impact assessments
- Geographic distribution across all continents

**Visualization Features:**
- Hierarchical treemap structure showing scale and frequency
- Interactive filtering by region, time period, and intervention type
- Detailed event information with casualty figures
- Search functionality for specific events or locations

**Data Sources:**
- Original research compilation by dessalines
- Congressional Research Service reports
- Department of Defense historical records
- Academic research from universities and think tanks
- Declassified government documents
- International news organizations

### 2. Arab Complicity Analysis

A sunburst visualization analyzing Arab countries' diplomatic, economic, and military relationships with Israel and the United States.

**Data Coverage:**
- 9 Arab countries with documented ties
- Over 3 trillion USD in documented investments and agreements
- 6 countries with direct normalization agreements
- Economic partnerships and military cooperation data

**Visualization Features:**
- Multi-level sunburst showing relationship hierarchies
- Investment flow analysis with financial breakdowns
- Timeline of diplomatic developments
- Comparative analysis of different relationship types

**Data Sources:**
- Official government announcements and treaties
- Financial disclosure reports
- Trade and investment databases
- Diplomatic cables and official statements
- Regional news sources and analysis

### 3. Corporate Complicity Network

A dual-view system revealing corporate entities involved in enabling human rights violations and supporting oppressive systems.

**Data Coverage:**
- 39 major corporations across 8 sectors
- Combined revenue exceeding 1 trillion USD
- Detailed involvement analysis based on UN investigations
- Integrated news articles from AFSC investigations

**Visualization Features:**
- Interactive network graph showing corporate connections
- Equal-sized treemap for better company visibility
- Detailed company profiles with involvement summaries
- Sector-based filtering and analysis
- News articles integration with confidence scoring

**Data Sources:**
- UN Human Rights Council Report A/HRC/59/23
- American Friends Service Committee investigations
- Corporate financial filings and annual reports
- Human rights organization investigations
- Government procurement records

### 4. Israel Documentation System

A comprehensive documentation system with dual visualization approaches for historical incident analysis.

**Data Coverage:**
- 14 documented incidents spanning 1996-2025
- 30-year casualty timeline with multiple source integration
- Lancet study integration showing under-reporting estimates
- Legal violations documentation (genocide, war crimes, crimes against humanity)

**Visualization Features:**

**Incident Treemap:**
- Equal-sized rectangles for all documented incidents
- Color intensity based on casualty scale
- Detailed incident information with source attribution
- Legal violations breakdown and evidence documentation

**Casualties Timeline:**
- Interactive bar chart spanning 2000-2025
- Linear and logarithmic scale options
- Multiple data source integration (Gaza Health Ministry, UN OCHA, B'Tselem)
- Lancet study estimates including indirect deaths (186,000+ total estimate)

**Data Sources:**
- Gaza Health Ministry records
- UN Office for the Coordination of Humanitarian Affairs (OCHA)
- B'Tselem documentation
- The Lancet peer-reviewed studies
- Human Rights Watch investigations
- Amnesty International reports
- Middle East Eye documentation
- Global Centre for the Responsibility to Protect

## Technical Implementation

**Frontend Technologies:**
- HTML5, CSS3, JavaScript ES6+
- D3.js v7 for data visualization
- Responsive design with CSS Grid and Flexbox
- Material Design principles for UI components

**Data Processing:**
- Python scripts for data cleaning and validation
- JSON data formats for efficient loading
- Automated data verification processes
- Source attribution and link validation

**Deployment:**
- Static site architecture
- Compatible with GitHub Pages and similar platforms
- Optimized for performance and accessibility
- Cross-browser compatibility

## Data Methodology

All visualizations follow strict data collection and verification protocols:

**Source Verification:**
- Multiple independent sources required for each data point
- Primary sources prioritized over secondary reporting
- Government documents and official records preferred
- Academic peer review when available

**Data Processing:**
- Standardized data formats across all visualizations
- Automated consistency checks and validation
- Regular updates as new information becomes available
- Version control for data changes and corrections

**Quality Assurance:**
- Cross-referencing with multiple databases
- Fact-checking against original documents
- Regular audits of data accuracy and completeness
- Community feedback integration for corrections

## Project Structure

```
├── index.html                          # Main hub with navigation
├── upload.html                         # Article upload interface
├── robots.txt                          # Search engine directives
├── sitemap.xml                         # Site structure map
│
├── arabs_complicit/                    # Arab Complicity Analysis
│   ├── index.html                      # Sunburst visualization
│   ├── demo.html                       # Demo version
│   ├── arabs_complicit.json           # Relationship data
│   └── arabs_investment.json          # Investment flow data
│
├── companies_complicit/                # Corporate Network Analysis
│   ├── index.html                      # Network graph visualization
│   ├── treemap.html                    # Treemap view
│   ├── companies_enhanced.json        # Company data with news
│   └── sankey.html                     # Flow diagram (legacy)
│
├── israel/                             # Israel Documentation
│   ├── simple_treemap.html            # Incident treemap (1996-2025)
│   ├── timeline.html                   # Casualties timeline (2000-2025)
│   ├── atro_israel.json               # Incident documentation
│   ├── casualties_data.json           # Historical casualty data
│   └── test.html                       # Data validation tool
│
├── data/                               # Core datasets
│   ├── us_interventions.json          # US interventions (1,338 events)
│   └── us_interventions_backup.json   # Data backup
│
├── harvester/                          # News integration system
│   ├── scraper.py                      # News article scraper
│   ├── integrate_news.py               # Data integration tool
│   ├── output/                         # Scraped data storage
│   └── utils/                          # Processing utilities
│
├── scripts/                            # Data processing tools
│   └── markdown_to_json.py             # Format conversion
│
├── .kiro/                              # Development environment
│   ├── specs/                          # Project specifications
│   └── steering/                       # Development guidelines
│
└── tests/                              # Quality assurance
    └── validation scripts
```

## Contributing

Contributions to data accuracy and completeness are welcome. All contributions must meet the following requirements:

**Data Standards:**
- Verifiable sources with working URLs
- Multiple source confirmation when possible
- Proper citation format and attribution
- Objective presentation without editorial commentary

**Documentation Requirements:**
- Clear methodology for data collection
- Source reliability assessment
- Data processing steps documented
- Version control for all changes

## Disclaimers

**Data Accuracy:** All information presented must be independently verified. This platform compiles data from various sources and users should cross-reference with original documents before drawing conclusions.

**Educational Purpose:** This platform is designed for educational and research purposes only. It is not intended to provide legal, political, or investment advice.

**Source Responsibility:** While efforts are made to ensure accuracy, users are responsible for verifying all claims and conducting their own research before making decisions based on this information.

**Ongoing Updates:** Data is continuously updated as new information becomes available. Historical data may be revised based on new evidence or corrections to original sources.

**Neutrality:** The platform aims to present factual information objectively. Users should consider multiple perspectives and sources when interpreting the data.

**Casualty Estimates:** All casualty figures are estimates from various historical sources and academic studies. Actual numbers may vary significantly due to limited documentation, different methodologies, and ongoing scholarly debate.

**Corporate Information:** Corporate complicity data is based on publicly available information, UN investigations, and credible reporting. Companies mentioned should be considered within the context of the evidence presented and users should conduct independent research.

**Geopolitical Analysis:** Analysis of Arab-Israeli relations and regional dynamics reflects documented agreements and investments. Political interpretations may vary and users should consult multiple sources for comprehensive understanding.

## Legal Notice

This project operates under fair use provisions for educational and research purposes. All data is compiled from publicly available sources. Original source attribution is provided throughout the platform.

The platform does not endorse any particular political viewpoint but aims to present documented information for educational analysis. Users are encouraged to form their own conclusions based on comprehensive research.

For questions about data sources, methodology, or corrections, please refer to the original source documents linked within each visualization.

## License

Released under the MIT License for educational and research purposes.

## Technical Credits

- D3.js visualization library
- Material Design principles
- Open source web technologies
- Community contributions and feedback

## US Atrocities Data Attribution

The US Atrocities Treemap visualization is built upon comprehensive research compiled by dessalines in their essay "A List of Atrocities committed by US authorities" available at: https://github.com/dessalines/essays/blob/main/us_atrocities.md

**Credit and Attribution:**
- Original research compilation: dessalines
- Source repository: https://github.com/dessalines/essays
- Essay title: "A List of Atrocities committed by US authorities"
- Data adaptation and visualization: This project

**Scope of Original Work:**
The original essay by dessalines provides extensive documentation of US military interventions, domestic atrocities, and foreign policy actions with detailed source citations and casualty estimates. The research covers:

- Historical military interventions and wars
- Domestic violence against marginalized communities
- Support for authoritarian regimes and dictatorships
- Economic warfare and sanctions
- Covert operations and intelligence activities
- Environmental and nuclear testing impacts

**Data Processing:**
The treemap visualization adapts this research by:
- Converting narrative documentation into structured JSON data
- Organizing events by geographic regions and categories
- Implementing interactive filtering and search capabilities
- Adding visual representation of scale and impact
- Maintaining source attribution for each documented event

**Academic Value:**
dessalines' original work represents significant scholarly effort in compiling and documenting historical events often underrepresented in mainstream historical narratives. The research includes extensive citations to academic sources, government documents, and credible news organizations.

**Acknowledgment:**
We acknowledge dessalines' substantial contribution to historical documentation and research. This visualization project serves to make their compiled research more accessible through interactive data visualization while maintaining the integrity and attribution of the original work.

Users interested in the full scope of the research, detailed citations, and comprehensive analysis should refer to the original essay at the GitHub repository linked above.

## Contact

For technical issues, data corrections, or academic collaboration, please submit issues through the project repository or contact the maintainers directly.