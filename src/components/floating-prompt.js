/**
 * Mailora.ai — Truly Draggable Floating AI Prompt Window
 * Pointer Events (Mouse & Touch), boundary constraints, minimize/restore, and submission.
 */

export class FloatingPrompt {
  constructor(element, options = {}) {
    this.el = element;
    this.handle = options.handle || element.querySelector('#studio-prompt-drag') || element;
    this.minimizeBtn = options.minimizeBtn || element.querySelector('#studio-collapse');
    this.closeBtn = options.closeBtn || element.querySelector('#studio-close');
    this.reopenBtn = options.reopenBtn || document.getElementById('studio-open-prompt');
    this.onSubmit = options.onSubmit || null;

    this.isDragging = false;
    this.isMinimized = false;
    this.startX = 0;
    this.startY = 0;
    this.initialLeft = 0;
    this.initialTop = 0;
    this.savedPosition = null;

    this.init();
  }

  init() {
    if (!this.el) return;

    // Pointer event listeners on handle for drag
    this.handle.addEventListener('pointerdown', this.onPointerDown.bind(this));
    window.addEventListener('pointermove', this.onPointerMove.bind(this));
    window.addEventListener('pointerup', this.onPointerUp.bind(this));

    // Minimize toggle
    if (this.minimizeBtn) {
      this.minimizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMinimize();
      });
    }

    // Close button
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.close();
      });
    }

    // Reopen FAB button
    if (this.reopenBtn) {
      this.reopenBtn.addEventListener('click', () => {
        this.reopen();
      });
    }

    // Form submit
    const submitBtn = this.el.querySelector('#generate-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const input = this.el.querySelector('#prompt-input');
        const ctaInput = this.el.querySelector('#prompt-cta-url');
        const promptText = input ? input.value.trim() : '';
        const ctaUrl = ctaInput ? ctaInput.value.trim() : '';
        if (this.onSubmit && promptText) {
          this.onSubmit(promptText, ctaUrl);
        }
      });
    }
  }

  onPointerDown(e) {
    if (e.target.closest('button, input, textarea, a')) return;

    this.isDragging = true;
    this.startX = e.clientX;
    this.startY = e.clientY;

    const rect = this.el.getBoundingClientRect();
    this.initialLeft = rect.left;
    this.initialTop = rect.top;

    // Remove bottom/right positioning and switch to fixed top/left
    this.el.style.bottom = 'auto';
    this.el.style.right = 'auto';
    this.el.style.left = `${this.initialLeft}px`;
    this.el.style.top = `${this.initialTop}px`;

    this.handle.setPointerCapture(e.pointerId);
  }

  onPointerMove(e) {
    if (!this.isDragging) return;

    const deltaX = e.clientX - this.startX;
    const deltaY = e.clientY - this.startY;

    let newLeft = this.initialLeft + deltaX;
    let newTop = this.initialTop + deltaY;

    // Viewport Boundary Constraints
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const rect = this.el.getBoundingClientRect();

    const minLeft = 10;
    const maxLeft = Math.max(10, viewportWidth - rect.width - 10);
    const minTop = 64; // Below header
    const maxTop = Math.max(64, viewportHeight - rect.height - 10);

    newLeft = Math.min(Math.max(newLeft, minLeft), maxLeft);
    newTop = Math.min(Math.max(newTop, minTop), maxTop);

    this.el.style.left = `${newLeft}px`;
    this.el.style.top = `${newTop}px`;
  }

  onPointerUp(e) {
    if (!this.isDragging) return;
    this.isDragging = false;
    try {
      this.handle.releasePointerCapture(e.pointerId);
    } catch (_) {}
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    const body = this.el.querySelector('.floating-prompt-body') || this.el.querySelector('#studio-prompt-body');
    if (this.isMinimized) {
      this.el.classList.add('minimized');
      if (body) body.style.display = 'none';
      if (this.minimizeBtn) this.minimizeBtn.textContent = '＋';
    } else {
      this.el.classList.remove('minimized');
      if (body) body.style.display = 'flex';
      if (this.minimizeBtn) this.minimizeBtn.textContent = '—';
    }
  }

  close() {
    this.el.style.display = 'none';
    if (this.reopenBtn) {
      this.reopenBtn.style.display = 'flex';
    }
  }

  reopen() {
    this.el.style.display = 'flex';
    if (this.reopenBtn) {
      this.reopenBtn.style.display = 'none';
    }
    if (this.isMinimized) {
      this.toggleMinimize();
    }
  }
}
