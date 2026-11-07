import { corsHeaders } from './cors.ts';

export function createErrorResponse(error: any, requestId: string = crypto.randomUUID()): Response {
  const message = error?.message || 'Lỗi xử lý server nội bộ.';
  let code = error?.code || 'INTERNAL_SERVER_ERROR';
  let status = 500;

  if (message.includes('UNAUTHORIZED')) {
    status = 401;
    code = 'UNAUTHORIZED';
  } else if (message.includes('INSUFFICIENT_CREDITS') || code === 'INSUFFICIENT_CREDITS') {
    status = 402;
    code = 'INSUFFICIENT_CREDITS';
  } else if (message.includes('VALIDATION_ERROR')) {
    status = 400;
    code = 'BAD_REQUEST';
  } else if (message.includes('QUOTA_EXHAUSTED')) {
    status = 429;
    code = 'RATE_LIMIT_EXCEEDED';
  }

  return new Response(
    JSON.stringify({
      success: false,
      error: { code, message },
      meta: { requestId }
    }),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

export function createSuccessResponse(data: any, requestId: string = crypto.randomUUID()): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      meta: { requestId }
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}
