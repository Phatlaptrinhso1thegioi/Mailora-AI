/**
 * Mailora.ai — Studio Header Component
 */

import { stateManager } from '../core/state-manager.js';
import { eventBus, EVENTS } from '../core/event-bus.js';
import { formatCredits } from '../utils/format.js';

export class StudioHeader {
  constructor(headerElement, options = {}) {
    this.el = headerElement;
    this.options = options;
    this.init();
  }

  init() {
    if (!this.el) return;

    this.renderUserInfo();

    // Listen to credit updates
    eventBus.on(EVENTS.CREDITS_UPDATED, (newCredits) => {
      this.updateCreditsBadge(newCredits);
    });

    eventBus.on(EVENTS.AUTH_STATE_CHANGED, () => {
      this.renderUserInfo();
    });
  }

  renderUserInfo() {
    const user = stateManager.getUser();
    const credits = stateManager.getCredits();

    const nameEl = this.el.querySelector('#header-user-name');
    const avatarEl = this.el.querySelector('#header-avatar-circle');
    const creditsEl = this.el.querySelector('#header-credits-count');

    if (nameEl) {
      nameEl.textContent = user?.full_name || user?.email?.split('@')[0] || 'Demo User';
    }

    if (avatarEl) {
      const initial = (user?.full_name || user?.email || 'M').charAt(0).toUpperCase();
      avatarEl.textContent = initial;
    }

    if (creditsEl) {
      creditsEl.textContent = `${formatCredits(credits)} Credits`;
    }
  }

  updateCreditsBadge(credits) {
    const creditsEl = this.el.querySelector('#header-credits-count');
    if (creditsEl) {
      creditsEl.textContent = `${formatCredits(credits)} Credits`;
    }
  }

  updateQaBadge(score) {
    const badge = this.el.querySelector('#qa-score-badge');
    if (badge) {
      badge.textContent = `QA: ${score}/100`;
      badge.className = score >= 80 
        ? 'badge badge-green' 
        : score >= 60 
          ? 'badge badge-purple' 
          : 'badge badge-gray';
    }
  }

  updateApiBadge(status, label = 'AI Ready') {
    const badge = this.el.querySelector('#api-key-status-label');
    const dot = this.el.querySelector('#api-key-dot');
    const btn = this.el.querySelector('#api-key-status-btn');

    if (badge) badge.textContent = label;
    if (dot) {
      dot.className = status === 'connected'
        ? 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse'
        : 'w-2 h-2 rounded-full bg-amber-500';
    }
    if (btn) {
      btn.className = status === 'connected'
        ? 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer'
        : 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition cursor-pointer';
    }
  }
}
