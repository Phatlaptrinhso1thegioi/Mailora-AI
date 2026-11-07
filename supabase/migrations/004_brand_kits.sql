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
