/**
 * Mailora.ai — Feature Flags
 */

import { getAppMode } from './supabase.config.js';

export const FEATURE_FLAGS = {
  // Use Cloud Edge Functions for Gemini if in CLOUD mode
  enableCloudAiGeneration: getAppMode() === 'CLOUD',
  
  // Real Supabase storage for images
  enableCloudStorage: getAppMode() === 'CLOUD',

  // Enable Real Credits deduction
  enableCreditEnforcement: true,

  // Benchmark presets panel
  enableBenchmarkTester: true,

  // Draggable floating copilot
  enableFloatingCopilot: true,

  // Table HTML email export
  enableTableHtmlExport: true
};
