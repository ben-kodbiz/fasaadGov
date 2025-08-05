# Accountability Hub - Data Visualizations

**WORK IN PROGRESS - ALPHA STAGE**

This project is currently under active development and in alpha stage. Data, visualizations, and documentation are subject to significant changes. Users should expect incomplete features, potential inaccuracies, and ongoing updates as the project evolves.

---

A comprehensive platform documenting networks of complicity that enable oppression, occupation, and human rights violations through interactive D3.js data visualizations.

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
- Original research compilation by dessalines (https://github.com/dessalines/essays/blob/main/us_atrocities.md)
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

A force-directed network graph revealing corporate entities involved in enabling human rights violations and supporting oppressive systems.

**Data Coverage:**
- 25+ major corporations across 8 sectors
- Combined revenue exceeding 1 trillion USD
- Detailed involvement analysis based on UN investigations
- Corporate subsidiary and partnership networks

**Visualization Features:**
- Interactive network graph showing corporate connections
- Detailed company profiles with involvement summaries
- Sector-based filtering and analysis
- Revenue and impact data visualization

**Data Sources:**
- UN Human Rights Council Report A/HRC/59/23
- Corporate financial filings and annual reports
- Human rights organization investigations
- Government procurement records
- Academic research on corporate accountability

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
├── index.html                    # Main landing page
├── treemap.html                  # US Atrocities visualization
├── arabs_complicit/
│   ├── index.html               # Arab complicity analysis
│   ├── arabs_complicit.json     # Relationship data
│   └── arabs_investment.json    # Investment data
├── companies_complicit/
│   ├── index.html               # Corporate network graph
│   └── companies_enhanced.json  # Enhanced company data
├── data/
│   └── us_interventions.json    # US interventions dataset
└── scripts/                     # Data processing utilities
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