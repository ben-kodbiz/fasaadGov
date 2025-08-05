# Arab Complicity Visualization

An interactive D3.js sunburst chart analyzing Arab countries' relationships and investments with Israel and the United States.

## 🎯 Overview

This visualization explores the complex web of relationships between Arab nations, Israel, and the United States, focusing on:
- Diplomatic ties and agreements
- Investment flows and economic partnerships  
- Public sentiment vs. government policies
- Historical context and timeline of relationships

## 🚀 Features

### Interactive Sunburst Chart
- **Multi-level hierarchy**: Countries grouped by relationship types or investment levels
- **Dynamic filtering**: Focus on specific country groups or agreement types
- **Rich tooltips**: Hover for quick country information
- **Detailed panels**: Click for comprehensive country analysis

### View Modes
1. **Relationships**: Groups countries by direct/indirect ties with Israel
2. **Investments**: Categorizes by investment levels in the US
3. **Timeline**: Organizes by agreement dates and normalization periods

### Data Insights
- **Abraham Accords countries**: UAE, Bahrain, Morocco, Sudan
- **Traditional allies**: Egypt, Jordan (pre-2020 normalization)
- **Indirect cooperation**: Saudi Arabia, Qatar, Oman
- **Investment patterns**: Gulf states dominate US investments ($3+ trillion)

## 📊 Data Sources

### Relationship Data (`arabs_complicit.json`)
- Diplomatic agreements and treaties
- Security cooperation details
- Public sentiment surveys (Arab Barometer 2021-2022)
- Government cooperation mechanisms

### Investment Data (`arabs_investment.json`)
- US investments (1995-2025): $3+ trillion total
- Israel investments (post-2020): <$3 billion total
- Sovereign wealth fund activities
- Sector-specific investment breakdowns

## 🎨 Design Features

### Color Coding
- **Red tones**: Israel relationships (direct/indirect)
- **Blue tones**: US relationships (direct/indirect)
- **Green tones**: Investment levels (high/medium/low)

### Responsive Layout
- Desktop: Side-by-side sunburst and info panel
- Mobile: Stacked layout with collapsible sections
- Accessible: WCAG-compliant colors and interactions

## 🔍 Key Findings

### Investment Patterns
- **Saudi Arabia**: $800B+ in US investments (largest Arab investor)
- **UAE**: $1.5T+ pledged investments (including 2025 commitments)
- **Qatar**: $1.3T+ including recent aviation deals
- **Gulf dominance**: 90%+ of Arab investments in US from Gulf states

### Relationship Dynamics
- **Direct normalization**: 6 countries (Egypt, Jordan, UAE, Bahrain, Morocco, Sudan)
- **Indirect cooperation**: 3 countries (Saudi Arabia, Qatar, Oman)
- **Public opposition**: <20% support normalization in most Arab countries
- **Government pragmatism**: Strategic ties despite public sentiment

### Timeline Insights
- **1979**: Egypt first to normalize (Camp David Accords)
- **1994**: Jordan follows with peace treaty
- **2020**: Abraham Accords accelerate normalization
- **2025**: Major investment pledges during Trump administration

## 🛠️ Technical Implementation

### Technologies
- **D3.js v7**: Interactive visualization framework
- **Vanilla JavaScript**: No additional frameworks
- **CSS Grid/Flexbox**: Responsive layout system
- **CSS Custom Properties**: Dynamic theming

### Architecture
```
arabs_complicit/
├── index.html              # Main visualization
├── arabs_complicit.json    # Relationship data
├── arabs_investment.json   # Investment data
├── task.md                 # Technical requirements
└── README.md              # This documentation
```

## 📱 Usage

1. **Open** `index.html` in a modern web browser
2. **Explore** different view modes using the controls
3. **Filter** countries by relationship type or agreements
4. **Hover** over segments for quick information
5. **Click** segments for detailed country analysis
6. **Reset** view to return to default state

## 🔧 Development

### Local Development
```bash
# Start local server
python -m http.server 8080 --directory arabs_complicit

# Open browser
open http://localhost:8080
```

### Data Updates
- Edit JSON files directly for data updates
- Visualization automatically adapts to data changes
- Validate JSON syntax before deployment

## 📈 Future Enhancements

### Potential Features
- **Timeline animation**: Animated progression of relationships
- **Trade flow visualization**: Import/export data integration
- **Sentiment tracking**: Real-time public opinion updates
- **Comparative analysis**: Side-by-side country comparisons

### Data Expansion
- **Additional countries**: Include more Arab League members
- **Sectoral breakdown**: Detailed investment by industry
- **Historical depth**: Pre-1995 relationship data
- **Multilateral agreements**: Regional cooperation frameworks

## 📚 Context & Significance

This visualization reveals the complex reality of Arab-Israeli-US relationships, where:

- **Economic pragmatism** often overrides public sentiment
- **Gulf wealth** creates significant US dependencies
- **Security cooperation** exists even without formal ties
- **Public opinion** remains largely opposed to normalization

The data shows how geopolitical relationships operate on multiple levels, with governments pursuing strategic interests while managing domestic opposition.

## ⚠️ Data Limitations

- Investment figures are estimates from various sources
- Some sovereign wealth funds don't disclose full portfolios
- Public sentiment data limited to available surveys
- Recent pledges (2025) may not be fully deliverable

## 📄 License

This visualization is created for educational and research purposes. Data sources are cited within the visualization and JSON files.