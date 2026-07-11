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
    throw new AiProviderError('Gemini analysis failed.', response.status);
  }
  return response.json();
}

export class AiConfigurationError extends Error {}

export class AiProviderError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
  }
}
