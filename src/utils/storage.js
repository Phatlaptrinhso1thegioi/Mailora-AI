/**
 * Mailora.ai — Storage Utilities & Legacy Migration
 */

export const localStore = {
  get(key, defaultValue = null) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : defaultValue;
    } catch (_) {
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn(`[localStore] Failed to write key ${key}`, e);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (_) {
      return false;
    }
  }
};

/**
 * Migration helper for legacy LocalStorage records
 * Detects legacy campaigns, media, brandkits, and migrates them safely.
 */
export async function migrateLegacyUserData(userEmail, supabaseClient = null) {
  if (!userEmail) return { migrated: false, reason: 'No user email provided' };

  const migrationKey = `mailora_migrated_${userEmail}`;
  if (localStore.get(migrationKey)) {
    return { migrated: true, alreadyMigrated: true };
  }

  const legacyHistory = localStore.get(`mailora_history_${userEmail}`, []);
  const legacyMedia = localStore.get(`mailora_media_${userEmail}`, []);
  const legacyBrandKit = localStore.get(`mailora_brandkit_${userEmail}`, null);

  let campaignsCount = 0;
  let mediaCount = 0;
  let brandKitMigrated = false;

  if (supabaseClient && supabaseClient.auth) {
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user && user.email === userEmail) {
        // 1. Migrate Campaigns
        if (Array.isArray(legacyHistory) && legacyHistory.length > 0) {
          for (const item of legacyHistory) {
            await supabaseClient.from('campaigns').upsert({
              id: item.id || undefined,
              user_id: user.id,
              brand_name: item.brandName || 'Thương hiệu',
              campaign_name: item.campaignName || item.subject || 'Chiến dịch',
              prompt: item.prompt || '',
              subject: item.subject || '',
              preheader: item.preheader || '',
              image_url: item.imageUrl || '',
              user_cta_url: item.userCtaUrl || '#',
              structured_data: item.structuredData || {},
              variants: item.variants || [],
              generated_html: item.generatedHtml || '',
              status: 'saved',
              created_at: item.savedAt ? new Date(item.savedAt).toISOString() : new Date().toISOString()
            });
            campaignsCount++;
          }
        }

        // 2. Migrate BrandKit
        if (legacyBrandKit && legacyBrandKit.brandName) {
          await supabaseClient.from('brand_kits').upsert({
            user_id: user.id,
            brand_name: legacyBrandKit.brandName,
            primary_color: legacyBrandKit.primaryColor || '#6655E8',
            secondary_color: legacyBrandKit.secondaryColor || '#F7F6FC',
            card_color: legacyBrandKit.cardColor || '#FFFFFF',
            heading_font: legacyBrandKit.headingFont || 'Plus Jakarta Sans',
            body_font: legacyBrandKit.bodyFont || 'Plus Jakarta Sans',
            cta_radius: legacyBrandKit.ctaRadius || '12px',
            cta_url: legacyBrandKit.ctaUrl || '#',
            brand_data: legacyBrandKit
          });
          brandKitMigrated = true;
        }

        localStore.set(migrationKey, {
          completedAt: Date.now(),
          campaignsCount,
          mediaCount,
          brandKitMigrated
        });
      }
    } catch (err) {
      console.warn('[Migration] Error migrating legacy data to Supabase:', err);
    }
  }

  return {
    migrated: true,
    campaignsCount,
    mediaCount,
    brandKitMigrated
  };
}
