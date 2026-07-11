# FitCheck

사진과 상황(TPO)을 바탕으로 Gemini가 OOTD 피드백을 제공하는 Cloudflare Pages 앱입니다.

## 로컬 실행

```bash
npm ci
npm run dev
```

프런트엔드만 Vite로 실행됩니다. Pages Function까지 로컬에서 확인하려면 Wrangler로 빌드 결과를 실행하고 `.dev.vars`에 `GEMINI_API_KEY`를 설정하세요.

```bash
npm run build
npx wrangler pages dev dist
```

## Cloudflare Pages 배포

- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: 비워 둠(저장소 루트)
- Environment variable: `GEMINI_API_KEY`를 Secret으로 등록
- Functions directory: 저장소 루트의 `functions/` 자동 인식

API 키는 코드나 `VITE_` 접두사 환경 변수에 넣지 마세요. `VITE_` 변수는 브라우저 번들에 노출됩니다.

현재 서버 모델은 이미지 입력과 구조화 출력을 지원하는 `gemini-3.1-flash-lite`로 고정되어 있습니다. 사용자가 요청 본문에서 임의 모델을 선택할 수 없도록 해 비용과 기능 범위를 통제합니다.
