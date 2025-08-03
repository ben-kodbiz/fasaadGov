# 🔄 GitHub Pages Workflow

## **Simple 3-Step Process**

### **Step 1: Add Articles** 📄
```bash
# Option A: Drag & drop files into news/ folder
# Option B: Use upload interface
python start.py  # Then go to http://localhost:8000/upload.html
```

### **Step 2: Deploy** 🚀
```bash
python deploy.py
```

### **Step 3: Live!** 🌐
Visit: `https://YOUR_USERNAME.github.io/us-atrocities-treemap/`

---

## **What Happens When You Deploy**

1. **📄 Process Articles**: Converts articles to JSON format
2. **📊 Update Data**: Merges with existing treemap data  
3. **📤 Git Push**: Commits and pushes to GitHub
4. **🌐 GitHub Pages**: Automatically serves updated site
5. **✨ Live Update**: Visitors see new articles in treemap

---

## **File Structure**

```
us-atrocities-treemap/
├── index.html                 # 🌐 Main treemap (GitHub Pages entry)
├── data/
│   └── us_interventions.json  # 📊 Treemap data (auto-updated)
├── news/                      # 📄 Drop articles here
├── scripts/                   # 🔧 Processing scripts
├── deploy.py                  # 🚀 One-command deployment
└── .nojekyll                  # 📋 GitHub Pages config
```

---

## **Supported Article Formats**

- **📄 PDF**: `.pdf` files
- **🌐 HTML**: `.html`, `.htm` web pages  
- **📝 Text**: `.txt` plain text files
- **📘 Word**: `.doc`, `.docx` documents

---

## **GitHub Pages Benefits**

- ✅ **Free Hosting**: No server costs
- ✅ **Global CDN**: Fast worldwide access
- ✅ **HTTPS**: Secure by default
- ✅ **Custom Domain**: Optional custom domain support
- ✅ **Version Control**: Full history of changes
- ✅ **No Maintenance**: GitHub handles infrastructure

---

## **Troubleshooting**

### **Site Not Updating?**
1. Check GitHub Pages is enabled in repository settings
2. Wait 5 minutes (GitHub Pages deployment time)
3. Hard refresh browser (Ctrl+F5)

### **Articles Not Processing?**
1. Check file formats are supported
2. Ensure files are in `news/` folder
3. Run `python deploy.py` again

### **Data Not Loading?**
1. Check `data/us_interventions.json` exists
2. Validate JSON format: `python -m json.tool data/us_interventions.json`
3. Check browser console for errors

---

## **Advanced Usage**

### **Batch Article Processing**
```bash
# Add multiple articles to news/ folder
# Then deploy all at once
python deploy.py
```

### **Custom Commit Messages**
```bash
# Edit deploy.py to customize commit messages
# Or commit manually:
git add .
git commit -m "Add breaking news articles"
git push
```

### **Backup Data**
```bash
# Backup current data
cp data/us_interventions.json data/backup_$(date +%Y%m%d).json
```

---

## **Performance Tips**

- 📊 **Data Size**: Keep JSON under 5MB for fast loading
- 🖼️ **Images**: Avoid embedding images in articles
- 📱 **Mobile**: Treemap is responsive and mobile-friendly
- 🔄 **Caching**: GitHub Pages has built-in CDN caching

---

*This workflow enables you to maintain a live, interactive news display with minimal effort!*