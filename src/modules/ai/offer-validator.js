/**
 * Mailora.ai — Offer & Anti-Fabrication Validator
 * Strictly enforces policy: NEVER invent discounts, prices, voucher codes, or gifts
 * unless explicitly specified in the user prompt.
 */

export function detectExplicitOffer(rawPrompt) {
  if (!rawPrompt || typeof rawPrompt !== 'string') return null;

  const text = rawPrompt.toLowerCase();

  // Pattern 1: Percentage discount (e.g., 20%, 50%, giảm 30%)
  const percentMatch = text.match(/(?:giảm|ưu đãi|sale|discount|off)?\s*(\d{1,2}%)/i) || text.match(/(\d{1,2})\s*%/);
  // Pattern 2: Specific price or voucher (e.g., 199k, 500.000đ, voucher 100k)
  const priceMatch = text.match(/(\d+[\.,]?\d*)\s*(?:k|vnđ|đ|vnd|usd|\$)/i);
  // Pattern 3: Explicit promotion keywords (buy 1 get 1, freeship, quà tặng)
  const promoKeywords = ['mua 1 tặng 1', 'buy 1 get 1', 'freeship', 'miễn phí vận chuyển', 'quà tặng', 'voucher', 'coupon'];
  const hasPromoWord = promoKeywords.some(kw => text.includes(kw));

  if (!percentMatch && !priceMatch && !hasPromoWord) {
    return null; // NO EXPLICIT OFFER DETECTED -> DO NOT FABRICATE
  }

  let offerTitle = 'ƯU ĐÃI ĐẶC QUYỀN';
  let offerHighlight = '';

  if (percentMatch) {
    offerHighlight = `GIẢM ${percentMatch[1].toUpperCase()}`;
  } else if (priceMatch) {
    offerHighlight = `CHỈ TỪ ${priceMatch[0].toUpperCase()}`;
  } else if (text.includes('mua 1 tặng 1') || text.includes('buy 1 get 1')) {
    offerHighlight = 'MUA 1 TẶNG 1';
  } else if (text.includes('freeship') || text.includes('miễn phí vận chuyển')) {
    offerHighlight = 'FREESHIP TOÀN QUỐC';
  } else {
    offerHighlight = 'QUÀ TẶNG GIỚI HẠN';
  }

  return {
    isExplicit: true,
    title: offerTitle,
    highlight: offerHighlight,
    note: 'Áp dụng cho đơn hàng đặt trực tiếp hôm nay.'
  };
}
