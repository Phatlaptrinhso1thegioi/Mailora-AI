/**
 * Mailora.ai — Image Service
 */

import { apiClient } from './api-client.js';
import { API_CONFIG } from '../config/api.config.js';
import { getAppMode } from '../config/supabase.config.js';
import { generateId } from '../utils/security.js';

export const FALLBACK_HERO_IMAGES = {
  luxury_beauty: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=880&q=80',
  modern_tech: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=880&q=80',
  fashion_editorial: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=880&q=80',
  organic_lifestyle: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=880&q=80',
  travel_experience: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=880&q=80',
  saas_digital: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=880&q=80',
  lifestyle_services: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=880&q=80',
  universal_modern: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=880&q=80'
};

class ImageService {
  async generateHeroImage(prompt, archetype = 'universal_modern') {
    const appMode = getAppMode();

    if (appMode === 'CLOUD') {
      const response = await apiClient.post(
        API_CONFIG.endpoints.generateHero,
        { prompt, archetype },
        { isCreditConsuming: true, idempotencyKey: generateId('hero_gen') }
      );
      if (response && response.success && response.data?.imageUrl) {
        return response.data.imageUrl;
      }
    }

    // Local / Curated Unsplash Fallback
    return FALLBACK_HERO_IMAGES[archetype] || FALLBACK_HERO_IMAGES.universal_modern;
  }
}

export const imageService = new ImageService();
