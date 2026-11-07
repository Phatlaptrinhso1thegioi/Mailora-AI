import { handleCors } from '../_shared/cors.ts';
import { ServerGeminiClient } from '../_shared/gemini-client.ts';
import { createErrorResponse, createSuccessResponse } from '../_shared/errors.ts';

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const requestId = crypto.randomUUID();

  try {
    const geminiClient = new ServerGeminiClient();
    const testResult = await geminiClient.testConnection();

    return createSuccessResponse({
      provider: 'Google Gemini',
      status: testResult.status,
      activeModel: testResult.model,
      fallbackModel: 'gemini-2.0-flash',
      configured: geminiClient.isConfigured(),
      checkedAt: testResult.timestamp
    }, requestId);
  } catch (error: any) {
    return createErrorResponse(error, requestId);
  }
});
