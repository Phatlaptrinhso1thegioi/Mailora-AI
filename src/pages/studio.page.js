/**
 * Mailora.ai — Creative Studio Page Master Controller
 */

import { bootstrapApp } from '../core/app.js';
import { stateManager } from '../core/state-manager.js';
import { eventBus, EVENTS } from '../core/event-bus.js';
import { authService } from '../services/auth.service.js';
import { geminiService } from '../services/gemini.service.js';
import { campaignService } from '../services/campaign.service.js';
import { mediaService } from '../services/media.service.js';
import { brandKitService } from '../services/brandkit.service.js';
import { creditsService } from '../services/credits.service.js';
import { generateEmailHtml } from '../modules/email/email-html-generator.js';
import { renderVariantToCanvas, syncInspectorToVariant, populateInspectorFromVariant } from '../modules/email/email-editor.js';
import { copyEmailHtml, downloadEmailHtmlFile, copyCampaignJson } from '../modules/email/email-export.js';
import { updateIframePreview, setDevicePreviewMode } from '../modules/email/email-preview.js';
import { runQualityAssurance } from '../modules/quality/quality-assurance.js';
import { uploadImageFile } from '../modules/media/image-uploader.js';
import { getBenchmarkPreset } from '../modules/ai/prompt-manager.js';
import { StudioHeader } from '../components/header.js';
import { StudioSidebar } from '../components/sidebar.js';
import { FloatingPrompt } from '../components/floating-prompt.js';
import { AdaptiveInspector } from '../components/adaptive-inspector.js';
import { Modal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { setLoadingState } from '../components/loading-state.js';
import { formatDate } from '../utils/format.js';

export async function initStudioPage() {
  await bootstrapApp();

  // 1. Session verification & Auth Guard
  let user = stateManager.getUser();
  if (!user) {
    const localSession = localStorage.getItem('mailora_active_session');
    if (localSession) {
      try {
        const parsed = JSON.parse(localSession);
        user = {
          id: parsed.id || 'usr_direct',
          email: parsed.email || 'ithust4869@gmail.com',
          full_name: parsed.full_name || (parsed.email ? parsed.email.split('@')[0] : 'User')
        };
        stateManager.setState({ user, credits: parsed.credits ?? 50 });
      } catch (_) {}
    }
  }

  if (!user) {
    user = {
      id: 'usr_guest',
      email: 'demo@mailora.ai',
      full_name: 'Khách hàng Mailora',
      credits: 50,
      plan: 'FREE'
    };
    stateManager.setState({ user, credits: 50 });
    localStorage.setItem('mailora_active_session', JSON.stringify({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: 'guest',
      credits: 50,
      loggedInAt: Date.now()
    }));
  }

  // 2. Setup Header & Sidebar
  const header = new StudioHeader(document.querySelector('header'));
  const sidebar = new StudioSidebar(document.querySelector('aside'), {
    onNewCampaign: handleNewCampaign,
    onOpenHistory: openHistoryDrawer,
    onOpenMedia: openMediaModal,
    onOpenBrandKit: openBrandKitModal
  });

  // 3. Setup Inspector
  const inspector = new AdaptiveInspector(document.querySelector('aside.lg\\:col-span-3') || document.getElementById('inspector-panel'), (fieldId, value) => {
    const activeVariant = stateManager.getActiveVariant();
    if (activeVariant) {
      syncInspectorToVariant(activeVariant, fieldId, value);
      const state = stateManager.getState();
      renderCanvas(activeVariant, state);
      updateQa(activeVariant, state);
    }
  });

  // 4. Setup Floating AI Prompt
  const floatingPrompt = new FloatingPrompt(document.getElementById('studio-prompt-float'), {
    onSubmit: handleGenerateCampaign
  });

  // 5. Setup Modals & Bind Global Handlers
  setupAllModals();
  bindGlobalStudioHandlers(header, sidebar);

  // Pre-seed Gemini API Key from environment if available
  const envKey = (typeof window !== 'undefined' && window.__VERCEL_GEMINI_KEY__) || import.meta.env?.VITE_GEMINI_API_KEY || import.meta.env?.GEMINI_API_KEY || '';
  if (!localStorage.getItem('mailora_gemini_api_key') && envKey) {
    localStorage.setItem('mailora_gemini_api_key', envKey);
  }

  // 6. Setup Device & View Mode Toggles
  setupViewToggles();

  // 7. Setup Export Actions
  setupExportActions();

  // 8. Setup Benchmark Buttons
  setupBenchmarkButtons();

  // 9. Check API Health
  await checkAndDisplayApiStatus(header);

  // 10. Load Workspace Counts
  await refreshWorkspaceData(sidebar);

  // 11. Canvas event delegation (Back to Selection, Upload image on hover)
  setupCanvasEvents();

  // 12. Check URL prompt handoff
  const urlParams = new URLSearchParams(window.location.search);
  const handoffPrompt = urlParams.get('prompt');
  if (handoffPrompt) {
    const promptInput = document.getElementById('prompt-input');
    if (promptInput) promptInput.value = handoffPrompt;
    window.history.replaceState({}, document.title, window.location.pathname);
    handleGenerateCampaign(handoffPrompt, '');
  }
}

async function handleGenerateCampaign(promptText, ctaUrl) {
  const generateBtn = document.getElementById('generate-btn');
  try {
    setLoadingState(generateBtn, true, 'AI đang tạo chiến dịch...');
    stateManager.setState({ isGenerating: true });

    const result = await geminiService.generateCampaign(promptText, { ctaUrl });

    stateManager.setState({
      structuredData: result,
      variants: result.variants,
      selectedIndex: 0,
      activeVariant: result.variants[0],
      isGenerating: false
    });

    // Update credits
    await creditsService.getBalance();

    // Show Selection Stage
    const selectionStage = document.getElementById('selectionStage');
    const selectedStage = document.getElementById('selectedStage');
    const placeholder = document.getElementById('initialPlaceholder');
    const variantsGrid = document.getElementById('variantsGrid');

    if (placeholder) placeholder.classList.add('hidden');
    if (selectionStage) selectionStage.classList.remove('hidden');
    if (selectedStage) selectedStage.classList.add('hidden');

    // Update Brand Intelligence Bar
    updateBrandIntelBar(result);

    // Render 4 Cards in variantsGrid
    if (variantsGrid) {
      renderFourCardsHtml(result.variants, variantsGrid, (selectedIdx) => {
        selectAndOpenVariant(selectedIdx);
      });
    }

    // Auto-save to history
    await campaignService.saveCampaign({
      brandName: result.brandName,
      subject: result.variants[0].subject,
      prompt: promptText,
      userCtaUrl: ctaUrl,
      imageUrl: result.heroImage,
      variants: result.variants,
      structuredData: result,
      selectedIndex: 0
    });

    showToast('Tạo chiến dịch 4 phong cách thành công! Hãy chọn 1 mẫu bên dưới.', 'success');
  } catch (err) {
    console.error('[GenerateCampaign] Error:', err);
    showToast(err.message || 'Không thể tạo chiến dịch.', 'error');
  } finally {
    setLoadingState(generateBtn, false);
    stateManager.setState({ isGenerating: false });
  }
}

function updateBrandIntelBar(result) {
  const brandEl = document.getElementById('intel-brand-name');
  const audienceEl = document.getElementById('intel-audience');
  const artEl = document.getElementById('intel-art-direction');
  const offerEl = document.getElementById('intel-offer-status');
  const titleEl = document.getElementById('selection-brand-title');
  const industryPill = document.getElementById('selection-industry-pill');

  if (brandEl) brandEl.textContent = result.brandName;
  if (audienceEl) audienceEl.textContent = result.targetAudience;
  if (artEl) artEl.textContent = result.artDirection;
  if (offerEl) offerEl.textContent = result.hasExplicitOffer ? `Ưu đãi: ${result.extractedOffer}` : 'Anti-Fabrication: An toàn';
  if (titleEl) titleEl.textContent = result.brandName;
  if (industryPill) industryPill.textContent = result.industry;
}

function renderFourCardsHtml(variants, container, onSelect) {
  container.innerHTML = variants.map((v, idx) => {
    const theme = v.theme || {};
    return `
      <div class="variant-card-box p-5 rounded-2xl border-2 border-gray-200 bg-white hover:border-[#6655E8] hover:shadow-lg transition cursor-pointer flex flex-col justify-between" data-index="${idx}">
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-[11px] font-bold tracking-wider uppercase text-[#6655E8]">${v.badge || `MẪU #${idx + 1}`}</span>
            <span class="text-xs font-semibold text-gray-400">#0${idx + 1}</span>
          </div>
          <h3 class="font-bold text-base text-gray-900 mb-2 leading-snug line-clamp-2">${v.headline || v.subject}</h3>
          <p class="text-xs text-gray-500 mb-4 line-clamp-3">${v.body || v.subheadline || ''}</p>
        </div>
        <div class="pt-3 border-t border-gray-100 flex items-center justify-between">
          <span class="text-[11px] font-medium text-gray-400 font-mono">${theme.font_family || 'Plus Jakarta Sans'}</span>
          <button type="button" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#6655E8] text-white hover:bg-[#5745D5] transition">
            Chọn mẫu này →
          </button>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('[data-index]').forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.getAttribute('data-index'), 10);
      onSelect(idx);
    });
  });
}

