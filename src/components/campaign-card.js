/**
 * Mailora.ai — Campaign Variant Card Component
 */

export function renderVariantCards(variants, containerElement, selectedIndex = 0, onSelect) {
  if (!containerElement || !Array.isArray(variants)) return;

  containerElement.innerHTML = variants.map((v, idx) => {
    const isSelected = idx === selectedIndex;
    const theme = v.theme || {};

    return `
      <div class="variant-card ${isSelected ? 'selected' : ''}" data-variant-index="${idx}">
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-[11px] font-bold tracking-wider uppercase text-primary">${v.badge || `BIẾN THỂ #${idx + 1}`}</span>
            ${isSelected ? '<span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-soft text-primary">Đang chọn</span>' : ''}
          </div>
          <h3 class="font-bold text-base text-gray-900 mb-1.5 leading-snug line-clamp-2">${v.headline || v.subject}</h3>
          <p class="text-xs text-gray-500 mb-3 line-clamp-2">${v.subheadline || ''}</p>
        </div>
        <div class="pt-3 border-t border-gray-100 flex items-center justify-between">
          <span class="text-[11px] font-medium text-gray-400 font-mono">${theme.font_family || 'Plus Jakarta Sans'}</span>
          <div class="w-4 h-4 rounded-full border border-black/10" style="background-color: ${theme.cta_bg || '#6655E8'};"></div>
        </div>
      </div>
    `;
  }).join('');

  containerElement.querySelectorAll('.variant-card').forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.getAttribute('data-variant-index'), 10);
      containerElement.querySelectorAll('.variant-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      if (onSelect) onSelect(idx);
    });
  });
}
