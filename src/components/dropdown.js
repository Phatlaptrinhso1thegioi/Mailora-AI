/**
 * Mailora.ai — Dropdown Component
 */

export class Dropdown {
  constructor(triggerElement, menuElement) {
    this.trigger = triggerElement;
    this.menu = menuElement;
    this.init();
  }

  init() {
    if (!this.trigger || !this.menu) return;

    this.trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    document.addEventListener('click', (e) => {
      if (!this.menu.contains(e.target) && !this.trigger.contains(e.target)) {
        this.close();
      }
    });
  }

  toggle() {
    this.menu.classList.toggle('hidden');
  }

  open() {
    this.menu.classList.remove('hidden');
  }

  close() {
    this.menu.classList.add('hidden');
  }
}
