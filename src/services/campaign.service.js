/**
 * Mailora.ai — Campaign Persistence Service
 * Supports Supabase PostgreSQL with RLS and Local Demo fallback.
 */

import { supabase, isCloudConfigured } from '../config/supabase.config.js';
import { stateManager } from '../core/state-manager.js';
import { localStore } from '../utils/storage.js';
import { generateId } from '../utils/security.js';

class CampaignService {
  async saveCampaign(campaignData) {
    const user = stateManager.getUser();
    const email = user?.email || 'local_demo';

    if (isCloudConfigured && supabase && user?.id) {
      const payload = {
        user_id: user.id,
        brand_name: campaignData.brandName || 'Thương hiệu',
        campaign_name: campaignData.campaignName || campaignData.subject || 'Chiến dịch',
        prompt: campaignData.prompt || '',
        art_direction: campaignData.artDirection || '',
        subject: campaignData.subject || '',
        preheader: campaignData.preheader || '',
        image_url: campaignData.imageUrl || '',
        user_cta_url: campaignData.userCtaUrl || '#',
        selected_index: campaignData.selectedIndex || 0,
        structured_data: campaignData.structuredData || {},
        variants: campaignData.variants || [],
        generated_html: campaignData.generatedHtml || '',
        status: 'saved',
        updated_at: new Date().toISOString()
      };

      if (campaignData.id) {
        payload.id = campaignData.id;
      }

      const { data, error } = await supabase
        .from('campaigns')
        .upsert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    // LOCAL DEMO MODE
    const historyKey = `mailora_history_${email}`;
    const list = localStore.get(historyKey, []);
    const newEntry = {
      ...campaignData,
      id: campaignData.id || generateId('camp'),
      savedAt: Date.now()
    };

    const existingIdx = list.findIndex(c => c.id === newEntry.id);
    if (existingIdx >= 0) {
      list[existingIdx] = newEntry;
    } else {
      list.unshift(newEntry);
    }

    localStore.set(historyKey, list.slice(0, 50));
    return newEntry;
  }

  async getCampaigns(limit = 50) {
    const user = stateManager.getUser();
    const email = user?.email || 'local_demo';

    if (isCloudConfigured && supabase && user?.id) {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    }

    return localStore.get(`mailora_history_${email}`, []);
  }

  async deleteCampaign(campaignId) {
    const user = stateManager.getUser();
    const email = user?.email || 'local_demo';

    if (isCloudConfigured && supabase && user?.id) {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;
      return true;
    }

    const historyKey = `mailora_history_${email}`;
    let list = localStore.get(historyKey, []);
    list = list.filter(c => c.id !== campaignId);
    localStore.set(historyKey, list);
    return true;
  }

  async duplicateCampaign(campaignId) {
    const campaigns = await this.getCampaigns();
    const target = campaigns.find(c => c.id === campaignId);
    if (!target) throw new Error('Không tìm thấy chiến dịch cần nhân bản.');

    const clone = {
      ...target,
      id: undefined,
      campaignName: `${target.campaign_name || target.campaignName || 'Chiến dịch'} (Bản sao)`
    };

    return this.saveCampaign(clone);
  }
}

export const campaignService = new CampaignService();
