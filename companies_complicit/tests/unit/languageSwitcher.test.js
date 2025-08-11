/**
 * Unit Tests for LanguageSwitcher Module
 * Tests internationalization functionality for FasaadGov v02
 */

import { LanguageSwitcher, createLanguageSwitcher, t } from '../../src/ui/languageSwitcher.js';

describe('LanguageSwitcher', () => {
  let languageSwitcher;
  let mockFetch;

  const mockTranslations = {
    en: {
      app: {
        title: 'Corporate Complicity Flow',
        subtitle: 'Money trail from funding sources to operations'
      },
      search: {
        placeholder: 'Search nodes and flows...',
        results_found: 'Found {count} result{plural} for \"{term}\"'
      },
      common: {
        loading: 'Loading...',
        error: 'Error'
      }
    },
    ms: {
      app: {
        title: 'Aliran Keterlibatan Korporat',
        subtitle: 'Jejak wang dari sumber pembiayaan ke operasi'
      },
      search: {
        placeholder: 'Cari nod dan aliran...',
        results_found: 'Ditemui {count} hasil{plural} untuk \"{term}\"'
      },
      common: {
        loading: 'Memuatkan...',
        error: 'Ralat'
      }
    }
  };

  beforeEach(() => {
    // Mock fetch
    mockFetch = jest.fn();
    global.fetch = mockFetch;

    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    };
    global.localStorage = localStorageMock;

    // Mock navigator
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'en-US'
    });

    // Mock document
    Object.defineProperty(document, 'documentElement', {
      writable: true,
      value: { lang: 'en' }
    });

    languageSwitcher = new LanguageSwitcher({
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'ms'],
      storageKey: 'test_language',
      autoDetect: false
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    languageSwitcher = null;
  });

  describe('Constructor and Initialization', () => {
    test('should create instance with default options', () => {
      const switcher = new LanguageSwitcher();
      
      expect(switcher.options.defaultLanguage).toBe('en');
      expect(switcher.options.supportedLanguages).toEqual(['en', 'ms']);
      expect(switcher.options.storageKey).toBe('fasaad_language');
      expect(switcher.options.fallbackLanguage).toBe('en');
      expect(switcher.options.autoDetect).toBe(true);
    });

    test('should merge custom options with defaults', () => {
      const customOptions = {
        defaultLanguage: 'ms',
        supportedLanguages: ['ms', 'en'],
        storageKey: 'custom_lang'
      };
      
      const switcher = new LanguageSwitcher(customOptions);
      
      expect(switcher.options.defaultLanguage).toBe('ms');
      expect(switcher.options.supportedLanguages).toEqual(['ms', 'en']);
      expect(switcher.options.storageKey).toBe('custom_lang');
      expect(switcher.options.fallbackLanguage).toBe('en'); // Should keep default
    });

    test('should initialize with current language set to default', () => {
      expect(languageSwitcher.currentLanguage).toBe('en');
    });
  });

  describe('Language Detection', () => {
    test('should detect language from localStorage', () => {
      localStorage.getItem.mockReturnValue('ms');
      
      const detectedLang = languageSwitcher.detectLanguage();
      
      expect(localStorage.getItem).toHaveBeenCalledWith('test_language');
      expect(detectedLang).toBe('ms');
    });

    test('should detect language from browser when localStorage is empty', () => {
      localStorage.getItem.mockReturnValue(null);
      navigator.language = 'ms-MY';
      
      const detectedLang = languageSwitcher.detectLanguage();
      
      expect(detectedLang).toBe('ms');
    });

    test('should fallback to default when unsupported language detected', () => {
      localStorage.getItem.mockReturnValue(null);
      navigator.language = 'fr-FR';
      
      const detectedLang = languageSwitcher.detectLanguage();
      
      expect(detectedLang).toBe('en');
    });

    test('should use stored language even if unsupported', () => {
      localStorage.getItem.mockReturnValue('fr');
      
      const detectedLang = languageSwitcher.detectLanguage();
      
      expect(detectedLang).toBe('en'); // Should fallback
    });
  });

  describe('Translation Loading', () => {
    test('should load translations successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTranslations.en)
      });

      const translations = await languageSwitcher.loadLanguage('en');
      
      expect(mockFetch).toHaveBeenCalledWith('data/i18n/en.json');
      expect(translations).toEqual(mockTranslations.en);
      expect(languageSwitcher.translations.has('en')).toBe(true);
    });

    test('should handle fetch errors gracefully', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(languageSwitcher.loadLanguage('en')).rejects.toThrow('HTTP 404: Not Found');
    });

    test('should use cached translations when available', async () => {
      languageSwitcher.translations.set('en', mockTranslations.en);
      
      const translations = await languageSwitcher.loadLanguage('en');
      
      expect(mockFetch).not.toHaveBeenCalled();
      expect(translations).toEqual(mockTranslations.en);
    });

    test('should prevent duplicate loading requests', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTranslations.en)
      });

      // Start two concurrent loads
      const promise1 = languageSwitcher.loadLanguage('en');
      const promise2 = languageSwitcher.loadLanguage('en');
      
      await Promise.all([promise1, promise2]);
      
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    test('should fallback to fallback language on error', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found'
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTranslations.en)
        });

      const translations = await languageSwitcher.loadLanguage('ms');
      
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenCalledWith('data/i18n/ms.json');
      expect(mockFetch).toHaveBeenCalledWith('data/i18n/en.json');
      expect(translations).toEqual(mockTranslations.en);
    });
  });

  describe('Language Switching', () => {
    beforeEach(async () => {
      mockFetch.mockImplementation((url) => {
        const lang = url.includes('en.json') ? 'en' : 'ms';
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTranslations[lang])
        });
      });
    });

    test('should change language successfully', async () => {
      await languageSwitcher.changeLanguage('ms');
      
      expect(languageSwitcher.currentLanguage).toBe('ms');
      expect(localStorage.setItem).toHaveBeenCalledWith('test_language', 'ms');
      expect(document.documentElement.lang).toBe('ms');
    });

    test('should not change to unsupported language', async () => {
      await expect(languageSwitcher.changeLanguage('fr')).rejects.toThrow('Unsupported language: fr');
      expect(languageSwitcher.currentLanguage).toBe('en');
    });

    test('should not change if already using the language', async () => {
      const spy = jest.spyOn(languageSwitcher, 'loadLanguage');
      
      await languageSwitcher.changeLanguage('en');
      
      expect(spy).not.toHaveBeenCalled();
      expect(languageSwitcher.currentLanguage).toBe('en');
    });

    test('should notify listeners on language change', async () => {
      const listener = jest.fn();
      languageSwitcher.onLanguageChange(listener);
      
      await languageSwitcher.changeLanguage('ms');
      
      expect(listener).toHaveBeenCalledWith('ms', 'en');
    });
  });

  describe('Translation Function', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTranslations.en)
      });
      
      await languageSwitcher.loadLanguage('en');
    });

    test('should translate simple keys', () => {
      const translation = languageSwitcher.t('common.loading');
      expect(translation).toBe('Loading...');
    });

    test('should translate nested keys', () => {
      const translation = languageSwitcher.t('app.title');
      expect(translation).toBe('Corporate Complicity Flow');
    });

    test('should return key when translation not found', () => {
      const translation = languageSwitcher.t('nonexistent.key');
      expect(translation).toBe('nonexistent.key');
    });

    test('should interpolate parameters', () => {
      const translation = languageSwitcher.t('search.results_found', {
        count: 5,
        term: 'test',
        plural: 's'
      });
      expect(translation).toBe('Found 5 results for "test"');
    });

    test('should handle missing parameters gracefully', () => {
      const translation = languageSwitcher.t('search.results_found', {
        count: 1
      });
      expect(translation).toBe('Found 1 result{plural} for "{term}"');
    });

    test('should fallback to fallback language', async () => {
      // Load fallback language
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTranslations.en)
      });
      await languageSwitcher.loadLanguage('en');
      
      // Switch to language without full translations
      languageSwitcher.currentLanguage = 'ms';
      languageSwitcher.translations.set('ms', { app: { title: 'Malay Title' } });
      
      // Should find in current language
      expect(languageSwitcher.t('app.title')).toBe('Malay Title');
      
      // Should fallback for missing key
      expect(languageSwitcher.t('common.loading')).toBe('Loading...');
    });
  });

  describe('Nested Value Retrieval', () => {
    test('should get nested values correctly', () => {
      const obj = {
        level1: {
          level2: {
            level3: 'deep value'
          }
        }
      };
      
      const value = languageSwitcher.getNestedValue(obj, 'level1.level2.level3');
      expect(value).toBe('deep value');
    });

    test('should return undefined for non-existent paths', () => {
      const obj = { level1: { level2: 'value' } };
      
      const value = languageSwitcher.getNestedValue(obj, 'level1.nonexistent.level3');
      expect(value).toBeUndefined();
    });

    test('should handle empty paths', () => {
      const obj = { key: 'value' };
      
      const value = languageSwitcher.getNestedValue(obj, '');
      expect(value).toBe(obj);
    });
  });

  describe('Parameter Interpolation', () => {
    test('should interpolate single parameter', () => {
      const result = languageSwitcher.interpolate('Hello {name}!', { name: 'World' });
      expect(result).toBe('Hello World!');
    });

    test('should interpolate multiple parameters', () => {
      const result = languageSwitcher.interpolate('{greeting} {name}, you have {count} messages', {
        greeting: 'Hello',
        name: 'John',
        count: 5
      });
      expect(result).toBe('Hello John, you have 5 messages');
    });

    test('should leave unmatched placeholders', () => {
      const result = languageSwitcher.interpolate('Hello {name}, {missing}!', { name: 'World' });
      expect(result).toBe('Hello World, {missing}!');
    });

    test('should handle non-string input', () => {
      expect(languageSwitcher.interpolate(123, {})).toBe(123);
      expect(languageSwitcher.interpolate(null, {})).toBe(null);
      expect(languageSwitcher.interpolate(undefined, {})).toBe(undefined);
    });
  });

  describe('Pluralization', () => {
    beforeEach(async () => {
      const pluralTranslations = {
        ...mockTranslations.en,
        items_singular: '{count} item',
        items_plural: '{count} items'
      };
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(pluralTranslations)
      });
      
      await languageSwitcher.loadLanguage('en');
    });

    test('should use singular form for count of 1', () => {
      const result = languageSwitcher.plural(1, 'items');
      expect(result).toBe('1 item');
    });

    test('should use plural form for count other than 1', () => {
      const result = languageSwitcher.plural(5, 'items');
      expect(result).toBe('5 items');
    });

    test('should fallback to base key with plural parameter', () => {
      const result = languageSwitcher.plural(5, 'search.results_found');
      expect(result).toBe('Found 5 result{plural} for "{term}"');
    });
  });

  describe('UI Creation', () => {
    beforeEach(async () => {
      const uiTranslations = {
        ...mockTranslations.en,
        language: {
          select_language: 'Select Language',
          english: 'English',
          malay: 'Bahasa Malaysia'
        }
      };
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(uiTranslations)
      });
      
      await languageSwitcher.loadLanguage('en');
    });

    test('should create UI HTML', () => {
      const html = languageSwitcher.createUI();
      
      expect(html).toContain('language-switcher');
      expect(html).toContain('Select Language');
      expect(html).toContain('<option value="en" selected>English</option>');
      expect(html).toContain('<option value="ms" >Bahasa Malaysia</option>');
    });

    test('should mark current language as selected', async () => {
      await languageSwitcher.changeLanguage('ms');
      const html = languageSwitcher.createUI();
      
      expect(html).toContain('<option value="ms" selected>');
      expect(html).not.toContain('<option value="en" selected>');
    });
  });

  describe('DOM Updates', () => {
    let mockElements;

    beforeEach(() => {
      mockElements = [
        {
          getAttribute: jest.fn().mockReturnValue('app.title'),
          textContent: '',
          innerHTML: '',
          placeholder: '',
          title: '',
          setAttribute: jest.fn()
        }
      ];

      document.querySelectorAll = jest.fn().mockImplementation((selector) => {
        if (selector === '[data-i18n]') return mockElements;
        if (selector === '[data-i18n-html]') return [];
        if (selector === '[data-i18n-placeholder]') return [];
        if (selector === '[data-i18n-title]') return [];
        if (selector === '[data-i18n-aria]') return [];
        return [];
      });
    });

    test('should update DOM elements with translations', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTranslations.en)
      });
      
      await languageSwitcher.loadLanguage('en');
      languageSwitcher.updateDOM();
      
      expect(mockElements[0].textContent).toBe('Corporate Complicity Flow');
    });
  });

  describe('Event Listeners', () => {
    test('should add language change listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      
      languageSwitcher.onLanguageChange(listener1);
      languageSwitcher.onLanguageChange(listener2);
      
      expect(languageSwitcher.changeListeners).toContain(listener1);
      expect(languageSwitcher.changeListeners).toContain(listener2);
    });

    test('should remove language change listeners', () => {
      const listener = jest.fn();
      
      languageSwitcher.onLanguageChange(listener);
      languageSwitcher.offLanguageChange(listener);
      
      expect(languageSwitcher.changeListeners).not.toContain(listener);
    });

    test('should handle listener errors gracefully', () => {
      const errorListener = jest.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });
      const goodListener = jest.fn();
      
      languageSwitcher.onLanguageChange(errorListener);
      languageSwitcher.onLanguageChange(goodListener);
      
      // Should not throw
      expect(() => {
        languageSwitcher.notifyLanguageChange('ms', 'en');
      }).not.toThrow();
      
      expect(errorListener).toHaveBeenCalled();
      expect(goodListener).toHaveBeenCalled();
    });
  });

  describe('Utility Methods', () => {
    test('should return current language', () => {
      expect(languageSwitcher.getCurrentLanguage()).toBe('en');
    });

    test('should return supported languages', () => {
      const supported = languageSwitcher.getSupportedLanguages();
      expect(supported).toEqual(['en', 'ms']);
      expect(supported).not.toBe(languageSwitcher.options.supportedLanguages); // Should be a copy
    });

    test('should check if language is supported', () => {
      expect(languageSwitcher.isLanguageSupported('en')).toBe(true);
      expect(languageSwitcher.isLanguageSupported('ms')).toBe(true);
      expect(languageSwitcher.isLanguageSupported('fr')).toBe(false);
    });

    test('should get language display names', () => {
      expect(languageSwitcher.getLanguageName('en')).toBe('English');
      expect(languageSwitcher.getLanguageName('ms')).toBe('Bahasa Malaysia');
      expect(languageSwitcher.getLanguageName('fr')).toBe('FR');
    });

    test('should clear cache', () => {
      languageSwitcher.translations.set('en', {});
      languageSwitcher.translations.set('ms', {});
      languageSwitcher.loadPromises.set('en', Promise.resolve());
      
      languageSwitcher.clearCache('en');
      
      expect(languageSwitcher.translations.has('en')).toBe(false);
      expect(languageSwitcher.translations.has('ms')).toBe(true);
      expect(languageSwitcher.loadPromises.has('en')).toBe(false);
    });

    test('should clear all cache', () => {
      languageSwitcher.translations.set('en', {});
      languageSwitcher.translations.set('ms', {});
      
      languageSwitcher.clearCache();
      
      expect(languageSwitcher.translations.size).toBe(0);
      expect(languageSwitcher.loadPromises.size).toBe(0);
    });
  });

  describe('Statistics', () => {
    test('should return language statistics', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTranslations.en)
      });
      
      await languageSwitcher.loadLanguage('en');
      const stats = languageSwitcher.getStats();
      
      expect(stats.currentLanguage).toBe('en');
      expect(stats.loadedLanguages).toEqual(['en']);
      expect(stats.supportedLanguages).toEqual(['en', 'ms']);
      expect(stats.cacheSize).toBe(1);
      expect(stats.translationCounts.en).toBeGreaterThan(0);
    });

    test('should count nested keys correctly', () => {
      const obj = {
        level1: {
          key1: 'value1',
          key2: 'value2',
          level2: {
            key3: 'value3'
          }
        },
        key4: 'value4'
      };
      
      const count = languageSwitcher.countKeys(obj);
      expect(count).toBe(4); // key1, key2, key3, key4
    });
  });

  describe('Factory Function', () => {
    test('should create language switcher instance', () => {
      const switcher = createLanguageSwitcher({ defaultLanguage: 'ms' });
      
      expect(switcher).toBeInstanceOf(LanguageSwitcher);
      expect(switcher.options.defaultLanguage).toBe('ms');
    });
  });

  describe('Global Translation Function', () => {
    test('should use global language switcher when available', () => {
      const mockSwitcher = { t: jest.fn().mockReturnValue('translated') };
      window.languageSwitcher = mockSwitcher;
      
      const result = t('test.key', { param: 'value' });
      
      expect(mockSwitcher.t).toHaveBeenCalledWith('test.key', { param: 'value' });
      expect(result).toBe('translated');
      
      delete window.languageSwitcher;
    });

    test('should return key when no global switcher available', () => {
      delete window.languageSwitcher;
      
      const result = t('test.key');
      
      expect(result).toBe('test.key');
    });
  });
});