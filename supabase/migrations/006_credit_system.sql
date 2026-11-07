-- ==============================================================================
-- 006_credit_system.sql — Atomic Credit Management & Ledger
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Negative for deduction, positive for grant/refund
  transaction_type TEXT NOT NULL, -- 'INITIAL_GRANT', 'AI_GENERATION', 'HERO_GENERATION', 'REFUND', 'ADMIN_ADJUSTMENT'
  reference_id TEXT,
  idempotency_key TEXT UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_idempotency ON public.credit_transactions(idempotency_key);

-- Initial Grant Record Trigger update
CREATE OR REPLACE FUNCTION public.log_initial_credit_grant()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.credit_transactions (
    user_id,
    amount,
    transaction_type,
    description
  ) VALUES (
    NEW.id,
    50,
    'INITIAL_GRANT',
    'Tặng 50 credits khởi tạo tài khoản mới'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_log_initial_credit ON public.profiles;
CREATE TRIGGER tr_log_initial_credit
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.log_initial_credit_grant();

-- Atomic RPC Function: deduct_user_credits
-- Uses SELECT ... FOR UPDATE to prevent concurrency race conditions and negative balances
CREATE OR REPLACE FUNCTION public.deduct_user_credits(
  p_amount INTEGER,
  p_transaction_type TEXT,
  p_reference_id TEXT DEFAULT NULL,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_user_id UUID;
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Verify authenticated caller
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: User is not authenticated';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount: Deductions must be greater than zero';
  END IF;

  -- Check idempotency key if provided
  IF p_idempotency_key IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.credit_transactions WHERE idempotency_key = p_idempotency_key) THEN
      SELECT credits INTO v_current_balance FROM public.profiles WHERE id = v_user_id;
      RETURN v_current_balance;
    END IF;
  END IF;

  -- Lock row for update
  SELECT credits INTO v_current_balance
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'INSUFFICIENT_CREDITS: Required %, available %', p_amount, v_current_balance;
  END IF;

  v_new_balance := v_current_balance - p_amount;

  -- Update balance
  UPDATE public.profiles
  SET credits = v_new_balance, updated_at = NOW()
  WHERE id = v_user_id;

  -- Record transaction ledger
  INSERT INTO public.credit_transactions (
    user_id,
    amount,
    transaction_type,
    reference_id,
    idempotency_key,
    description
  ) VALUES (
    v_user_id,
    -p_amount,
    p_transaction_type,
    p_reference_id,
    p_idempotency_key,
    'Khấu trừ credits cho thao tác ' || p_transaction_type
  );

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
