/**
 * Mailora.ai — Adaptive Inspector Component
 */

import { populateInspectorFromVariant, syncInspectorToVariant } from '../modules/email/email-editor.js';

export class AdaptiveInspector {
  constructor(inspectorElement, onFieldChange) {
    this.el = inspectorElement;
    this.onFieldChange = onFieldChange;
    this.activeTab = 'design';

    this.init();
  }

  init() {
    if (!this.el) return;

    // Tabs toggle
    const tabButtons = this.el.querySelectorAll('.inspector-tab-btn');
    const tabPanes = this.el.querySelectorAll('.inspector-tab-pane');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        tabPanes.forEach(pane => {
          if (pane.id === `tab-pane-${targetTab}`) {
            pane.classList.remove('hidden');
          } else {
            pane.classList.add('hidden');
          }
        });
      });
    });

    // Inputs change listeners (input and change)
    this.el.querySelectorAll('input, textarea, select').forEach(input => {
      input.addEventListener('input', (e) => {
        if (this.onFieldChange) {
          this.onFieldChange(e.target.id, e.target.value);
        }
      });
    });
  }

  updateFromVariant(variant) {
    populateInspectorFromVariant(variant, this.el);
  }
}
