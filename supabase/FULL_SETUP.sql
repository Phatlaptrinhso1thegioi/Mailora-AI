-- ==============================================================================
-- 001_initial_schema.sql — Mailora.ai Base Extensions & Helpers
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to handle updated_at timestamp automatically
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ==============================================================================
-- 002_profiles_and_auth.sql — Profiles & Automatic Signup Trigger
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'FREE',
  credits INTEGER NOT NULL DEFAULT 50 CHECK (credits >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Trigger to update updated_at
CREATE TRIGGER tr_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to automatically create a profile and initial credit transaction on new auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name TEXT;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  
  -- 1. Insert Profile with 50 Initial Credits
  INSERT INTO public.profiles (id, email, full_name, credits, plan)
  VALUES (NEW.id, NEW.email, v_full_name, 50, 'FREE')
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS tr_on_auth_user_created ON auth.users;
CREATE TRIGGER tr_on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();
-- ==============================================================================
-- 003_campaigns.sql — Campaigns Table & Management
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  prompt TEXT,
  art_direction TEXT,
  subject TEXT,
  preheader TEXT,
  image_url TEXT,
  user_cta_url TEXT DEFAULT '#',
  selected_index INTEGER NOT NULL DEFAULT 0,
  structured_data JSONB DEFAULT '{}'::jsonb,
  variants JSONB DEFAULT '[]'::jsonb,
  generated_html TEXT,
  status TEXT NOT NULL DEFAULT 'saved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON public.campaigns(created_at DESC);

-- Trigger to update updated_at
CREATE TRIGGER tr_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
-- ==============================================================================
-- 004_brand_kits.sql — Brand Kits Management
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.brand_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  primary_color TEXT NOT NULL DEFAULT '#6655E8',
  secondary_color TEXT NOT NULL DEFAULT '#F7F6FC',
  card_color TEXT NOT NULL DEFAULT '#FFFFFF',
  heading_font TEXT NOT NULL DEFAULT 'Plus Jakarta Sans',
  body_font TEXT NOT NULL DEFAULT 'Plus Jakarta Sans',
  cta_radius TEXT NOT NULL DEFAULT '12px',
  cta_url TEXT DEFAULT '#',
  brand_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_brand_kits_user_id ON public.brand_kits(user_id);

-- Trigger for updated_at
CREATE TRIGGER tr_brand_kits_updated_at
BEFORE UPDATE ON public.brand_kits
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
-- ==============================================================================
-- 005_media_library.sql — Media Library Metadata
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'upload', -- 'upload' | 'ai' | 'brand'
  mime_type TEXT,
  file_size BIGINT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_media_library_user_id ON public.media_library(user_id);
CREATE INDEX IF NOT EXISTS idx_media_library_created_at ON public.media_library(created_at DESC);
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
-- ==============================================================================
-- 007_rls_policies.sql — Row Level Security (RLS) & Storage Access Policies
-- ==============================================================================

-- 1. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- 2. Profiles Policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Users can update only non-financial columns of their own profile (name, avatar)
CREATE POLICY "Users can update own profile info"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  -- Prevents client from updating credits or plan directly
);

-- 3. Campaigns Policies
CREATE POLICY "Users can view own campaigns"
ON public.campaigns FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own campaigns"
ON public.campaigns FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns"
ON public.campaigns FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns"
ON public.campaigns FOR DELETE
USING (auth.uid() = user_id);

-- 4. Brand Kits Policies
CREATE POLICY "Users can view own brand kits"
ON public.brand_kits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own brand kits"
ON public.brand_kits FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brand kits"
ON public.brand_kits FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own brand kits"
ON public.brand_kits FOR DELETE
USING (auth.uid() = user_id);

-- 5. Media Library Policies
CREATE POLICY "Users can view own media"
ON public.media_library FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own media"
ON public.media_library FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own media"
ON public.media_library FOR DELETE
USING (auth.uid() = user_id);

-- 6. Credit Transactions Policies
-- Users can ONLY read their transactions, NEVER insert or modify directly
CREATE POLICY "Users can view own credit transactions"
ON public.credit_transactions FOR SELECT
USING (auth.uid() = user_id);

-- 7. Supabase Storage Bucket & RLS for campaign-media
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaign-media', 'campaign-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Users can view their own files or public objects
CREATE POLICY "Allow public read for campaign media"
ON storage.objects FOR SELECT
USING (bucket_id = 'campaign-media');

-- Storage Policy: Users can upload files into their own folder: {user_id}/*
CREATE POLICY "Allow authenticated user uploads to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'campaign-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage Policy: Users can delete files in their own folder
CREATE POLICY "Allow authenticated user delete in own folder"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'campaign-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
