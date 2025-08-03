# 🗺️ US Atrocities Treemap - Live News Display

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://YOUR_USERNAME.github.io/us-atrocities-treemap/)
[![License](https://img.shields.io/badge/License-Educational-blue)](#license)
[![D3.js](https://img.shields.io/badge/D3.js-v7-orange)](https://d3js.org/)

An interactive D3.js treemap visualization displaying documented US atrocities and interventions, hosted live on GitHub Pages. Acts as a dynamic news display that updates when new articles are added.

## 🌐 **Live Demo**
**Visit: [https://YOUR_USERNAME.github.io/us-atrocities-treemap/](https://YOUR_USERNAME.github.io/us-atrocities-treemap/)**

*Replace YOUR_USERNAME with the actual GitHub username*

---

## 🚀 **Quick Start - GitHub Pages Deployment**

### **1. Setup Repository**
```bash
# Clone or fork this repository
git clone https://github.com/YOUR_USERNAME/us-atrocities-treemap.git
cd us-atrocities-treemap

# Setup GitHub repository and Pages
python setup_github.py
```

### **2. Add Articles**
```bash
# Option A: Drag & drop files into news/ folder
# Supported formats: PDF, HTML, DOC, DOCX, TXT

# Option B: Use local upload interface
python start.py  # Then go to http://localhost:8000/upload.html
```

### **3. Deploy to Live Site**
```bash
# One command deployment
python deploy.py
```

### **4. Visit Your Live Site**
- `https://YOUR_USERNAME.github.io/us-atrocities-treemap/`
- Updates appear in 1-5 minutes

---

## 📁 **Project Structure**

```
us-atrocities-treemap/
├── index.html                 # 🌐 Main treemap visualization
├── upload.html                # 📤 Local upload interface
├── data/
│   └── us_interventions.json  # 📊 Treemap data (auto-updated)
├── news/                      # 📄 Drop new articles here
├── scripts/
│   ├── process_articles.py    # 📰 Process news articles
│   ├── markdown_to_json.py    # 📚 Process historical data
│   ├── upload_server.py       # 🔧 Local upload server
│   └── upload_processor.py    # 🔄 Upload processing logic
├── deploy.py                  # 🚀 GitHub Pages deployment
├── setup_github.py            # ⚙️ Repository setup helper
├── start.py                   # 🖥️ Local development server
├── add_article.py             # ✍️ Command-line article addition
├── us_atrocity.md            # 📖 Historical data source
├── requirements.txt           # 📦 Python dependencies
├── .nojekyll                  # 📋 GitHub Pages config
└── .gitignore                 # 🚫 Git ignore rules
```

---

## 🔄 **Content Creator Workflow**

### **Daily Article Updates**
1. **Add Articles**: Drop files in `news/` folder
2. **Deploy**: Run `python deploy.py`
3. **Live**: Articles appear on GitHub Pages in minutes

### **Supported Article Formats**
- **📄 PDF**: `.pdf` files
- **🌐 HTML**: `.html`, `.htm` web pages  
- **📝 Text**: `.txt` plain text files
- **📘 Word**: `.doc`, `.docx` documents

### **Automatic Processing**
- **Title Extraction**: From filename or content
- **Date Detection**: From filename or article content
- **Category Assignment**: Auto-categorized by keywords
- **Duplicate Prevention**: Won't process same file twice

---

## 🛠️ **Local Development**

### **Prerequisites**
- **Python 3.7+**
- **Git**
- **GitHub account**

### **Install Dependencies**
```bash
pip install -r requirements.txt
```

### **Local Upload Interface**
```bash
# Start local servers
python start.py

# Access upload interface
# http://localhost:8000/upload.html
```

### **Manual Article Processing**
```bash
# Process articles in news/ folder
python scripts/process_articles.py

# Add single article via command line
python add_article.py "Article Title" "Content..." --date 2024-08-03
```

---

## 🌟 **Features**

### **Interactive Visualization**
- **Treemap Display**: Hierarchical visualization of events
- **Color Coding**: Distinct colors for each category
- **Hover Tooltips**: Detailed information on hover
- **Filtering**: Filter by type and category
- **Responsive Design**: Works on all devices

### **Data Management**
- **440+ Historical Events**: Pre-loaded from comprehensive research
- **Live News Integration**: Add new articles seamlessly
- **Smart Categorization**: Auto-assigns categories based on content
- **Timestamp Tracking**: Maintains creation and processing dates

### **GitHub Pages Benefits**
- **Free Hosting**: No server costs
- **Global CDN**: Fast worldwide access
- **HTTPS Security**: Secure by default
- **Custom Domain**: Optional custom domain support
- **Version Control**: Full history of changes
- **Zero Maintenance**: GitHub handles infrastructure

---

## 📊 **Data Categories**

### **International**
- Middle East, Latin America, Africa, Asia, Europe

### **Domestic**
- Native Americans, Black people, Latinos, Asians, Women
- Workers and the Poor, Children, Prisoners, Religious minorities

### **Recent**
- Israel Atrocities, News Articles

---

## 🔧 **Troubleshooting**

### **Site Not Updating?**
1. Check GitHub Pages is enabled in repository settings
2. Wait 5 minutes (GitHub Pages deployment time)
3. Hard refresh browser (Ctrl+F5)

### **Articles Not Processing?**
1. Check file formats are supported
2. Ensure files are in `news/` folder
3. Run `python deploy.py` again

### **Local Upload Not Working?**
1. Install dependencies: `pip install -r requirements.txt`
2. Start servers: `python start.py`
3. Check both ports 5000 and 8000 are available

---

## 📄 **License & Disclaimer**

This project documents historical events for educational and awareness purposes. All data is sourced from publicly available information and user contributions.

**Usage Guidelines:**
- Educational and research purposes
- Factual documentation only
- Respect for victims and families
- Accurate source attribution

---

## 🤝 **Contributing**

1. **Add Articles**: Use the upload interface or drop files in `news/`
2. **Report Issues**: Create GitHub issues for bugs or suggestions
3. **Improve Documentation**: Submit pull requests for documentation improvements
4. **Share Data Sources**: Contribute additional reliable sources

---

*Transform your local article collection into a live, interactive news visualization with GitHub Pages!*