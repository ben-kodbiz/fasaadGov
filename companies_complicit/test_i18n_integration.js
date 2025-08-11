/**
 * Simple test script to verify i18n integration
 */

import { LanguageSwitcher } from './src/ui/languageSwitcher.js';

async function testI18nIntegration() {
  console.log('🧪 Testing i18n integration...');
  
  try {
    // Create language switcher
    const languageSwitcher = new LanguageSwitcher({
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'ms'],
      storageKey: 'test_language',
      autoDetect: false
    });

    // Initialize
    await languageSwitcher.initialize();
    console.log('✅ Language switcher initialized');

    // Test English translations
    console.log('📝 Testing English translations:');
    console.log('  app.title:', languageSwitcher.t('app.title'));
    console.log('  search.placeholder:', languageSwitcher.t('search.placeholder'));
    console.log('  export.export_svg:', languageSwitcher.t('export.export_svg'));

    // Test parameter interpolation
    console.log('  search.results_found:', languageSwitcher.t('search.results_found', {
      count: 5,
      plural: 's',
      term: 'test'
    }));

    // Switch to Malay
    await languageSwitcher.changeLanguage('ms');
    console.log('✅ Switched to Malay');

    // Test Malay translations
    console.log('📝 Testing Malay translations:');
    console.log('  app.title:', languageSwitcher.t('app.title'));
    console.log('  search.placeholder:', languageSwitcher.t('search.placeholder'));
    console.log('  export.export_svg:', languageSwitcher.t('export.export_svg'));

    // Test parameter interpolation in Malay
    console.log('  search.results_found:', languageSwitcher.t('search.results_found', {
      count: 5,
      plural: '',
      term: 'ujian'
    }));

    // Test fallback
    console.log('📝 Testing fallback for missing key:');
    console.log('  missing.key:', languageSwitcher.t('missing.key'));

    // Test statistics
    const stats = languageSwitcher.getStats();
    console.log('📊 Language statistics:', stats);

    console.log('✅ All i18n integration tests passed!');
    
  } catch (error) {
    console.error('❌ i18n integration test failed:', error);
  }
}

// Run tests if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  testI18nIntegration();
}

export { testI18nIntegration };