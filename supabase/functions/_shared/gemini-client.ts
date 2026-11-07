/**
 * Mailora.ai — Server-side Gemini Client
 * Uses GEMINI_API_KEY from Deno.env (Supabase Secrets).
 * Supports structured JSON generation, 3.8-flash with fallback cascade.
 */

export interface GeminiGenerateOptions {
  model?: string;
  systemInstruction?: string;
  temperature?: number;
  responseMimeType?: string;
}

export class ServerGeminiClient {
  private apiKey: string;
  private primaryModel: string;
  private fallbackModel: string;

  constructor() {
    this.apiKey = Deno.env.get('GEMINI_API_KEY') || '';
    this.primaryModel = Deno.env.get('GEMINI_PRIMARY_MODEL') || 'gemini-3.8-flash';
    this.fallbackModel = Deno.env.get('GEMINI_FALLBACK_MODEL') || 'gemini-2.5-flash';
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  async generateStructuredContent(prompt: string, options: GeminiGenerateOptions = {}): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('CONFIG_ERROR: GEMINI_API_KEY chưa được cấu hình trong Supabase Secrets.');
    }

    const model = options.model || this.primaryModel;

    try {
      return await this.callGeminiApi(model, prompt, options);
    } catch (err: any) {
      if (model !== this.fallbackModel) {
        console.warn(`[GeminiClient] Primary model ${model} failed (${err.message}). Retrying with fallback: ${this.fallbackModel}`);
        return await this.callGeminiApi(this.fallbackModel, prompt, options);
      }
      throw err;
    }
  }

  private async callGeminiApi(model: string, prompt: string, options: GeminiGenerateOptions): Promise<any> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;

    const bodyPayload: any = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        responseMimeType: options.responseMimeType ?? 'application/json'
      }
    };

    if (options.systemInstruction) {
      bodyPayload.systemInstruction = {
        parts: [{ text: options.systemInstruction }]
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload)
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const errMsg = errBody?.error?.message || response.statusText;
      if (response.status === 429) {
        throw new Error(`QUOTA_EXHAUSTED: Hạn ngạch Gemini API đã vượt quá giới hạn (429). Chi tiết: ${errMsg}`);
      }
      throw new Error(`GEMINI_API_ERROR (${response.status}): ${errMsg}`);
    }

    const json = await response.json();
    const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error('INVALID_RESPONSE: Phản hồi từ Gemini không có nội dung hợp lệ.');
    }

    try {
      const cleanJson = rawText.replace(/```(?:json)?\n?/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (parseErr) {
      throw new Error(`JSON_PARSE_ERROR: Không thể giải mã JSON từ phản hồi AI: ${rawText.slice(0, 200)}...`);
    }
  }

  async testConnection(): Promise<{ status: string; model: string; timestamp: string }> {
    if (!this.isConfigured()) {
      return {
        status: 'disconnected',
        model: this.primaryModel,
        timestamp: new Date().toISOString()
      };
    }

    try {
      const res = await this.generateStructuredContent('Respond with {"status": "ok"}', {
        temperature: 0.1
      });
      return {
        status: res?.status === 'ok' ? 'connected' : 'degraded',
        model: this.primaryModel,
        timestamp: new Date().toISOString()
      };
    } catch (e: any) {
      return {
        status: 'error',
        model: this.primaryModel,
        timestamp: new Date().toISOString()
      };
    }
  }
}
