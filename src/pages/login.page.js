/**
 * Mailora.ai — Login Page Module
 */

import { bootstrapApp } from '../core/app.js';
import { authService } from '../services/auth.service.js';
import { isValidEmail } from '../utils/validation.js';
import { showToast } from '../components/toast.js';
import { setLoadingState } from '../components/loading-state.js';

export async function initLoginPage() {
  await bootstrapApp();

  // If already authenticated, redirect to studio
  if (authService.isAuthenticated()) {
    window.location.href = '/AI_creative_studio.html';
    return;
  }

  const form = document.getElementById('login-form') || document.querySelector('form');
  const emailInput = document.getElementById('login-email') || document.querySelector('input[type="email"]');
  const passwordInput = document.getElementById('login-password') || document.querySelector('input[type="password"]');
  const togglePwdBtn = document.getElementById('toggle-password') || document.querySelector('.auth-toggle-pwd');
  const submitBtn = document.getElementById('btn-submit-login') || form?.querySelector('button[type="submit"]');

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

      const email = emailInput ? emailInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value : '';

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

      try {
        setLoadingState(submitBtn, true, 'Đang đăng nhập...');
        await authService.signIn(email, password);
        showToast('Đăng nhập thành công! Đang chuyển hướng...', 'success');
        setTimeout(() => {
          window.location.href = '/AI_creative_studio.html';
        }, 500);
      } catch (err) {
        showToast(err.message || 'Email hoặc mật khẩu không chính xác.', 'error');
        setLoadingState(submitBtn, false);
      }
    });
  }

  // Forgot password
  const forgotBtn = document.getElementById('forgot-password-link');
  if (forgotBtn && emailInput) {
    forgotBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      if (!isValidEmail(email)) {
        showToast('Vui lòng nhập email vào ô trên để nhận liên kết khôi phục.', 'warning');
        emailInput.focus();
        return;
      }

      try {
        await authService.resetPassword(email);
        showToast('Đã gửi email khôi phục mật khẩu. Vui lòng kiểm tra hộp thư!', 'success');
      } catch (err) {
        showToast(err.message || 'Không thể gửi email khôi phục.', 'error');
      }
    });
  }

  // Demo / Quick Access Button
  const demoBtn = document.getElementById('btn-demo-login') || document.querySelector('button[onclick*="AI_creative_studio"]');
  if (demoBtn) {
    demoBtn.removeAttribute('onclick');
    demoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = emailInput?.value?.trim() || 'demo@mailora.ai';
      authService.createDirectSession(email, email.split('@')[0]);
      showToast('Đã khởi tạo phiên đăng nhập! Đang vào Studio...', 'success');
      setTimeout(() => {
        window.location.href = '/AI_creative_studio.html';
      }, 300);
    });
  }
}
