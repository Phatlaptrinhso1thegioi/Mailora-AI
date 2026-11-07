/**
 * Mailora.ai — Brand Kit Service
 */

import { supabase, isCloudConfigured } from '../config/supabase.config.js';
import { stateManager } from '../core/state-manager.js';
import { localStore } from '../utils/storage.js';

class BrandKitService {
  async getBrandKit() {
    const user = stateManager.getUser();
    const email = user?.email || 'local_demo';

    if (isCloudConfigured && supabase && user?.id) {
      const { data, error } = await supabase
        .from('brand_kits')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return {
          brandName: data.brand_name,
          primaryColor: data.primary_color,
          secondaryColor: data.secondary_color,
          cardColor: data.card_color,
          headingFont: data.heading_font,
          bodyFont: data.body_font,
          ctaRadius: data.cta_radius,
          ctaUrl: data.cta_url,
          ...data.brand_data
        };
      }
    }

    return localStore.get(`mailora_brandkit_${email}`, {
      brandName: 'Thương hiệu của tôi',
      primaryColor: '#6655E8',
      secondaryColor: '#F7F6FC',
      cardColor: '#FFFFFF',
      headingFont: 'Plus Jakarta Sans',
      bodyFont: 'Plus Jakarta Sans',
      ctaRadius: '12px',
      ctaUrl: 'https://mailora.ai'
    });
  }

  async saveBrandKit(kit) {
    const user = stateManager.getUser();
    const email = user?.email || 'local_demo';

    if (isCloudConfigured && supabase && user?.id) {
      const { data, error } = await supabase
        .from('brand_kits')
        .upsert({
          user_id: user.id,
          brand_name: kit.brandName || 'Thương hiệu',
          primary_color: kit.primaryColor || '#6655E8',
          secondary_color: kit.secondaryColor || '#F7F6FC',
          card_color: kit.cardColor || '#FFFFFF',
          heading_font: kit.headingFont || 'Plus Jakarta Sans',
          body_font: kit.bodyFont || 'Plus Jakarta Sans',
          cta_radius: kit.ctaRadius || '12px',
          cta_url: kit.ctaUrl || '#',
          brand_data: kit,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    localStore.set(`mailora_brandkit_${email}`, kit);
    return kit;
  }
}

export const brandKitService = new BrandKitService();
