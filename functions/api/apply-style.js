import { AI_FEATURES, resolveAiModel } from '../_lib/ai/models.js';
import { runAiModel } from '../_lib/ai/run.js';
import { base64ToBlob, json, parseDataUrl } from '../_lib/http.js';
import { toPublicAiError } from '../_lib/ai/errors.js';

const MAX_TEXT_LENGTH = 500;

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const image = parseDataUrl(body.imageBase64, 1_500_000);
    const recommendation = cleanText(body.recommendation, 100);
    const feedback = cleanText(body.feedback, MAX_TEXT_LENGTH);

    if (!image || !recommendation) {
      return json({ error: '사진과 추천 아이템이 필요합니다.' }, 400);
    }

    const model = resolveAiModel(AI_FEATURES.STYLE_EDIT, env);
    const dimensions = outputDimensions(body.width, body.height);
    const result = await runAiModel(model, env, {
      image: base64ToBlob(image),
      prompt: buildEditPrompt(recommendation, feedback),
      ...dimensions,
    });

    if (!result?.image || typeof result.image !== 'string') {
      return json({ error: '편집된 이미지가 생성되지 않았습니다.' }, 502);
    }

    return json({ image: `data:image/jpeg;base64,${result.image}` });
  } catch (error) {
    console.error('Style edit handler failed', error instanceof Error ? error.message : error);
    const publicError = toPublicAiError(error);
    return json({ error: publicError.message, code: publicError.code }, publicError.status);
  }
}

export function onRequestGet() {
  return json({ error: '허용되지 않은 요청 방식입니다.' }, 405);
}

function cleanText(value, maxLength) {
  return typeof value === 'string' ? value.replace(/[\r\n]+/g, ' ').trim().slice(0, maxLength) : '';
}

function buildEditPrompt(recommendation, feedback) {
  return [
    'Perform a strictly localized fashion garment replacement on input image 0.',
    `Replace only the criticized clothing item with: ${recommendation}. Change pixels only where that garment exists.`,
    feedback ? `Styling context: ${feedback}.` : '',
    'ABSOLUTE IDENTITY LOCK: preserve the exact same person and identity. Never modify, regenerate, beautify, retouch, or reinterpret the face, facial features, expression, eyes, nose, mouth, ears, hair, skin, skin tone, neck, hands, fingers, body, body proportions, body shape, height, weight, pose, or anatomy.',
    'Preserve the exact original silhouette and physical boundaries of the person. The replacement garment must conform to the existing body and pose; the body must never conform to the new garment.',
    'Preserve camera angle, crop, perspective, lighting, shadows, background, surrounding objects, accessories, and every garment not explicitly requested.',
    'If the requested garment cannot be replaced without changing the face or body, leave the protected person pixels unchanged and make only the safest minimal garment edit.',
    'Keep the result photorealistic. Do not add text, logos, borders, stickers, extra people, or accessories not requested.',
  ].filter(Boolean).join(' ');
}

function outputDimensions(width, height) {
  const sourceWidth = Number(width);
  const sourceHeight = Number(height);
  if (!Number.isFinite(sourceWidth) || !Number.isFinite(sourceHeight) || sourceWidth <= 0 || sourceHeight <= 0) {
    return { width: 768, height: 1024 };
  }

  const scale = 1024 / Math.max(sourceWidth, sourceHeight);
  const normalized = (value) => Math.max(256, Math.min(1024, Math.round((value * scale) / 16) * 16));
  return { width: normalized(sourceWidth), height: normalized(sourceHeight) };
}
