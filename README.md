# FitCheck

사진과 상황(TPO)을 바탕으로 Gemini가 OOTD 피드백을 제공하는 Cloudflare Pages 앱입니다.

기존 FitCheck UI와 사용자 흐름은 `fitcheck/`에 유지하고, 저장소 루트의 Vite 설정에서 Cloudflare Pages용 `dist/` 산출물을 생성합니다.

## 로컬 실행

```bash
npm ci
npm run dev
```

Pages Function까지 로컬에서 확인하려면 `.dev.vars`에 `GEMINI_API_KEY`를 설정한 후 다음 명령을 사용합니다.

```bash
npm run build
npx wrangler pages dev dist
```

## Cloudflare Pages

- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: 저장소 루트
- Secret: `GEMINI_API_KEY`
- Pages Functions: 저장소 루트의 `functions/`

API 키를 코드 또는 `VITE_` 환경 변수에 넣지 마세요. 배포 환경에서는 암호화된 `GEMINI_API_KEY` Secret만 사용합니다.
