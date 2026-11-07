/**
 * Mailora.ai — Supabase Storage Service
 * Handles secure file uploads to campaign-media bucket.
 */

import { supabase, isCloudConfigured } from '../config/supabase.config.js';
import { APP_CONFIG } from '../config/app.config.js';
import { stateManager } from '../core/state-manager.js';

class StorageService {
  constructor() {
    this.bucketName = APP_CONFIG.storage.mediaBucket;
  }

  async uploadFile(file, category = 'uploads') {
    const user = stateManager.getUser();

    if (isCloudConfigured && supabase && user?.id) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `${user.id}/${category}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get Public URL or Signed URL
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      return {
        path: filePath,
        url: urlData.publicUrl,
        name: file.name,
        size: file.size,
        type: file.type
      };
    }

    // LOCAL DEMO MODE FALLBACK: Object URL
    const objectUrl = URL.createObjectURL(file);
    return {
      path: `local/${file.name}`,
      url: objectUrl,
      name: file.name,
      size: file.size,
      type: file.type
    };
  }
}

export const storageService = new StorageService();
