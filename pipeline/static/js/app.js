/**
 * Article Pipeline Frontend JavaScript
 * Handles form submission, file uploads, progress display, and user interactions
 */

class ArticlePipeline {
    constructor() {
        this.currentTab = 'text';
        this.selectedFile = null;
        this.isProcessing = false;
        
        this.initializeElements();
        this.bindEvents();
        this.updateCharacterCount();
    }

    initializeElements() {
        // Form elements
        this.form = document.getElementById('article-form');
        this.textArea = document.getElementById('article-text');
        this.sourceUrl = document.getElementById('source-url');
        this.fileInput = document.getElementById('file-input');
        this.submitBtn = document.getElementById('submit-btn');
        
        // Tab elements
        this.tabButtons = document.querySelectorAll('.tab-button');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        // File upload elements
        this.fileUploadArea = document.getElementById('file-upload-area');
        this.fileInfo = document.getElementById('file-info');
        this.fileName = document.getElementById('file-name');
        this.fileSize = document.getElementById('file-size');
        this.removeFileBtn = document.getElementById('remove-file');
        
        // Progress elements
        this.progressSection = document.getElementById('progress-section');
        this.progressStatus = document.getElementById('progress-status');
        this.progressFill = document.getElementById('progress-fill');
        this.progressPercentage = document.getElementById('progress-percentage');
        
        // Results elements
        this.resultsSection = document.getElementById('results-section');
        this.resultsContent = document.getElementById('results-content');
        this.collapseBtn = document.getElementById('collapse-results');
        
        // Error elements
        this.errorSection = document.getElementById('error-section');
        this.errorMessage = document.getElementById('error-message');
        this.retryBtn = document.getElementById('retry-btn');
        
        // Character counter
        this.charCount = document.getElementById('char-count');
    }

