import { handleCors } from '../_shared/cors.ts';
import { authenticateUser } from '../_shared/auth.ts';
import { ServerGeminiClient } from '../_shared/gemini-client.ts';
import { createErrorResponse, createSuccessResponse } from '../_shared/errors.ts';

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const requestId = crypto.randomUUID();

  try {
    await authenticateUser(req);
    const body = await req.json().catch(() => ({}));
    const { content = '', tone = 'professional' } = body;

    const geminiClient = new ServerGeminiClient();
    const prompt = `Viết lại đoạn nội dung email sau theo phong cách "${tone}". Giữ nguyên ý nghĩa cốt lõi, nâng cao tính hấp dẫn và khả năng hành động:
"${content}"
Trả về JSON: {"rewritten": "nội dung đã viết lại"}`;

    const res = await geminiClient.generateStructuredContent(prompt, { temperature: 0.7 });
    return createSuccessResponse(res, requestId);
  } catch (error: any) {
    return createErrorResponse(error, requestId);
  }
});
