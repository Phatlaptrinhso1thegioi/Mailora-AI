/**
 * Mailora.ai — Credit Service
 * Communicates with Supabase PostgreSQL functions for atomic balance verification and deductions.
 */

import { supabase, isCloudConfigured } from '../config/supabase.config.js';
import { stateManager } from '../core/state-manager.js';
import { eventBus, EVENTS } from '../core/event-bus.js';
import { InsufficientCreditsError } from '../utils/errors.js';

class CreditsService {
  async getBalance() {
    if (isCloudConfigured && supabase) {
      const user = stateManager.getUser();
      if (!user) return 0;

      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        stateManager.setCredits(data.credits);
        return data.credits;
      }
    }
    return stateManager.getCredits();
  }

  async deductCredits(amount, operationType, referenceId = null) {
    const currentBalance = await this.getBalance();
    if (currentBalance < amount) {
      throw new InsufficientCreditsError(`Bạn cần ít nhất ${amount} credits để thực hiện thao tác này (Hiện có: ${currentBalance}).`);
    }

    if (isCloudConfigured && supabase) {
      const user = stateManager.getUser();
      // Call atomic PostgreSQL RPC function
      const { data, error } = await supabase.rpc('deduct_user_credits', {
        p_amount: amount,
        p_transaction_type: operationType,
        p_reference_id: referenceId
      });

      if (error) {
        throw new Error(error.message || 'Lỗi khi trừ credits.');
      }

      stateManager.setCredits(data);
      return data;
    }

    // LOCAL DEMO MODE: deduct locally
    const newBalance = Math.max(0, currentBalance - amount);
    stateManager.setCredits(newBalance);
    
    // Save to demo session
    const localSession = JSON.parse(localStorage.getItem('mailora_active_session') || '{}');
    localSession.credits = newBalance;
    localStorage.setItem('mailora_active_session', JSON.stringify(localSession));

    return newBalance;
  }

  async getTransactionHistory() {
    if (isCloudConfigured && supabase) {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    }

    // Local demo transactions
    return [
      {
        id: 'tx_initial',
        amount: 50,
        transaction_type: 'INITIAL_GRANT',
        description: 'Quà tặng khởi tạo tài khoản',
        created_at: new Date().toISOString()
      }
    ];
  }
}

export const creditsService = new CreditsService();
