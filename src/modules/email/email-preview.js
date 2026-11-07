/**
 * Mailora.ai — Email Preview Module
 */

import { generateEmailHtml } from './email-html-generator.js';

export function updateIframePreview(iframeElement, variant, options = {}) {
  if (!iframeElement) return;
  const html = generateEmailHtml(variant, options);
  iframeElement.srcdoc = html;
}

export function setDevicePreviewMode(containerElement, mode = 'desktop') {
  if (!containerElement) return;

  if (mode === 'mobile') {
    containerElement.classList.remove('canvas-device-desktop');
    containerElement.classList.add('canvas-device-mobile');
    containerElement.style.maxWidth = '375px';
  } else {
    containerElement.classList.remove('canvas-device-mobile');
    containerElement.classList.add('canvas-device-desktop');
    containerElement.style.maxWidth = '600px';
  }
}
