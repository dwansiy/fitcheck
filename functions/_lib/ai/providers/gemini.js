import { AI_ERROR_CODES, AiConfigurationError, AiProviderError } from '../errors.js';

export async function runGemini({ modelId, env, input }) {
  if (!env.GEMINI_API_KEY) throw new AiConfigurationError('GEMINI_API_KEY is not configured.');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': env.GEMINI_API_KEY,
      },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    console.error('Gemini request failed', response.status, await response.text());
    const code = response.status === 429
      ? AI_ERROR_CODES.QUOTA_EXCEEDED
      : AI_ERROR_CODES.TEMPORARY_UNAVAILABLE;
    throw new AiProviderError('Gemini analysis failed.', response.status, code);
  }
  return response.json();
}
