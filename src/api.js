import { API_ENDPOINT } from './config.js';

export class ApiError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function analyzeOutfit(image, tpo) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 45_000);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image, tpo }),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new ApiError(payload.error || '분석 요청에 실패했습니다.', response.status);
    return payload;
  } catch (error) {
    if (error.name === 'AbortError') throw new ApiError('분석 시간이 초과되었습니다. 다시 시도해 주세요.', 408);
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}
