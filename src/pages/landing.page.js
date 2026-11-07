/**
 * Mailora.ai — Landing Pages (index.html & landing_page.html) Module
 * Handles public landing experience, dynamic auth header rendering,
 * and Copilot prompt handoffs without forceful auto-redirects.
 */

import { bootstrapApp } from '../core/app.js';
import { authService } from '../services/auth.service.js';
import { isValidEmail } from '../utils/validation.js';
import { showToast } from '../components/toast.js';

export async function initLandingPage() {
  await bootstrapApp();

  // 1. Dynamic Header Authentication State (Open AI Studio / Sign out)
  setupDynamicHeaderAuth();

  // 2. Diagonal Columns (index.html)
  setupDiagonalColumns();

  // 3. Email Onboarding Form (index.html hero & bottom)
  setupOnboardingForms();

  // 4. Rotating Keywords (landing_page.html)
  setupRotatingKeywords();

  // 5. Copilot Suggestion Chips (landing_page.html)
  setupCopilotChips();

  // 6. Billing Toggle (landing_page.html)
  setupBillingToggle();
}

function setupDynamicHeaderAuth() {
  const isAuthenticated = authService.isAuthenticated();
  const session = authService.getSession();

  // 1. landing_page.html Header Right Actions
  const landingNav = document.getElementById('landing-auth-nav') || document.querySelector('header .flex.items-center.space-x-3, header .flex.items-center.space-x-4');
  if (landingNav && isAuthenticated && session) {
    const displayName = session.full_name || session.email.split('@')[0];
    landingNav.innerHTML = `
      <div class="flex items-center gap-3">
        <a 
          href="/AI_creative_studio.html" 
          class="bg-gradient-to-r from-emerald-500 to-[#4F39F6] hover:opacity-95 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full transition shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
          title="Mở không gian làm việc Mailora AI Studio"
        >
          <span>✦ Mở AI Studio</span>
          <span>&rarr;</span>
        </a>
        <button 
          type="button"
          id="btn-landing-logout" 
          class="text-xs font-semibold text-zinc-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition cursor-pointer"
          title="Đăng xuất khỏi tài khoản"
        >
          Đăng xuất
        </button>
      </div>
    `;

    document.getElementById('btn-landing-logout')?.addEventListener('click', async () => {
      await authService.signOut();
      window.location.reload();
    });
  }

  // 2. index.html Header Actions
  const indexAuth = document.getElementById('index-auth-actions');
  if (indexAuth) {
    if (isAuthenticated && session) {
      indexAuth.innerHTML = `
        <div class="flex items-center gap-2.5">
          <a 
            href="/AI_creative_studio.html" 
            class="bg-gradient-to-r from-[#6655E8] to-purple-600 hover:opacity-95 text-white font-bold text-xs px-4 py-2 rounded-full transition shadow-md shadow-purple-500/25 flex items-center gap-1.5"
          >
            <span>✦ Mở AI Studio</span>
            <span>&rarr;</span>
          </a>
          <button 
            type="button"
            id="btn-index-logout" 
            class="text-xs font-semibold text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            Đăng xuất
          </button>
        </div>
      `;
      document.getElementById('btn-index-logout')?.addEventListener('click', async () => {
        await authService.signOut();
        window.location.reload();
      });
    } else {
      indexAuth.innerHTML = `
        <a 
          href="/login.html" 
          class="text-xs font-bold text-zinc-400 hover:text-white px-3.5 py-1.5 rounded-lg hover:bg-white/10 transition"
        >
          Đăng nhập
        </a>
      `;
    }
  }
}

function setupDiagonalColumns() {
  const container = document.getElementById('diagonal-columns-container');
  if (!container) return;

  // Add scroll classes to columns if present
  const columns = container.querySelectorAll('.diagonal-column');
  columns.forEach((col, idx) => {
    col.classList.add(idx % 2 === 0 ? 'scroll-up' : 'scroll-down');
  });
}

function setupOnboardingForms() {
  // Hero email submission on index.html
  const forms = document.querySelectorAll('.onboarding-email-form, #hero-onboarding-form, #bottom-onboarding-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const email = input ? input.value.trim() : '';

      if (!isValidEmail(email)) {
        showToast('Vui lòng nhập địa chỉ email hợp lệ.', 'warning');
        return;
      }

      localStorage.setItem('mailora_signup_email', email);
      window.location.href = `/sign_up.html?email=${encodeURIComponent(email)}`;
    });
  });

  // Direct prompt submit on landing_page.html
  const promptForms = document.querySelectorAll('.landing-prompt-form, #hero-prompt-form');
  promptForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="text"], textarea');
      const prompt = input ? input.value.trim() : '';

      if (!prompt) {
        showToast('Vui lòng nhập mô tả hoặc ý tưởng chiến dịch.', 'warning');
        return;
      }

      sessionStorage.setItem('mailora_pending_prompt', prompt);

      if (authService.isAuthenticated()) {
        window.location.href = `/AI_creative_studio.html?prompt=${encodeURIComponent(prompt)}`;
      } else {
        window.location.href = `/login.html?prompt=${encodeURIComponent(prompt)}`;
      }
    });
  });
}

function setupRotatingKeywords() {
  const el = document.getElementById('rotating-keyword');
  if (!el) return;

  const keywords = ['thương mại điện tử', 'thương hiệu thời trang', 'startup SaaS', 'chuỗi nhà hàng F&B', 'thẩm mỹ & mỹ phẩm', 'du lịch nghỉ dưỡng'];
  let idx = 0;

  setInterval(() => {
    idx = (idx + 1) % keywords.length;
    el.style.opacity = '0';
    setTimeout(() => {
      el.textContent = keywords[idx];
      el.style.opacity = '1';
    }, 200);
  }, 2500);
}

function setupCopilotChips() {
  const chips = document.querySelectorAll('.copilot-chip, [data-copilot-prompt]');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-copilot-prompt') || chip.textContent.trim();
      sessionStorage.setItem('mailora_pending_prompt', prompt);

      if (authService.isAuthenticated()) {
        window.location.href = `/AI_creative_studio.html?prompt=${encodeURIComponent(prompt)}`;
      } else {
        window.location.href = `/login.html?prompt=${encodeURIComponent(prompt)}`;
      }
    });
  });
}

function setupBillingToggle() {
  const toggleBtns = document.querySelectorAll('.billing-pill-btn, [data-billing]');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const isYearly = btn.getAttribute('data-billing') === 'yearly';
      document.querySelectorAll('[data-price-monthly]').forEach(priceEl => {
        const monthly = priceEl.getAttribute('data-price-monthly');
        const yearly = priceEl.getAttribute('data-price-yearly');
        priceEl.textContent = isYearly ? yearly : monthly;
      });
    });
  });
}
