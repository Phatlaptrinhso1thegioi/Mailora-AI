/**
 * Mailora.ai — Core Application Entry Point
 */

import { initAppLifecycle } from './lifecycle.js';
import { stateManager } from './state-manager.js';
import { eventBus, EVENTS } from './event-bus.js';
import { APP_CONFIG } from '../config/app.config.js';
import { API_CONFIG } from '../config/api.config.js';

export async function bootstrapApp() {
  const lifecycle = await initAppLifecycle();
  return {
    config: APP_CONFIG,
    apiConfig: API_CONFIG,
    stateManager,
    eventBus,
    mode: lifecycle.mode
  };
}
