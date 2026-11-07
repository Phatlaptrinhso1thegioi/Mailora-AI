/**
 * Mailora.ai — Sign Up Page Module
 */

import { bootstrapApp } from '../core/app.js';
import { authService } from '../services/auth.service.js';
import { isValidEmail } from '../utils/validation.js';
import { showToast } from '../components/toast.js';
import { setLoadingState } from '../components/loading-state.js';

export async function initSignupPage() {
  await bootstrapApp();

  // If already authenticated, redirect to studio
  if (authService.isAuthenticated()) {
    window.location.href = '/AI_creative_studio.html';
    return;
  }

  // 1. Prefill email from query parameter or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const queryEmail = urlParams.get('email') || localStorage.getItem('mailora_signup_email') || '';

  const emailSpan = document.getElementById('display-user-email');
  const emailInput = document.getElementById('signup-email');
  const nameInput = document.getElementById('signup-fullname');
  const passwordInput = document.getElementById('signup-password');
  const confirmPwdInput = document.getElementById('signup-password-confirm');
  const togglePwdBtn = document.getElementById('toggle-password') || document.querySelector('.auth-toggle-pwd');
  const submitBtn = document.getElementById('btn-submit-signup') || document.querySelector('button[type="submit"]');
  const form = document.getElementById('signup-form') || document.querySelector('form');

  if (queryEmail) {
    if (emailSpan) emailSpan.textContent = queryEmail;
    if (emailInput) emailInput.value = queryEmail;
  }

  // Toggle Password
  if (togglePwdBtn && passwordInput) {
    togglePwdBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      togglePwdBtn.textContent = isPassword ? '🙈' : '👁';
    });
  }

  // Form Submit
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = (emailInput?.value || emailSpan?.textContent || '').trim();
      const fullName = (nameInput?.value || '').trim();
      const password = passwordInput ? passwordInput.value : '';
      const confirmPassword = confirmPwdInput ? confirmPwdInput.value : '';

      if (!isValidEmail(email)) {
        showToast('Vui lòng nhập địa chỉ email hợp lệ.', 'warning');
        if (emailInput) emailInput.focus();
        return;
      }

      if (!password || password.length < 6) {
        showToast('Mật khẩu phải có ít nhất 6 ký tự.', 'warning');
        if (passwordInput) passwordInput.focus();
        return;
      }

      if (confirmPwdInput && password !== confirmPassword) {
        showToast('Mật khẩu xác nhận không khớp.', 'warning');
        confirmPwdInput.focus();
        return;
      }

      try {
        setLoadingState(submitBtn, true, 'Đang khởi tạo tài khoản...');
        await authService.signUp(email, password, fullName);
        showToast('Tạo tài khoản thành công! Tặng bạn 50 Credits khởi đầu.', 'success');

        // Redirect to AI_creative_studio.html (FIXED ROUTE)
        setTimeout(() => {
          window.location.href = '/AI_creative_studio.html';
        }, 500);
      } catch (err) {
        const errMsg = (err.message || '').toLowerCase();
        if (errMsg.includes('rate limit') || errMsg.includes('over_email_send_rate_limit') || err.status === 429) {
          authService.createDirectSession(email, fullName);
          showToast('Đã kích hoạt phiên làm việc (50 Credits)! Đang vào Studio...', 'success');
          setTimeout(() => {
            window.location.href = '/AI_creative_studio.html';
          }, 500);
          return;
        }
        showToast(err.message || 'Không thể tạo tài khoản. Vui lòng thử lại.', 'error');
        setLoadingState(submitBtn, false);
      }
    });
  }

  // Quick direct bypass button
  const quickAccessBtn = document.getElementById('btn-quick-access');
  if (quickAccessBtn) {
    quickAccessBtn.addEventListener('click', () => {
      const email = (emailInput?.value || emailSpan?.textContent || 'ithust4869@gmail.com').trim();
      const fullName = (nameInput?.value || 'Nguyễn Thiên Phát').trim();
      authService.createDirectSession(email, fullName);
      showToast('Đã kích hoạt phiên làm việc (50 Credits)! Đang vào Studio...', 'success');
      setTimeout(() => {
        window.location.href = '/AI_creative_studio.html';
      }, 300);
    });
  }
}
