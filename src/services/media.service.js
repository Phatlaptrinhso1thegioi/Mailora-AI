/**
 * Mailora.ai — Media Library Service
 */

import { supabase, isCloudConfigured } from '../config/supabase.config.js';
import { stateManager } from '../core/state-manager.js';
import { storageService } from './storage.service.js';
import { localStore } from '../utils/storage.js';
import { generateId } from '../utils/security.js';

export const DEFAULT_MEDIA_ASSETS = [
  { id: 'med_mailora_mark', name: 'Mailora Ribbon Icon', url: './mailora-brand/logo-mark.png', type: 'brand', addedAt: Date.now() },
  { id: 'med_mailora_full', name: 'Mailora AI Full Logo', url: './mailora-brand/mailora-logo-transparent.png', type: 'brand', addedAt: Date.now() },
  { id: 'med_sample_1', name: 'LUMIÈRE Luxury Essence', url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=880&q=80', type: 'ai', addedAt: Date.now() - 3600000 },
  { id: 'med_sample_2', name: 'NEO-TECH Cyber Audio', url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=880&q=80', type: 'ai', addedAt: Date.now() - 7200000 },
  { id: 'med_sample_3', name: 'MAISON ÉLÉGANCE Atelier', url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=880&q=80', type: 'ai', addedAt: Date.now() - 10800000 },
  { id: 'med_sample_4', name: 'PURE BOTANICS Organic', url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=880&q=80', type: 'ai', addedAt: Date.now() - 14400000 }
];

class MediaService {
  async getMediaLibrary() {
    const user = stateManager.getUser();
    const email = user?.email || 'local_demo';

    if (isCloudConfigured && supabase && user?.id) {
      const { data, error } = await supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(item => ({
          id: item.id,
          name: item.name,
          url: item.storage_path.startsWith('http') 
            ? item.storage_path 
            : supabase.storage.from('campaign-media').getPublicUrl(item.storage_path).data.publicUrl,
          type: item.type,
          fileSize: item.file_size,
          mimeType: item.mime_type,
          addedAt: new Date(item.created_at).getTime()
        }));
      }
    }

    return localStore.get(`mailora_media_${email}`, DEFAULT_MEDIA_ASSETS);
  }

  async uploadAndSaveMedia(file, category = 'uploads') {
    const user = stateManager.getUser();
    const email = user?.email || 'local_demo';

    const uploaded = await storageService.uploadFile(file, category);

    if (isCloudConfigured && supabase && user?.id) {
      const { data, error } = await supabase
        .from('media_library')
        .insert({
          user_id: user.id,
          name: uploaded.name,
          storage_path: uploaded.path,
          type: category === 'generated' ? 'ai' : 'upload',
          mime_type: uploaded.type,
          file_size: uploaded.size,
          metadata: { originalName: file.name }
        })
        .select()
        .single();

      if (error) throw error;
      return {
        id: data.id,
        name: data.name,
        url: uploaded.url,
        type: data.type,
        addedAt: Date.now()
      };
    }

    // Local demo
    const mediaKey = `mailora_media_${email}`;
    const list = localStore.get(mediaKey, DEFAULT_MEDIA_ASSETS);
    const newMedia = {
      id: generateId('med'),
      name: uploaded.name,
      url: uploaded.url,
      type: 'upload',
      addedAt: Date.now()
    };
    list.unshift(newMedia);
    localStore.set(mediaKey, list);
    return newMedia;
  }

  async deleteMedia(mediaId) {
    const user = stateManager.getUser();
    const email = user?.email || 'local_demo';

    if (isCloudConfigured && supabase && user?.id) {
      await supabase.from('media_library').delete().eq('id', mediaId);
      return true;
    }

    const mediaKey = `mailora_media_${email}`;
    let list = localStore.get(mediaKey, DEFAULT_MEDIA_ASSETS);
    list = list.filter(m => m.id !== mediaId);
    localStore.set(mediaKey, list);
    return true;
  }
}

export const mediaService = new MediaService();
