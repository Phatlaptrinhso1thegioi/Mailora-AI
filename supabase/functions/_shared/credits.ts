import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

export async function deductCreditsServerSide(
  supabase: SupabaseClient,
  amount: number,
  operationType: string,
  referenceId: string | null = null,
  idempotencyKey: string | null = null
): Promise<number> {
  const { data, error } = await supabase.rpc('deduct_user_credits', {
    p_amount: amount,
    p_transaction_type: operationType,
    p_reference_id: referenceId,
    p_idempotency_key: idempotencyKey
  });

  if (error) {
    if (error.message.includes('INSUFFICIENT_CREDITS')) {
      const err = new Error('INSUFFICIENT_CREDITS: Tài khoản của bạn không đủ credits để tạo chiến dịch này.');
      (err as any).code = 'INSUFFICIENT_CREDITS';
      throw err;
    }
    throw new Error(`CREDIT_DEDUCTION_FAILED: ${error.message}`);
  }

  return data;
}
