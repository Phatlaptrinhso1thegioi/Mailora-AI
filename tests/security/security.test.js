import { describe, it, expect } from 'vitest';
import { escapeHtml, sanitizeUrl } from '../../src/utils/security.js';
import { API_CONFIG } from '../../src/config/api.config.js';

describe('Security & XSS Prevention', () => {
  it('escapes dangerous HTML characters to prevent XSS injection', () => {
    const malicious = '<script>alert("xss")</script><img src="x" onerror="alert(1)">';
    const escaped = escapeHtml(malicious);

    expect(escaped).not.toContain('<script>');
    expect(escaped).toContain('&lt;script&gt;');
    expect(escaped).toContain('&lt;img');
  });

  it('sanitizes unsafe javascript: or data: URLs to safe hash', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('#');
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('#');
    expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('#');
    expect(sanitizeUrl('https://mailora.ai')).toBe('https://mailora.ai');
    expect(sanitizeUrl('mailto:contact@mailora.ai')).toBe('mailto:contact@mailora.ai');
  });

  it('guarantees no private Gemini API keys exist in frontend API_CONFIG', () => {
    const configString = JSON.stringify(API_CONFIG);
    expect(configString).not.toContain('GEMINI_API_KEY');
    expect(configString).not.toContain('AIzaSy'); // Google API key prefix
    expect(configString).not.toContain('service_role');
  });
});
