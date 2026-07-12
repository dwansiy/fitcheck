const MATCH_SCHEMA = Object.freeze({
  type: 'object',
  additionalProperties: false,
  properties: {
    name: { type: 'string' },
    x: { type: 'integer', minimum: 0, maximum: 100 },
    y: { type: 'integer', minimum: 0, maximum: 100 },
  },
  required: ['name', 'x', 'y'],
});

const WORST_MATCH_SCHEMA = Object.freeze({
  ...MATCH_SCHEMA,
  properties: {
    ...MATCH_SCHEMA.properties,
    recommendItem: { type: 'string' },
    reasonTags: {
      type: 'array',
      items: { type: 'string' },
      minItems: 2,
      maxItems: 3,
    },
  },
  required: [...MATCH_SCHEMA.required, 'recommendItem', 'reasonTags'],
});

export const OUTFIT_RESULT_SCHEMA = Object.freeze({
  type: 'object',
  additionalProperties: false,
  properties: {
    score: { type: 'integer', minimum: 0, maximum: 10000 },
    tier: { type: 'string' },
    roast: { type: 'string' },
    bestMatches: { type: 'array', items: MATCH_SCHEMA, minItems: 3, maxItems: 4 },
    worstMatches: { type: 'array', items: WORST_MATCH_SCHEMA, minItems: 3, maxItems: 4 },
    musinsaQuery: { type: 'string' },
    stats: {
      type: 'object',
      additionalProperties: { type: 'integer', minimum: 0, maximum: 100 },
    },
  },
  required: ['score', 'tier', 'roast', 'bestMatches', 'worstMatches', 'musinsaQuery', 'stats'],
});

export function parseOutfitResult(response) {
  const candidate = response?.candidates?.[0];
  const blocked = candidate?.finishReason === 'SAFETY'
    || response?.promptFeedback?.blockReason === 'SAFETY';
  if (blocked) throw new AiSafetyError();
  if (!candidate?.content?.parts) throw invalidResponse('Gemini returned no usable candidate.');

  const responseText = candidate.content.parts
    .filter((part) => typeof part?.text === 'string')
    .map((part) => part.text)
    .join('')
    .trim();

  if (!responseText) throw invalidResponse('Gemini returned an empty response.');

  let result;
  try {
    result = JSON.parse(responseText);
  } catch {
    throw invalidResponse('Gemini returned invalid JSON.');
  }

  validateOutfitResult(result);
  return result;
}

function validateOutfitResult(result) {
  const isIntegerInRange = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
  const isNonEmptyText = (value) => typeof value === 'string' && value.trim().length > 0;
  const isMatch = (value, withRecommendation = false) => value
    && isNonEmptyText(value.name)
    && isIntegerInRange(value.x, 0, 100)
    && isIntegerInRange(value.y, 0, 100)
    && (!withRecommendation || isNonEmptyText(value.recommendItem));
  const stats = result?.stats && Object.entries(result.stats);

  const valid = result
    && isIntegerInRange(result.score, 0, 10000)
    && isNonEmptyText(result.tier)
    && isNonEmptyText(result.roast)
    && Array.isArray(result.bestMatches)
    && result.bestMatches.length >= 3
    && result.bestMatches.length <= 4
    && result.bestMatches.every((match) => isMatch(match))
    && Array.isArray(result.worstMatches)
    && result.worstMatches.length >= 3
    && result.worstMatches.length <= 4
    && result.worstMatches.every((match) => isMatch(match, true)
      && Array.isArray(match.reasonTags)
      && match.reasonTags.length >= 2
      && match.reasonTags.every(isNonEmptyText))
    && isNonEmptyText(result.musinsaQuery)
    && Array.isArray(stats)
    && stats.length === 5
    && stats.every(([name, score]) => isNonEmptyText(name) && isIntegerInRange(score, 0, 100));

  if (!valid) throw invalidResponse('Gemini response failed outfit-result validation.');
}

function invalidResponse(message) {
  return new AiProviderError(message, 502, AI_ERROR_CODES.INVALID_RESPONSE);
}
import { AI_ERROR_CODES, AiProviderError, AiSafetyError } from './errors.js';
