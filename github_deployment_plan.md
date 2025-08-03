# GitHub Pages Deployment Plan
## US Atrocities Treemap - Live News Display

### 🎯 **Goal**
Create a live D3.js treemap hosted on GitHub Pages that automatically updates when you add new articles locally and push to GitHub.

### 📋 **Workflow Overview**
1. **Local Development**: Add articles using upload interface
2. **Git Push**: Push changes to GitHub repository
3. **GitHub Pages**: Automatically serves updated treemap
4. **Live Display**: Users see updated visualization instantly

---

## 🚀 **Step-by-Step Implementation**

### **Phase 1: Repository Setup**

#### 1.1 Create GitHub Repository
```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit: US Atrocities Treemap"

# Create GitHub repository (via GitHub web interface)
# Then connect local to remote
git remote add origin https://github.com/YOUR_USERNAME/us-atrocities-treemap.git
git branch -M main
git push -u origin main
```

#### 1.2 Enable GitHub Pages
- Go to repository Settings
- Scroll to "Pages" section
- Source: Deploy from a branch
- Branch: main / (root)
- Save

### **Phase 2: File Structure Optimization**

#### 2.1 GitHub Pages Compatible Structure
```
us-atrocities-treemap/
├── index.html              # Main treemap (GitHub Pages entry point)
├── data/
│   └── us_interventions.json   # Data file (auto-updated)
├── scripts/
│   ├── process_articles.py     # Local processing script
│   ├── markdown_to_json.py     # Historical data processor
│   └── update_data.py          # New: GitHub deployment script
├── news/                   # Local article storage
├── docs/                   # Optional: Documentation
├── .github/
│   └── workflows/
│       └── update-data.yml     # Optional: GitHub Actions
├── .gitignore
├── README.md
└── .nojekyll              # Bypass Jekyll processing
```

#### 2.2 Create .nojekyll file
```bash
touch .nojekyll
```

#### 2.3 Update .gitignore
```
# Python
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
env/
venv/

# Local development
uploads/
*.log

# Keep data and news folders
!data/
!news/
```

### **Phase 3: Local Workflow Scripts**

#### 3.1 Enhanced Article Processing
Create `scripts/update_data.py`:
- Process articles from news/ folder
- Update us_interventions.json
- Generate deployment-ready files
- Create commit message with new articles

#### 3.2 Deployment Script
Create `deploy.py`:
- Run article processing
- Commit changes to git
- Push to GitHub
- Display deployment URL

### **Phase 4: GitHub Pages Optimization**

#### 4.1 Static File Optimization
- Minify CSS/JS (optional)
- Optimize JSON file size
- Add loading indicators
- Error handling for missing files

#### 4.2 CDN and Performance
- Use D3.js CDN (already implemented)
- Compress JSON data
- Add browser caching headers

### **Phase 5: Automation Options**

#### 5.1 Manual Workflow (Recommended)
```bash
# Add new articles to news/ folder
# Run processing and deployment
python deploy.py
```

#### 5.2 GitHub Actions (Advanced)
- Auto-process articles on push
- Generate updated JSON
- Deploy automatically

---

## 🛠 **Implementation Scripts**

### **Script 1: Enhanced Data Processor**
```python
# scripts/update_data.py
# Processes articles and prepares for GitHub deployment
```

### **Script 2: Deployment Script**
```python
# deploy.py
# One-command deployment to GitHub Pages
```

### **Script 3: GitHub Pages Index**
```html
# index.html (optimized for GitHub Pages)
# Static D3.js treemap with error handling
```

---

## 📱 **User Experience**

### **For You (Content Creator)**
1. Add articles to `news/` folder (drag & drop or upload interface)
2. Run `python deploy.py`
3. Articles appear live on GitHub Pages within minutes

### **For Visitors**
1. Visit `https://YOUR_USERNAME.github.io/us-atrocities-treemap/`
2. See live, interactive treemap
3. Filter and explore data
4. Always see latest articles

---

## 🔧 **Technical Benefits**

### **GitHub Pages Advantages**
- ✅ Free hosting
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Custom domain support
- ✅ Version control integration
- ✅ No server maintenance

### **D3.js Static Benefits**
- ✅ Fast loading
- ✅ No backend required
- ✅ Works offline (after first load)
- ✅ Mobile responsive
- ✅ SEO friendly

---

## 📊 **Data Flow**

```
Local PC → Upload Articles → Process → Git Push → GitHub Pages → Live Display
    ↓           ↓              ↓         ↓           ↓            ↓
[news/]    [upload.html]  [scripts/]  [git]   [GitHub]    [D3.js treemap]
```

---

## 🚀 **Quick Start Commands**

```bash
# 1. Setup repository
git init && git add . && git commit -m "Initial commit"

# 2. Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/us-atrocities-treemap.git
git push -u origin main

# 3. Enable GitHub Pages in repository settings

# 4. Add articles and deploy
python deploy.py

# 5. Visit your live site
# https://YOUR_USERNAME.github.io/us-atrocities-treemap/
```

---

## 🎯 **Success Metrics**

- ✅ Live treemap accessible via GitHub Pages URL
- ✅ New articles appear within 5 minutes of deployment
- ✅ Mobile responsive design
- ✅ Fast loading (< 3 seconds)
- ✅ Error handling for data issues
- ✅ SEO optimized for discovery

---

## 🔄 **Maintenance Workflow**

### Daily/Weekly
1. Add new articles to `news/` folder
2. Run `python deploy.py`
3. Verify live site updates

### Monthly
1. Review and clean old articles
2. Update documentation
3. Check site performance
4. Backup data files

---

This plan creates a professional, automated workflow where you can easily add articles locally and have them appear live on GitHub Pages as an interactive D3.js treemap news display!