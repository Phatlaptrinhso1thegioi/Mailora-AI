/**
 * Mailora.ai — Media Library UI Controller
 */

import { mediaService } from '../../services/media.service.js';
import { eventBus, EVENTS } from '../../core/event-bus.js';

export async function loadAndRenderMediaLibrary(gridElement, onSelectMedia) {
  if (!gridElement) return;

  const items = await mediaService.getMediaLibrary();

  if (items.length === 0) {
    gridElement.innerHTML = `
      <div class="col-span-full py-8 text-center text-sm text-gray-400">
        Chưa có hình ảnh nào trong thư viện. Hãy tải lên ảnh đầu tiên của bạn!
      </div>
    `;
    return;
  }

  gridElement.innerHTML = items.map(item => `
    <div class="group relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-video cursor-pointer transition hover:shadow-md" data-media-id="${item.id}" data-media-url="${item.url}">
      <img src="${item.url}" alt="${item.name}" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 p-2">
        <button type="button" class="btn-select-media px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white shadow">
          Chọn ảnh
        </button>
      </div>
      <div class="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/70 to-transparent text-[11px] text-white truncate">
        ${item.name}
      </div>
    </div>
  `).join('');

  gridElement.querySelectorAll('.btn-select-media').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('[data-media-url]');
      const url = card?.getAttribute('data-media-url');
      if (url && onSelectMedia) {
        onSelectMedia(url);
        eventBus.emit(EVENTS.IMAGE_UPDATED, url);
      }
    });
  });
}
