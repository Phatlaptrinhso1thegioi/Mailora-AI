import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from '../../src/services/auth.service.js';
import { stateManager } from '../../src/core/state-manager.js';

describe('Authentication Service', () => {
  beforeEach(() => {
    localStorage.clear();
    stateManager.setState({ user: null, credits: 50 });
  });

  it('signs up a new user with initial 50 credits grant', async () => {
    const res = await authService.signUp('user@example.com', 'password123', 'John Doe');
    expect(res).toBeDefined();
    expect(res.user).toBeDefined();
    expect(res.user.email).toBe('user@example.com');
    expect(stateManager.getCredits()).toBe(50);
    expect(authService.isAuthenticated()).toBe(true);
  });

  it('signs in an existing user and restores session', async () => {
    await authService.signUp('test@mailora.ai', 'securepass');
    await authService.signOut();
    expect(authService.isAuthenticated()).toBe(false);

    const signinRes = await authService.signIn('test@mailora.ai', 'securepass');
    expect(signinRes.user.email).toBe('test@mailora.ai');
    expect(authService.isAuthenticated()).toBe(true);
  });

  it('signs out properly and clears active session state', async () => {
    await authService.signUp('logout_test@mailora.ai', 'pass1234');
    expect(authService.isAuthenticated()).toBe(true);

    await authService.signOut();
    expect(authService.isAuthenticated()).toBe(false);
    expect(stateManager.getUser()).toBeNull();
  });
});
