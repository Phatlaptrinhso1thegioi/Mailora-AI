/**
 * Mailora.ai — Centralized API Configuration
 * NEVER place private credentials in this file.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const functionsBaseUrl = import.meta.env.VITE_FUNCTIONS_BASE_URL || (supabaseUrl ? `${supabaseUrl}/functions/v1` : '');

export const API_CONFIG = {
  baseUrl: supabaseUrl,
  functionsBaseUrl: functionsBaseUrl,

  endpoints: {
    generateCampaign: '/generate-campaign',
    generateHero: '/generate-hero',
    rewriteContent: '/rewrite-content',
    validateEmail: '/validate-email',
    apiStatus: '/api-status'
  },

  timeout: 60000, // 60 seconds

  retry: {
    maxAttempts: 2,
    delayMs: 1000,
    backoffFactor: 2
  },

  models: {
    primary: 'gemini-3.8-flash',
    fallback: 'gemini-2.5-flash',
    allowedList: [
      { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (Latest Production Model)', recommended: true },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Legacy Model)', recommended: false },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Fast Fallback)', recommended: false }
    ]
  }
};
