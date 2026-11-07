import { describe, it, expect } from 'vitest';
import { analyzePromptLocally, extractOrSynthesizeBrandName } from '../../src/modules/ai/brand-intelligence.js';
import { generateAdaptiveCampaignLocally } from '../../src/modules/ai/adaptive-engine.js';
import { detectExplicitOffer } from '../../src/modules/ai/offer-validator.js';
import { validateAndNormalizeSchema } from '../../src/modules/ai/response-validator.js';

describe('Adaptive Brand Intelligence & AI Engine', () => {
  it('handles short prompts gracefully without failure', () => {
    const res1 = analyzePromptLocally('phở');
    expect(res1.archetype).toBe('organic_lifestyle');
    expect(res1.brand_name).toBe('ORIGIN HERITAGE');

    const res2 = analyzePromptLocally('gym');
    expect(res2.archetype).toBe('lifestyle_services');
    expect(res2.brand_name).toBe('VITALITY FITNESS');

    const res3 = analyzePromptLocally('bán xe');
    expect(res3.archetype).toBe('lifestyle_services');
    expect(res3.brand_name).toBe('VELOCITY MOTORS');
  });

  it('correctly maps all 8 archetypes', () => {
    const archetypesMap = [
      { prompt: 'mỹ phẩm dưỡng da ban đêm serum', expected: 'luxury_beauty' },
      { prompt: 'laptop gaming siêu mỏng chip OLED', expected: 'modern_tech' },
      { prompt: 'thời trang may đo lookbook trench coat', expected: 'fashion_editorial' },
      { prompt: 'cà phê arabica rang xay nguyên bản', expected: 'organic_lifestyle' },
      { prompt: 'du lịch nghỉ dưỡng resort ven biển', expected: 'travel_experience' },
      { prompt: 'phần mềm SaaS tự động hóa workflow B2B', expected: 'saas_digital' },
      { prompt: 'phòng tập gym fitness pilates', expected: 'lifestyle_services' },
      { prompt: 'dịch vụ chăm sóc khách hàng doanh nghiệp', expected: 'universal_modern' }
    ];

    for (const testCase of archetypesMap) {
      const res = analyzePromptLocally(testCase.prompt);
      expect(res.archetype).toBe(testCase.expected);
    }
  });

  it('generates exactly 4 distinct creative design variants', () => {
    const campaign = generateAdaptiveCampaignLocally('Thương hiệu thời trang Mono Studio');
    expect(campaign.variants).toHaveLength(4);
    expect(campaign.variants[0].style_name).toContain('Signature Flagship');
    expect(campaign.variants[1].style_name).toContain('High-Contrast Atelier');
    expect(campaign.variants[2].style_name).toContain('Editorial Storyteller');
    expect(campaign.variants[3].style_name).toContain('Conversion Focus');
  });

  it('strictly adheres to anti-fabrication policy', () => {
    // When prompt has NO mention of offer, do NOT fabricate!
    const noOffer = detectExplicitOffer('Thương hiệu mỹ phẩm cao cấp dưỡng ẩm ban đêm');
    expect(noOffer).toBeNull();

    // When prompt has explicit offer, extract it accurately
    const withOffer = detectExplicitOffer('Khuyến mãi giảm 30% cho khách hàng mới');
    expect(withOffer).not.toBeNull();
    expect(withOffer.highlight).toContain('30%');
  });

  it('validates and normalizes structured response schema', () => {
    const rawAiData = {
      brandName: 'LUMIÈRE',
      industry: 'Beauty',
      variants: [
        { headline: 'H1', cta_text: 'Buy' }
      ]
    };

    const validated = validateAndNormalizeSchema(rawAiData);
    expect(validated.brandName).toBe('LUMIÈRE');
    expect(validated.variants).toHaveLength(4);
    expect(validated.variants[0].theme).toBeDefined();
    expect(validated.variants[0].theme.font_family).toBeDefined();
    expect(validated.variants[1].style_name).toContain('High-Contrast Atelier');
    expect(validated.variants[2].style_name).toContain('Editorial Storyteller');
    expect(validated.variants[3].style_name).toContain('Conversion Focus');
  });
});
