/**
 * Mailora.ai — Application Configuration
 */

export const APP_CONFIG = {
  name: 'Mailora.ai',
  tagline: 'Adaptive AI Email Marketing & Creative Studio',
  version: '2.0.0',
  defaultLanguage: 'vi',
  
  // Credits Policy
  credits: {
    initialGrant: 50,
    costs: {
      campaignGeneration: 1,
      heroGeneration: 1,
      contentRewrite: 1,
      emailValidation: 0 // Free
    }
  },

  // Design Defaults
  design: {
    archetypes: [
      'luxury_beauty',
      'modern_tech',
      'fashion_editorial',
      'organic_lifestyle',
      'travel_experience',
      'saas_digital',
      'lifestyle_services',
      'universal_modern'
    ],
    defaultArchetype: 'universal_modern',
    defaultVariantIndex: 0
  },

  // Storage Bucket Names
  storage: {
    mediaBucket: 'campaign-media'
  },

  // URLs & Navigation
  routes: {
    home: '/index.html',
    landing: '/landing_page.html',
    login: '/login.html',
    signup: '/sign_up.html',
    studio: '/AI_creative_studio.html'
  }
};
