/**
 * Mailora.ai — AI Response Schema Validator
 * Enforces the standardized 4-email creative architecture:
 * 1. Signature Flagship
 * 2. High-Contrast Atelier
 * 3. Editorial Storyteller
 * 4. Conversion Focus
 */

export const STANDARD_VARIANT_ARCHITECTURES = [
  {
    name: 'Signature Flagship',
    badge: '✦ SIGNATURE FLAGSHIP',
    tone: 'Sang trọng, toàn diện, chuẩn mực nhận diện thương hiệu cao cấp',
    eyebrow: 'SIGNATURE EDITION · FLAGSHIP ARCHITECTURE',
    headingFont: 'Playfair Display',
    primaryColor: '#4F39F6',
    cardBg: '#FFFFFF',
    bgOuter: '#F7F6FC',
    ctaText: 'Khám Phá Tuyệt Tác →'
  },
  {
    name: 'High-Contrast Atelier',
    badge: '◐ HIGH-CONTRAST ATELIER',
    tone: 'Sắc sảo, ấn tượng thị giác mạnh, phong cách atelier độc bản',
    eyebrow: 'EXCLUSIVE ATELIER · ARCHITECTURAL CUT',
    headingFont: 'Instrument Serif',
    primaryColor: '#27243A',
    cardBg: '#111827',
    bgOuter: '#0B0F17',
    ctaText: 'Khám Phá Bộ Sưu Tập →'
  },
  {
    name: 'Editorial Storyteller',
    badge: '📖 EDITORIAL STORYTELLER',
    tone: 'Sâu lắng, chạm vào cảm xúc, khơi gợi lòng trắc ẩn và tự sự thương hiệu',
    eyebrow: 'BEHIND THE SCENES · CRAFT NARRATIVE',
    headingFont: 'Playfair Display',
    primaryColor: '#6655E8',
    cardBg: '#FFFFFF',
    bgOuter: '#FAF8F5',
    ctaText: 'Đọc Trọn Vẹn Câu Chuyện →'
  },
  {
    name: 'Conversion Focus',
    badge: '⚡ CONVERSION FOCUS',
    tone: 'Cô đọng, trực diện, kích thích quyết định hành động ngay',
    eyebrow: 'LIMITED OPPORTUNITY · TAKE ACTION',
    headingFont: 'Plus Jakarta Sans',
    primaryColor: '#16A36A',
    cardBg: '#FFFFFF',
    bgOuter: '#F4FBF7',
    ctaText: 'Nhận Ưu Đãi Ngay →'
  }
];

export function validateAndNormalizeSchema(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Dữ liệu phản hồi AI không đúng định dạng object.');
  }

  const brandName = typeof data.brandName === 'string' && data.brandName ? data.brandName.trim() : 'Mailora Brand';

  const normalized = {
    brandName,
    industry: typeof data.industry === 'string' && data.industry ? data.industry.trim() : 'Dịch Vụ & Thương Mại',
    archetype: typeof data.archetype === 'string' && data.archetype ? data.archetype.trim() : 'universal_modern',
    targetAudience: typeof data.targetAudience === 'string' ? data.targetAudience.trim() : 'Khách hàng tiềm năng',
    campaignObjective: typeof data.campaignObjective === 'string' ? data.campaignObjective.trim() : 'Gia tăng tương tác & nhận diện',
    artDirection: typeof data.artDirection === 'string' ? data.artDirection.trim() : 'Soft Modern Premium',
    subject: typeof data.subject === 'string' ? data.subject.trim() : `Thông điệp đặc biệt từ ${brandName}`,
    preheader: typeof data.preheader === 'string' ? data.preheader.trim() : 'Khám phá ngay hôm nay.',
    heroPrompt: typeof data.heroPrompt === 'string' ? data.heroPrompt.trim() : '',
    hasExplicitOffer: Boolean(data.hasExplicitOffer),
    promo: data.promo || null,
    variants: Array.isArray(data.variants) ? data.variants : []
  };

  // Ensure exactly 4 distinct variants per standard architecture (indices 0 through 3)
  const finalVariants = [];

  for (let idx = 0; idx < 4; idx++) {
    const arch = STANDARD_VARIANT_ARCHITECTURES[idx];
    const rawVariant = normalized.variants[idx] || {};

    const styleName = rawVariant.style_name || rawVariant.styleName || `${normalized.artDirection} — ${arch.name}`;
    const headline = rawVariant.headline || (idx === 0 ? normalized.subject : `${arch.name} — ${brandName}`);
    const subheadline = rawVariant.subheadline || normalized.preheader;
    const body = rawVariant.body || `${brandName} mang đến trải nghiệm chất lượng cao và giải pháp chuyên biệt.`;
    const benefits = Array.isArray(rawVariant.benefits) && rawVariant.benefits.length >= 3
      ? rawVariant.benefits.slice(0, 3)
      : [
          'Tiêu chuẩn chất lượng khắt khe và quy trình thực hiện chuyên nghiệp',
          'Đội ngũ chuyên môn tận tâm đồng hành xuyên suốt trải nghiệm',
          'Cam kết giá trị gia tăng thực chất và sự an tâm tối đa'
        ];

    finalVariants.push({
      id: idx + 1,
      style_name: styleName,
      badge: rawVariant.badge || arch.badge,
      tone: rawVariant.tone || arch.tone,
      eyebrow: rawVariant.eyebrow || arch.eyebrow,
      subject: rawVariant.subject || (idx === 0 ? normalized.subject : `${headline} | ${brandName}`),
      preheader: rawVariant.preheader || subheadline,
      headline,
      subheadline,
      body,
      benefits,
      promo_box: rawVariant.promo_box || rawVariant.promoBox || (normalized.promo?.highlight || ''),
      cta_text: rawVariant.cta_text || rawVariant.primaryCta || arch.ctaText,
      cta_url: rawVariant.cta_url || rawVariant.ctaUrl || '#',
      secondary_cta_text: rawVariant.secondary_cta_text || 'Tìm Hiểu Thêm',
      secondary_cta_url: rawVariant.secondary_cta_url || '#',
      theme: {
        bg_outer: rawVariant.theme?.bg_outer || arch.bgOuter,
        card_bg: rawVariant.theme?.card_bg || arch.cardBg,
        card_border: rawVariant.theme?.card_border || '1px solid #EAE7F1',
        font_family: rawVariant.theme?.font_family || rawVariant.headingFont || arch.headingFont,
        body_font: rawVariant.theme?.body_font || rawVariant.bodyFont || 'Plus Jakarta Sans',
        eyebrow_color: rawVariant.theme?.eyebrow_color || arch.primaryColor,
        headline_color: rawVariant.theme?.headline_color || (arch.cardBg === '#111827' ? '#FFFFFF' : '#27243A'),
        body_color: rawVariant.theme?.body_color || (arch.cardBg === '#111827' ? '#D1D5DB' : '#555268'),
        cta_bg: rawVariant.theme?.cta_bg || rawVariant.primaryColor || arch.primaryColor,
        cta_color: rawVariant.theme?.cta_color || '#FFFFFF',
        cta_radius: rawVariant.theme?.cta_radius || '12px'
      }
    });
  }

  normalized.variants = finalVariants;
  return normalized;
}
