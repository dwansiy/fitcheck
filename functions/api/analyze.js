const ALLOWED_TPOS = new Set(['일상', '데이트', '출근', '운동', '하객']);
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const STAT_NAMES = {
  일상: ['색상 조화', '실루엣', '활용도', '편안함', '완성도'],
  데이트: ['호감도', '센스', '분위기', '자신감', '완성도'],
  출근: ['단정함', '전문성', '활동성', '신뢰감', '완성도'],
  운동: ['기능성', '활동성', '쾌적함', '실루엣', '완성도'],
  하객: ['격식', '배려', '사진발', '세련미', '완성도'],
};
const MODEL = 'gemini-3.1-flash-lite';
const MAX_BODY_BYTES = 4_500_000;

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});

export async function onRequestPost({ request, env }) {
  if (!env.GEMINI_API_KEY) return json({ error: '서버 API 키가 설정되지 않았습니다.' }, 503);
  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > MAX_BODY_BYTES) return json({ error: '이미지 요청 크기가 너무 큽니다.' }, 413);

  try {
    const body = await request.json();
    const input = validateInput(body);
    if (!input.ok) return json({ error: input.error }, 400);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
        body: JSON.stringify(createGeminiRequest(input.value)),
      },
    );

    if (!response.ok) {
      console.error('Gemini request failed', response.status, await response.text());
      return json({ error: 'AI 분석 서비스가 응답하지 않았습니다.' }, 502);
    }
    const payload = await response.json();
    const raw = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) return json({ error: 'AI 분석 결과가 비어 있습니다.' }, 502);
    const result = validateResult(JSON.parse(raw), input.value.tpo);
    return result.ok ? json(result.value) : json({ error: 'AI 분석 결과 형식이 올바르지 않습니다.' }, 502);
  } catch (error) {
    console.error('Analyze handler failed', error instanceof Error ? error.message : error);
    return json({ error: '요청을 처리하지 못했습니다.' }, 500);
  }
}

export function onRequestGet() {
  return json({ error: '허용되지 않은 요청 방식입니다.' }, 405);
}

function validateInput(body) {
  if (!body || typeof body !== 'object' || !ALLOWED_TPOS.has(body.tpo) || typeof body.image !== 'string') return { ok: false, error: '사진과 올바른 TPO를 입력해 주세요.' };
  if (body.image.length > MAX_BODY_BYTES) return { ok: false, error: '이미지 요청 크기가 너무 큽니다.' };
  const match = body.image.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match || !ALLOWED_MIME_TYPES.has(match[1])) return { ok: false, error: '지원하지 않는 이미지 형식입니다.' };
  return { ok: true, value: { tpo: body.tpo, mimeType: match[1], data: match[2] } };
}

function createGeminiRequest({ tpo, mimeType, data }) {
  const statProperties = Object.fromEntries(STAT_NAMES[tpo].map((name) => [name, { type: 'INTEGER', minimum: 0, maximum: 100 }]));
  return {
    contents: [{ parts: [{ text: promptFor(tpo) }, { inlineData: { mimeType, data } }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        required: ['score', 'tier', 'roast', 'bestMatch', 'worstMatch', 'stats'],
        properties: {
          score: { type: 'INTEGER', minimum: 0, maximum: 10000 },
          tier: { type: 'STRING' },
          roast: { type: 'STRING' },
          bestMatch: { type: 'OBJECT', required: ['name', 'x', 'y'], properties: { name: { type: 'STRING' }, x: { type: 'INTEGER' }, y: { type: 'INTEGER' } } },
          worstMatch: { type: 'OBJECT', required: ['name', 'recommendItem', 'x', 'y'], properties: { name: { type: 'STRING' }, recommendItem: { type: 'STRING' }, x: { type: 'INTEGER' }, y: { type: 'INTEGER' } } },
          stats: { type: 'OBJECT', required: STAT_NAMES[tpo], properties: statProperties },
        },
      },
    },
  };
}

function promptFor(tpo) {
  return `당신은 한국 패션 스타일리스트입니다. 사용자가 업로드한 OOTD를 '${tpo}' 상황 적합성, 색 조합, 실루엣, 소재 조화, 완성도로 평가하세요. 외모나 신체를 비하하지 말고 옷과 스타일만 다루세요. score는 0~10000 정수입니다. tier는 9000 이상 '패션 챌린저', 7500 이상 '다이아몬드', 6000 이상 '골드', 4000 이상 '실버', 나머지는 '아이언'으로 정확히 정하세요. roast는 재치 있지만 유용한 한국어 피드백 100자 안팎입니다. bestMatch와 worstMatch는 사진 속 구체적 의상 부위의 설명과 해당 위치 x,y(각 5~95)를 담으세요. recommendItem은 보완할 구체적 패션 아이템입니다. stats는 이 상황에 적합한 서로 다른 한국어 항목 정확히 5개와 0~100 정수 점수로 구성하세요.`;
}

function validateResult(value, tpo) {
  const isPoint = (point, recommendation = false) => point && typeof point.name === 'string' && (!recommendation || typeof point.recommendItem === 'string') && Number.isInteger(point.x) && point.x >= 5 && point.x <= 95 && Number.isInteger(point.y) && point.y >= 5 && point.y <= 95;
  const stats = value?.stats && Object.entries(value.stats);
  const expectedStats = STAT_NAMES[tpo];
  if (!value || !Number.isInteger(value.score) || value.score < 0 || value.score > 10000 || typeof value.roast !== 'string' || value.roast.length > 500 || !isPoint(value.bestMatch) || !isPoint(value.worstMatch, true) || !stats || stats.length !== 5 || stats.some(([key, val]) => !expectedStats.includes(key) || !Number.isInteger(val) || val < 0 || val > 100)) return { ok: false };
  return { ok: true, value: { ...value, tier: tierFor(value.score) } };
}

function tierFor(score) {
  if (score >= 9000) return '패션 챌린저';
  if (score >= 7500) return '다이아몬드';
  if (score >= 6000) return '골드';
  if (score >= 4000) return '실버';
  return '아이언';
}
