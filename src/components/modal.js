/**
 * Mailora.ai — Modal Dialog Controller
 */

export class Modal {
  constructor(modalElement) {
    this.modal = typeof modalElement === 'string' ? document.getElementById(modalElement) : modalElement;
    this.closeButtons = this.modal ? this.modal.querySelectorAll('[data-modal-close], .btn-modal-close') : [];

    this.init();
  }

  init() {
    if (!this.modal) return;

    this.closeButtons.forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });
  }

  open() {
    if (!this.modal) return;
    this.modal.classList.remove('hidden');
    this.modal.classList.add('flex', 'active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    if (!this.modal) return;
    this.modal.classList.add('hidden');
    this.modal.classList.remove('flex', 'active');
    document.body.style.overflow = '';
  }

  isOpen() {
    return this.modal && !this.modal.classList.contains('hidden');
  }
}
