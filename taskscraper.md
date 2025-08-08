# 📋 **AFSC Company Data Scraper - Implementation Plan**

## **Project Overview**
Create a scraper to extract company data from https://afsc.org/gaza-genocide-companies and organize it into structured JSON files categorized by company names.

---

## **Phase 1: Analysis & Setup**

### **1.1 Website Analysis**
- **Target URL**: `https://afsc.org/gaza-genocide-companies`
- **Content Structure**: Company profiles with detailed information
- **Data Points to Extract**:
  - Company name
  - Company description/summary
  - Involvement details
  - Revenue information
  - Headquarters location
  - Specific incidents/evidence
  - Source links and references

### **1.2 Technical Setup**
```
harvester/
├── scraper.py              # Main scraper script
├── requirements.txt        # Dependencies
├── config.py              # Configuration settings
├── utils/
│   ├── __init__.py
│   ├── parser.py          # HTML parsing utilities
│   ├── cleaner.py         # Data cleaning functions
│   └── validator.py       # Data validation
├── output/
│   ├── companies/         # Individual company JSON files
│   ├── combined.json      # All companies combined
│   └── metadata.json      # Scraping metadata
└── logs/
    └── scraper.log        # Logging output
```

---

## **Phase 2: Core Implementation**

### **2.1 Dependencies & Libraries**
```python
# requirements.txt
requests>=2.31.0
beautifulsoup4>=4.12.0
lxml>=4.9.0
selenium>=4.15.0  # If dynamic content
json5>=0.9.0
python-dateutil>=2.8.0
fake-useragent>=1.4.0
```

### **2.2 Main Scraper Architecture**
```python
class AFSCCompanyScraper:
    def __init__(self):
        self.base_url = "https://afsc.org/gaza-genocide-companies"
        self.session = requests.Session()
        self.companies_data = {}
        
    def scrape_companies(self):
        # 1. Fetch main page
        # 2. Parse company sections
        # 3. Extract company data
        # 4. Clean and validate data
        # 5. Save to JSON files
```

---

## **Phase 3: Data Extraction Strategy**

### **3.1 HTML Structure Analysis**
- Identify company section containers
- Map CSS selectors for each data field
- Handle different content formats
- Extract embedded links and references

### **3.2 Data Fields Mapping**
```python
COMPANY_FIELDS = {
    'name': 'h3, h2, .company-name',
    'description': '.company-description, p',
    'involvement': '.involvement-section',
    'revenue': '.revenue-info',
    'headquarters': '.headquarters-info',
    'incidents': '.incident-list',
    'sources': 'a[href]',
    'last_updated': '.date-info'
}
```

---

## **Phase 4: Data Processing Pipeline**

### **4.1 Data Cleaning Functions**
```python
def clean_company_data(raw_data):
    # Remove HTML tags
    # Normalize whitespace
    # Extract structured information
    # Validate required fields
    # Format dates and numbers
```

### **4.2 JSON Structure Design**
```json
{
  "company_name": "Elbit Systems",
  "metadata": {
    "scraped_at": "2025-08-07T10:00:00Z",
    "source_url": "https://afsc.org/gaza-genocide-companies",
    "scraper_version": "1.0.0"
  },
  "basic_info": {
    "name": "Elbit Systems",
    "headquarters": "Haifa, Israel",
    "revenue": "$5.8 billion (2023)",
    "industry": "Defense/Military"
  },
  "involvement": {
    "summary": "Primary supplier of weapons and surveillance systems...",
    "specific_activities": [
      "Skylark and Hermes military UAV drones",
      "MPR 500 multi-purpose bombs",
      "Surveillance systems"
    ]
  },
  "incidents": [
    {
      "date": "2024-04-01",
      "description": "Hermes 450 drone attack on World Central Kitchen",
      "casualties": "7 aid workers killed",
      "location": "Deir al-Balah, Gaza"
    }
  ],
  "sources": [
    {
      "type": "primary",
      "url": "https://afsc.org/gaza-genocide-companies",
      "title": "Gaza Genocide Companies Report"
    }
  ]
}
```

---

## **Phase 5: Implementation Steps**

### **5.1 Step-by-Step Development**
1. **Setup Environment**
   ```bash
   mkdir harvester
   cd harvester
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```

2. **Create Base Scraper**
   - HTTP session with proper headers
   - Rate limiting and retry logic
   - Error handling and logging

3. **HTML Parser Development**
   - BeautifulSoup parser setup
   - CSS selector identification
   - Content extraction functions

4. **Data Processing Pipeline**
   - Text cleaning utilities
   - Data validation functions
   - JSON serialization

5. **Output Management**
   - Individual company files
   - Combined dataset
   - Metadata tracking

### **5.2 Quality Assurance**
- **Data Validation**: Required fields, format checking
- **Duplicate Detection**: Prevent duplicate company entries
- **Error Handling**: Network issues, parsing errors
- **Logging**: Comprehensive activity logging

---

## **Phase 6: Advanced Features**

### **6.1 Incremental Updates**
- Track last scrape timestamp
- Only update changed content
- Maintain version history

### **6.2 Integration Ready**
- Compatible with existing companies_enhanced.json format
- Easy integration with visualization system
- API-ready JSON structure

---

## **Phase 7: Execution Plan**

### **7.1 Development Order**
1. ✅ Create basic scraper structure
2. ✅ Implement HTML parsing
3. ✅ Add data cleaning functions
4. ✅ Create JSON output system
5. ✅ Add error handling and logging
6. ✅ Test with sample data
7. ✅ Full scrape and validation

### **7.2 Testing Strategy**
- Unit tests for parsing functions
- Integration tests for full pipeline
- Data quality validation
- Output format verification

---

## **Expected Output Structure**
```
harvester/output/
├── companies/
│   ├── elbit_systems.json
│   ├── lockheed_martin.json
│   ├── boeing.json
│   ├── caterpillar.json
│   ├── general_dynamics.json
│   └── ...
├── combined.json          # All companies in one file
└── metadata.json         # Scraping statistics and info
```

---

## **Integration with Existing System**
- Output format compatible with `companies_complicit/companies_enhanced.json`
- Easy merge with existing company data
- Maintains news_articles structure for future updates
- Ready for visualization system integration

---

## **Next Steps**
1. **Confirm implementation approach**
2. **Start with Phase 1: Setup Environment**
3. **Implement core scraper functionality**
4. **Test with sample data**
5. **Full deployment and validation**

---

**Status**: ⏳ Awaiting confirmation to begin implementation