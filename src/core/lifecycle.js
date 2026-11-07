/**
 * Mailora.ai — Application Lifecycle Manager
 */

import { supabase, isCloudConfigured, getAppMode } from '../config/supabase.config.js';
import { stateManager } from './state-manager.js';
import { eventBus, EVENTS } from './event-bus.js';
import { migrateLegacyUserData } from '../utils/storage.js';

export async function initAppLifecycle() {
  const mode = getAppMode();
  stateManager.setState({ mode });

  if (mode === 'CLOUD' && supabase) {
    try {
      // Check existing Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        stateManager.setState({ user: session.user });

        // Fetch user profile and credits balance
        const { data: profile } = await supabase
          .from('profiles')
          .select('credits, plan, full_name, avatar_url')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          stateManager.setState({
            credits: profile.credits ?? 50,
            user: { ...session.user, ...profile }
          });
        }

        // Trigger automatic legacy migration
        if (session.user.email) {
          migrateLegacyUserData(session.user.email, supabase);
        }
      } else {
        // Fallback: check local active session if present (e.g. rate-limit bypass)
        const localSession = localStorage.getItem('mailora_active_session');
        if (localSession) {
          try {
            const parsed = JSON.parse(localSession);
            stateManager.setState({
              user: {
                id: parsed.id || 'usr_direct',
                email: parsed.email || 'ithust4869@gmail.com',
                full_name: parsed.full_name || (parsed.email ? parsed.email.split('@')[0] : 'User')
              },
              credits: parsed.credits ?? 50
            });
          } catch (_) {}
        }
      }

      // Listen to Supabase auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session && session.user) {
          stateManager.setState({ user: session.user });
          eventBus.emit(EVENTS.AUTH_STATE_CHANGED, { event, user: session.user });
        } else if (event === 'SIGNED_OUT') {
          stateManager.setState({ user: null });
          eventBus.emit(EVENTS.AUTH_STATE_CHANGED, { event, user: null });
        }
      });
    } catch (err) {
      console.warn('[Lifecycle] Error during cloud session initialization:', err);
    }
  } else {
    // LOCAL DEMO MODE: load local session if present
    const localSession = localStorage.getItem('mailora_active_session');
    if (localSession) {
      try {
        const parsed = JSON.parse(localSession);
        stateManager.setState({
          user: {
            id: 'local_user',
            email: parsed.email || 'demo@mailora.ai',
            full_name: parsed.email ? parsed.email.split('@')[0] : 'Demo User'
          },
          credits: parsed.credits ?? 50
        });
      } catch (_) {}
    }
  }

  return { mode, initialized: true };
}
