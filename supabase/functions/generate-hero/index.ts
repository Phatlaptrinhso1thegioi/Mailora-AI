import { handleCors } from '../_shared/cors.ts';
import { authenticateUser } from '../_shared/auth.ts';
import { deductCreditsServerSide } from '../_shared/credits.ts';
import { createErrorResponse, createSuccessResponse } from '../_shared/errors.ts';

const FALLBACK_HEROES: Record<string, string> = {
  luxury_beauty: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=880&q=80',
  modern_tech: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=880&q=80',
  fashion_editorial: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=880&q=80',
  organic_lifestyle: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=880&q=80',
  universal_modern: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=880&q=80'
};

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const requestId = crypto.randomUUID();

  try {
    const { user, supabase } = await authenticateUser(req);
    const body = await req.json().catch(() => ({}));
    const archetype = body.archetype || 'universal_modern';

    // Deduct 1 credit for hero image generation
    const idempotencyKey = req.headers.get('X-Idempotency-Key') || `hero_${requestId}`;
    await deductCreditsServerSide(supabase, 1, 'HERO_GENERATION', requestId, idempotencyKey);

    const imageUrl = FALLBACK_HEROES[archetype] || FALLBACK_HEROES.universal_modern;

    return createSuccessResponse({ imageUrl, prompt: body.prompt || '' }, requestId);
  } catch (error: any) {
    return createErrorResponse(error, requestId);
  }
});
