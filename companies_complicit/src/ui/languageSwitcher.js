/**
 * Language Switcher Module for FasaadGov v02
 * Provides internationalization support with language switching capabilities
 */

export class LanguageSwitcher {
  constructor(options = {}) {
    this.options = {
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'ms'],
      storageKey: 'fasaad-language',
      autoDetect: true,
      fallbackLanguage: 'en',
      ...options
    };

    this.currentLanguage = this.options.defaultLanguage;
    this.translations = new Map();
    this.loadPromises = new Map();
    this.changeListeners = [];
    
    this.initialize();
  }

  /**
   * Initialize the language switcher
   */
  async initialize() {
    // Detect or load saved language
    this.currentLanguage = this.detectLanguage();
    
    // Load initial language
    await this.loadLanguage(this.currentLanguage);
    
    // Notify listeners
    this.notifyLanguageChange(this.currentLanguage);
  }

  /**
   * Detect the appropriate language to use
   * @returns {String} Language code
   */
  detectLanguage() {
    // Check saved preference
    const savedLanguage = this.getSavedLanguage();
    if (savedLanguage && this.options.supportedLanguages.includes(savedLanguage)) {
      return savedLanguage;
    }

    // Auto-detect from browser if enabled
    if (this.options.autoDetect) {
      const browserLanguage = this.getBrowserLanguage();
      if (browserLanguage && this.options.supportedLanguages.includes(browserLanguage)) {
        return browserLanguage;
      }
    }

    return this.options.defaultLanguage;
  }

  /**
   * Get saved language from storage
   * @returns {String|null} Saved language code
   */
  getSavedLanguage() {
    try {
      return localStorage.getItem(this.options.storageKey);
    } catch (e) {
      return null;
    }
  }

  /**
   * Get browser language preference
   * @returns {String|null} Browser language code
   */
  getBrowserLanguage() {
    if (typeof navigator === 'undefined') return null;
    
    const language = navigator.language || navigator.languages?.[0];
    if (!language) return null;
    
    // Extract language code (e.g., 'en-US' -> 'en')
    return language.split('-')[0].toLowerCase();
  }

  /**
   * Load translations for a language
   * @param {String} languageCode - Language code to load
   * @returns {Promise<Object>} Loaded translations
   */
  async loadLanguage(languageCode) {
    // Return cached translations if available
    if (this.translations.has(languageCode)) {
      return this.translations.get(languageCode);
    }

    // Return existing load promise if in progress
    if (this.loadPromises.has(languageCode)) {
      return await this.loadPromises.get(languageCode);
    }

    // Create load promise
    const loadPromise = this.fetchTranslations(languageCode);
    this.loadPromises.set(languageCode, loadPromise);

    try {
      const translations = await loadPromise;
      this.translations.set(languageCode, translations);
      this.loadPromises.delete(languageCode);
      return translations;
    } catch (error) {
      this.loadPromises.delete(languageCode);
      console.error(`Failed to load language ${languageCode}:`, error);
      
      // Load fallback language if different
      if (languageCode !== this.options.fallbackLanguage) {
        return await this.loadLanguage(this.options.fallbackLanguage);
      }
      
      throw error;
    }
  }

  /**
   * Fetch translations from file
   * @param {String} languageCode - Language code
   * @returns {Promise<Object>} Translations object
   */
  async fetchTranslations(languageCode) {
    const response = await fetch(`data/i18n/${languageCode}.json`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Switch to a different language
   * @param {String} languageCode - Target language code
   * @returns {Promise<Boolean>} Success status
   */
  async switchLanguage(languageCode) {
    if (!this.options.supportedLanguages.includes(languageCode)) {
      console.warn(`Unsupported language: ${languageCode}`);
      return false;
    }

    if (languageCode === this.currentLanguage) {
      return true; // Already using this language
    }

    try {
      // Load the new language
      await this.loadLanguage(languageCode);
      
      // Update current language
      const previousLanguage = this.currentLanguage;
      this.currentLanguage = languageCode;
      
      // Save preference
      this.saveLanguage(languageCode);
      
      // Notify listeners
      this.notifyLanguageChange(languageCode, previousLanguage);
      
      return true;
    } catch (error) {
      console.error(`Failed to switch to language ${languageCode}:`, error);
      return false;
    }
  }

  /**
   * Save language preference to storage
   * @param {String} languageCode - Language code to save
   */
  saveLanguage(languageCode) {
    try {
      localStorage.setItem(this.options.storageKey, languageCode);
    } catch (e) {
      console.warn('Failed to save language preference:', e);
    }
  }

  /**
   * Get translation for a key
   * @param {String} key - Translation key (dot notation supported)
   * @param {Object} params - Parameters for interpolation
   * @returns {String} Translated text
   */
  t(key, params = {}) {
    const translations = this.translations.get(this.currentLanguage);
    if (!translations) {
      return key; // Return key if no translations loaded
    }

    const value = this.getNestedValue(translations, key);
    if (value === undefined) {
      // Try fallback language
      const fallbackTranslations = this.translations.get(this.options.fallbackLanguage);
      if (fallbackTranslations && this.currentLanguage !== this.options.fallbackLanguage) {
        const fallbackValue = this.getNestedValue(fallbackTranslations, key);
        if (fallbackValue !== undefined) {
          return this.interpolate(fallbackValue, params);
        }
      }
      
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }

    return this.interpolate(value, params);
  }

  /**
   * Get nested value from object using dot notation
   * @param {Object} obj - Object to search
   * @param {String} path - Dot notation path
   * @returns {*} Found value or undefined
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Interpolate parameters into translation string
   * @param {String} text - Text with placeholders
   * @param {Object} params - Parameters to interpolate
   * @returns {String} Interpolated text
   */
  interpolate(text, params) {
    if (typeof text !== 'string') {
      return text;
    }

    return text.replace(/\{(\w+)\}/g, (match, key) => {
      if (params.hasOwnProperty(key)) {
        return String(params[key]);
      }
      return match;
    });
  }

  /**
   * Get plural form for a count
   * @param {Number} count - Count value
   * @param {String} language - Language code (optional)
   * @returns {String} Plural suffix
   */
  getPlural(count, language = null) {
    const lang = language || this.currentLanguage;
    
    // Simple plural rules - can be extended for more complex languages
    const pluralRules = {
      en: count !== 1 ? 's' : '',
      ms: '' // Malay doesn't have plural forms like English
    };

    return pluralRules[lang] || '';
  }

  /**
   * Format number according to language locale
   * @param {Number} number - Number to format
   * @param {Object} options - Formatting options
   * @returns {String} Formatted number
   */
  formatNumber(number, options = {}) {
    const locales = {
      en: 'en-US',
      ms: 'ms-MY'
    };

    const locale = locales[this.currentLanguage] || locales.en;
    
    try {
      return new Intl.NumberFormat(locale, options).format(number);
    } catch (e) {
      return String(number);
    }
  }

  /**
   * Format date according to language locale
   * @param {Date|String} date - Date to format
   * @param {Object} options - Formatting options
   * @returns {String} Formatted date
   */
  formatDate(date, options = {}) {
    const locales = {
      en: 'en-US',
      ms: 'ms-MY'
    };

    const locale = locales[this.currentLanguage] || locales.en;
    const dateObj = date instanceof Date ? date : new Date(date);
    
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    };

    try {
      return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
    } catch (e) {
      return String(date);
    }
  }

  /**
   * Create language switcher UI
   * @returns {String} HTML for language switcher
   */
  createUI() {
    const languageNames = {
      en: 'English',
      ms: 'Bahasa Melayu'
    };

    const options = this.options.supportedLanguages.map(lang => {
      const selected = lang === this.currentLanguage ? 'selected' : '';
      return `<option value="${lang}" ${selected}>${languageNames[lang] || lang}</option>`;
    }).join('');

    return `
      <div class="language-switcher">
        <label for="language-select" class="language-switcher__label">
          🌐 Language:
        </label>
        <select id="language-select" class="language-switcher__select" aria-label="Select language">
          ${options}
        </select>
      </div>
    `;
  }

  /**
   * Initialize UI with event listeners
   * @param {String|Element} container - Container for the UI
   */
  initializeUI(container) {
    const containerEl = typeof container === 'string' ? 
      document.querySelector(container) : container;
    
    if (!containerEl) {
      throw new Error('Language switcher container not found');
    }

    containerEl.innerHTML = this.createUI();

    const select = containerEl.querySelector('#language-select');
    if (select) {
      select.addEventListener('change', async (event) => {
        const newLanguage = event.target.value;
        const success = await this.switchLanguage(newLanguage);
        
        if (!success) {
          // Revert selection if switch failed
          event.target.value = this.currentLanguage;
        }
      });
    }
  }

  /**
   * Add language change listener
   * @param {Function} listener - Callback function
   */
  onLanguageChange(listener) {
    if (typeof listener === 'function') {
      this.changeListeners.push(listener);
    }
  }

  /**
   * Remove language change listener
   * @param {Function} listener - Callback function to remove
   */
  offLanguageChange(listener) {
    const index = this.changeListeners.indexOf(listener);
    if (index > -1) {
      this.changeListeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners of language change
   * @param {String} newLanguage - New language code
   * @param {String} previousLanguage - Previous language code
   */
  notifyLanguageChange(newLanguage, previousLanguage = null) {
    this.changeListeners.forEach(listener => {
      try {
        listener(newLanguage, previousLanguage);
      } catch (error) {
        console.error('Error in language change listener:', error);
      }
    });
  }

  /**
   * Get current language
   * @returns {String} Current language code
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * Get supported languages
   * @returns {Array<String>} Array of supported language codes
   */
  getSupportedLanguages() {
    return [...this.options.supportedLanguages];
  }

  /**
   * Check if a language is supported
   * @param {String} languageCode - Language code to check
   * @returns {Boolean} True if supported
   */
  isLanguageSupported(languageCode) {
    return this.options.supportedLanguages.includes(languageCode);
  }

  /**
   * Get all loaded translations
   * @returns {Map} Map of language codes to translation objects
   */
  getLoadedTranslations() {
    return new Map(this.translations);
  }

  /**
   * Preload languages
   * @param {Array<String>} languageCodes - Languages to preload
   * @returns {Promise<Array>} Array of load results
   */
  async preloadLanguages(languageCodes = null) {
    const languages = languageCodes || this.options.supportedLanguages;
    const loadPromises = languages.map(lang => this.loadLanguage(lang));
    
    return await Promise.allSettled(loadPromises);
  }

  /**
   * Clear cached translations
   * @param {String} languageCode - Specific language to clear (optional)
   */
  clearCache(languageCode = null) {
    if (languageCode) {
      this.translations.delete(languageCode);
      this.loadPromises.delete(languageCode);
    } else {
      this.translations.clear();
      this.loadPromises.clear();
    }
  }

  /**
   * Destroy the language switcher
   */
  destroy() {
    this.clearCache();
    this.changeListeners = [];
    this.currentLanguage = this.options.defaultLanguage;
  }
}

/**
 * Factory function to create language switcher
 * @param {Object} options - Configuration options
 * @returns {LanguageSwitcher} Language switcher instance
 */
export function createLanguageSwitcher(options = {}) {
  return new LanguageSwitcher(options);
}

/**
 * Global translation function (convenience)
 * @param {String} key - Translation key
 * @param {Object} params - Parameters for interpolation
 * @returns {String} Translated text
 */
export function t(key, params = {}) {
  if (window.languageSwitcher) {
    return window.languageSwitcher.t(key, params);
  }
  return key;
}