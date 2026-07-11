import { AiConfigurationError, AiProviderError } from './gemini.js';

export async function runWorkersAiImageEdit({ modelId, env, input }) {
  if (!env.AI) throw new AiConfigurationError("Workers AI binding 'AI' is not configured.");

  const form = new FormData();
  form.append('prompt', input.prompt);
  form.append('input_image_0', input.image, 'outfit.jpg');
  form.append('width', String(input.width));
  form.append('height', String(input.height));

  const serialized = new Response(form);
  try {
    return await env.AI.run(modelId, {
      multipart: {
        body: serialized.body,
        contentType: serialized.headers.get('content-type'),
      },
    });
  } catch (error) {
    console.error('Workers AI image edit failed', error instanceof Error ? error.message : error);
    throw new AiProviderError('Image editing failed.');
  }
}