    bindEvents() {
        // Tab switching
        this.tabButtons.forEach(button => {
            button.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Character counting
        this.textArea.addEventListener('input', () => this.updateCharacterCount());

        // File upload events
        this.fileUploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileUploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.fileUploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.fileUploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.removeFileBtn.addEventListener('click', () => this.removeFile());

        // Results collapse
        this.collapseBtn.addEventListener('click', () => this.toggleResults());

        // Retry button
        this.retryBtn.addEventListener('click', () => this.hideError());
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update tab buttons
        this.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Update tab content
        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
        
        // Clear previous selections when switching tabs
        if (tabName === 'text') {
            this.removeFile();
        } else {
            this.textArea.value = '';
            this.updateCharacterCount();
        }
    }

    updateCharacterCount() {
        const count = this.textArea.value.length;
        this.charCount.textContent = count.toLocaleString();
        
        const counter = this.charCount.parentElement;
        counter.classList.remove('warning', 'error');
        
        if (count > 45000) {
            counter.classList.add('error');
        } else if (count > 40000) {
            counter.classList.add('warning');
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        this.fileUploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.fileUploadArea.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.fileUploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        // Validate file type
        const allowedTypes = ['application/pdf', 'text/html', 'text/plain'];
        const allowedExtensions = ['.pdf', '.html', '.htm', '.txt'];
        
        const isValidType = allowedTypes.includes(file.type) || 
                           allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
        
        if (!isValidType) {
            this.showError('Invalid file type. Please upload PDF, HTML, or TXT files only.');
            return;
        }

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            this.showError('File size too large. Please upload files smaller than 10MB.');
            return;
        }

        this.selectedFile = file;
        this.displayFileInfo(file);
    }

    displayFileInfo(file) {
        this.fileName.textContent = file.name;
        this.fileSize.textContent = this.formatFileSize(file.size);
        this.fileInfo.style.display = 'block';
        this.fileUploadArea.style.display = 'none';
    }

    removeFile() {
        this.selectedFile = null;
        this.fileInput.value = '';
        this.fileInfo.style.display = 'none';
        this.fileUploadArea.style.display = 'block';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isProcessing) return;
        
        // Validate input
        if (!this.validateInput()) return;
        
        this.isProcessing = true;
        this.hideError();
        this.hideResults();
        this.showProgress();
        
        try {
            const formData = new FormData();
            
            if (this.currentTab === 'text') {
                formData.append('article_text', this.textArea.value);
                formData.append('source_url', this.sourceUrl.value);
            } else {
                formData.append('article_file', this.selectedFile);
            }
            
            const response = await this.submitToAPI(formData);
            
            if (response.success) {
                this.showResults(response.data);
            } else {
                this.showError(response.error || 'Processing failed. Please try again.');
            }
            
        } catch (error) {
            console.error('Submission error:', error);
            this.showError('Network error. Please check your connection and try again.');
        } finally {
            this.isProcessing = false;
            this.hideProgress();
        }
    }

    validateInput() {
        if (this.currentTab === 'text') {
            const text = this.textArea.value.trim();
            if (!text) {
                this.showError('Please enter article text.');
                return false;
            }
            if (text.length > 50000) {
                this.showError('Article text exceeds 50,000 character limit.');
                return false;
            }
        } else {
            if (!this.selectedFile) {
                this.showError('Please select a file to upload.');
                return false;
            }
        }
        return true;
    }

    async submitToAPI(formData) {
        // Simulate progress updates
        this.updateProgress(10, 'Validating input...');
        await this.delay(500);
        
        this.updateProgress(30, 'Processing article...');
        await this.delay(1000);
        
        this.updateProgress(60, 'Extracting entities...');
        await this.delay(1500);
        
        this.updateProgress(80, 'Formatting data...');
        await this.delay(1000);
        
        this.updateProgress(100, 'Complete!');
        
        // TODO: Replace with actual API call when backend is implemented
        // For now, return mock data
        return {
            success: true,
            data: {
                entities: {
                    organizations: [
                        { name: 'NSO Group', category: 'Surveillance', confidence: 0.95 },
                        { name: 'Meta', category: 'Technology', confidence: 0.88 }
                    ],
                    locations: [
                        { name: 'Israel', type: 'country', confidence: 0.98 },
                        { name: 'Palestine', type: 'country', confidence: 0.92 }
                    ],
                    persons: [
                        { name: 'John Doe', role: 'CEO', confidence: 0.82 }
                    ]
                },
                processing_time: '2.3 seconds',
                source_url: formData.get('source_url') || 'Uploaded file'
            }
        };
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateProgress(percentage, status) {
        this.progressFill.style.width = `${percentage}%`;
        this.progressPercentage.textContent = `${percentage}%`;
        this.progressStatus.textContent = status;
    }

    showProgress() {
        this.progressSection.style.display = 'block';
        this.submitBtn.disabled = true;
        this.submitBtn.innerHTML = '<span class="material-icons">hourglass_empty</span>Processing...';
    }

    hideProgress() {
        this.progressSection.style.display = 'none';
        this.submitBtn.disabled = false;
        this.submitBtn.innerHTML = '<span class="material-icons">send</span>Process Article';
    }

    showResults(data) {
        this.resultsContent.innerHTML = this.formatResults(data);
        this.resultsSection.style.display = 'block';
        
        // Scroll to results
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    hideResults() {
        this.resultsSection.style.display = 'none';
    }

    formatResults(data) {
        const { entities, processing_time, source_url } = data;
        
        let html = `
            <div class="result-summary">
                <p><strong>Processing Time:</strong> ${processing_time}</p>
                <p><strong>Source:</strong> ${source_url}</p>
            </div>
        `;
        
        if (entities.organizations && entities.organizations.length > 0) {
            html += `
                <div class="entity-group">
                    <h4>Organizations (${entities.organizations.length})</h4>
                    <div class="entity-list">
                        ${entities.organizations.map(org => `
                            <div class="entity-item">
                                <span class="entity-name">${org.name}</span>
                                <span class="entity-category">${org.category}</span>
                                <span class="entity-confidence">${Math.round(org.confidence * 100)}%</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        if (entities.locations && entities.locations.length > 0) {
            html += `
                <div class="entity-group">
                    <h4>Locations (${entities.locations.length})</h4>
                    <div class="entity-list">
                        ${entities.locations.map(loc => `
                            <div class="entity-item">
                                <span class="entity-name">${loc.name}</span>
                                <span class="entity-category">${loc.type}</span>
                                <span class="entity-confidence">${Math.round(loc.confidence * 100)}%</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        if (entities.persons && entities.persons.length > 0) {
            html += `
                <div class="entity-group">
                    <h4>Persons (${entities.persons.length})</h4>
                    <div class="entity-list">
                        ${entities.persons.map(person => `
                            <div class="entity-item">
                                <span class="entity-name">${person.name}</span>
                                <span class="entity-category">${person.role || 'Unknown'}</span>
                                <span class="entity-confidence">${Math.round(person.confidence * 100)}%</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        return html;
    }

    toggleResults() {
        const content = this.resultsContent;
        const icon = this.collapseBtn.querySelector('.material-icons');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            icon.textContent = 'expand_less';
        } else {
            content.style.display = 'none';
            icon.textContent = 'expand_more';
        }
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorSection.style.display = 'block';
        
        // Scroll to error
        this.errorSection.scrollIntoView({ behavior: 'smooth' });
    }

    hideError() {
        this.errorSection.style.display = 'none';
    }
}

// Additional CSS for results formatting
const additionalCSS = `
    .result-summary {
        background: var(--surface-variant);
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 24px;
    }
    
    .result-summary p {
        margin: 4px 0;
        font-size: 0.95rem;
    }
    
    .entity-group {
        margin-bottom: 24px;
    }
    
    .entity-group h4 {
        color: var(--primary-color);
        margin: 0 0 12px 0;
        font-weight: 500;
        font-size: 1.1rem;
    }
    
    .entity-list {
        display: grid;
        gap: 8px;
    }
    
    .entity-item {
        display: grid;
        grid-template-columns: 2fr 1fr auto;
        gap: 12px;
        padding: 12px 16px;
        background: var(--surface-variant);
        border-radius: 6px;
        align-items: center;
    }
    
    .entity-name {
        font-weight: 500;
        color: var(--text-color);
    }
    
    .entity-category {
        color: var(--text-secondary);
        font-size: 0.9rem;
    }
    
    .entity-confidence {
        color: var(--primary-color);
        font-weight: 500;
        font-size: 0.9rem;
    }
    
    @media (max-width: 768px) {
        .entity-item {
            grid-template-columns: 1fr;
            gap: 4px;
        }
        
        .entity-category,
        .entity-confidence {
            font-size: 0.85rem;
        }
    }
`;

// Inject additional CSS
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ArticlePipeline();
});