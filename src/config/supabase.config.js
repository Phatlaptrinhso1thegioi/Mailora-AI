/**
 * Mailora.ai — Supabase Client Configuration
 * Supports Cloud Mode (when configured) and Local Demo Mode fallback.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

// In automated test runner, isolate from remote cloud network calls
const isTestEnv = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';

export const isCloudConfigured = Boolean(
  !isTestEnv &&
  supabaseUrl && 
  supabaseKey && 
  supabaseUrl.startsWith('http') && 
  !supabaseUrl.includes('your-project')
);

let supabaseClient = null;

if (isCloudConfigured) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'mailora_supabase_auth_session'
      }
    });
  } catch (err) {
    console.warn('[Supabase] Failed to initialize cloud client. Falling back to local demo mode.', err);
    supabaseClient = null;
  }
}

export const supabase = supabaseClient;

export function getAppMode() {
  return isCloudConfigured && supabaseClient ? 'CLOUD' : 'LOCAL_DEMO';
}
