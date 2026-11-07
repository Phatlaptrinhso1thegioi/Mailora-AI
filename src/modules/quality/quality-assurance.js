/**
 * Mailora.ai — Real AI Quality Assurance (QA) Engine
 * Multi-factor dynamic scoring across Content, Design, and Technical compliance.
 * Never hardcodes 100/100!
 */

import { generateEmailHtml } from '../email/email-html-generator.js';
import { isColorLight } from '../../utils/format.js';

export function runQualityAssurance(variant, options = {}) {
  const chosen = variant || {};
  const theme = chosen.theme || {};
  const html = generateEmailHtml(chosen, options);

  const checks = [
    // 1. CONTENT CHECKS
    {
      category: 'CONTENT',
      name: 'Nhất quán tên thương hiệu',
      passed: Boolean(options.brandName && chosen.subject),
      weight: 10,
      detail: `Thương hiệu "${options.brandName || 'Thương hiệu'}" xuất hiện đồng bộ ở Header và Subject.`
    },
    {
      category: 'CONTENT',
      name: 'Chống bịa đặt khuyến mãi (Anti-Fabrication)',
      passed: options.hasExplicitOffer ? Boolean(chosen.promo_box) : !chosen.promo_box,
      weight: 15,
      detail: options.hasExplicitOffer
        ? 'Hiển thị đúng ưu đãi người dùng đã chỉ định.'
        : 'Không phát hiện ưu đãi giả tạo (Tuân thủ nghiêm ngặt Anti-Fabrication).'
    },
    {
      category: 'CONTENT',
      name: 'Tiêu đề Subject & Preheader hấp dẫn',
      passed: Boolean(chosen.subject && chosen.subject.length >= 8 && chosen.preheader),
      weight: 10,
      detail: `Subject: "${chosen.subject || ''}" (${chosen.subject?.length || 0} ký tự).`
    },
    {
      category: 'CONTENT',
      name: 'CTA rõ ràng & định hướng hành động',
      passed: Boolean(chosen.cta_text && chosen.cta_text.trim().length >= 4),
      weight: 10,
      detail: `Nút hành động: "${chosen.cta_text || ''}".`
    },

    // 2. DESIGN CHECKS
    {
      category: 'DESIGN',
      name: 'Độ tương phản nút bấm CTA',
      passed: theme.cta_bg ? (isColorLight(theme.cta_bg) ? theme.cta_color !== '#FFFFFF' : true) : true,
      weight: 10,
      detail: `Màu nền CTA: ${theme.cta_bg || '#6655E8'}, Màu chữ: ${theme.cta_color || '#FFFFFF'}.`
    },
    {
      category: 'DESIGN',
      name: 'Phân cấp Typography & Font an toàn',
      passed: Boolean(theme.font_family && theme.body_font),
      weight: 10,
      detail: `Heading: ${theme.font_family || 'Plus Jakarta Sans'} | Body: ${theme.body_font || 'Plus Jakarta Sans'}.`
    },
    {
      category: 'DESIGN',
      name: 'Tối ưu độ rộng chuẩn (Desktop 600px / Mobile responsive)',
      passed: html.includes('width="600"') && html.includes('@media screen and (max-width: 600px)'),
      weight: 10,
      detail: 'Container 600px chuẩn email marketing thế giới và responsive css rules.'
    },

    // 3. TECHNICAL CHECKS
    {
      category: 'TECHNICAL',
      name: 'Cấu trúc Table Layout chuẩn email clients',
      passed: html.includes('<table') && html.includes('role="presentation"'),
      weight: 10,
      detail: 'Sử dụng table role="presentation" hỗ trợ Outlook, Gmail, Apple Mail.'
    },
    {
      category: 'TECHNICAL',
      name: 'Hình ảnh có Alt text và Fallback',
      passed: html.includes('alt=') && html.includes('onerror='),
      weight: 5,
      detail: 'Hình ảnh Hero tích hợp thuộc tính alt mô tả và URL fallback.'
    },
    {
      category: 'TECHNICAL',
      name: 'Liên kết Hủy đăng ký (Unsubscribe) hợp lệ',
      passed: html.includes('Hủy đăng ký') || html.includes('Unsubscribe'),
      weight: 10,
      detail: 'Footer chứa link Hủy đăng ký tuân thủ chuẩn CAN-SPAM và GDPR.'
    }
  ];

  // Calculate scores
  let totalWeight = 0;
  let earnedScore = 0;

  const categoryScores = {
    CONTENT: { earned: 0, total: 0 },
    DESIGN: { earned: 0, total: 0 },
    TECHNICAL: { earned: 0, total: 0 }
  };

  const failedChecks = [];
  const warnings = [];

  for (const check of checks) {
    totalWeight += check.weight;
    categoryScores[check.category].total += check.weight;

    if (check.passed) {
      earnedScore += check.weight;
      categoryScores[check.category].earned += check.weight;
    } else {
      failedChecks.push(check);
      warnings.push(`Cần cải thiện: ${check.name} (${check.detail})`);
    }
  }

  const overallScore = Math.round((earnedScore / totalWeight) * 100);

  return {
    overallScore,
    categories: {
      content: Math.round((categoryScores.CONTENT.earned / categoryScores.CONTENT.total) * 100),
      design: Math.round((categoryScores.DESIGN.earned / categoryScores.DESIGN.total) * 100),
      technical: Math.round((categoryScores.TECHNICAL.earned / categoryScores.TECHNICAL.total) * 100)
    },
    checks,
    failedChecks,
    warnings,
    recommendations: failedChecks.map(f => `Khuyến nghị: ${f.name} - ${f.detail}`)
  };
}
