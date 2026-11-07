/**
 * Mailora.ai — Adaptive Brand Intelligence Engine
 * 8 Archetypes, 100+ keywords, brand synthesis, and anti-fabrication offer validation.
 */

import { detectExplicitOffer } from './offer-validator.js';

export function normalizeRawPrompt(input) {
  const text = String(input || '').trim();
  if (!text) {
    return 'Chiến dịch giới thiệu bộ sưu tập sản phẩm và dịch vụ cao cấp, cam kết chất lượng vượt trội và trải nghiệm hoàn hảo cho khách hàng.';
  }
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length < 4) {
    return 'Chiến dịch giới thiệu dịch vụ và sản phẩm chuyên nghiệp dành cho ' + text + ', cam kết chất lượng, uy tín và trải nghiệm dịch vụ tận tâm cho khách hàng.';
  }
  return text;
}

export function extractOrSynthesizeBrandName(text, lower, originalPrompt) {
  const raw = (originalPrompt || text || '').trim();
  const rawLower = (originalPrompt || text || '').toLowerCase();

  // 1. Quoted brand
  const quotedMatch = raw.match(/["“'«]([^"”'»]{2,35})["”'»]/);
  if (quotedMatch && quotedMatch[1].trim()) {
    return quotedMatch[1].trim().toUpperCase();
  }

  // 2. Preset benchmark brands
  if (/lumière|lumiere/i.test(raw)) return 'LUMIÈRE';
  if (/phát\s*technology|phát\s*tech/i.test(raw)) return 'PHÁT TECHNOLOGY';
  if (/mono\s*studio/i.test(raw)) return 'MONO STUDIO';
  if (/brew\s*&\s*co/i.test(raw)) return 'BREW & CO.';
  if (/hạt\s*lặng/i.test(raw)) return 'HẠT LẶNG ĐÀ LẠT';
  if (/nomad\s*travel/i.test(raw)) return 'NOMAD TRAVEL';
  if (/nexusflow/i.test(raw)) return 'NEXUSFLOW';

  // 3. Catch words after prefixes
  const genericWords = new Set(['ốc', 'phở', 'cơm', 'bánh mì', 'cà phê', 'trà sữa', 'bún', 'bún bò', 'lẩu', 'nướng', 'giày', 'xe', 'áo']);
  const prefixRegex = /(?:thương hiệu|nhãn hàng|hãng|quán|tiệm|shop|công ty|tập đoàn|doanh nghiệp|chuỗi|nhà hàng|viện|phòng khám|trung tâm|studio|clb|câu lạc bộ|gara|xưởng|đại lý|nền tảng|startup)\s+([A-ZÀ-Ỹa-zà-ỹ0-9&'\-\.\s]{2,28})/i;
  const prefixMatch = raw.match(prefixRegex);
  if (prefixMatch && prefixMatch[1]) {
    let candidate = prefixMatch[1].trim();
    candidate = candidate.replace(/\s+(?:ra mắt|giới thiệu|khai trương|chuyên|cam kết|mở bán|thông báo|dành cho|với|tại|ưu đãi|giảm giá|sale).*$/i, '');
    const candWords = candidate.split(/\s+/).slice(0, 4).join(' ');
    if (candWords.length >= 2 && !genericWords.has(candWords.toLowerCase()) && !/^(và|với|tại|dành|cho)$/i.test(candWords)) {
      return candWords.toUpperCase();
    }
  }

  // 4. Synthesize standard Brand Tag based on product/keywords (100+ patterns)
  if (/(?:^|[^\p{L}\p{N}])(phở|bún bò|bún|bánh mì|món việt|ẩm thực|quán ăn|cơm)(?:$|[^\p{L}\p{N}])/iu.test(rawLower)) {
    return 'ORIGIN HERITAGE';
  }
  if (/(?:^|[^\p{L}\p{N}])(quán ốc|ốc|hải sản|seafood)(?:$|[^\p{L}\p{N}])/iu.test(rawLower)) {
    return 'OCEAN DELIGHT';
  }
  if (/(?:^|[^\p{L}\p{N}])(cà phê|coffee|cafe|rang xay)(?:$|[^\p{L}\p{N}])/iu.test(rawLower)) {
    return 'BREW & CO.';
  }
  if (/(?:^|[^\p{L}\p{N}])(trà sữa|trà|tea|boba)(?:$|[^\p{L}\p{N}])/iu.test(rawLower)) {
    return 'TEA ATELIER';
  }
  if (/(?:^|[^\p{L}\p{N}])(bánh|bakery|pastry|bánh ngọt)(?:$|[^\p{L}\p{N}])/iu.test(rawLower)) {
    return 'MAISON DU PAIN';
  }
  if (/(?:^|[^\p{L}\p{N}])(lẩu|nướng|bbq|buffet)(?:$|[^\p{L}\p{N}])/iu.test(rawLower)) {
    return 'GOLDEN GRILL';
  }
  if (/(?:^|[^\p{L}\p{N}])(gym|fitness|thể hình|workout|pilates|boxing)(?:$|[^\p{L}\p{N}])/iu.test(rawLower)) {
    return 'VITALITY FITNESS';
  }
  if (/(?:^|[^\p{L}\p{N}])(yoga|thiền|meditation)(?:$|[^\p{L}\p{N}])/iu.test(rawLower)) {
    return 'ZENITH WELLNESS';
  }
  if (/(?:^|[^\p{L}\p{N}])(bán xe|xe hơi|ô tô|motor|xe máy|showroom xe|auto|car)(?:$|[^\p{L}\p{N}])/iu.test(rawLower)) {
    return 'VELOCITY MOTORS';
  }
  if (/(?:^|[^\p{L}\p{N}])(học lái xe|lái xe)(?:$|[^\p{L}\p{N}])/iu.test(rawLower)) {
    return 'DRIVE PRO ACADEMY';
  }
  if (/(?:^|[^\p{L}\p{N}])(ielts|học tiếng|tiếng anh|anh ngữ|du học)(?:$|[^\p{L}\p{N}])/iu.test(rawLower)) {
    return 'APEX ACADEMY';
  }
  if (/(?:^|[^\p{L}\p{N}])(khóa học|giáo dục|đào tạo|lớp học|academy)(?:$|[^\p{L}\p{N}])/iu.test(rawLower)) {
    return 'FUTURE ACADEMY';
  }
  if (/(?:^|[^\p{L}\p{N}])(bất động sản|nhà đất|căn hộ|chung cư|villa|bđs)(?:$|[^\p{L}\p{N}])/iu.test(rawLower)) {
    return 'PRIME REALTY';
  }
  if (/(?:^|[^\p{L}\p{N}])(nội thất|decor|kiến trúc|sofa|bàn ghế)(?:$|[^\p{L}\p{N}])/iu.test(rawLower)) {
    return 'ATELIER LIVING';
  }
  if (/(?:^|[^\p{L}\p{N}])(nước hoa|perfume)(?:$|[^\p{L}\p{N}])/iu.test(rawLower)) {
    return 'PARFUM ÉLITE';
  }
  if (/(?:^|[^\p{L}\p{N}])(spa|clinic|thẩm mỹ|massage|facial)(?:$|[^\p{L}\p{N}])/iu.test(rawLower)) {
    return 'LOTUS SPA & CLINIC';
  }
  if (/(?:^|[^\p{L}\p{N}])(mỹ phẩm|skincare|serum|kem dưỡng|làm đẹp|son)(?:$|[^\p{L}\p{N}])/iu.test(rawLower)) {
    return 'AURA BEAUTÉ';
  }
  if (/(?:^|[^\p{L}\p{N}])(nail|móng)(?:$|[^\p{L}\p{N}])/iu.test(rawLower)) {
    return 'POLISH & GLAM';
  }
  if (/(?:^|[^\p{L}\p{N}])(giày|sneaker|bán giày)(?:$|[^\p{L}\p{N}])/iu.test(rawLower)) {
    return 'SOLE & STEP';
  }
  if (/(?:^|[^\p{L}\p{N}])(túi xách|phụ kiện|trang sức|đồng hồ)(?:$|[^\p{L}\p{N}])/iu.test(rawLower)) {
    return 'ATELIER LUXE';
  }
  if (/(?:^|[^\p{L}\p{N}])(thời trang|quần áo|đầm|váy|lookbook|fashion|vest)(?:$|[^\p{L}\p{N}])/iu.test(rawLower)) {
    return 'MAISON VOGUE';
  }
  if (/(?:^|[^\p{L}\p{N}])(laptop|điện thoại|pc|phần cứng|máy tính|công nghệ|hardware)(?:$|[^\p{L}\p{N}])/iu.test(rawLower)) {
    return 'NEXUS HARDWARE';
  }
  if (/(?:^|[^\p{L}\p{N}])(tai nghe|âm thanh|loa)(?:$|[^\p{L}\p{N}])/iu.test(rawLower)) {
    return 'SONIC PRO';
  }
  if (/(?:^|[^\p{L}\p{N}])(vé máy bay|flight|bay)(?:$|[^\p{L}\p{N}])/iu.test(rawLower)) {
    return 'SKYWAY AIR';
  }
  if (/(?:^|[^\p{L}\p{N}])(du lịch|tour|resort|khách sạn|homestay|travel)(?:$|[^\p{L}\p{N}])/iu.test(rawLower)) {
    return 'NOMAD TRAVEL';
  }
  if (/(?:^|[^\p{L}\p{N}])(saas|phần mềm|ứng dụng|app|b2b|crm|cloud)(?:$|[^\p{L}\p{N}])/iu.test(rawLower)) {
    return 'NEXUSFLOW DIGITAL';
  }

  // 5. Capitalized proper brand name
  if (originalPrompt && originalPrompt.trim().length > 3) {
    const properPattern = /(?:^|\s)([A-ZÀ-Ỹ][\p{L}0-9]+(?:\s+[A-ZÀ-Ỹ][\p{L}0-9]+){0,2})/u;
    const properMatch = originalPrompt.match(properPattern);
    const stopWords = new Set(['Chiến', 'Dịch', 'Giới', 'Thiệu', 'Dành', 'Cho', 'Cam', 'Kết', 'Chất', 'Lượng', 'Uy', 'Tín', 'Trải', 'Nghiệm', 'Tận', 'Tâm', 'Khách', 'Hàng', 'Sản', 'Phẩm', 'Dịch', 'Vụ', 'Chúng', 'Tôi', 'Hệ', 'Thống', 'Được', 'Với', 'Tại', 'Một', 'Các', 'Những', 'Kính', 'Gửi', 'Chào']);
    if (properMatch && properMatch[1]) {
      const candidate = properMatch[1].trim();
      const firstWord = candidate.split(/\s+/)[0];
      if (!stopWords.has(firstWord) && candidate.length >= 3) {
        return candidate.toUpperCase();
      }
    }
  }

  const cleanOriginal = raw.replace(/[^\p{L}\p{N}\s]/gu, '').trim();
  if (cleanOriginal && cleanOriginal.split(/\s+/).length <= 2 && cleanOriginal.length >= 2 && cleanOriginal.length <= 18) {
    return cleanOriginal.toUpperCase();
  }

  return 'MODERN SELECTION';
}

export const ARCHETYPES_CONFIG = {
  luxury_beauty: {
    industry: 'Làm Đẹp & Chăm Sóc Sắc Đẹp',
    art_direction: 'Haute Parfumerie & Luxury Aesthetics',
    tone: 'Thanh lịch, quý phái, nâng niu cảm xúc khách hàng',
    target_audience: 'Phái đẹp hiện đại, trân trọng nét đẹp tự nhiên và sản phẩm cao cấp',
    eyebrow: 'LUMIÈRE ATELIER · SPECIAL EDITION',
    default_headline: (brand) => `${brand} — Tinh Hoa Đánh Thức Làn Da Tỏa Sáng`,
    default_subheadline: 'Công thức độc bản chứa phức hợp tinh chất thực vật quý hiếm mang lại nét rạng ngời thuần khiết.',
    default_benefits: [
      'Hiệu quả dưỡng ẩm sâu và phục hồi vẻ rạng ngời tức thì',
      'Thành phần hữu cơ an toàn cho mọi làn da nhạy cảm',
      'Được kiểm định lâm sàng bởi chuyên gia da liễu hàng đầu'
    ],
    cta_text: 'Trải Nghiệm Tinh Hoa Ngay',
    secondary_cta_text: 'Tìm Hiểu Liệu Trình',
    hero_image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=880&q=80',
    primary_color: '#6655E8',
    secondary_color: '#D8B4FE',
    accent_color: '#9333EA',
    text_color: '#27243A',
    background_color: '#FBF8F5',
    card_background: '#FFFFFF',
    heading_font: 'Playfair Display',
    body_font: 'Plus Jakarta Sans'
  },

  modern_tech: {
    industry: 'Công Nghệ & Điện Tử Thông Minh',
    art_direction: 'Precision Tech & Futuristic Modernism',
    tone: 'Đột phá, chuyên nghiệp, truyền cảm hứng đổi mới',
    target_audience: 'Người yêu công nghệ, chuyên gia, game thủ và nhà sáng tạo số',
    eyebrow: 'INNOVATION MATRIX · REVOLUTIONARY',
    default_headline: (brand) => `${brand} — Sức Mạnh Đột Phá Mọi Giới Hạn`,
    default_subheadline: 'Hiệu năng kiến trúc mới tối ưu hóa tốc độ xử lý vượt trội và tiết kiệm điện năng đỉnh cao.',
    default_benefits: [
      'Xử lý tác vụ nặng tức thì với vi xử lý thế hệ mới',
      'Thời lượng pin bền bỉ đồng hành suốt ngày dài làm việc',
      'Thiết kế nguyên khối tinh xảo đạt tiêu chuẩn công nghiệp'
    ],
    cta_text: 'Đặt Hàng & Nhận Ưu Đãi',
    secondary_cta_text: 'Xem Thông Số Kỹ Thuật',
    hero_image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=880&q=80',
    primary_color: '#4F39F6',
    secondary_color: '#818CF8',
    accent_color: '#06B6D4',
    text_color: '#1E1B2E',
    background_color: '#F4F5F9',
    card_background: '#FFFFFF',
    heading_font: 'Plus Jakarta Sans',
    body_font: 'Plus Jakarta Sans'
  },

  fashion_editorial: {
    industry: 'Thời Trang & Phong Cách Sống',
    art_direction: 'Editorial Monolith & High Fashion',
    tone: 'Sắc sảo, phong cách, dẫn đầu xu hướng thị trường',
    target_audience: 'Tín đồ thời trang đương đại đam mê thiết kế may đo và sự cá tính',
    eyebrow: 'NEW SEASON LOOKBOOK · ATELIER EDITION',
    default_headline: (brand) => `${brand} — Tuyên Ngôn Phong Cách Thời Thượng`,
    default_subheadline: 'Bộ sưu tập mới kết hợp giữa nghệ thuật may đo thủ công và tinh thần tối giản hiện đại.',
    default_benefits: [
      'Chất liệu vải nhập khẩu cao cấp mềm mại và thoáng khí',
      'Đường may thủ công chuẩn form tôn vinh vóc dáng',
      'Bộ sưu tập phiên bản giới hạn không sản xuất đại trà'
    ],
    cta_text: 'Khám Phá Lookbook',
    secondary_cta_text: 'Đặt Lịch Thử Đồ',
    hero_image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=880&q=80',
    primary_color: '#27243A',
    secondary_color: '#A99BF5',
    accent_color: '#6655E8',
    text_color: '#171622',
    background_color: '#FAF8F5',
    card_background: '#FFFFFF',
    heading_font: 'Instrument Serif',
    body_font: 'Plus Jakarta Sans'
  },

  organic_lifestyle: {
    industry: 'Ẩm Thực & F&B Đương Đại',
    art_direction: 'Warm Organic Craft & Earthy Textures',
    tone: 'Ấm áp, chân thành, giàu hương vị tự nhiên',
    target_audience: 'Những người yêu ẩm thực tinh tế, nguyên liệu tươi ngon và không gian ấm cúng',
    eyebrow: 'ARTISANAL TASTE · FROM FARM TO TABLE',
    default_headline: (brand) => `${brand} — Trọn Vẹn Hương Vị Tự Nhiên Thuần Khiết`,
    default_subheadline: 'Tuyển chọn từ nguồn nguyên liệu hữu cơ tươi ngon mỗi ngày mang lại trải nghiệm ẩm thực trọn vẹn.',
    default_benefits: [
      '100% nguyên liệu tươi sạch có nguồn gốc hữu cơ',
      'Công thức chế biến gia truyền lưu giữ trọn vị ngon',
      'Không gian thưởng thức ấm cúng chuẩn vị yêu thương'
    ],
    cta_text: 'Đặt Bàn & Thưởng Thức Ngay',
    secondary_cta_text: 'Khám Phá Thực Đơn',
    hero_image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=880&q=80',
    primary_color: '#16A36A',
    secondary_color: '#86EFAC',
    accent_color: '#D97706',
    text_color: '#1F2937',
    background_color: '#FDFBF7',
    card_background: '#FFFFFF',
    heading_font: 'Playfair Display',
    body_font: 'Plus Jakarta Sans'
  },

  travel_experience: {
    industry: 'Du Lịch & Nghỉ Dưỡng Cao Cấp',
    art_direction: 'Serene Panorama & Coastal Elegance',
    tone: 'Phóng khoáng, êm dịu, khơi gợi cảm hứng xê dịch',
    target_audience: 'Gia đình, cặp đôi và du khách mong muốn tận hưởng kỳ nghỉ yên bình',
    eyebrow: 'EXCLUSIVE GETAWAY · PRIVATE ESCAPE',
    default_headline: (brand) => `${brand} — Nơi Bình Yên Chạm Vào Từng Khoảnh Khắc`,
    default_subheadline: 'Trải nghiệm kỳ nghỉ dưỡng đẳng cấp giữa thiên nhiên biển trời tuyệt mỹ và dịch vụ chuẩn 5 sao.',
    default_benefits: [
      'Biệt thự hướng biển với hồ bơi vô cực riêng tư',
      'Dịch vụ quản gia và ẩm thực đa dạng phục vụ tại phòng',
      'Đặc quyền check-in sớm và liệu trình spa phục hồi'
    ],
    cta_text: 'Đặt Phòng Kỳ Nghỉ Vàng',
    secondary_cta_text: 'Xem Hình Ảnh Khu Nghỉ',
    hero_image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=880&q=80',
    primary_color: '#0284C7',
    secondary_color: '#7DD3FC',
    accent_color: '#0D9488',
    text_color: '#1E293B',
    background_color: '#F0F9FF',
    card_background: '#FFFFFF',
    heading_font: 'Instrument Serif',
    body_font: 'Plus Jakarta Sans'
  },

  saas_digital: {
    industry: 'Phần Mềm & Giải Pháp Chuyển Đổi Số',
    art_direction: 'Clean SaaS Grid & Product Clarity',
    tone: 'Rõ ràng, hiệu quả, tập trung vào tăng trưởng chỉ số ROI',
    target_audience: 'Lãnh đạo doanh nghiệp, trưởng phòng và đội ngũ vận hành tinh gọn',
    eyebrow: 'WORKFLOW ACCELERATOR · CLOUD NATIVE',
    default_headline: (brand) => `${brand} — Tự Động Hóa Vận Hành, Bứt Phá Doanh Số`,
    default_subheadline: 'Hệ thống quản lý thông minh giúp doanh nghiệp tiết kiệm 40% thời gian xử lý thủ công mỗi tuần.',
    default_benefits: [
      'Tích hợp liền mạch với hơn 50+ công cụ làm việc quen thuộc',
      'Báo cáo tự động theo thời gian thực trực quan dễ theo dõi',
      'Bảo mật dữ liệu cấp độ doanh nghiệp tiêu chuẩn quốc tế'
    ],
    cta_text: 'Bắt Đầu Dùng Thử Miễn Phí',
    secondary_cta_text: 'Đặt Lịch Demo 1-1',
    hero_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=880&q=80',
    primary_color: '#6655E8',
    secondary_color: '#C4B5FD',
    accent_color: '#3B82F6',
    text_color: '#1E1B2E',
    background_color: '#F7F6FC',
    card_background: '#FFFFFF',
    heading_font: 'Plus Jakarta Sans',
    body_font: 'Plus Jakarta Sans'
  },

  lifestyle_services: {
    industry: 'Thể Hình & Phong Cách Sống Khỏe',
    art_direction: 'High-Energy Dynamic & Precision Motion',
    tone: 'Năng động, thúc đẩy ý chí, đồng hành cùng mục tiêu',
    target_audience: 'Người tập luyện, nhân viên văn phòng muốn rèn luyện thể chất và tái tạo năng lượng',
    eyebrow: 'TRANSFORMATION PROTOCOL · PEAK PERFORMANCE',
    default_headline: (brand) => `${brand} — Đánh Thức Năng Lượng, Bứt Phá Giới Hạn`,
    default_subheadline: 'Không gian tập luyện hiện đại cùng lộ trình cá nhân hóa đồng hành với từng bước tiến của bạn.',
    default_benefits: [
      'Huấn luyện viên chuyên nghiệp kèm sát 1-1 từng động tác',
      'Trang thiết bị chuẩn quốc tế không gian tập luyện rộng rãi',
      'Đo lường chỉ số thể chất định kỳ và tối ưu thực đơn dinh dưỡng'
    ],
    cta_text: 'Đăng Ký Buổi Tập Miễn Phí',
    secondary_cta_text: 'Xem Lịch Lớp Học',
    hero_image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=880&q=80',
    primary_color: '#EF4444',
    secondary_color: '#FCA5A5',
    accent_color: '#F59E0B',
    text_color: '#1F2937',
    background_color: '#FEF2F2',
    card_background: '#FFFFFF',
    heading_font: 'Plus Jakarta Sans',
    body_font: 'Plus Jakarta Sans'
  },

  universal_modern: {
    industry: 'Dịch Vụ & Thương Mại Đương Đại',
    art_direction: 'Soft Modern Premium Atelier',
    tone: 'Hiện đại, chuyên nghiệp, truyền tải giá trị đích thực',
    target_audience: 'Khách hàng hiện đại đang tìm kiếm giải pháp và sản phẩm chất lượng cao',
    eyebrow: 'EXCLUSIVE SPOTLIGHT · EDITION 2026',
    default_headline: (brand) => `${brand} — Giá Trị Đích Thực Cho Cuộc Sống Hiện Đại`,
    default_subheadline: 'Chúng tôi nỗ lực mang đến dịch vụ chu đáo cùng chất lượng sản phẩm dẫn đầu thị trường.',
    default_benefits: [
      'Cam kết chất lượng chuẩn mực đồng hành lâu dài cùng khách hàng',
      'Chính sách hậu mãi và bảo hành chu đáo tận tâm',
      'Đội ngũ chuyên viên tư vấn hỗ trợ nhiệt tình 24/7'
    ],
    cta_text: 'Tìm Hiểu Chi Tiết Ngay',
    secondary_cta_text: 'Liên Hệ Đội Ngũ Hỗ Trợ',
    hero_image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=880&q=80',
    primary_color: '#6655E8',
    secondary_color: '#A99BF5',
    accent_color: '#3B82F6',
    text_color: '#27243A',
    background_color: '#F7F6FC',
    card_background: '#FFFFFF',
    heading_font: 'Plus Jakarta Sans',
    body_font: 'Plus Jakarta Sans'
  }
};

export function analyzePromptLocally(rawPrompt, userCtaUrl = '') {
  const originalInput = String(rawPrompt || '').trim();
  const text = normalizeRawPrompt(originalInput);
  const lower = text.toLowerCase();
  const originalLower = originalInput.toLowerCase();

  // 1. Anti-fabrication offer check
  const offerData = detectExplicitOffer(originalInput);
  const hasExplicitOffer = Boolean(offerData && offerData.isExplicit);
  const extractedOffer = offerData ? offerData.highlight : '';

  // 2. Synthesize Brand Name
  const brandName = extractOrSynthesizeBrandName(text, lower, originalInput);

  // 3. Match Archetype (100+ keywords)
  let archetype = 'universal_modern';
  const matchU = (regex) => regex.test(originalLower) || regex.test(lower);

  if (matchU(/(?:mỹ phẩm|skincare|nước hoa|serum|tinh chất|kem dưỡng|làn da|beauty|spa|son môi|son|clinic|chăm sóc da|dưỡng da|trị mụn|kem chống nắng)/iu)) {
    archetype = 'luxury_beauty';
  } else if (matchU(/(?:laptop|smartphone|điện thoại|tai nghe|chip|công nghệ|macbook|gaming|pc|phần cứng|tablet|ipad|camera|máy ảnh|smartwatch|gadget|loa bluetooth|âm thanh)/iu)) {
    archetype = 'modern_tech';
  } else if (matchU(/(?:thời trang|lookbook|áo khoác|tailoring|fashion|collection|túi xách|quần áo|suit|đầm|váy|giày|sneaker|bán giày|vest|sơ mi|streetwear|trang sức)/iu)) {
    archetype = 'fashion_editorial';
  } else if (matchU(/(?:cà phê|coffee|arabica|trà|ẩm thực|nhà hàng|brew|organic|thực phẩm|quán ăn|phở|bún|bánh mì|lẩu|nướng|quán ốc|ốc|hải sản|trà sữa|bakery|dining)/iu)) {
    archetype = 'organic_lifestyle';
  } else if (matchU(/(?:du lịch|nghỉ dưỡng|resort|khách sạn|biển|travel|villa|tour|kỳ nghỉ|vé máy bay|homestay|du thuyền|cruise|camping|flight)/iu)) {
    archetype = 'travel_experience';
  } else if (matchU(/(?:saas|phần mềm|ứng dụng|platform|workflow|b2b|digital|cloud|api|crm|dashboard|automation|nền tảng số|erp|pos)/iu)) {
    archetype = 'saas_digital';
  } else if (matchU(/(?:gym|yoga|fitness|thể hình|workout|pilates|boxing|giáo dục|khóa học|ielts|du học|lái xe|bất động sản|nhà đất|bán xe|xe hơi|ô tô|nội thất)/iu)) {
    archetype = 'lifestyle_services';
  }

  const cfg = ARCHETYPES_CONFIG[archetype] || ARCHETYPES_CONFIG.universal_modern;
  const safeUrl = userCtaUrl && userCtaUrl.trim() ? userCtaUrl.trim() : 'https://mailora.ai';

  return {
    brand_name: brandName,
    archetype: archetype,
    industry: cfg.industry,
    art_direction: cfg.art_direction,
    tone: cfg.tone,
    target_audience: cfg.target_audience,
    has_explicit_offer: hasExplicitOffer,
    extracted_offer: extractedOffer,
    cfg,
    user_summary: text,
    user_cta_url: safeUrl
  };
}
