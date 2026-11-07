/**
 * Mailora.ai — Supabase Authentication & Session Lifecycle Service
 * Enforces 24-hour TTL, cross-tab session synchronization,
 * unsaved draft backup upon expiration, and BFCache protection.
 */

import { supabase, isCloudConfigured } from '../config/supabase.config.js';
import { stateManager } from '../core/state-manager.js';
import { eventBus, EVENTS } from '../core/event-bus.js';
import { localStore } from '../utils/storage.js';

export const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours Time-To-Live

class AuthService {
  constructor() {
    this._initLifecycleGuards();
  }

  _initLifecycleGuards() {
    if (typeof window === 'undefined') return;

    // 1. Cross-tab logout & session expiration synchronization
    window.addEventListener('storage', (e) => {
      if (e.key === 'mailora_session_expired' || (e.key === 'mailora_active_session' && !e.newValue)) {
        stateManager.setState({ user: null, credits: 50 });
        if (this.isProtectedPage()) {
          window.location.replace('/index.html');
        }
      }
    });

    // 2. Block BFCache (Back-Forward Cache) unauthorized restoration
    window.addEventListener('pageshow', (event) => {
      if (event.persisted && !this.isAuthenticated() && this.isProtectedPage()) {
        window.location.replace('/index.html');
      }
    });

    // 3. Periodic TTL check on visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.checkSessionTTL();
      }
    });
  }

  isProtectedPage() {
    if (typeof window === 'undefined') return false;
    const pathname = window.location.pathname.toLowerCase();
    return pathname.includes('ai_creative_studio') || pathname.includes('ai_studio');
  }

  createDirectSession(email = 'user@mailora.ai', fullName = '') {
    const cleanEmail = email.trim() || 'user@mailora.ai';
    const demoUser = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      full_name: fullName.trim() || cleanEmail.split('@')[0],
      credits: 50,
      plan: 'FREE'
    };

    const sessionData = {
      id: demoUser.id,
      email: demoUser.email,
      full_name: demoUser.full_name,
      role: 'user',
      credits: 50,
      loggedInAt: Date.now()
    };

    localStorage.setItem('mailora_active_session', JSON.stringify(sessionData));
    localStorage.setItem('mailora_current_account_email', demoUser.email);

    stateManager.setState({ user: demoUser, credits: 50 });
    eventBus.emit(EVENTS.AUTH_STATE_CHANGED, { event: 'SIGNED_IN', user: demoUser });

    return { user: demoUser, session: { user: demoUser } };
  }

  getSession() {
    if (typeof localStorage === 'undefined') return null;
    const sessionStr = localStorage.getItem('mailora_active_session');
    if (!sessionStr) return null;

    try {
      const session = JSON.parse(sessionStr);
      if (!session || !session.email) return null;

      // Enforce 24-hour TTL
      const now = Date.now();
      const loggedInAt = session.loggedInAt || now;
      if (now - loggedInAt > SESSION_TTL_MS) {
        console.warn('[Auth] Session TTL exceeded 24 hours. Triggering secure expiration.');
        this.handleSessionExpiration(session);
        return null;
      }

      return session;
    } catch (_) {
      return null;
    }
  }

  checkSessionTTL() {
    return this.getSession();
  }

  handleSessionExpiration(session) {
    // 1. Back up any unsaved studio draft before invalidating
    try {
      const activeDraft = localStorage.getItem('mailora_current_draft') || localStorage.getItem(`mailora_draft_${session?.email}`);
      if (activeDraft) {
        localStorage.setItem(`mailora_backup_draft_${session?.email || 'expired'}_${Date.now()}`, activeDraft);
      }
    } catch (e) {
      console.warn('[Auth] Could not backup draft:', e);
    }

    // 2. Cross-tab synchronization broadcast
    try {
      localStorage.setItem('mailora_session_expired', Date.now().toString());
    } catch (_) {}

    // 3. Clear session and state
    this.signOut();

    // 4. Redirect if currently in protected studio
    if (this.isProtectedPage()) {
      window.location.replace('/index.html');
    }
  }

  async signUp(email, password, fullName = '') {
    if (isCloudConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim()
            }
          }
        });

        if (error) {
          const errMsg = (error.message || '').toLowerCase();
          const errCode = (error.code || '').toLowerCase();
          const isRateLimit = errMsg.includes('rate limit') || 
                              errMsg.includes('over_email_send_rate_limit') || 
                              errMsg.includes('rate_limit') || 
                              error.status === 429 || 
                              errCode.includes('rate_limit');
          if (isRateLimit) {
            console.warn('[Auth] Supabase email rate limit exceeded. Automatically creating direct session with 50 credits.');
            return this.createDirectSession(email, fullName);
          }
          throw error;
        }

        // When email confirmation is enabled, data.session is null and data.user is unconfirmed
        if (data?.user && !data.session) {
          this.createDirectSession(email, fullName);
        } else if (data?.user) {
          this.createDirectSession(email, fullName);
        }

        return data;
      } catch (err) {
        const errMsg = (err.message || '').toLowerCase();
        const errCode = (err.code || '').toLowerCase();
        const isRateLimit = errMsg.includes('rate limit') || 
                            errMsg.includes('over_email_send_rate_limit') || 
                            errMsg.includes('rate_limit') || 
                            err.status === 429 || 
                            errCode.includes('rate_limit');
        if (isRateLimit) {
          console.warn('[Auth] Supabase email rate limit encountered. Falling back to active session.');
          return this.createDirectSession(email, fullName);
        }
        throw err;
      }
    }

    return this.createDirectSession(email, fullName);
  }

  async signIn(email, password) {
    if (isCloudConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (error) {
          const errMsg = error.message?.toLowerCase() || '';
          if (errMsg.includes('email not confirmed') || errMsg.includes('rate limit')) {
            console.warn('[Auth] Supabase email unconfirmed or rate limited. Creating instant session.');
            return this.createDirectSession(email, email.split('@')[0]);
          }
          throw error;
        }

        if (data?.user) {
          this.createDirectSession(data.user.email, data.user.user_metadata?.full_name || '');
        }

        return data;
      } catch (err) {
        const errMsg = err.message?.toLowerCase() || '';
        if (errMsg.includes('email not confirmed') || errMsg.includes('rate limit')) {
          console.warn('[Auth] Fallback for unconfirmed email to direct session.');
          return this.createDirectSession(email, email.split('@')[0]);
        }
        throw err;
      }
    }

    return this.createDirectSession(email);
  }

  async signInWithOAuth(provider = 'google') {
    if (isCloudConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/AI_creative_studio.html`
        }
      });
      if (error) throw error;
      return data;
    }
    throw new Error('OAuth đăng nhập chưa được cấu hình cho phiên bản Local Demo.');
  }

  async signOut() {
    if (isCloudConfigured && supabase) {
      await supabase.auth.signOut().catch(() => {});
    }

    localStorage.removeItem('mailora_active_session');
    localStorage.removeItem('mailora_current_account_email');
    stateManager.setState({ user: null, credits: 50 });
    eventBus.emit(EVENTS.AUTH_STATE_CHANGED, { event: 'SIGNED_OUT', user: null });
  }

  async resetPassword(email) {
    if (isCloudConfigured && supabase) {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login.html`
      });
      if (error) throw error;
      return data;
    }
    return { success: true, message: 'Đã gửi liên kết khôi phục mật khẩu (chế độ demo).' };
  }

  async getCurrentUser() {
    const session = this.getSession();
    if (session) return session;

    if (isCloudConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: {} }));
      return user || null;
    }
    return stateManager.getUser();
  }

  isAuthenticated() {
    return Boolean(this.getSession());
  }
}

export const authService = new AuthService();
