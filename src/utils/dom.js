/**
 * Mailora.ai — DOM Utilities
 */

export const $ = (selector, context = document) => context.querySelector(selector);
export const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

export function on(element, event, handler, options) {
  if (!element) return;
  element.addEventListener(event, handler, options);
  return () => element.removeEventListener(event, handler, options);
}

export function delegate(element, event, selector, handler) {
  if (!element) return;
  return on(element, event, (e) => {
    const target = e.target.closest(selector);
    if (target && element.contains(target)) {
      handler.call(target, e, target);
    }
  });
}

export function show(element, displayStyle = 'block') {
  if (!element) return;
  element.style.display = displayStyle;
  element.classList.remove('hidden');
}

export function hide(element) {
  if (!element) return;
  element.style.display = 'none';
  element.classList.add('hidden');
}

export function toggle(element, force) {
  if (!element) return;
  const isHidden = element.style.display === 'none' || element.classList.contains('hidden');
  const shouldShow = force !== undefined ? force : isHidden;
  if (shouldShow) {
    show(element);
  } else {
    hide(element);
  }
}
