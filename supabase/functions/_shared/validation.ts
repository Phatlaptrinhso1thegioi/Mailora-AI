export function validateCampaignInput(body: any): { prompt: string; ctaUrl: string; model?: string } {
  if (!body || typeof body !== 'object') {
    throw new Error('VALIDATION_ERROR: Request body phải là một JSON object.');
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  if (prompt.length < 2) {
    throw new Error('VALIDATION_ERROR: Prompt quá ngắn. Vui lòng cung cấp ít nhất 2 ký tự.');
  }

  const ctaUrl = typeof body.ctaUrl === 'string' ? body.ctaUrl.trim() : '#';
  const model = typeof body.model === 'string' ? body.model.trim() : undefined;

  return { prompt, ctaUrl, model };
}
