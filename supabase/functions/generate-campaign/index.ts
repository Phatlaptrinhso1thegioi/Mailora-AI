import { handleCors, corsHeaders } from '../_shared/cors.ts';
import { authenticateUser } from '../_shared/auth.ts';
import { ServerGeminiClient } from '../_shared/gemini-client.ts';
import { deductCreditsServerSide } from '../_shared/credits.ts';
import { checkRateLimit } from '../_shared/rate-limit.ts';
import { validateCampaignInput } from '../_shared/validation.ts';
import { createErrorResponse, createSuccessResponse } from '../_shared/errors.ts';

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const requestId = crypto.randomUUID();

  try {
    // 1. Authenticate user
    const { user, supabase } = await authenticateUser(req);

    // 2. Rate limiting (20 requests per minute per user)
    if (!checkRateLimit(`ratelimit_${user.id}`, 20, 60000)) {
      return createErrorResponse(new Error('RATE_LIMIT: Quá nhiều yêu cầu tạo chiến dịch. Vui lòng thử lại sau.'), requestId);
    }

    // 3. Parse and validate input
    const body = await req.json().catch(() => ({}));
    const { prompt, ctaUrl, model } = validateCampaignInput(body);

    const idempotencyKey = req.headers.get('X-Idempotency-Key') || `gen_${requestId}`;

    // 4. Atomic credit deduction (1 credit)
    await deductCreditsServerSide(supabase, 1, 'AI_GENERATION', requestId, idempotencyKey);

    // 5. Build prompt for Gemini structured response
    const geminiClient = new ServerGeminiClient();
    const systemInstruction = `Bạn là Senior AI Creative Director và Email Marketing Architect hàng đầu của Mailora.ai.
Nhiệm vụ: Phân tích prompt của người dùng, phân loại chính xác ngành hàng (luxury_beauty, modern_tech, fashion_editorial, organic_lifestyle, travel_experience, saas_digital, lifestyle_services, universal_modern), và tạo ra cấu trúc chiến dịch email marketing chuẩn xác.
Quy tắc chống bịa đặt (Anti-Fabrication Guard):
- TUYỆT ĐỐI KHÔNG tự bịa đặt % giảm giá, voucher code, giá tiền cụ thể nếu người dùng không nhắc đến.
- Trả về đúng định dạng JSON được yêu cầu.`;

    const userPrompt = `Phân tích yêu cầu chiến dịch: "${prompt}".
CTA URL người dùng: "${ctaUrl}".
Hãy tạo cấu trúc JSON chiến dịch gồm các trường:
{
  "brandName": "Tên thương hiệu chuẩn",
  "industry": "Tên ngành hàng",
  "archetype": "luxury_beauty | modern_tech | fashion_editorial | organic_lifestyle | travel_experience | saas_digital | lifestyle_services | universal_modern",
  "targetAudience": "Đối tượng khách hàng mục tiêu",
  "campaignObjective": "Mục tiêu chiến dịch",
  "artDirection": "Định hướng nghệ thuật và màu sắc",
  "subject": "Tiêu đề email hấp dẫn",
  "preheader": "Đoạn mô tả ngắn hiển thị trước khi mở email",
  "heroPrompt": "Prompt chi tiết để tạo ảnh Hero",
  "hasExplicitOffer": false,
  "promo": null,
  "variants": [
    {
      "id": "variant_1",
      "styleName": "Signature Flagship",
      "headline": "Tiêu đề chính",
      "subheadline": "Tiêu đề phụ",
      "body": "Nội dung thuyết phục chuẩn email marketing",
      "primaryCta": "Kêu gọi hành động chính",
      "ctaUrl": "${ctaUrl}",
      "benefits": ["Lợi ích 1", "Lợi ích 2", "Lợi ích 3"],
      "primaryColor": "#6655E8",
      "cardColor": "#FFFFFF",
      "headingFont": "Plus Jakarta Sans",
      "bodyFont": "Plus Jakarta Sans"
    },
    {
      "id": "variant_2",
      "styleName": "High-Contrast Atelier",
      "headline": "Tiêu đề nghệ thuật và tương phản",
      "subheadline": "Tiêu đề phụ sắc sảo",
      "body": "Nội dung phong cách atelier cao cấp",
      "primaryCta": "Khám phá ngay",
      "ctaUrl": "${ctaUrl}",
      "benefits": ["Lợi ích 1", "Lợi ích 2", "Lợi ích 3"],
      "primaryColor": "#27243A",
      "cardColor": "#FAF9FE",
      "headingFont": "Instrument Serif",
      "bodyFont": "Plus Jakarta Sans"
    },
    {
      "id": "variant_3",
      "styleName": "Editorial Storyteller",
      "headline": "Tiêu đề tự sự truyền cảm hứng",
      "subheadline": "Câu chuyện thương hiệu",
      "body": "Nội dung dẫn dắt cảm xúc người đọc",
      "primaryCta": "Đọc toàn bộ câu chuyện",
      "ctaUrl": "${ctaUrl}",
      "benefits": ["Lợi ích 1", "Lợi ích 2", "Lợi ích 3"],
      "primaryColor": "#4F39F6",
      "cardColor": "#FFFFFF",
      "headingFont": "Playfair Display",
      "bodyFont": "Plus Jakarta Sans"
    },
    {
      "id": "variant_4",
      "styleName": "Conversion Focus",
      "headline": "Tiêu đề tập trung chuyển đổi nhanh",
      "subheadline": "Lý do hành động ngay lập tức",
      "body": "Nội dung ngắn gọn, súc tích, thúc đẩy hành vi",
      "primaryCta": "Bắt đầu trải nghiệm ngay",
      "ctaUrl": "${ctaUrl}",
      "benefits": ["Lợi ích 1", "Lợi ích 2", "Lợi ích 3"],
      "primaryColor": "#16A36A",
      "cardColor": "#FFFFFF",
      "headingFont": "Plus Jakarta Sans",
      "bodyFont": "Plus Jakarta Sans"
    }
  ]
}`;

    const structuredResult = await geminiClient.generateStructuredContent(userPrompt, {
      model,
      systemInstruction,
      temperature: 0.65
    });

    return createSuccessResponse(structuredResult, requestId);
  } catch (error: any) {
    console.error(`[generate-campaign] Error:`, error);
    return createErrorResponse(error, requestId);
  }
});
