/**
 * Mailora.ai — Centralized API Client
 * Secure HTTP client handling session tokens, timeouts, retries, and errors.
 */

import { API_CONFIG } from '../config/api.config.js';
import { supabase } from '../config/supabase.config.js';
import { AppError, AuthError, RateLimitError, InsufficientCreditsError } from '../utils/errors.js';

class ApiClient {
  constructor() {
    this.config = API_CONFIG;
  }

  async getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (supabase && supabase.auth) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
      } catch (_) {}
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const {
      method = 'POST',
      body = null,
      idempotencyKey = null,
      timeout = this.config.timeout,
      retryCount = 0
    } = options;

    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${this.config.functionsBaseUrl}${endpoint}`;

    const headers = await this.getAuthHeaders();
    if (idempotencyKey) {
      headers['X-Idempotency-Key'] = idempotencyKey;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 401) {
          throw new AuthError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        if (response.status === 402 || (data && data.error && data.error.code === 'INSUFFICIENT_CREDITS')) {
          throw new InsufficientCreditsError(data?.error?.message || 'Không đủ Credits.');
        }
        if (response.status === 429) {
          throw new RateLimitError('Hệ thống đang quá tải. Vui lòng thử lại sau giây lát.');
        }

        const message = data?.error?.message || data?.message || `Lỗi máy chủ (${response.status})`;
        throw new AppError(message, data?.error?.code || 'SERVER_ERROR', response.status, data);
      }

      return data;
    } catch (err) {
      clearTimeout(timeoutId);

      if (err.name === 'AbortError') {
        throw new AppError('Yêu cầu vượt quá thời gian chờ (Timeout). Vui lòng thử lại.', 'TIMEOUT_ERROR', 408);
      }

      // Safe retry for idempotent read-only or network errors
      if (retryCount < this.config.retry.maxAttempts && !options.isCreditConsuming && !idempotencyKey) {
        await new Promise(res => setTimeout(res, this.config.retry.delayMs * Math.pow(this.config.retry.backoffFactor, retryCount)));
        return this.request(endpoint, { ...options, retryCount: retryCount + 1 });
      }

      throw err;
    }
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }
}

export const apiClient = new ApiClient();
