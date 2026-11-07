/**
 * Mailora.ai — Standard Application & API Errors
 */

export class AppError extends Error {
  constructor(message, code = 'APP_ERROR', status = 400, details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class AuthError extends AppError {
  constructor(message, code = 'AUTH_ERROR', details = null) {
    super(message, code, 401, details);
    this.name = 'AuthError';
  }
}

export class InsufficientCreditsError extends AppError {
  constructor(message = 'Tài khoản không đủ Credits để thực hiện tác vụ này.', details = null) {
    super(message, 'INSUFFICIENT_CREDITS', 402, details);
    this.name = 'InsufficientCreditsError';
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Quá nhiều yêu cầu. Vui lòng thử lại sau giây lát.', details = null) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429, details);
    this.name = 'RateLimitError';
  }
}

export function normalizeErrorMessage(error) {
  if (!error) return 'Đã có lỗi không xác định xảy ra.';
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  return 'Lỗi hệ thống. Vui lòng thử lại sau.';
}