function selectAndOpenVariant(index) {
  stateManager.setSelectedIndex(index);
  const state = stateManager.getState();
  const variant = state.variants[index];

  const selectionStage = document.getElementById('selectionStage');
  const selectedStage = document.getElementById('selectedStage');

  if (selectionStage) selectionStage.classList.add('hidden');
  if (selectedStage) selectedStage.classList.remove('hidden');

  renderCanvas(variant, state);
  updateQa(variant, state);

  // Update Inspector inputs
  populateInspectorFromVariant(variant, document.querySelector('aside.lg\\:col-span-3'));

  showToast(`Đã mở mẫu: ${variant.style_name || `Mẫu #${index + 1}`}`);
}

function renderCanvas(variant, state) {
  const canvasCard = document.getElementById('canvas-email-card');
  const iframe = document.getElementById('table-email-iframe');

  if (canvasCard) {
    renderVariantToCanvas(variant, canvasCard, {
      brandName: state.structuredData?.brandName || 'MAILORA BRAND',
      imageUrl: state.structuredData?.heroImage || ''
    });
  }

  if (iframe) {
    updateIframePreview(iframe, variant, {
      brandName: state.structuredData?.brandName || 'MAILORA BRAND',
      imageUrl: state.structuredData?.heroImage || '',
      userCtaUrl: state.structuredData?.userCtaUrl || '#'
    });
  }
}

function updateQa(variant, state) {
  const qaReport = runQualityAssurance(variant, {
    brandName: state.structuredData?.brandName || 'MAILORA BRAND',
    hasExplicitOffer: state.structuredData?.hasExplicitOffer,
    imageUrl: state.structuredData?.heroImage || ''
  });

  const badge = document.getElementById('qa-score-badge');
  if (badge) {
    badge.textContent = `QA: ${qaReport.overallScore}/100`;
    badge.className = qaReport.overallScore >= 80 
      ? 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200' 
      : 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200';
  }

  stateManager.setState({ lastQaReport: qaReport });
}

function handleNewCampaign() {
  document.getElementById('prompt-input').value = '';
  const selectionStage = document.getElementById('selectionStage');
  const selectedStage = document.getElementById('selectedStage');
  const placeholder = document.getElementById('initialPlaceholder');

  if (selectionStage) selectionStage.classList.add('hidden');
  if (selectedStage) selectedStage.classList.add('hidden');
  if (placeholder) placeholder.classList.remove('hidden');

  stateManager.setState({
    structuredData: null,
    variants: [],
    selectedIndex: 0,
    activeVariant: null
  });

  showToast('Đã bắt đầu phiên làm việc mới.');
}

function setupViewToggles() {
  const btnDesktop = document.getElementById('device-desktop-btn');
  const btnMobile = document.getElementById('device-mobile-btn');
  const canvasWrapper = document.getElementById('canvas-email-card')?.parentElement;

  if (btnDesktop && btnMobile && canvasWrapper) {
    btnDesktop.addEventListener('click', () => {
      btnDesktop.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-gray-900 shadow-sm transition';
      btnMobile.className = 'px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 transition';
      setDevicePreviewMode(canvasWrapper, 'desktop');
      stateManager.setState({ deviceMode: 'desktop' });
    });

    btnMobile.addEventListener('click', () => {
      btnMobile.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-gray-900 shadow-sm transition';
      btnDesktop.className = 'px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 transition';
      setDevicePreviewMode(canvasWrapper, 'mobile');
      stateManager.setState({ deviceMode: 'mobile' });
    });
  }

  const btnCanvas = document.getElementById('view-canvas-btn');
  const btnTable = document.getElementById('view-table-btn');
  const canvasCard = document.getElementById('canvas-email-card');
  const iframe = document.getElementById('table-email-iframe');

  if (btnCanvas && btnTable) {
    btnCanvas.addEventListener('click', () => {
      btnCanvas.className = 'px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-gray-900 shadow-sm transition cursor-pointer';
      btnTable.className = 'px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 transition cursor-pointer';
      if (canvasCard) canvasCard.classList.remove('hidden');
      if (iframe) iframe.classList.add('hidden');
      stateManager.setState({ viewMode: 'visual' });
    });

    btnTable.addEventListener('click', () => {
      btnTable.className = 'px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-gray-900 shadow-sm transition cursor-pointer';
      btnCanvas.className = 'px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 transition cursor-pointer';
      if (canvasCard) canvasCard.classList.add('hidden');
      if (iframe) {
        iframe.classList.remove('hidden');
        const state = stateManager.getState();
        const activeVariant = stateManager.getActiveVariant();
        if (activeVariant) {
          updateIframePreview(iframe, activeVariant, {
            brandName: state.structuredData?.brandName || 'MAILORA BRAND',
            imageUrl: state.structuredData?.heroImage || '',
            userCtaUrl: state.structuredData?.userCtaUrl || '#'
          });
        }
      }
      stateManager.setState({ viewMode: 'html' });
    });
  }
}

function setupExportActions() {
  const copyBtn = document.getElementById('btn-copy-html') || document.querySelector('[onclick*="copyActiveEmailHtml"]');
  const downloadBtn = document.getElementById('btn-download-html') || document.querySelector('[onclick*="downloadHtmlFile"]');
  const codeBtn = document.querySelector('[onclick*="openCodeModal"]');

  if (copyBtn) {
    copyBtn.onclick = async (e) => {
      e?.preventDefault();
      const activeVariant = stateManager.getActiveVariant();
      if (!activeVariant) {
        showToast('Chưa có email nào để copy. Vui lòng tạo chiến dịch trước.', 'warning');
        return;
      }
      const state = stateManager.getState();
      await copyEmailHtml(activeVariant, {
        brandName: state.structuredData?.brandName,
        imageUrl: state.structuredData?.heroImage
      });
      showToast('Đã sao chép mã nguồn Table HTML chuẩn email clients!', 'success');
    };
  }

  if (downloadBtn) {
    downloadBtn.onclick = (e) => {
      e?.preventDefault();
      const activeVariant = stateManager.getActiveVariant();
      if (!activeVariant) {
        showToast('Chưa có email nào để tải về.', 'warning');
        return;
      }
      const state = stateManager.getState();
      const filename = downloadEmailHtmlFile(activeVariant, {
        brandName: state.structuredData?.brandName,
        imageUrl: state.structuredData?.heroImage
      });
      showToast(`Đã tải về tệp: ${filename}`, 'success');
    };
  }

  if (codeBtn) {
    codeBtn.onclick = (e) => {
      e?.preventDefault();
      const activeVariant = stateManager.getActiveVariant();
      if (!activeVariant) {
        showToast('Chưa có email nào.', 'warning');
        return;
      }
      const state = stateManager.getState();
      const html = generateEmailHtml(activeVariant, {
        brandName: state.structuredData?.brandName,
        imageUrl: state.structuredData?.heroImage
      });

      const modalEl = document.getElementById('code-modal');
      const htmlCodeEl = document.getElementById('modal-html-code');
      const jsonCodeEl = document.getElementById('modal-json-code');

      if (htmlCodeEl) htmlCodeEl.textContent = html;
      if (jsonCodeEl) jsonCodeEl.textContent = JSON.stringify(state.structuredData, null, 2);

      if (modalEl) {
        const modal = new Modal(modalEl);
        modal.open();
      }
    };
  }
}

function setupBenchmarkButtons() {
  const btn = document.querySelector('[onclick*="cycleBenchmarkPreset"]');
  let currentIdx = 0;
  if (btn) {
    btn.onclick = (e) => {
      e?.preventDefault();
      currentIdx = (currentIdx + 1) % 6;
      const preset = getBenchmarkPreset(currentIdx);
      if (preset) {
        const input = document.getElementById('prompt-input');
        if (input) input.value = preset.prompt;
        showToast(`Đã nạp bài test #${preset.code}: ${preset.brand} (${preset.expectedStyle})`);
      }
    };
  }
}

function setupCanvasEvents() {
  // Back to Selection button
  const backButtons = document.querySelectorAll('[onclick*="backToSelection"]');
  backButtons.forEach(btn => {
    btn.onclick = (e) => {
      e?.preventDefault();
      const selectionStage = document.getElementById('selectionStage');
      const selectedStage = document.getElementById('selectedStage');
      if (selectionStage) selectionStage.classList.remove('hidden');
      if (selectedStage) selectedStage.classList.add('hidden');
    };
  });
}

function setupAllModals() {
  // API Key & Model Modal
  const apiKeyModalEl = document.getElementById('apikey-modal');
  if (apiKeyModalEl) {
    const modal = new Modal(apiKeyModalEl);
    const trigger = document.getElementById('api-key-status-btn');
    if (trigger) trigger.onclick = () => modal.open();

    const closeBtns = apiKeyModalEl.querySelectorAll('[onclick*="closeApiKeyModal"]');
    closeBtns.forEach(btn => { btn.onclick = () => modal.close(); });

    const saveBtn = apiKeyModalEl.querySelector('[onclick*="saveApiKeyFromModal"]');
    if (saveBtn) {
      saveBtn.onclick = () => {
        showToast('Đã lưu cấu hình kết nối thành công!');
        modal.close();
      };
    }
  }

  // QA Modal
  const qaModalEl = document.getElementById('qa-modal');
  if (qaModalEl) {
    const modal = new Modal(qaModalEl);
    const trigger = document.getElementById('qa-status-btn');
    if (trigger) {
      trigger.onclick = () => {
        renderQaModal(qaModalEl);
        modal.open();
      };
    }
    const closeBtns = qaModalEl.querySelectorAll('[onclick*="closeQaModal"]');
    closeBtns.forEach(btn => { btn.onclick = () => modal.close(); });
  }

  // Account Modal
  const accountModalEl = document.getElementById('account-modal');
  if (accountModalEl) {
    const modal = new Modal(accountModalEl);
    const trigger = document.getElementById('header-user-btn');
    if (trigger) trigger.onclick = () => modal.open();
    const closeBtns = accountModalEl.querySelectorAll('[onclick*="closeAccountModal"]');
    closeBtns.forEach(btn => { btn.onclick = () => modal.close(); });
  }
}

function renderQaModal(modalEl) {
  const report = stateManager.getState().lastQaReport;
  if (!report) return;

  const scoreBadge = modalEl.querySelector('#qa-score-badge');
  const reportList = modalEl.querySelector('#qa-report-list');

  if (reportList) {
    reportList.innerHTML = report.checks.map(c => `
      <div class="p-3 rounded-xl border ${c.passed ? 'border-emerald-200 bg-emerald-50/50' : 'border-amber-200 bg-amber-50/50'} flex items-start gap-3">
        <span class="${c.passed ? 'text-emerald-600' : 'text-amber-600'} font-bold">${c.passed ? '✓' : '⚠'}</span>
        <div>
          <div class="text-xs font-bold text-gray-900">${c.name} [${c.category}]</div>
          <div class="text-[11px] text-gray-600 mt-0.5">${c.detail}</div>
        </div>
      </div>
    `).join('');
  }
}

async function refreshWorkspaceData(sidebar) {
  try {
    const campaigns = await campaignService.getCampaigns();
    const media = await mediaService.getMediaLibrary();
    sidebar.updateCounts(campaigns.length, media.length);
  } catch (_) {}
}

async function openHistoryDrawer() {
  const drawer = document.getElementById('history-drawer');
  if (!drawer) return;
  drawer.classList.remove('hidden');

  const container = document.getElementById('history-items-container');
  if (container) {
    const campaigns = await campaignService.getCampaigns();
    if (campaigns.length === 0) {
      container.innerHTML = '<div class="py-8 text-center text-xs text-gray-400">Chưa có chiến dịch nào được lưu.</div>';
      return;
    }

    container.innerHTML = campaigns.map(c => `
      <div class="p-3.5 rounded-xl border border-gray-200 bg-white hover:border-[#6655E8] transition cursor-pointer mb-2" data-hist-id="${c.id}">
        <div class="font-bold text-xs text-gray-900 truncate">${c.brand_name || c.brandName}: ${c.campaign_name || c.subject}</div>
        <div class="text-[11px] text-gray-400 mt-1">${formatDate(c.created_at || c.savedAt)}</div>
      </div>
    `).join('');

    container.querySelectorAll('[data-hist-id]').forEach(item => {
      item.onclick = () => {
        const id = item.getAttribute('data-hist-id');
        const camp = campaigns.find(c => c.id === id);
        if (camp) {
          stateManager.setState({
            structuredData: camp.structured_data || camp,
            variants: camp.variants || [],
            selectedIndex: camp.selected_index || 0,
            activeVariant: (camp.variants && camp.variants[0]) || null
          });
          selectAndOpenVariant(camp.selected_index || 0);
          drawer.classList.add('hidden');
        }
      };
    });
  }

  const closeBtns = drawer.querySelectorAll('[onclick*="closeHistoryDrawer"]');
  closeBtns.forEach(b => { b.onclick = () => drawer.classList.add('hidden'); });
}

async function openMediaModal() {
  const mediaModalEl = document.getElementById('media-modal');
  if (!mediaModalEl) return;
  const modal = new Modal(mediaModalEl);
  modal.open();

  const container = document.getElementById('media-grid-container');
  const items = await mediaService.getMediaLibrary();

  if (container) {
    container.innerHTML = items.map(item => `
      <div class="group relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-video cursor-pointer transition hover:shadow-md" data-media-url="${item.url}">
        <img src="${item.url}" alt="${item.name}" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-2">
          <span class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#6655E8] text-white shadow">Chọn ảnh này</span>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('[data-media-url]').forEach(card => {
      card.onclick = () => {
        const url = card.getAttribute('data-media-url');
        const state = stateManager.getState();
        if (state.structuredData) {
          state.structuredData.heroImage = url;
          const activeVariant = stateManager.getActiveVariant();
          if (activeVariant) renderCanvas(activeVariant, state);
        }
        modal.close();
        showToast('Đã áp dụng ảnh mới vào canvas!');
      };
    });
  }

  const closeBtns = mediaModalEl.querySelectorAll('[onclick*="closeMediaModal"]');
  closeBtns.forEach(b => { b.onclick = () => modal.close(); });
}

async function openBrandKitModal() {
  const brandKitModalEl = document.getElementById('brandkit-modal');
  if (!brandKitModalEl) return;
  const modal = new Modal(brandKitModalEl);
  modal.open();

  const kit = await brandKitService.getBrandKit();
  const nameInput = document.getElementById('bk-brand-name');
  const colorInput = document.getElementById('bk-primary-color');
  const fontSelect = document.getElementById('bk-heading-font');
  const urlInput = document.getElementById('bk-cta-url');

  if (nameInput) nameInput.value = kit.brandName || '';
  if (colorInput) colorInput.value = kit.primaryColor || '#6655E8';
  if (fontSelect) fontSelect.value = kit.headingFont || 'Plus Jakarta Sans';
  if (urlInput) urlInput.value = kit.ctaUrl || '';

  const saveBtns = brandKitModalEl.querySelectorAll('[onclick*="saveBrandKit"]');
  saveBtns.forEach(btn => {
    btn.onclick = async () => {
      const updated = {
        brandName: nameInput ? nameInput.value.trim() : kit.brandName,
        primaryColor: colorInput ? colorInput.value : kit.primaryColor,
        headingFont: fontSelect ? fontSelect.value : kit.headingFont,
        ctaUrl: urlInput ? urlInput.value.trim() : kit.ctaUrl
      };
      await brandKitService.saveBrandKit(updated);
      modal.close();
      showToast('Đã lưu thiết lập Brand Kit!', 'success');
    };
  });

  const closeBtns = brandKitModalEl.querySelectorAll('[onclick*="closeBrandKitModal"]');
  closeBtns.forEach(b => { b.onclick = () => modal.close(); });
}

async function checkAndDisplayApiStatus(header) {
  try {
    const res = await geminiService.checkApiStatus();
    if (res && res.success) {
      header.updateApiBadge('connected', res.data.activeModel || 'Gemini API: Đã kết nối');
    } else {
      header.updateApiBadge('disconnected', 'Cấu hình API Key');
    }
  } catch (_) {
    header.updateApiBadge('disconnected', 'Cấu hình API Key');
  }
}

function bindGlobalStudioHandlers(header, sidebar) {
  // 1. API Key Modal Handlers
  window.openApiKeyModal = () => {
    const modal = document.getElementById('apikey-modal');
    if (!modal) return;
    const keyInput = document.getElementById('modal-apikey-input');
    const proxyInput = document.getElementById('modal-proxy-input');
    if (keyInput) {
      keyInput.value =
        localStorage.getItem('mailora_gemini_api_key') ||
        sessionStorage.getItem('mailora_gemini_api_key') ||
        (typeof window !== 'undefined' && window.__VERCEL_GEMINI_KEY__) ||
        (import.meta.env?.VITE_GEMINI_API_KEY || import.meta.env?.GEMINI_API_KEY || '');
    }
    if (proxyInput) {
      proxyInput.value = localStorage.getItem('mailora_gemini_proxy_url') || '';
    }
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  };

  window.closeApiKeyModal = () => {
    const modal = document.getElementById('apikey-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  window.saveApiKeyFromModal = async () => {
    const keyInput = document.getElementById('modal-apikey-input');
    const proxyInput = document.getElementById('modal-proxy-input');
    const key = keyInput ? keyInput.value.trim() : '';
    const proxy = proxyInput ? proxyInput.value.trim() : '';

    if (key) {
      localStorage.setItem('mailora_gemini_api_key', key);
      sessionStorage.setItem('mailora_gemini_api_key', key);
    } else {
      localStorage.removeItem('mailora_gemini_api_key');
      sessionStorage.removeItem('mailora_gemini_api_key');
    }

    if (proxy) {
      localStorage.setItem('mailora_gemini_proxy_url', proxy);
    } else {
      localStorage.removeItem('mailora_gemini_proxy_url');
    }

    window.closeApiKeyModal();
    await checkAndDisplayApiStatus(header);
    showToast('Đã lưu cấu hình kết nối Gemini API thành công!', 'success');
  };

  window.clearSavedApiKey = async () => {
    localStorage.removeItem('mailora_gemini_api_key');
    sessionStorage.removeItem('mailora_gemini_api_key');
    localStorage.removeItem('mailora_gemini_proxy_url');
    const keyInput = document.getElementById('modal-apikey-input');
    const proxyInput = document.getElementById('modal-proxy-input');
    if (keyInput) keyInput.value = '';
    if (proxyInput) proxyInput.value = '';
    await checkAndDisplayApiStatus(header);
    showToast('Đã xóa API Key khỏi trình duyệt!', 'info');
  };

  // 2. Export & Code Modal
  window.copyActiveEmailHtml = async () => {
    const activeVariant = stateManager.getActiveVariant();
    const state = stateManager.getState();
    if (!activeVariant) {
      showToast('Vui lòng tạo hoặc chọn một mẫu email trước!', 'warning');
      return;
    }
    const html = generateEmailHtml(activeVariant, state.structuredData, state.deviceMode);
    await copyEmailHtml(html);
    showToast('Đã sao chép Table HTML vào Clipboard!', 'success');
  };

  window.downloadHtmlFile = () => {
    const activeVariant = stateManager.getActiveVariant();
    const state = stateManager.getState();
    if (!activeVariant) {
      showToast('Chưa có email nào để tải xuống.', 'warning');
      return;
    }
    const html = generateEmailHtml(activeVariant, state.structuredData, state.deviceMode);
    downloadEmailHtmlFile(html, `mailora-${activeVariant.theme?.header_tag || 'campaign'}-${Date.now()}.html`);
    showToast('Đã tải xuống file .HTML thành công!', 'success');
  };

  window.openCodeModal = () => {
    const modal = document.getElementById('code-modal');
    if (!modal) return;
    const activeVariant = stateManager.getActiveVariant();
    const state = stateManager.getState();
    const html = activeVariant ? generateEmailHtml(activeVariant, state.structuredData, state.deviceMode) : '<!-- Chưa có email nào được tạo -->';
    const htmlEl = document.getElementById('modal-html-code');
    const jsonEl = document.getElementById('modal-json-code');
    if (htmlEl) htmlEl.textContent = html;
    if (jsonEl) jsonEl.textContent = JSON.stringify(state.structuredData || {}, null, 2);
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  };

  window.closeCodeModal = () => {
    const modal = document.getElementById('code-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  window.copyJsonData = async () => {
    const state = stateManager.getState();
    await copyCampaignJson(state.structuredData || {});
    showToast('Đã sao chép Structured JSON Schema!', 'success');
  };

  // 3. QA Modal
  window.openQaModal = () => {
    const modal = document.getElementById('qa-modal');
    if (!modal) return;
    const activeVariant = stateManager.getActiveVariant();
    const state = stateManager.getState();
    if (activeVariant && !state.lastQaReport) {
      const report = runQualityAssurance(activeVariant, state.structuredData);
      stateManager.setState({ lastQaReport: report });
    }
    renderQaModal(modal);
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  };

  window.closeQaModal = () => {
    const modal = document.getElementById('qa-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  // 4. Account Modal
  window.openAccountModal = () => {
    const modal = document.getElementById('account-modal');
    if (!modal) return;
    const user = stateManager.getUser();
    const nameInput = document.getElementById('acc-input-name');
    const emailLabel = document.getElementById('acc-modal-email');
    const nameLabel = document.getElementById('acc-modal-display-name');
    if (nameInput) nameInput.value = user?.full_name || '';
    if (emailLabel) emailLabel.textContent = user?.email || 'ithust4869@gmail.com';
    if (nameLabel) nameLabel.textContent = user?.full_name || 'Nguyễn Thiên Phát';
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  };

  window.closeAccountModal = () => {
    const modal = document.getElementById('account-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  window.saveAccountProfile = () => {
    const nameInput = document.getElementById('acc-input-name');
    const newName = nameInput ? nameInput.value.trim() : '';
    if (newName) {
      const user = stateManager.getUser();
      stateManager.setState({ user: { ...user, full_name: newName } });
      header.renderUserInfo();
      showToast('Đã cập nhật thông tin tài khoản!', 'success');
      window.closeAccountModal();
    }
  };

  window.handleAddNewAccount = () => {
    window.location.href = '/login.html';
  };

  // 5. Brand Kit Modal
  window.openBrandKitModal = () => openBrandKitModal();
  window.closeBrandKitModal = () => {
    const modal = document.getElementById('brandkit-modal');
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
  };

  window.saveBrandKit = async () => {
    const nameInput = document.getElementById('bk-brand-name');
    const colorInput = document.getElementById('bk-primary-color');
    const fontSelect = document.getElementById('bk-heading-font');
    const urlInput = document.getElementById('bk-cta-url');
    const updated = {
      brandName: nameInput ? nameInput.value.trim() : '',
      primaryColor: colorInput ? colorInput.value : '#6655E8',
      headingFont: fontSelect ? fontSelect.value : 'Plus Jakarta Sans',
      ctaUrl: urlInput ? urlInput.value.trim() : ''
    };
    await brandKitService.saveBrandKit(updated);
    window.closeBrandKitModal();
    showToast('Đã lưu thiết lập Brand Kit!', 'success');
  };

  window.applyBrandKitToActiveCampaign = async () => {
    const kit = await brandKitService.getBrandKit();
    const activeVariant = stateManager.getActiveVariant();
    if (activeVariant && kit) {
      syncInspectorToVariant(activeVariant, 'primaryColor', kit.primaryColor);
      const state = stateManager.getState();
      renderCanvas(activeVariant, state);
      showToast('Đã áp dụng Brand Kit vào chiến dịch hiện tại!', 'success');
      window.closeBrandKitModal();
    }
  };

  // 6. History Drawer
  window.openHistoryDrawer = () => openHistoryDrawer();
  window.closeHistoryDrawer = () => {
    const drawer = document.getElementById('history-drawer');
    if (drawer) drawer.classList.add('hidden');
  };

  window.clearAllCampaignHistory = async () => {
    await campaignService.clearAllCampaigns();
    await refreshWorkspaceData(sidebar);
    window.closeHistoryDrawer();
    showToast('Đã xóa toàn bộ lịch sử chiến dịch!', 'info');
  };

  window.saveCurrentCampaignToHistory = async (showNotification = true) => {
    const state = stateManager.getState();
    if (!state.structuredData) {
      if (showNotification) showToast('Chưa có chiến dịch nào để lưu!', 'warning');
      return;
    }
    await campaignService.saveCampaign({
      brandName: state.structuredData.brandName,
      subject: state.structuredData.subject,
      variants: state.variants,
      selectedIndex: state.selectedIndex,
      structured_data: state.structuredData
    });
    await refreshWorkspaceData(sidebar);
    if (showNotification) showToast('Đã lưu chiến dịch vào lịch sử thành công!', 'success');
  };

  // 7. Media Library Modal
  window.openMediaModal = () => openMediaModal();
  window.closeMediaModal = () => {
    const modal = document.getElementById('media-modal');
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
  };

  window.filterMediaLibrary = async (filter) => {
    const container = document.getElementById('media-grid-container');
    if (!container) return;
    const items = await mediaService.getMediaLibrary();
    const filtered = filter === 'all' ? items : items.filter(i => filter === 'ai' ? i.source === 'ai' : i.source === 'upload');
    container.innerHTML = filtered.map(item => `
      <div class="group relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-video cursor-pointer transition hover:shadow-md" data-media-url="${item.url}">
        <img src="${item.url}" alt="${item.name}" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-2">
          <span class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#6655E8] text-white shadow">Chọn ảnh này</span>
        </div>
      </div>
    `).join('');
  };

  window.triggerImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const url = await uploadImageFile(file);
        const state = stateManager.getState();
        if (state.structuredData) {
          state.structuredData.heroImage = url;
          const activeVariant = stateManager.getActiveVariant();
          if (activeVariant) renderCanvas(activeVariant, state);
        }
        showToast('Đã tải ảnh lên thành công!', 'success');
      }
    };
    input.click();
  };

  window.regenerateActiveImage = async () => {
    const activeVariant = stateManager.getActiveVariant();
    if (activeVariant) {
      showToast('AI đang tạo lại hình ảnh Hero mới...', 'info');
      const newImage = await mediaService.generateHeroImage(activeVariant.theme?.header_tag || 'modern');
      const state = stateManager.getState();
      if (state.structuredData) {
        state.structuredData.heroImage = newImage.url;
        renderCanvas(activeVariant, state);
        showToast('Đã cập nhật hình ảnh Hero mới!', 'success');
      }
    }
  };

  // 8. Campaign & Canvas Controls
  window.reopenPromptFloat = () => {
    const promptFloat = document.getElementById('studio-prompt-float');
    if (promptFloat) promptFloat.classList.remove('hidden');
  };

  window.generateAdaptiveCampaign = (force) => {
    const promptInput = document.getElementById('prompt-input');
    const urlInput = document.getElementById('prompt-cta-url');
    const text = promptInput ? promptInput.value.trim() : '';
    const cta = urlInput ? urlInput.value.trim() : '';
    if (!text) {
      showToast('Vui lòng nhập ý tưởng hoặc thông tin thương hiệu vào ô Prompt!', 'warning');
      if (promptInput) promptInput.focus();
      return;
    }
    handleGenerateCampaign(text, cta);
  };

  window.selectVariant = (index) => selectAndOpenVariant(index);

  window.backToSelection = () => {
    const selectionStage = document.getElementById('selectionStage');
    const selectedStage = document.getElementById('selectedStage');
    if (selectionStage) selectionStage.classList.remove('hidden');
    if (selectedStage) selectedStage.classList.add('hidden');
  };

  window.resetInspectorToSelectedStyle = () => {
    const activeVariant = stateManager.getActiveVariant();
    if (activeVariant) {
      populateInspectorFromVariant(activeVariant);
      const state = stateManager.getState();
      renderCanvas(activeVariant, state);
      showToast('Đã khôi phục thiết kế ban đầu của mẫu!', 'info');
    }
  };

  window.resetToDefaultProject = () => {
    stateManager.setState({ structuredData: null, variants: [], activeVariant: null });
    const selectionStage = document.getElementById('selectionStage');
    const selectedStage = document.getElementById('selectedStage');
    const placeholder = document.getElementById('initialPlaceholder');
    if (selectionStage) selectionStage.classList.add('hidden');
    if (selectedStage) selectedStage.classList.add('hidden');
    if (placeholder) placeholder.classList.remove('hidden');
    window.reopenPromptFloat();
    showToast('Đã đưa studio về trạng thái ban đầu sạch sẽ!', 'info');
  };

  window.setPrimaryColor = (color) => {
    const activeVariant = stateManager.getActiveVariant();
    if (activeVariant) {
      syncInspectorToVariant(activeVariant, 'primaryColor', color);
      const state = stateManager.getState();
      renderCanvas(activeVariant, state);
      updateQa(activeVariant, state);
    }
  };

  window.setDeviceMode = (mode) => {
    stateManager.setState({ deviceMode: mode });
    setDevicePreviewMode(mode);
    const activeVariant = stateManager.getActiveVariant();
    const state = stateManager.getState();
    if (activeVariant) renderCanvas(activeVariant, state);
  };

  window.setRenderViewMode = (mode) => {
    stateManager.setState({ renderViewMode: mode });
    const canvasMode = document.getElementById('canvas-render-mode');
    const tableMode = document.getElementById('table-render-mode');
    if (mode === 'table') {
      if (canvasMode) canvasMode.classList.add('hidden');
      if (tableMode) tableMode.classList.remove('hidden');
    } else {
      if (canvasMode) canvasMode.classList.remove('hidden');
      if (tableMode) tableMode.classList.add('hidden');
    }
  };

  window.loadBenchmarkPreset = (index) => {
    const preset = getBenchmarkPreset(index);
    if (preset) {
      const promptInput = document.getElementById('prompt-input');
      const urlInput = document.getElementById('prompt-cta-url');
      if (promptInput) promptInput.value = preset.prompt;
      if (urlInput) urlInput.value = preset.ctaUrl || '';
      showToast(`Đã nạp mẫu: ${preset.title}`, 'info');
      window.reopenPromptFloat();
    }
  };

  window.cycleBenchmarkPreset = () => {
    window._currentPresetIdx = ((window._currentPresetIdx || 0) + 1) % 6;
    window.loadBenchmarkPreset(window._currentPresetIdx);
  };

  window.runBenchmarkTest = (index) => {
    window.loadBenchmarkPreset(index);
    const preset = getBenchmarkPreset(index);
    if (preset) handleGenerateCampaign(preset.prompt, preset.ctaUrl || '');
  };
}
