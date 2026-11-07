/**
 * Mailora.ai — State Manager
 * Centralized reactive application state preserving structured campaign data.
 */

import { eventBus, EVENTS } from './event-bus.js';
import { localStore } from '../utils/storage.js';

class StateManager {
  constructor() {
    this.state = {
      user: null,
      credits: 50,
      mode: 'LOCAL_DEMO', // 'CLOUD' | 'LOCAL_DEMO'
      
      // Campaign Generation State
      isGenerating: false,
      lastGeneratedPrompt: '',
      userCtaUrl: '',
      
      // Structured Campaign Data
      structuredData: null,
      variants: [],
      selectedIndex: 0,
      activeVariant: null,

      // UI View Modes
      deviceMode: 'desktop', // 'desktop' (600px) | 'mobile' (375px)
      viewMode: 'visual',   // 'visual' | 'html'
      isFloatingPromptOpen: true,

      // Workspace Entities
      campaignHistory: [],
      mediaLibrary: [],
      brandKit: null
    };

    this.subscribers = new Set();
  }

  getState() {
    return this.state;
  }

  setState(partialState, notify = true) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...partialState };

    if (notify) {
      this.notify(prevState);
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify(prevState) {
    for (const callback of this.subscribers) {
      try {
        callback(this.state, prevState);
      } catch (err) {
        console.error('[StateManager] Subscriber error:', err);
      }
    }
  }

  // Helper getters & setters
  getUser() {
    return this.state.user;
  }

  getCredits() {
    return this.state.credits;
  }

  setCredits(amount) {
    this.setState({ credits: amount });
    eventBus.emit(EVENTS.CREDITS_UPDATED, amount);
  }

  getActiveVariant() {
    if (!this.state.variants || this.state.variants.length === 0) return null;
    return this.state.variants[this.state.selectedIndex] || this.state.variants[0];
  }

  setSelectedIndex(index) {
    if (this.state.variants && this.state.variants[index]) {
      this.setState({
        selectedIndex: index,
        activeVariant: this.state.variants[index]
      });
      eventBus.emit(EVENTS.VARIANT_SELECTED, {
        index,
        variant: this.state.variants[index]
      });
    }
  }
}

export const stateManager = new StateManager();
