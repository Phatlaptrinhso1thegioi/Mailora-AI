/**
 * Mailora.ai — Security Utilities
 * XSS prevention, HTML escaping, safe URL sanitization.
 */

export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '#';
  const clean = url.trim();
  if (/^(?:https?:\/\/|mailto:|tel:)/i.test(clean)) {
    return clean;
  }
  if (clean.startsWith('/') || clean.startsWith('./')) {
    return clean;
  }
  return '#';
}

export function sanitizeTextContent(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/<[^>]*>/g, '').trim();
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
