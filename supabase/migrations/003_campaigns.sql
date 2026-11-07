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
