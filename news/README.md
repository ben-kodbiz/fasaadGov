# News Articles Folder

This folder is for drag-and-drop news articles about US/Israel atrocities.

## How to Use

1. **Drag and Drop**: Simply drag news article files (text or HTML) into this folder
2. **Supported Formats**: 
   - `.txt` files (plain text articles)
   - `.html` files (web page articles)
   - `.htm` files (web page articles)
3. **Processing**: Run the article processing script to automatically convert articles to JSON format
4. **Integration**: Processed articles will be automatically integrated into the treemap visualization

## File Naming Convention

For best results, name your files descriptively:
- `2024-01-15_gaza_hospital_bombing.txt`
- `2024-02-03_us_drone_strike_yemen.html`

## Article Content Requirements

Articles should contain:
- **Title**: Clear headline or title
- **Date**: Publication or event date
- **Content**: Description of the atrocity or event
- **Source**: Original source URL or publication (if available)

## Processing

After adding articles, run:
```bash
python scripts/process_articles.py
```

This will:
- Parse all new articles in this folder
- Extract relevant information
- Add them to the visualization data
- Update the treemap display