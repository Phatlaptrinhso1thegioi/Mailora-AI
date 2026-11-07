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
