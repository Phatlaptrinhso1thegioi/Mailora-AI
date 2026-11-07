/**
 * Mailora.ai — Validation Utilities
 */

export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
  return re.test(email.trim());
}

export function isValidPassword(password) {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6;
}

export function validateCampaignPrompt(prompt) {
  if (!prompt || typeof prompt !== 'string') {
    return { valid: false, error: 'Vui lòng nhập mô tả chiến dịch hoặc tên sản phẩm.' };
  }
  const clean = prompt.trim();
  if (clean.length < 2) {
    return { valid: false, error: 'Mô tả quá ngắn. Vui lòng nhập ít nhất 2 ký tự (Ví dụ: phở, gym, bán xe).' };
  }
  return { valid: true, clean };
}
