/**
 * Mailora.ai — Event Bus
 * Lightweight publish/subscribe event hub to decouple UI and services.
 */

class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  once(event, callback) {
    const unsubscribe = this.on(event, (...args) => {
      unsubscribe();
      callback(...args);
    });
    return unsubscribe;
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event).delete(callback);
    if (this.listeners.get(event).size === 0) {
      this.listeners.delete(event);
    }
  }

  emit(event, ...args) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event).forEach(callback => {
      try {
        callback(...args);
      } catch (err) {
        console.error(`[EventBus] Error in event listener for "${event}":`, err);
      }
    });
  }

  clear() {
    this.listeners.clear();
  }
}

export const eventBus = new EventBus();

// Core Event Types Constant
export const EVENTS = {
  AUTH_STATE_CHANGED: 'auth:state-changed',
  CREDITS_UPDATED: 'credits:updated',
  CAMPAIGN_GENERATION_STARTED: 'campaign:gen-started',
  CAMPAIGN_GENERATION_COMPLETED: 'campaign:gen-completed',
  CAMPAIGN_GENERATION_FAILED: 'campaign:gen-failed',
  VARIANT_SELECTED: 'variant:selected',
  CANVAS_CONTENT_CHANGED: 'canvas:content-changed',
  INSPECTOR_FIELD_CHANGED: 'inspector:field-changed',
  DEVICE_MODE_CHANGED: 'device:mode-changed',
  IMAGE_UPDATED: 'image:updated',
  BRANDKIT_APPLIED: 'brandkit:applied',
  TOAST_SHOW: 'toast:show'
};
