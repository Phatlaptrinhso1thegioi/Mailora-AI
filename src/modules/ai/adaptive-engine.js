/**
 * Mailora.ai — Adaptive Engine (Local Pipeline)
 * High-performance local inference engine running 8 archetypes, 100+ patterns,
 * and 4 distinct design directions.
 */

import { analyzePromptLocally } from './brand-intelligence.js';
import { buildBrandSpecificVariants } from './variant-manager.js';
import { FALLBACK_HERO_IMAGES } from '../../services/image.service.js';

export function generateAdaptiveCampaignLocally(rawPrompt, userCtaUrl = '') {
  const analysis = analyzePromptLocally(rawPrompt, userCtaUrl);
  const variants = buildBrandSpecificVariants(
    analysis.brand_name,
    analysis.cfg,
    analysis.user_summary,
    analysis.extracted_offer,
    analysis.user_cta_url
  );

  const heroImage = FALLBACK_HERO_IMAGES[analysis.archetype] || FALLBACK_HERO_IMAGES.universal_modern;

  return {
    brandName: analysis.brand_name,
    industry: analysis.industry,
    archetype: analysis.archetype,
    targetAudience: analysis.target_audience,
    campaignObjective: 'Thu hút sự chú ý, xây dựng lòng tin và chuyển đổi khách hàng tiềm năng.',
    artDirection: analysis.art_direction,
    subject: variants[0].subject,
    preheader: variants[0].preheader,
    heroImage: heroImage,
    hasExplicitOffer: analysis.has_explicit_offer,
    extractedOffer: analysis.extracted_offer,
    userCtaUrl: analysis.user_cta_url,
    variants: variants
  };
}
