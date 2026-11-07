import { describe, it, expect, beforeEach } from 'vitest';
import { creditsService } from '../../src/services/credits.service.js';
import { stateManager } from '../../src/core/state-manager.js';
import { InsufficientCreditsError } from '../../src/utils/errors.js';

describe('Credit System', () => {
  beforeEach(() => {
    localStorage.clear();
    stateManager.setState({
      user: { id: 'usr_test', email: 'test@mailora.ai' },
      credits: 50
    });
  });

  it('verifies initial 50 credits balance', async () => {
    const balance = await creditsService.getBalance();
    expect(balance).toBe(50);
  });

  it('deducts 1 credit for campaign generation', async () => {
    const newBalance = await creditsService.deductCredits(1, 'AI_GENERATION');
    expect(newBalance).toBe(49);
    expect(stateManager.getCredits()).toBe(49);
  });

  it('throws InsufficientCreditsError when balance is less than required deduction', async () => {
    stateManager.setCredits(0);
    await expect(creditsService.deductCredits(1, 'AI_GENERATION'))
      .rejects.toThrow(InsufficientCreditsError);
  });

  it('prevents concurrent overdraw from causing negative balance', async () => {
    stateManager.setCredits(2);
    await creditsService.deductCredits(1, 'AI_GENERATION');
    await creditsService.deductCredits(1, 'AI_GENERATION');
    expect(stateManager.getCredits()).toBe(0);

    await expect(creditsService.deductCredits(1, 'AI_GENERATION'))
      .rejects.toThrow(InsufficientCreditsError);
  });
});
