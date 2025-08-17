# Accountability Hub - Exposing Networks of Complicity

**WORK IN PROGRESS - ALPHA STAGE**

This project is currently under active development and in alpha stage. Data, visualizations, and documentation are subject to significant changes. Users should expect incomplete features, potential inaccuracies, and ongoing updates as the project evolves.

---

A comprehensive platform documenting networks of complicity that enable oppression, occupation, and human rights violations through interactive data visualizations. From boardrooms to battlefields, see who profits from oppression and who pays the price.

## Platform Overview

The Accountability Hub reveals the interconnected web of state violence, corporate complicity, and systemic oppression through five powerful data visualization tools. Each section exposes different facets of how power operates, who benefits, and what the human cost truly is.

## Sections Summary

### US Atrocities - The Empire's Footprint
An unflinching examination of American military interventions worldwide from 1945 to present. This interactive treemap documents 1,338 events across 75+ years, revealing the true scope of US imperial violence. From covert operations to full-scale invasions, see the pattern of intervention that spans every continent and costs millions of lives.

**Key Insights:**
- 1,338 documented interventions across 47 categories
- Geographic distribution showing no region untouched
- Casualty data revealing the human cost of empire
- Timeline spanning eight decades of continuous warfare

### Arab Complicity - Betrayal Visualized
A sunburst analysis exposing how Arab regimes have abandoned Palestinian liberation for profit and protection. Track over 3 trillion USD in investments and agreements that flow between Arab capitals, Tel Aviv, and Washington. See which governments chose collaboration over resistance.

**Key Insights:**
- 9 Arab countries with documented normalization ties
- Financial flows exceeding 3 trillion USD
- Military cooperation agreements enabling occupation
- Investment partnerships prioritizing profit over principle

### Corporate Complicity - Profiting from Oppression
A network analysis revealing 39 major corporations directly enabling human rights violations and supporting oppressive systems. Combined revenue exceeding 1 trillion USD, these entities profit from surveillance, weapons, infrastructure, and technology that sustains occupation and violence.

**Key Insights:**
- 39 corporations across 8 sectors enabling violations
- UN-documented evidence of direct involvement
- Revenue streams built on human suffering
- Corporate networks spanning multiple violation types

### Israel Atrocities - Documenting Genocide
A dual-visualization system documenting systematic violence and legal violations spanning three decades. From targeted assassinations to mass bombardments, this section chronicles 14 major incidents and 30 years of casualty data, including Lancet study estimates showing the true scale of destruction.

**Key Insights:**
- 14 documented incidents from 1996-2025
- 186,000+ estimated total deaths including indirect casualties
- Legal violations including genocide, war crimes, crimes against humanity
- Multiple data sources confirming systematic patterns

### Genocide Watch - Video Evidence Archive
A curated collection of documentary videos, interviews, and news analysis exposing genocide and war crimes worldwide. This multimedia archive provides visual testimony and expert analysis that mainstream media often ignores or downplays.

**Key Insights:**
- Curated video documentation from credible sources
- Expert interviews and analysis
- Real-time documentation of ongoing atrocities
- Educational content for understanding genocide patterns

## Technical Architecture

**Frontend Technologies:**
- HTML5, CSS3, JavaScript ES6+
- D3.js v7 for data visualization
- Material Design principles
- Responsive design for all devices

**Data Processing:**
- Python validation scripts
- JSON data formats
- Automated verification processes
- Source attribution and link validation

**Deployment:**
- Static site architecture
- Cross-browser compatibility
- Optimized performance
- Accessibility compliant

## Data Methodology

**Source Verification:**
- Multiple independent sources required
- Primary sources prioritized
- Government documents and official records
- Academic peer review when available

**Quality Assurance:**
- Cross-referencing with multiple databases
- Fact-checking against original documents
- Regular audits of accuracy and completeness
- Community feedback integration

## Project Structure

```
├── index.html                          # Main hub with navigation
├── data/                               # Core datasets
│   └── us_interventions.json          # US interventions (1,338 events)
│
├── arabs_complicit/                    # Arab Complicity Analysis
│   ├── index.html                      # Sunburst visualization
│   ├── arabs_complicit.json           # Relationship data
│   └── arabs_investment.json          # Investment flow data
│
├── companies_complicit/                # Corporate Complicity Analysis
│   ├── index.html                      # Network graph visualization
│   ├── treemap.html                    # Treemap view
│   └── companies_enhanced.json        # Company data with news
│
├── israel/                             # Israel Atrocities Documentation
│   ├── simple_treemap.html            # Incident treemap (1996-2025)
│   ├── timeline.html                   # Casualties timeline (2000-2025)
│   ├── atro_israel.json               # Incident documentation
│   └── casualties_data.json           # Historical casualty data
│
├── genocide_watch/                     # Video Documentation Archive
│   └── index.html                      # Video library interface
│
├── videos/                             # Video metadata
│   └── atro_vid.json                  # Video documentation data
│
├── harvester/                          # News integration system
├── scripts/                            # Data processing tools
└── tests/                              # Quality assurance
```

## Data Sources

**Primary Sources:**
- UN Human Rights Council Reports
- Gaza Health Ministry Records
- B'Tselem Documentation
- OCHA Casualty Data
- Congressional Research Service
- Academic Research Papers
- Government Documents
- Declassified Intelligence Files

**Processing Pipeline:**
- Source Verification
- Data Standardization
- Cross-Reference Validation
- JSON Format Conversion
- Automated Quality Checks

## Contributing

Contributions to data accuracy and completeness are welcome. All contributions must meet strict verification standards:

**Requirements:**
- Verifiable sources with working URLs
- Multiple source confirmation when possible
- Proper citation format and attribution
- Objective presentation without editorial commentary

## Disclaimers

**Educational Purpose:** This platform is designed for educational and research purposes only. All information must be independently verified.

**Data Accuracy:** While efforts are made to ensure accuracy, users are responsible for verifying all claims and conducting their own research.

**Ongoing Updates:** Data is continuously updated as new information becomes available. Historical data may be revised based on new evidence.

**Neutrality:** The platform aims to present factual information objectively. Users should consider multiple perspectives and sources.

## US Atrocities Data Attribution

The US Atrocities visualization is built upon comprehensive research compiled by dessalines in their essay "A List of Atrocities committed by US authorities" available at: https://github.com/dessalines/essays/blob/main/us_atrocities.md

**Original Research:** dessalines
**Source Repository:** https://github.com/dessalines/essays
**Data Adaptation:** This project

We acknowledge dessalines' substantial contribution to historical documentation. This visualization serves to make their compiled research more accessible through interactive data visualization while maintaining the integrity and attribution of the original work.

## Legal Notice

This project operates under fair use provisions for educational and research purposes. All data is compiled from publicly available sources with proper attribution.

## License

Released under the MIT License for educational and research purposes.

## Contact

For technical issues, data corrections, or academic collaboration, please submit issues through the project repository.

---

**Made by The Kangarian, From Perlis with Love**