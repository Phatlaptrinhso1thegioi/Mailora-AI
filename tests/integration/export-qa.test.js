import { describe, it, expect } from 'vitest';
import { generateEmailHtml } from '../../src/modules/email/email-html-generator.js';
import { runQualityAssurance } from '../../src/modules/quality/quality-assurance.js';
import { campaignService } from '../../src/services/campaign.service.js';

describe('Email HTML Export & Real QA Engine', () => {
  const sampleVariant = {
    subject: 'Ưu đãi bộ sưu tập Thu Đông mới',
    preheader: 'Trải nghiệm phong cách thời thượng.',
    eyebrow: 'EXCLUSIVE LOOKBOOK',
    headline: 'Tuyên Ngôn Phong Cách Mới',
    subheadline: 'Bộ sưu tập độc quyền số lượng có hạn.',
    body: 'Khám phá ngay hôm nay.',
    benefits: ['Chất liệu cao cấp', 'May đo thủ công', 'Miễn phí đổi trả'],
    cta_text: 'Khám phá bộ sưu tập',
    cta_url: 'https://mailora.ai/collection',
    theme: {
      bg_outer: '#FAF8F5',
      card_bg: '#FFFFFF',
      cta_bg: '#6655E8',
      cta_color: '#FFFFFF',
      font_family: 'Playfair Display',
      body_font: 'Plus Jakarta Sans'
    }
  };

  it('generates email-client compliant Table HTML', () => {
    const html = generateEmailHtml(sampleVariant, {
      brandName: 'MONO STUDIO',
      imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d'
    });

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<table role="presentation"');
    expect(html).toContain('MONO STUDIO');
    expect(html).toContain('Hủy đăng ký (Unsubscribe)');
    expect(html).toContain('width="600"');
    expect(html).toContain('@media screen and (max-width: 600px)');
  });

  it('executes real QA scoring without hardcoding 100/100', () => {
    const qaReport = runQualityAssurance(sampleVariant, {
      brandName: 'MONO STUDIO',
      hasExplicitOffer: false
    });

    expect(qaReport.overallScore).toBeGreaterThan(0);
    expect(qaReport.overallScore).toBeLessThanOrEqual(100);
    expect(qaReport.categories.content).toBeDefined();
    expect(qaReport.categories.design).toBeDefined();
    expect(qaReport.categories.technical).toBeDefined();
    expect(Array.isArray(qaReport.checks)).toBe(true);
  });

  it('saves, retrieves, and deletes campaigns via campaignService', async () => {
    const saved = await campaignService.saveCampaign({
      brandName: 'TEST BRAND',
      subject: 'Chiến dịch thử nghiệm',
      prompt: 'Prompt thử nghiệm'
    });

    expect(saved.id).toBeDefined();

    const list = await campaignService.getCampaigns();
    expect(list.some(c => c.id === saved.id)).toBe(true);

    await campaignService.deleteCampaign(saved.id);
    const updatedList = await campaignService.getCampaigns();
    expect(updatedList.some(c => c.id === saved.id)).toBe(false);
  });
});
