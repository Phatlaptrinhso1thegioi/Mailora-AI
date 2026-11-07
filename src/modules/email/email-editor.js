/**
 * Mailora.ai — Email Editor & Two-Way Binding Manager
 * Coordinates real-time sync between Canvas and Right Inspector.
 */

import { eventBus, EVENTS } from '../../core/event-bus.js';

export function populateInspectorFromVariant(variant, containerElement) {
  if (!variant || !containerElement) return;

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  };

  // Content tab
  setVal('insp-input-headline', variant.headline);
  setVal('insp-input-body', variant.body);
  setVal('insp-input-cta', variant.cta_text);
  setVal('insp-input-cta-url', variant.cta_url);
  setVal('insp-input-subject', variant.subject);

  // Theme settings
  if (variant.theme) {
    if (document.getElementById('insp-fontfamily')) {
      document.getElementById('insp-fontfamily').value = variant.theme.font_family || 'Plus Jakarta Sans';
    }
  }
}

export function syncInspectorToVariant(variant, fieldId, value) {
  if (!variant) return variant;

  const map = {
    'insp-input-headline': 'headline',
    'insp-input-body': 'body',
    'insp-input-cta': 'cta_text',
    'insp-input-cta-url': 'cta_url',
    'insp-input-subject': 'subject'
  };

  if (map[fieldId]) {
    variant[map[fieldId]] = value;
  } else if (fieldId === 'insp-fontfamily') {
    if (!variant.theme) variant.theme = {};
    variant.theme.font_family = value;
  } else if (fieldId === 'custom-color-picker' || fieldId === 'insp-primary-color') {
    if (!variant.theme) variant.theme = {};
    variant.theme.cta_bg = value;
  }

  eventBus.emit(EVENTS.CANVAS_CONTENT_CHANGED, variant);
  return variant;
}

export function renderVariantToCanvas(variant, canvasCardElement, options = {}) {
  if (!variant || !canvasCardElement) return;

  const theme = variant.theme || {};

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text || '';
  };

  setText('canvas-brand-tag', options.brandName || 'MAILORA BRAND');
  setText('canvas-eyebrow', variant.eyebrow);
  setText('canvas-headline', variant.headline);
  setText('canvas-subheadline', variant.subheadline);
  setText('canvas-body', variant.body);
  setText('canvas-cta-btn', variant.cta_text);
  setText('preview-subject-bottom', variant.subject);
  setText('preview-preheader-bottom', variant.preheader);

  // Apply colors & fonts
  if (theme.card_bg) canvasCardElement.style.backgroundColor = theme.card_bg;
  if (theme.font_family) canvasCardElement.style.fontFamily = theme.font_family;

  const ctaBtn = document.getElementById('canvas-cta-btn');
  if (ctaBtn && theme.cta_bg) {
    ctaBtn.style.backgroundColor = theme.cta_bg;
    ctaBtn.style.color = theme.cta_color || '#FFFFFF';
    if (theme.cta_radius) ctaBtn.style.borderRadius = theme.cta_radius;
  }

  // Benefits
  const benefitsList = document.getElementById('canvas-benefits-list');
  if (benefitsList && Array.isArray(variant.benefits)) {
    benefitsList.innerHTML = variant.benefits.map(b => `
      <div class="flex items-start gap-2.5 text-xs text-gray-700">
        <span class="text-[#6655E8] font-bold">✓</span>
        <span>${b}</span>
      </div>
    `).join('');
  }

  // Promo box
  const promoWrap = document.getElementById('canvas-promo-wrap');
  const promoText = document.getElementById('canvas-promo-text');
  if (promoWrap) {
    if (variant.promo_box && String(variant.promo_box).trim()) {
      promoWrap.style.display = 'block';
      if (promoText) promoText.textContent = variant.promo_box;
    } else {
      promoWrap.style.display = 'none';
    }
  }

  // Hero image
  const heroImg = document.getElementById('canvas-hero-img');
  if (heroImg && options.imageUrl) {
    heroImg.src = options.imageUrl;
    heroImg.style.display = 'block';
  }
}
