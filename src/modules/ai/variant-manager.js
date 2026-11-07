/**
 * Mailora.ai — Variant Manager
 * Constructs the 4 distinct creative design directions.
 */

export function buildBrandSpecificVariants(brandName, cfg, userSummary, extractedOffer, safeUrl) {
  const headline = typeof cfg.default_headline === 'function' ? cfg.default_headline(brandName) : cfg.default_headline;

  return [
    // 1. Signature Flagship
    {
      id: 1,
      style_name: `${cfg.art_direction} — Signature Flagship`,
      badge: `✦ ${cfg.art_direction.toUpperCase()}`,
      tone: cfg.tone,
      eyebrow: cfg.eyebrow,
      subject: headline,
      preheader: cfg.default_subheadline,
      headline: headline,
      subheadline: cfg.default_subheadline,
      body: userSummary,
      benefits: cfg.default_benefits,
      promo_box: extractedOffer || '',
      cta_text: cfg.cta_text,
      cta_url: safeUrl,
      secondary_cta_text: cfg.secondary_cta_text,
      secondary_cta_url: safeUrl,
      theme: {
        bg_outer: cfg.background_color,
        card_bg: cfg.card_background,
        card_border: `1px solid ${cfg.secondary_color}55`,
        font_family: cfg.heading_font,
        body_font: cfg.body_font,
        eyebrow_color: cfg.accent_color,
        headline_color: cfg.text_color,
        body_color: '#555268',
        cta_bg: cfg.primary_color,
        cta_color: '#FFFFFF',
        cta_radius: '12px'
      }
    },

    // 2. High-Contrast Atelier
    {
      id: 2,
      style_name: 'High-Contrast Atelier — Sắc Sảo Đương Đại',
      badge: '★ HIGH-CONTRAST ATELIER',
      tone: 'Sắc sảo, ấn tượng thị giác mạnh, phong cách atelier độc bản',
      eyebrow: 'EXCLUSIVE ATELIER · ARCHITECTURAL CUT',
      subject: `Kiến Tạo Đẳng Cấp Riêng Cùng ${brandName}`,
      preheader: 'Trải nghiệm sự khác biệt với ngôn ngữ thị giác tương phản mạnh mẽ.',
      headline: `Chuẩn Mực Tinh Hoa — ${brandName}`,
      subheadline: 'Sự hòa quyện giữa thẩm mỹ tối giản sắc nét và tư duy tạo tác khác biệt.',
      body: userSummary,
      benefits: [
        'Ngôn ngữ thiết kế tương phản cao tôn vinh giá trị sản phẩm',
        'Trải nghiệm thị giác độc nhất vô nhị gây ấn tượng tức thì',
        'Chi tiết may đo hoàn thiện chuẩn xác theo yêu cầu'
      ],
      promo_box: extractedOffer || '',
      cta_text: 'Khám Phá Bộ Sưu Tập',
      cta_url: safeUrl,
      secondary_cta_text: 'Đăng Ký Tư Vấn',
      secondary_cta_url: safeUrl,
      theme: {
        bg_outer: '#12111A',
        card_bg: '#1A1826',
        card_border: '1px solid #36324A',
        font_family: 'Instrument Serif',
        body_font: 'Plus Jakarta Sans',
        eyebrow_color: '#A99BF5',
        headline_color: '#FFFFFF',
        body_color: '#B5B1CC',
        cta_bg: '#6655E8',
        cta_color: '#FFFFFF',
        cta_radius: '10px'
      }
    },

    // 3. Editorial Storyteller
    {
      id: 3,
      style_name: 'Editorial Storyteller — Tự Sự Truyền Cảm Hứng',
      badge: '❦ EDITORIAL STORYTELLER',
      tone: 'Sâu lắng, chạm vào cảm xúc, khơi gợi lòng trắc ẩn',
      eyebrow: 'BEHIND THE SCENES · CRAFT NARRATIVE',
      subject: `Hành Trình Khởi Tạo Cảm Xúc Cùng ${brandName}`,
      preheader: 'Mỗi câu chuyện là một niềm đam mê được gửi gắm trọn vẹn.',
      headline: `Câu Chuyện Đằng Sau Từng Tác Phẩm Của ${brandName}`,
      subheadline: 'Chúng tôi tin rằng giá trị đích thực bắt nguồn từ sự tận tâm và tình yêu cái đẹp.',
      body: userSummary,
      benefits: [
        'Câu chuyện chân thực chạm đến trái tim người tiêu dùng',
        'Cam kết minh bạch về xuất xứ và quy trình chế tác',
        'Đồng hành cùng những giá trị nhân văn bền vững'
      ],
      promo_box: extractedOffer || '',
      cta_text: 'Đọc Trọn Vẹn Câu Chuyện',
      cta_url: safeUrl,
      secondary_cta_text: 'Lắng Nghe Chia Sẻ',
      secondary_cta_url: safeUrl,
      theme: {
        bg_outer: '#FAF8F5',
        card_bg: '#FFFFFF',
        card_border: '1px solid #EAE5DE',
        font_family: 'Playfair Display',
        body_font: 'Plus Jakarta Sans',
        eyebrow_color: '#9333EA',
        headline_color: '#2A2421',
        body_color: '#5C544E',
        cta_bg: '#4F39F6',
        cta_color: '#FFFFFF',
        cta_radius: '14px'
      }
    },

    // 4. Conversion Focus
    {
      id: 4,
      style_name: 'Conversion Focus — Thúc Đẩy Chuyển Đổi Nhanh',
      badge: '⚡ CONVERSION MAXIMIZER',
      tone: 'Rõ ràng, trực diện, kích thích quyết định hành động ngay',
      eyebrow: 'LIMITED OPPORTUNITY · TAKE ACTION',
      subject: `Ưu Tiên Đặc Quyền Hôm Nay — Bắt Đầu Cùng ${brandName}`,
      preheader: 'Số lượng suất ưu đãi có hạn. Hãy sở hữu ngay trước khi kết thúc.',
      headline: `Bắt Đầu Nâng Tầm Trải Nghiệm Cùng ${brandName}`,
      subheadline: 'Giải pháp hoàn hảo mang lại giá trị thiết thực và sự hài lòng vượt bậc.',
      body: userSummary,
      benefits: [
        'Quy trình đăng ký đơn giản chỉ mất 30 giây',
        'Được chuyên viên hỗ trợ 1-1 ngay sau khi kích hoạt',
        'Bảo đảm sự hài lòng trọn vẹn và an tâm tuyệt đối'
      ],
      promo_box: extractedOffer || '',
      cta_text: 'Hành Động Ngay Hôm Nay',
      cta_url: safeUrl,
      secondary_cta_text: 'Tìm Hiểu Thêm',
      secondary_cta_url: safeUrl,
      theme: {
        bg_outer: '#F4FBF7',
        card_bg: '#FFFFFF',
        card_border: '1px solid #C8E8D5',
        font_family: 'Plus Jakarta Sans',
        body_font: 'Plus Jakarta Sans',
        eyebrow_color: '#16A36A',
        headline_color: '#153E2B',
        body_color: '#3B604E',
        cta_bg: '#16A36A',
        cta_color: '#FFFFFF',
        cta_radius: '12px'
      }
    }
  ];
}
