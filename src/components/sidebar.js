/**
 * Mailora.ai — Studio Sidebar Component
 */

import { stateManager } from '../core/state-manager.js';
import { authService } from '../services/auth.service.js';

export class StudioSidebar {
  constructor(sidebarElement, actions = {}) {
    this.el = sidebarElement;
    this.actions = actions;
    this.init();
  }

  init() {
    if (!this.el) return;

    // New Campaign button
    const newCampBtn = this.el.querySelector('#btn-new-campaign');
    if (newCampBtn) {
      newCampBtn.addEventListener('click', () => {
        if (this.actions.onNewCampaign) this.actions.onNewCampaign();
      });
    }

    // History button
    const historyBtn = this.el.querySelector('#btn-open-history');
    if (historyBtn) {
      historyBtn.addEventListener('click', () => {
        if (this.actions.onOpenHistory) this.actions.onOpenHistory();
      });
    }

    // Media Library button
    const mediaBtn = this.el.querySelector('#btn-open-media');
    if (mediaBtn) {
      mediaBtn.addEventListener('click', () => {
        if (this.actions.onOpenMedia) this.actions.onOpenMedia();
      });
    }

    // Brand Kit button
    const brandKitBtn = this.el.querySelector('#btn-open-brandkit');
    if (brandKitBtn) {
      brandKitBtn.addEventListener('click', () => {
        if (this.actions.onOpenBrandKit) this.actions.onOpenBrandKit();
      });
    }

    // Logout button
    const logoutBtn = this.el.querySelector('#btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await authService.signOut();
        window.location.href = '/login.html';
      });
    }
  }

  updateCounts(historyCount, mediaCount) {
    const historyBadge = this.el.querySelector('#sidebar-badge-history-count');
    const mediaBadge = this.el.querySelector('#sidebar-badge-media-count');

    if (historyBadge) historyBadge.textContent = historyCount;
    if (mediaBadge) mediaBadge.textContent = mediaCount;
  }
}
