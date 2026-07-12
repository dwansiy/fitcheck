import { AI_FEATURES, resolveAiModel } from '../_lib/ai/models.js';
import { runAiModel } from '../_lib/ai/run.js';
import { OUTFIT_RESULT_SCHEMA, parseOutfitResult } from '../_lib/ai/outfit-result.js';
import { toPublicAiError } from '../_lib/ai/errors.js';
import { json as jsonResponse, parseDataUrl } from '../_lib/http.js';

const ALLOWED_TPOS = new Set(['일상', '데이트', '출근', '운동', '하객']);

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { imageBase64, tpo } = body;

    const image = parseDataUrl(imageBase64);
    if (!image || !ALLOWED_TPOS.has(tpo)) return jsonResponse({ error: '사진과 올바른 TPO가 필요합니다.' }, 400);

    const model = resolveAiModel(AI_FEATURES.OUTFIT_ANALYSIS, env);

    const base64Data = image.base64;
    const mimeType = image.mimeType;

    const prompt = `
당신은 트렌디하고 위트 있으며 뼈 때리는 패션 비평가인 'FitCheck 마스터'입니다.
사용자가 제출한 OOTD 사진과 상황(TPO)을 바탕으로 패션력을 평가하고 JSON 형식으로 응답해 주세요.

[TPO 상황]
${tpo}

[분석 및 응답 기준]
1. 패션력 점수(score): 0 ~ 10,000점 범위로 정수로만 평가해 주세요.
2. 티어(tier): 점수에 따라 다음 5개 중 정확히 매칭되는 티어 텍스트를 할당해 주세요.
   - 9000점 이상: "패션 챌린저"
   - 7500점 이상 9000점 미만: "다이아몬드"
   - 6000점 이상 7500점 미만: "골드"
   - 4000점 이상 6000점 미만: "실버"
   - 4000점 미만: "아이언"
3. 한줄평(roast): 점수와 상황(TPO)에 어울리는 위트 있고 직설적인 한줄평 (100~150자 내외). 점수가 낮을수록 뼈 때리는 매운맛(savage roast)이어야 하고, 높을수록 힙하고 시크한 칭찬이어야 합니다. 반드시 150자를 넘지 않도록 간결하게 끝내주세요.
4. 베스트 매치(bestMatches): 서로 다른 아이템/부위 3~4개를 좋은 순서대로 배열에 담으세요.
   - name: 착장에서 가장 조화롭고 잘 어울리는 특정 아이템/부위에 대한 설명 (예: "와이드 카키 데님 팬츠: 루즈한 상의 핏과 완벽한 톤온톤 매치")
   - x: 해당 부위의 이미지 상 가로 위치 백분율 (0~100 사이 정수값, 핀 마킹 위치)
   - y: 해당 부위의 이미지 상 세로 위치 백분율 (0~100 사이 정수값, 핀 마킹 위치)
5. 워스트 매치(worstMatches): 서로 다른 개선 지점 3~4개를 가장 중요한 순서대로 배열에 담으세요.
   - name: 착장에서 가장 어색하거나 교체하고 싶은 특정 아이템/부위에 대한 지적 및 코디 보완 설명 (예: "투박한 회색 운동화: 전체적인 캐주얼 미니멀 무드에 찬물을 끼얹는 언밸런스. 심플한 독일군 스니커즈로 변경 추천")
   - recommendItem: 대체 추천하는 단품 패션 아이템 이름 (예: "독일군 스니커즈"). 이 추천 명칭은 무신사 쇼핑몰에서 상품 검색이 바로 가능한 직관적인 한글 명사여야 합니다.
   - reasonTags: 추천 이유를 나타내는 짧은 한글 태그 2~3개 (예: ["트렌디", "가성비"]).
   - x: 해당 부위의 이미지 상 가로 위치 백분율 (0~100 사이 정수값, 핀 마킹 위치)
   - y: 해당 부위의 이미지 상 세로 위치 백분율 (0~100 사이 정수값, 핀 마킹 위치)
6. 무신사 검색어(musinsaQuery): worstMatches[0].recommendItem과 매치되는 검색용 핵심 단어
7. 상세 스탯(stats): 선택된 TPO 상황에 맞춰 지정된 5개 스탯 항목들의 개별 점수(0~100 사이 정수)를 매겨 주세요. 스탯 항목 이름(Key)은 반드시 오타 없이 아래에 정의된 5개 이름 그대로 사용해야 합니다.

[상황별 스탯 정의 (반드시 해당하는 TPO의 Key 이름을 매핑해 주세요)]
- 일상: {"색상 불협화음 🎨": 점수, "안구 보호도 👁️": 점수, "근자감 농도 ⚡": 점수, "지갑 방어력 💸": 점수, "마실 적합도 ☕": 점수}
- 데이트: {"설렘 유발 지수 💘": 점수, "과도한 격식도 🕴️": 점수, "센스 스포일러 🕶️": 점수, "호감도 파괴력 💔": 점수, "데이트 생존율 🧬": 점수}
- 출근: {"부장님 눈총 지수 😒": 점수, "프로페셔널 지수 💼": 점수, "활동성 방해율 🏃": 점수, "퇴근 본능 자극도 ⏰": 점수, "평판 수호 지수 🛡️": 점수}
- 운동: {"헬창 아우라 지수 🏋️": 점수, "거울 셀카 득표율 📸": 점수, "땀 배출 지연도 💦": 점수, "신체 보정 치트 📐": 점수, "근손실 위장도 🧬": 점수}
- 하객: {"신부 저격 민폐도 🏹": 점수, "하객 격식 비율 🤝": 점수, "사진 생존율 📸": 점수, "피로연 프리패스 🍽️": 점수, "친척 잔소리 실드 🛡️": 점수}

반드시 백틱(\`\`\`)이나 마크다운 마크업 없는 순수한 JSON 객체 형식으로만 응답해야 하며, 다음 JSON 스키마를 완벽히 준수해야 합니다:
{
  "score": number,
  "tier": string,
  "roast": string,
  "bestMatches": [{
    "name": string,
    "x": number,
    "y": number
  }],
  "worstMatches": [{
    "name": string,
    "recommendItem": string,
    "reasonTags": [string, string],
    "x": number,
    "y": number
  }],
  "musinsaQuery": string,
  "stats": {
    "키이름1": number,
    "키이름2": number,
    "키이름3": number,
    "키이름4": number,
    "키이름5": number
  }
}
`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseFormat: {
          text: {
            mimeType: 'application/json',
            schema: OUTFIT_RESULT_SCHEMA,
          },
        },
      }
    };

    const response = await runAiModel(model, env, requestBody);
    return jsonResponse(parseOutfitResult(response));
  } catch (error) {
    console.error('Analyze handler failed', error instanceof Error ? error.message : error);
    const publicError = toPublicAiError(error);
    return jsonResponse({ error: publicError.message, code: publicError.code }, publicError.status);
  }
}
