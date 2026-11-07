import { handleCors } from '../_shared/cors.ts';
import { authenticateUser } from '../_shared/auth.ts';
import { createErrorResponse, createSuccessResponse } from '../_shared/errors.ts';

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const requestId = crypto.randomUUID();

  try {
    await authenticateUser(req);
    const body = await req.json().catch(() => ({}));
    const { html = '', subject = '', preheader = '' } = body;

    const issues: string[] = [];
    if (!subject.trim()) issues.push('Tiêu đề email (Subject) không được để trống.');
    if (!preheader.trim()) issues.push('Preheader không được để trống.');
    if (!html.includes('<table')) issues.push('Email chưa tối ưu layout dạng Table.');
    if (!html.includes('unsubscribe') && !html.includes('hủy đăng ký')) {
      issues.push('Khuyến nghị thêm link Hủy đăng ký (Unsubscribe) để tăng độ tin cậy.');
    }

    const isValid = issues.length === 0;

    return createSuccessResponse({
      valid: isValid,
      score: Math.max(70, 100 - (issues.length * 10)),
      issues
    }, requestId);
  } catch (error: any) {
    return createErrorResponse(error, requestId);
  }
});
