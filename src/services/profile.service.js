/**
 * Mailora.ai — Profile Service
 */

import { supabase, isCloudConfigured } from '../config/supabase.config.js';
import { stateManager } from '../core/state-manager.js';

class ProfileService {
  async getProfile() {
    const user = stateManager.getUser();
    if (!user) return null;

    if (isCloudConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!error && data) return data;
    }

    return user;
  }

  async updateProfile(updates) {
    const user = stateManager.getUser();
    if (!user) return null;

    if (isCloudConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.fullName || updates.full_name,
          avatar_url: updates.avatarUrl || updates.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      stateManager.setState({ user: { ...user, ...data } });
      return data;
    }

    const updatedUser = { ...user, ...updates };
    stateManager.setState({ user: updatedUser });
    return updatedUser;
  }
}

export const profileService = new ProfileService();
