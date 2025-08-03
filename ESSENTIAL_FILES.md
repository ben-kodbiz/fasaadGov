# 📁 Essential Files for GitHub Pages Deployment

## 🎯 **Core Files (Required)**

### **Main Application**
- `index.html` - Main treemap visualization (GitHub Pages entry point)
- `data/us_interventions.json` - Treemap data (auto-generated)
- `us_atrocity.md` - Historical data source

### **GitHub Pages Setup**
- `deploy.py` - One-command deployment to GitHub Pages
- `setup_github.py` - Repository initialization helper
- `.nojekyll` - GitHub Pages configuration
- `.gitignore` - Git ignore rules

### **Article Processing**
- `scripts/process_articles.py` - Process news articles
- `scripts/markdown_to_json.py` - Process historical data
- `news/` - Folder for new articles (drag & drop)

## 🔧 **Local Development (Optional)**

### **Upload Interface**
- `upload.html` - Web interface for uploading articles
- `scripts/upload_server.py` - Local upload server
- `scripts/upload_processor.py` - Upload processing logic
- `start.py` - Start local development servers

### **Utilities**
- `add_article.py` - Command-line article addition
- `requirements.txt` - Python dependencies

## 📚 **Documentation**
- `README.md` - Main documentation
- `WORKFLOW.md` - Simple workflow guide
- `github_deployment_plan.md` - Detailed implementation plan

---

## 🚀 **Minimal Setup (GitHub Pages Only)**

If you only want GitHub Pages deployment, you need:

```
├── index.html
├── data/us_interventions.json
├── deploy.py
├── setup_github.py
├── scripts/process_articles.py
├── scripts/markdown_to_json.py
├── news/
├── .nojekyll
├── .gitignore
└── us_atrocity.md
```

## 🖥️ **Full Setup (Local + GitHub Pages)**

For local development + GitHub Pages:

```
All files in the repository
```

---

*The system is designed to work with just the core files for GitHub Pages deployment, with optional local development tools.*