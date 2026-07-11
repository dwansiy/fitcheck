// ========================================================
// FITCHECK! CORE APP CONTROLLER
// ========================================================

// 1. 글로벌 상태 (State)
const state = {
  activeScreen: 'screen-upload',
  selectedTpo: '일상',          // 디폴트 상황: '일상'
  currentOotdImage: null,      // 사용자가 업로드한 OOTD 이미지 Base64 데이터
  
  // 측정 결과 데이터
  score: 0,
  originalScore: 0,
  tier: '실버',
  isPatched: false,            // 추천 코디 가상 장착 여부
  
  // 5대 상세 스탯 데이터
  stats: [],

  // 배틀 모드 관련 상태값
  isBattleMode: false,
  opponentScore: 0,
  opponentTpo: '일상',

  // 무신사 연계 팝업용 임시 보관 상태
  targetMusinsaUrl: '',
  targetMusinsaItem: '독일군 스니커즈',

  // AI API 결과 임시 보관
  apiData: null
};

// 2. DOM 요소 셀렉터
const dom = {
  appToast: document.getElementById('app-toast'),
  toastText: document.getElementById('toast-text'),
  appHeader: document.getElementById('app-header'),
  
  // 화면 세션들
  screenUpload: document.getElementById('screen-upload'),
  screenLoading: document.getElementById('screen-loading'),
  screenResult: document.getElementById('screen-result'),
  
  // 메인 업로드 화면
  uploadBoxTrigger: document.getElementById('upload-box-trigger'),
  uploadPlaceholder: document.getElementById('upload-placeholder'),
  uploadPreviewContainer: document.getElementById('upload-preview-container'),
  uploadPreviewImg: document.getElementById('upload-preview-img'),
  imageFileInput: document.getElementById('image-file-input'),
  tpoChips: document.querySelectorAll('.tpo-chip'),
  btnSubmitScan: document.getElementById('btn-submit-scan'),
  
  // 로딩 화면
  loadingStatusText: document.getElementById('loading-status-text'),
  loadingProgressFill: document.getElementById('loading-progress-fill'),
  
  // 결과 화면
  resultOotdImg: document.getElementById('result-ootd-img'),
  resultTopOverlayTag: document.getElementById('result-top-overlay-tag'),
  stylePatchedBadge: document.getElementById('style-patched-badge'),
  virtualStickerOverlay: document.getElementById('virtual-sticker-overlay'),
  pinAngel: document.getElementById('pin-angel'),
  pinDevil: document.getElementById('pin-devil'),
  feedbackTooltip: document.getElementById('feedback-tooltip'),
  tooltipTitle: document.getElementById('tooltip-title'),
  tooltipContent: document.getElementById('tooltip-content'),
  btnCloseTooltip: document.getElementById('btn-close-tooltip'),
  linkShopping: document.getElementById('link-shopping'),
  btnApplyAdvice: document.getElementById('btn-apply-advice'),
  bonusScoreBadge: document.getElementById('bonus-score-badge'),
  
  resultScoreNum: document.getElementById('result-score-num'),
  resultTierName: document.getElementById('result-tier-name'),
  resultRoastText: document.getElementById('result-roast-text'),
  vibeCheckTitle: document.getElementById('vibe-check-title'),
  statsContainer: document.getElementById('stats-container'),
  
  btnShareStory: document.getElementById('btn-share-story'),
  btnRetry: document.getElementById('btn-retry'),
  instagramExportCanvas: document.getElementById('instagram-export-canvas'),
  
  // 신규 배틀 및 인스타 연동 모달 관련
  btnCopyLink: document.getElementById('btn-copy-link'),
  instagramRedirectModal: document.getElementById('instagram-redirect-modal'),
  btnCloseRedirectModal: document.getElementById('btn-close-redirect-modal'),
  btnOpenInstagramApp: document.getElementById('btn-open-instagram-app'),
  instagramPreviewImg: document.getElementById('instagram-preview-img'),

  // 배틀 모드 관련 추가 DOM
  battleChallengeCard: document.getElementById('battle-challenge-card'),
  battleTpoBadge: document.getElementById('battle-tpo-badge'),
  opponentScoreDisplay: document.getElementById('opponent-score-display'),
  battleVersusContainer: document.getElementById('battle-versus-container'),
  resultOotdImgChallenger: document.getElementById('result-ootd-img-challenger'),
  stampOpp: document.getElementById('stamp-opp'),
  stampChallenger: document.getElementById('stamp-challenger'),
  vsOppScore: document.getElementById('vs-opp-score'),
  vsOppTier: document.getElementById('vs-opp-tier'),
  resultHeaderBadge: document.getElementById('result-header-badge'),
  resultTopOverlayBadge: document.getElementById('result-top-overlay-badge'),
  
  // 무신사 연동 모달 관련 DOM
  musinsaRedirectModal: document.getElementById('musinsa-redirect-modal'),
  btnCloseMusinsaModal: document.getElementById('btn-close-musinsa-modal'),
  btnCloseMusinsaModalCancel: document.getElementById('btn-close-musinsa-modal-cancel'),
  btnConfirmMusinsaRedirect: document.getElementById('btn-confirm-musinsa-redirect'),
  musinsaItemName: document.getElementById('musinsa-item-name'),
  pinInteractionGuide: document.getElementById('pin-interaction-guide')
};

// ========================================================
// INITIALIZER & ROUTING
// ========================================================

function init() {
  bindEvents();
  
  // 배틀 모드 쿼리 파라미터 감지 및 처리
  checkBattleQueryParameters();

  if (!state.isBattleMode) {
    selectTpo('일상'); // 일반 모드일 때 디폴트는 일상
  }
}

// URL 배틀 쿼리 파라미터 감지기
function checkBattleQueryParameters() {
  const params = new URLSearchParams(window.location.search);
  const opponentScore = params.get('score');
  const opponentTpo = params.get('tpo');

  if (opponentScore && opponentTpo) {
    state.isBattleMode = true;
    state.opponentScore = parseInt(opponentScore, 10);
    state.opponentTpo = opponentTpo;

    // 배틀 도전자 정보 카드 활성화
    if (dom.battleChallengeCard) {
      dom.battleChallengeCard.classList.remove('hidden');
    }
    if (dom.battleTpoBadge) {
      dom.battleTpoBadge.textContent = `상황: ${opponentTpo}`;
    }
    if (dom.opponentScoreDisplay) {
      dom.opponentScoreDisplay.textContent = state.opponentScore.toLocaleString();
    }

    // 대결용 상황(TPO) 칩 강제 선택 및 락 처리
    selectTpo(opponentTpo);
    dom.tpoChips.forEach(chip => {
      chip.disabled = true;
      chip.classList.add('opacity-70', 'cursor-not-allowed');
    });

    // 측정 버튼 배틀 텍스트 변경
    if (dom.btnSubmitScan) {
      const spanEl = dom.btnSubmitScan.querySelector('span');
      if (spanEl) spanEl.textContent = "배틀 측정 시작하기 🥊";
    }
  }
}

// 이벤트 바인딩
function bindEvents() {
  // 1. TPO 칩 클릭
  dom.tpoChips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      const tpoValue = e.currentTarget.getAttribute('data-tpo');
      selectTpo(tpoValue);
    });
  });

  // 2. 업로드 영역 클릭 ➔ 파일 인풋 실행 (이벤트 버블링 차단 완료)
  dom.uploadBoxTrigger.addEventListener('click', () => {
    dom.imageFileInput.click();
  });

  // 3. 파일 인풋 변경 처리
  dom.imageFileInput.addEventListener('change', handleCustomFileUpload);

  // 4. 패션력 측정하기 실행
  dom.btnSubmitScan.addEventListener('click', startScanningSequence);

  // 5. 결과창 Angel/Devil 마커 클릭
  dom.pinAngel.addEventListener('click', () => showPinTooltip('angel'));
  dom.pinDevil.addEventListener('click', () => showPinTooltip('devil'));
  dom.btnCloseTooltip.addEventListener('click', hideTooltip);

  // 6. 추천 코디 적용 (Devil 피드백 교체)
  dom.btnApplyAdvice.addEventListener('click', applyStyleAdvice);

  // 7. 다시하기 (Retry)
  dom.btnRetry.addEventListener('click', resetToUploadScreen);

  // 8. 인스타 스토리 다운로드 및 모달 트리거
  dom.btnShareStory.addEventListener('click', exportInstagramStory);

  // 9. 배틀 링크 복사
  if (dom.btnCopyLink) dom.btnCopyLink.addEventListener('click', copyBattleLink);

  // 10. 인스타 바로가기 모달 연동
  if (dom.btnCloseRedirectModal) {
    dom.btnCloseRedirectModal.addEventListener('click', () => {
      dom.instagramRedirectModal.classList.add('hidden');
    });
  }
  if (dom.btnOpenInstagramApp) {
    dom.btnOpenInstagramApp.addEventListener('click', openInstagramApp);
  }

  // 11. 무신사 리다이렉션 컨펌 모달 연동
  if (dom.linkShopping) {
    dom.linkShopping.addEventListener('click', (e) => {
      e.preventDefault();
      if (dom.musinsaItemName) {
        dom.musinsaItemName.textContent = state.targetMusinsaItem;
      }
      if (dom.musinsaRedirectModal) {
        dom.musinsaRedirectModal.classList.remove('hidden');
      }
    });
  }
  if (dom.btnCloseMusinsaModal) {
    dom.btnCloseMusinsaModal.addEventListener('click', () => {
      dom.musinsaRedirectModal.classList.add('hidden');
    });
  }
  if (dom.btnCloseMusinsaModalCancel) {
    dom.btnCloseMusinsaModalCancel.addEventListener('click', () => {
      dom.musinsaRedirectModal.classList.add('hidden');
    });
  }
  if (dom.btnConfirmMusinsaRedirect) {
    dom.btnConfirmMusinsaRedirect.addEventListener('click', () => {
      window.open(state.targetMusinsaUrl, '_blank');
      dom.musinsaRedirectModal.classList.add('hidden');
    });
  }
}

// ========================================================
// LOGIC IMPLEMENTATION
// ========================================================

// Toast 알림
function showToast(message) {
  dom.toastText.textContent = message;
  dom.appToast.classList.remove('hidden');
  setTimeout(() => {
    dom.appToast.classList.add('hidden');
  }, 2200);
}

// 상황(TPO) 스위치 선택
function selectTpo(tpo) {
  state.selectedTpo = tpo;
  dom.tpoChips.forEach(chip => {
    if (chip.getAttribute('data-tpo') === tpo) {
      chip.classList.add('active-tpo', 'bg-cream', 'neo-shadow');
    } else {
      chip.classList.remove('active-tpo', 'bg-cream', 'neo-shadow');
    }
  });
  playSound('chip');
}

// 커스텀 이미지 파일 업로드 처리
function handleCustomFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    state.currentOotdImage = event.target.result;

    // 미리보기 렌더링
    dom.uploadPreviewImg.src = state.currentOotdImage;
    dom.uploadPlaceholder.classList.add('hidden');
    dom.uploadPreviewContainer.classList.remove('hidden');

    // 측정 버튼 활성화
    dom.btnSubmitScan.disabled = false;
    showToast("OOTD 사진이 등록되었습니다! 📸");
    playSound('select');
  };
  reader.readAsDataURL(file);
}

// API 호출 및 다중 폴백 로직
async function callAnalyzeAPI(imageBase64, tpo) {
  // 1단계: Cloudflare Pages Serverless Proxy (/api/analyze) 호출 시도
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageBase64,
        tpo
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
    
    throw new Error(`Proxy status: ${response.status}`);
  } catch (err) {
    console.warn("Serverless proxy call failed or not found, trying local client fallback...", err);
  }

  // 2단계: 로컬 개발 환경용 클라이언트 직접 호출 (Vite VITE_GEMINI_API_KEY 변수 사용)
  const localApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const localModel = import.meta.env.VITE_AI_OUTFIT_ANALYSIS_MODEL;
  if (localApiKey && localModel) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(localModel)}:generateContent?key=${localApiKey}`;
      
      const base64Parts = imageBase64.split(',');
      const base64Data = base64Parts[1];
      const mimeType = base64Parts[0].split(';')[0].split(':')[1];
      
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
4. 베스트 매치(bestMatch):
   - name: 착장에서 가장 조화롭고 잘 어울리는 특정 아이템/부위에 대한 설명 (예: "와이드 카키 데님 팬츠: 루즈한 상의 핏과 완벽한 톤온톤 매치")
   - x: 해당 부위의 이미지 상 가로 위치 백분율 (0~100 사이 정수값)
   - y: 해당 부위의 이미지 상 세로 위치 백분율 (0~100 사이 정수값)
5. 워스트 매치(worstMatch):
   - name: 착장에서 가장 어색하거나 교체하고 싶은 특정 아이템/부위에 대한 지적 및 코디 보완 설명 (예: "투박한 회색 운동화: 전체적인 캐주얼 미니멀 무드에 찬물을 끼얹는 언밸런스. 심플한 독일군 스니커즈로 변경 추천")
   - recommendItem: 대체 추천하는 단품 패션 아이템 이름 (예: "독일군 스니커즈"). 이 추천 명칭은 무신사 쇼핑몰에서 상품 검색이 바로 가능한 직관적인 한글 명사여야 합니다.
   - x: 해당 부위의 이미지 상 가로 위치 백분율 (0~100 사이 정수값)
   - y: 해당 부위의 이미지 상 세로 위치 백분율 (0~100 사이 정수값)
6. 무신사 검색어(musinsaQuery): worstMatch.recommendItem과 매치되는 검색용 핵심 단어 (예: "독일군 스니커즈")
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
  "bestMatch": {
    "name": string,
    "x": number,
    "y": number
  },
  "worstMatch": {
    "name": string,
    "recommendItem": string,
    "x": number,
    "y": number
  },
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
          responseMimeType: "application/json"
        }
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const json = await response.json();
        const text = json.candidates[0].content.parts[0].text;
        return JSON.parse(text.trim());
      }
      throw new Error(`Direct call status: ${response.status}`);
    } catch (err) {
      console.error("Direct client API call failed:", err);
    }
  }

  throw new Error("No API connection succeeded.");
}

// 2단계: 로딩 스캔 진행 시뮬레이션
function startScanningSequence() {
  dom.btnSubmitScan.disabled = true;
  
  // 화면 전환 (Upload -> Loading)
  dom.screenUpload.classList.remove('active-screen');
  dom.screenLoading.classList.add('active-screen');
  
  // 상단 통합 헤더 감추기 (트랜잭션 몰입 유도)
  if (dom.appHeader) dom.appHeader.classList.add('hidden');
  
  playSound('scan_start');

  const normalLoadingTexts = [
    "OOTD 실루엣 경계 벡터 추출 중...",
    "상/하의 픽셀 보색 대비 강도 연산 중...",
    "선택 TPO 목적 적합성 딥러닝 감정 중...",
    "안구 스트레스 유발 농도 판독 중...",
    "패션 구조대 출동 여부 결정 중...",
    "스캔 보고서 연성 완료!"
  ];

  const battleLoadingTexts = [
    "상대방 착장 레이아웃 데이터 수신 중...",
    "도전자 OOTD 레이아웃 교차 분해 중...",
    "1:1 픽셀 단위 배틀 시뮬레이션 가동 중...",
    "안구 정화도 대조 검증 연산 중...",
    "배틀 매치 심사 완료! VS 카드 연성 중..."
  ];

  const loadingTexts = state.isBattleMode ? battleLoadingTexts : normalLoadingTexts;

  let currentStep = 0;
  dom.loadingStatusText.textContent = loadingTexts[0];
  dom.loadingProgressFill.style.width = "10%";

  // 2.4초간 400ms 간격으로 상태 메시지와 프로그레스바 증가
  const interval = setInterval(() => {
    currentStep++;
    if (currentStep < loadingTexts.length - 1) { // 마지막 완료 멘트 전까지
      dom.loadingStatusText.textContent = loadingTexts[currentStep];
      dom.loadingProgressFill.style.width = `${15 + (currentStep * 17)}%`;
      playSound('beep');
    }
  }, 400);

  // API 호출 시작
  let apiFailed = false;
  let apiResolved = false;
  
  callAnalyzeAPI(state.currentOotdImage, state.selectedTpo)
    .then(data => {
      state.apiData = data;
      apiResolved = true;
    })
    .catch(err => {
      console.warn("API fallback to mock active.", err);
      state.apiData = null;
      apiFailed = true;
      apiResolved = true;
    });

  // 최소 2.4초 대기 후 API 상태 체크 및 화면 전환
  setTimeout(() => {
    clearInterval(interval);
    
    const checkCompletion = setInterval(() => {
      if (apiResolved) {
        clearInterval(checkCompletion);
        
        if (apiFailed) {
          showToast("AI 분석 실패 🚨 임시 결과로 대체합니다.");
        } else {
          showToast("AI 분석 완료! 🎯");
        }
        
        dom.loadingStatusText.textContent = loadingTexts[loadingTexts.length - 1]; // "스캔 보고서 연성 완료!"
        dom.loadingProgressFill.style.width = "100%";
        
        setTimeout(() => {
          // 분석 결과창 연산 및 이동
          calculateFashionResults();
          dom.screenLoading.classList.remove('active-screen');
          dom.screenResult.classList.add('active-screen');
          playSound('success');
        }, 300);
      } else {
        // 아직 대기 중인 경우 대기 안내 문구 노출 및 펄스 효과
        dom.loadingStatusText.textContent = "AI의 깊이 있는 패션 훈수를 대기 중...";
        dom.loadingProgressFill.style.width = "95%";
      }
    }, 100);
  }, 2400);
}

// 3단계: 결과창 연산
function calculateFashionResults() {
  state.isPatched = false;
  dom.stylePatchedBadge.classList.add('hidden');
  dom.virtualStickerOverlay.classList.add('hidden');

  if (state.apiData) {
    // API 분석 결과 반영
    state.score = state.apiData.score;
    state.originalScore = state.apiData.score;
    state.tier = state.apiData.tier;
    state.bestMatch = state.apiData.bestMatch;
    state.worstMatch = state.apiData.worstMatch;
    state.musinsaQuery = state.apiData.musinsaQuery;
    state.targetMusinsaItem = state.apiData.worstMatch ? state.apiData.worstMatch.recommendItem : "독일군 스니커즈";
    
    // 스탯 매핑 및 originalVal 기록
    state.stats = Object.entries(state.apiData.stats || {}).map(([name, val]) => ({
      name,
      val: val,
      originalVal: val
    }));
  } else {
    // API 실패 혹은 없을 시 mock 데이터 폴백 복구
    const seed = state.currentOotdImage ? state.currentOotdImage.length : 12345;
    let baseScore = 4000 + (seed % 4800); // 4000 ~ 8800 점
    baseScore += getRandomOffset(-200, 200);
    baseScore = Math.max(1800, Math.min(9850, baseScore));

    state.score = baseScore;
    state.originalScore = baseScore;
    state.tier = calculateTier(state.score);

    state.bestMatch = { name: "전반적으로 핏의 실루엣 조합과 상체 라인 조화가 우수합니다! 😇", x: 60, y: 35 };
    state.worstMatch = { name: "하반신의 슈즈 매치가 코디 전체의 매력을 해치고 있습니다. 베이직한 독일군 스니커즈로 변경을 강력 추천합니다. 😈", recommendItem: "독일군 스니커즈", x: 40, y: 75 };
    state.musinsaQuery = "독일군 스니커즈";
    state.targetMusinsaItem = "독일군 스니커즈";
    
    state.stats = []; // renderVibeStats에서 기존 Mock으로 재정의
  }

  // 비주얼 이미지 및 배틀 레이아웃 세팅
  if (state.isBattleMode) {
    // 5:5 분할 매치 화면 연동
    dom.resultOotdImg.classList.add('hidden');
    dom.battleVersusContainer.classList.remove('hidden');
    dom.resultOotdImgChallenger.src = state.currentOotdImage;
    
    // 핀 마커 및 툴팁 감춤
    dom.pinAngel.classList.add('hidden');
    dom.pinDevil.classList.add('hidden');
    dom.feedbackTooltip.classList.add('hidden');
    if (dom.resultTopOverlayBadge) dom.resultTopOverlayBadge.classList.add('hidden');
    if (dom.pinInteractionGuide) dom.pinInteractionGuide.classList.add('hidden');

    // 상대방 스펙 바인딩
    dom.vsOppScore.textContent = `${state.opponentScore.toLocaleString()}점`;
    dom.vsOppTier.textContent = calculateTier(state.opponentScore);

    // 승패 판정에 따른 스탬프 오버레이
    const winStampHTML = `
      <div class="bg-secondary border-[3px] border-black text-black px-4 py-2 font-headline font-black text-base rotate-[12deg] shadow-[3px_3px_0px_rgba(0,0,0,1)] uppercase tracking-wider select-none scale-110">
        WIN 🏆
      </div>
    `;
    const loseStampHTML = `
      <div class="bg-[#ffdad6] border-[3px] border-black text-black px-4 py-2 font-headline font-black text-base rotate-[-12deg] shadow-[3px_3px_0px_rgba(0,0,0,1)] uppercase tracking-wider select-none scale-110">
        LOSE 💀
      </div>
    `;

    dom.stampOpp.classList.remove('hidden');
    dom.stampChallenger.classList.remove('hidden');

    if (state.score > state.opponentScore) {
      dom.stampChallenger.innerHTML = winStampHTML;
      dom.stampOpp.innerHTML = loseStampHTML;
    } else {
      dom.stampChallenger.innerHTML = loseStampHTML;
      dom.stampOpp.innerHTML = winStampHTML;
    }
  } else {
    // 일반 모드 렌더링
    dom.resultOotdImg.classList.remove('hidden');
    dom.battleVersusContainer.classList.add('hidden');
    dom.resultOotdImg.src = state.currentOotdImage;
    
    // Angel & Devil 핀 배치 및 내용 세팅
    setupPins();
    if (dom.resultTopOverlayBadge) dom.resultTopOverlayBadge.classList.remove('hidden');
    if (dom.pinInteractionGuide) dom.pinInteractionGuide.classList.remove('hidden');
  }

  // 점수판 그리기 및 카운트업
  renderResultDashboard();
}

// 핀 마커 포지셔닝 및 코디 세팅
function setupPins() {
  dom.feedbackTooltip.classList.add('hidden');
  
  // 임포트한 커스텀 이미지 위의 범용 OOTD 좌표 핀 세팅
  let angelPos = { top: 35, left: 60 };
  let devilPos = { top: 75, left: 40 };

  if (state.bestMatch && typeof state.bestMatch.x === 'number' && typeof state.bestMatch.y === 'number') {
    angelPos = { top: state.bestMatch.y, left: state.bestMatch.x };
  }
  if (state.worstMatch && typeof state.worstMatch.x === 'number' && typeof state.worstMatch.y === 'number') {
    devilPos = { top: state.worstMatch.y, left: state.worstMatch.x };
  }

  // 핀 DOM 위치 적용
  dom.pinAngel.style.top = `${angelPos.top}%`;
  dom.pinAngel.style.left = `${angelPos.left}%`;
  dom.pinDevil.style.top = `${devilPos.top}%`;
  dom.pinDevil.style.left = `${devilPos.left}%`;

  // 핀 복원 (Devil 핀 리셋)
  dom.pinDevil.classList.remove('hidden');
  dom.pinDevil.querySelector('span').textContent = "😈";
  dom.pinDevil.className = "absolute bg-error-container border-[3px] border-black rounded-full p-2.5 neo-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none z-20 cursor-pointer text-2xl transition-all flex items-center justify-center w-12 h-12 group gap-1";
}

// 핀 상세 정보 툴팁 노출
function showPinTooltip(type) {
  dom.feedbackTooltip.classList.remove('hidden');
  playSound('select');

  if (type === 'angel') {
    // 활성 상태 핀 하이라이트 부여
    dom.pinAngel.classList.add('ring-[5px]', 'ring-black', 'scale-110');
    dom.pinDevil.classList.remove('ring-[5px]', 'ring-black', 'scale-110');

    dom.tooltipTitle.textContent = "😇 BEST MATCH";
    dom.tooltipTitle.className = "font-headline font-black text-xs uppercase px-2 py-0.5 border-[2px] border-black bg-secondary text-black";
    dom.tooltipContent.textContent = state.bestMatch ? state.bestMatch.name : "전반적으로 핏의 실루엣 조합과 상체 라인 조화가 우수합니다! 😇";
    
    // Angel은 쇼핑몰 추천 및 코디적용 숨김
    dom.linkShopping.classList.add('hidden');
    dom.btnApplyAdvice.classList.add('hidden');
  } else {
    // 활성 상태 핀 하이라이트 부여
    dom.pinDevil.classList.add('ring-[5px]', 'ring-black', 'scale-110');
    dom.pinAngel.classList.remove('ring-[5px]', 'ring-black', 'scale-110');

    dom.tooltipTitle.textContent = "😈 WORST MATCH";
    dom.tooltipTitle.className = "font-headline font-black text-xs uppercase px-2 py-0.5 border-[2px] border-black bg-error-container text-black";
    
    let comment = state.worstMatch ? state.worstMatch.name : "하반신의 슈즈 매치가 코디 전체의 매력을 해치고 있습니다. 베이직한 독일군 스니커즈로 변경을 강력 추천합니다. 😈";
    let query = state.musinsaQuery ? encodeURIComponent(state.musinsaQuery) : "독일군+스니커즈";

    dom.tooltipContent.textContent = comment;
    state.targetMusinsaItem = state.worstMatch ? state.worstMatch.recommendItem : "독일군 스니커즈";
    state.targetMusinsaUrl = `https://www.musinsa.com/search/goods?keyword=${query}`;
    dom.linkShopping.href = "#";
    
    // Devil 쇼핑몰 이동 및 추천 코디 버튼 활성화
    dom.linkShopping.classList.remove('hidden');
    if (state.isPatched) {
      dom.btnApplyAdvice.classList.add('hidden'); // 이미 적용되었으면 감춤
    } else {
      dom.btnApplyAdvice.classList.remove('hidden');
    }
  }

  // 소형 모바일 화면 대응: 피드백 창이 열릴 때 화면 아래로 잘리지 않도록 뷰포트 내로 자동 스크롤 연동
  setTimeout(() => {
    if (dom.feedbackTooltip) {
      dom.feedbackTooltip.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, 80);
}

function hideTooltip() {
  dom.feedbackTooltip.classList.add('hidden');
  
  // 모든 핀 활성 상태 하이라이트 제거
  dom.pinAngel.classList.remove('ring-[5px]', 'ring-black', 'scale-110');
  dom.pinDevil.classList.remove('ring-[5px]', 'ring-black', 'scale-110');
}

// 추천 코디 적용 (실시간 Rescoring 및 가상 대체)
async function applyStyleAdvice() {
  if (state.isPatched) return;

  dom.btnApplyAdvice.disabled = true;
  showToast('AI가 추천 아이템을 자연스럽게 적용하고 있습니다... ✨');

  try {
    const preparedImage = await prepareImageForStyleEdit(state.currentOotdImage);
    const response = await fetch('/api/apply-style', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: preparedImage.dataUrl,
        width: preparedImage.originalWidth,
        height: preparedImage.originalHeight,
        recommendation: state.targetMusinsaItem,
        feedback: state.worstMatch?.name || '',
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.image) throw new Error(payload.error || '이미지 개선에 실패했습니다.');

    const resultImage = state.isBattleMode ? dom.resultOotdImgChallenger : dom.resultOotdImg;
    resultImage.src = payload.image;
    await resultImage.decode();
    state.currentOotdImage = payload.image;
  } catch (error) {
    showToast(error.message || '이미지 개선에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    dom.btnApplyAdvice.disabled = false;
    return;
  }

  state.isPatched = true;
  dom.btnApplyAdvice.disabled = false;
  hideTooltip();

  // 1. 보너스 스코어 획득 플로팅 연출
  dom.bonusScoreBadge.classList.remove('hidden');
  dom.stylePatchedBadge.classList.remove('hidden');
  playSound('upgrade');

  // 2. 핀 마커 숨기기 (코디 보완 패치 적용 시 중복 마커 클러터 방지)
  dom.pinDevil.classList.add('hidden');
  
  // 3. 사진 위에 가상 장착 스티커 박스 붙이기
  const recommendItemName = state.targetMusinsaItem || "독일군 스니커즈";
  let pos = { top: 72, left: 33 };
  if (state.worstMatch && typeof state.worstMatch.x === 'number' && typeof state.worstMatch.y === 'number') {
    pos.top = Math.min(90, Math.max(10, state.worstMatch.y - 3));
    pos.left = Math.min(90, Math.max(10, state.worstMatch.x - 7));
  }

  // 스티커 위치 잡고 보이기 (Neo-Brutalist 스티커 스타일)
  dom.virtualStickerOverlay.style.top = `${pos.top}%`;
  dom.virtualStickerOverlay.style.left = `${pos.left}%`;
  dom.virtualStickerOverlay.innerHTML = `
    <span class="absolute -top-3 -left-3 bg-white border-[2px] border-black text-[9px] font-headline font-black px-1 py-0.5 shadow-[1px_1px_0px_rgba(0,0,0,1)] uppercase text-black">PATCHED</span>
    <div class="bg-[#e2f4eb] border-[3px] border-black px-2.5 py-1.5 shadow-[3px_3px_0px_0px_#000000] rotate-[-5deg] font-bold text-xs flex items-center gap-1.5 text-black">
      <span>👟</span>
      <span>${recommendItemName}</span>
    </div>
  `;
  dom.virtualStickerOverlay.classList.remove('hidden');

  // 클릭 인터랙션 추가 (구원된 핀 대신 스티커가 세부설명 응답)
  dom.virtualStickerOverlay.style.cursor = "pointer";
  dom.virtualStickerOverlay.onclick = () => {
    showToast(`🎉 코디 개선 완료! ${recommendItemName} 가상 대체 장착 (+1,500점)`);
    playSound('select');
  };

  // 4. 점수 카운트업 실행 (+1,500점)
  let currentVal = state.score;
  const targetVal = Math.min(10000, state.score + 1500);
  state.score = targetVal;

  const duration = 1000;
  const stepTime = 16;
  const increment = (targetVal - currentVal) / (duration / stepTime);

  const scoreTimer = setInterval(() => {
    currentVal += increment;
    if (currentVal >= targetVal) {
      dom.resultScoreNum.textContent = targetVal.toLocaleString();
      clearInterval(scoreTimer);
      
      // 등급 및 최종 대시보드 스탯 갱신
      state.tier = calculateTier(targetVal);
      dom.resultTierName.textContent = state.tier;
      dom.resultTopOverlayTag.textContent = "UPGRADE 완료";
      
      // 로스트 텍스트 격려 멘트로 변경
      dom.resultRoastText.textContent = `🎉 훌륭합니다! 워스트 부위를 트렌디한 ${recommendItemName}(으)로 코디 대체하자마자 착장 밸런스가 한층 안정되었습니다. 안구 정화 완료! 😎`;
      
      // 스탯 갱신
      renderVibeStats();
      showToast("코디 교체 완료! +1,500점 패션력 상승! ⚡");
    } else {
      dom.resultScoreNum.textContent = Math.floor(currentVal).toLocaleString();
    }
  }, stepTime);

  setTimeout(() => {
    dom.bonusScoreBadge.classList.add('hidden');
  }, 2200);
}

async function prepareImageForStyleEdit(dataUrl) {
  const image = new Image();
  image.src = dataUrl;
  await image.decode();

  const maxInputDimension = 496;
  const scale = Math.min(1, maxInputDimension / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext('2d');
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  return {
    dataUrl: canvas.toDataURL('image/jpeg', 0.88),
    originalWidth: image.naturalWidth,
    originalHeight: image.naturalHeight,
  };
}

// 점수판 및 스탯 렌더링 총괄
function renderResultDashboard() {
  // 점수 롤링 연출
  dom.resultScoreNum.textContent = "0";
  let currentVal = 0;
  const targetVal = state.score;
  const duration = 1000;
  const stepTime = 16;
  const increment = targetVal / (duration / stepTime);

  const timer = setInterval(() => {
    currentVal += increment;
    if (currentVal >= targetVal) {
      dom.resultScoreNum.textContent = targetVal.toLocaleString();
      clearInterval(timer);
    } else {
      dom.resultScoreNum.textContent = Math.floor(currentVal).toLocaleString();
    }
  }, stepTime);

  // 티어 및 한줄평 텍스트 세팅
  state.tier = calculateTier(state.score);
  dom.resultTierName.textContent = state.tier;
  
  if (state.isBattleMode) {
    // 헤더 배지 변경 (전체 상태 표기)
    if (dom.resultHeaderBadge) {
      if (state.score > state.opponentScore) {
        dom.resultHeaderBadge.textContent = "VICTORY 🎉";
        dom.resultHeaderBadge.className = "bg-secondary border-[2px] border-black px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-black rotate-[2deg] text-black";
      } else {
        dom.resultHeaderBadge.textContent = "DEFEAT 🚨";
        dom.resultHeaderBadge.className = "bg-error-container border-[2px] border-black px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-black rotate-[-2deg] text-black";
      }
    }
    
    if (state.score > state.opponentScore) {
      dom.resultRoastText.textContent = `🎉 배틀 승리! 상대방의 밋밋한 착장(점수: ${state.opponentScore.toLocaleString()}점)을 당신의 힙스터 아우라로 완벽하게 제압하고 참교육했습니다. 친구에게 링크를 되돌려주고 승리를 자축하세요! 😎`;
    } else {
      dom.resultRoastText.textContent = `🚨 배틀 패배! 상대방의 견고한 가치관이 깃든 핏(점수: ${state.opponentScore.toLocaleString()}점)에 가로막혀 당신의 OOTD가 대완패를 당했습니다. 추천 코드를 가상 장착하여 복수전을 시작하세요! 😈`;
    }
  } else {
    // 헤더 배지 복원
    if (dom.resultHeaderBadge) {
      dom.resultHeaderBadge.textContent = "QC PASSED ✅";
      dom.resultHeaderBadge.className = "bg-secondary border-[2px] border-black px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold rotate-[2deg] text-black";
    }
    dom.resultTopOverlayTag.textContent = state.score >= 7000 ? "VOGUE PASS" : "EMERGENCY";
    dom.resultRoastText.textContent = getRoastComment(state.selectedTpo, state.score, state.isPatched);
  }
  
  // 스탯 렌더링
  dom.vibeCheckTitle.textContent = state.isBattleMode ? `바이브 체크 (배틀: ${state.selectedTpo})` : `바이브 체크 (${state.selectedTpo})`;
  renderVibeStats();
}

// 티어 연산
function calculateTier(score) {
  if (score >= 9000) return '패션 챌린저';
  if (score >= 7500) return '다이아몬드';
  if (score >= 6000) return '골드';
  if (score >= 4000) return '실버';
  return '아이언';
}

// 스탯별 위트있는 상세 설명 데이터베이스
const statDescriptions = {
  // 일상
  '색상 불협화음 🎨': "상/하의 색 조합이 보색 관계거나 채도가 너무 튀면 올라갑니다. 낮아야 눈이 편안해요.",
  '안구 보호도 👁️': "당신의 패션이 주변 사람들의 시력을 얼마나 보호해 줬는지 나타내는 이타적인 지표입니다.",
  '근자감 농도 ⚡': "이 옷을 입고 명동 벌판을 얼마나 뻔뻔하게 활보할 수 있는지 나타냅니다.",
  '지갑 방어력 💸': "소비된 아이템들의 가성비 지수. SPA 위주면 90% 이상, 명품 믹스면 낮아집니다.",
  '마실 적합도 ☕': "동네 메가커피나 편의점에 갈 때 지나치게 힘을 주지 않았는지 측정합니다.",
  // 데이트
  '설렘 유발 지수 💘': "첫눈에 호감을 사고 썸 탈 확률을 늘려주는 데이트 성공의 척도.",
  '과도한 격식도 🕴️': "마치 면접 보러 온 것처럼 각 잡힌 무거운 룩인지 판독합니다. (낮아야 로맨틱)",
  '센스 스포일러 🕶️': "악세서리, 양말 색 등 드러나지 않는 한 끗 차이의 디테일 센스.",
  '호감도 파괴력 💔': "보는 이의 연애 세포를 잠재우는 끔찍한 단품 아이템의 존재율 (낮을수록 좋음).",
  '데이트 생존율 🧬': "오늘 데이트 후 삼겹살 먹다 체하지 않고 다음 애프터에 성공할 시뮬레이션 지수.",
  // 출근
  '부장님 눈총 지수 😒': "부장님의 등 뒤 레이저 가동률. 튀거나 성의 없어 보일수록 치솟습니다.",
  '프로페셔널 지수 💼': "일은 기획서 마감 직전인데 패션만은 실리콘밸리 CEO 뺨치는 전문성 연출도.",
  '활동성 방해율 🏃': "이 옷을 입고 하루 종일 엑셀 노가다와 탕비실 커피 배달이 가능한가에 대한 지표.",
  '퇴근 본능 자극도 ⏰': "옷이 너무 불편하거나 너무 편해 당장 퇴근하고 싶어지는 본능 유도율.",
  '평판 수호 지수 🛡️': "사내 복장 불량 지적을 방어하고 패셔니스타 평판을 지켜내는 방어율.",
  // 운동
  '헬창 아우라 지수 🏋️': "3대 운동 몇 치는지와 상관없이 헬스장 바닥을 지배하는 고수 느낌.",
  '거울 셀카 득표율 📸': "오운완 해시태그 박아 올렸을 때 인스타 하트를 땡겨올 확률.",
  '땀 배출 지연도 💦': "통풍이 전혀 안 되어 겨드랑이 홍수 폭발을 유발하는 기능성 상실율.",
  '신체 보정 치트 📐': "어깨가 넓어 보이거나 다리가 길어 보이게 숨겨진 체형 사기 지수.",
  '근손실 위장도 🧬': "핏 때문에 실제로 만든 근육마저 쪼그라들어 보이는 억울함 방어 지수.",
  // 하객
  '신부 저격 민폐도 🏹': "흰색 민폐룩이나 지나치게 화려하여 신랑 신부의 존재를 묻어버리는 지수.",
  '하객 격식 비율 🤝': "결혼식을 축하하기 위해 나이와 자리에 알맞게 성의를 보인 척도.",
  '사진 생존율 📸': "맨 뒤 구석 단체 샷에서도 깔끔하게 존재감을 발휘하는 룩.",
  '피로연 프리패스 🍽️': "식사 도중 바지 후크를 풀지 않고 피로연 뷔페 5접시를 채울 수 있는 신축성 지수.",
  '친척 잔소리 실드 🛡️': "오랜만에 만난 친척들의 잔소리('결혼은 언제 하니')를 물리치는 단정함의 힘."
};

// 상황별 스탯 데이터 생성 및 렌더링
function renderVibeStats() {
  const tpo = state.selectedTpo;
  
  if (!state.apiData) {
    const statsMapping = {
      '일상': [
        { name: '색상 불협화음 🎨', val: getMutedStatVal(100 - (state.score/105), 15, 95), originalVal: Math.floor(100 - (state.originalScore/105)) },
        { name: '안구 보호도 👁️', val: getMutedStatVal(state.score/100, 20, 99), originalVal: Math.floor(state.originalScore/100) },
        { name: '근자감 농도 ⚡', val: getMutedStatVal(45 + (state.score/200), 30, 98), originalVal: Math.floor(45 + (state.originalScore/200)) },
        { name: '지갑 방어력 💸', val: getMutedStatVal(100 - (state.score/120), 10, 95), originalVal: Math.floor(100 - (state.originalScore/120)) },
        { name: '마실 적합도 ☕', val: getMutedStatVal(state.score/100 - 5, 20, 98), originalVal: Math.floor(state.originalScore/100 - 5) }
      ],
      '데이트': [
        { name: '설렘 유발 지수 💘', val: getMutedStatVal(state.score/95, 25, 99), originalVal: Math.floor(state.originalScore/95) },
        { name: '과도한 격식도 🕴️', val: getMutedStatVal(110 - (state.score/100), 10, 90), originalVal: Math.floor(110 - (state.originalScore/100)) },
        { name: '센스 스포일러 🕶️', val: getMutedStatVal(state.score/102, 15, 98), originalVal: Math.floor(state.originalScore/102) },
        { name: '호감도 파괴력 💔', val: getMutedStatVal(100 - (state.score/100), 5, 95), originalVal: Math.floor(100 - (state.originalScore/100)) },
        { name: '데이트 생존율 🧬', val: getMutedStatVal(state.score/98, 20, 99), originalVal: Math.floor(state.originalScore/98) }
      ],
      '출근': [
        { name: '부장님 눈총 지수 😒', val: getMutedStatVal(105 - (state.score/98), 10, 95), originalVal: Math.floor(105 - (state.originalScore/98)) },
        { name: '프로페셔널 지수 💼', val: getMutedStatVal(state.score/100, 20, 98), originalVal: Math.floor(state.originalScore/100) },
        { name: '활동성 방해율 🏃', val: getMutedStatVal(100 - (state.score/110), 15, 90), originalVal: Math.floor(100 - (state.originalScore/110)) },
        { name: '퇴근 본능 자극도 ⏰', val: getMutedStatVal(40 + (state.score/200), 20, 98), originalVal: Math.floor(40 + (state.originalScore/200)) },
        { name: '평판 수호 지수 🛡️', val: getMutedStatVal(state.score/100 + 5, 30, 99), originalVal: Math.floor(state.originalScore/100 + 5) }
      ],
      '운동': [
        { name: '헬창 아우라 지수 🏋️', val: getMutedStatVal(state.score/100, 15, 98), originalVal: Math.floor(state.originalScore/100) },
        { name: '거울 셀카 득표율 📸', val: getMutedStatVal(state.score/95, 10, 99), originalVal: Math.floor(state.originalScore/95) },
        { name: '땀 배출 지연도 💦', val: getMutedStatVal(100 - (state.score/105), 10, 90), originalVal: Math.floor(100 - (state.originalScore/105)) },
        { name: '신체 보정 치트 📐', val: getMutedStatVal(state.score/100 + 8, 25, 99), originalVal: Math.floor(state.originalScore/100 + 8) },
        { name: '근손실 위장도 🧬', val: getMutedStatVal(state.score/98, 30, 98), originalVal: Math.floor(state.originalScore/98) }
      ],
      '하객': [
        { name: '신부 저격 민폐도 🏹', val: getMutedStatVal(100 - (state.score/100), 5, 95), originalVal: Math.floor(100 - (state.originalScore/100)) },
        { name: '하객 격식 비율 🤝', val: getMutedStatVal(state.score/98, 30, 99), originalVal: Math.floor(state.originalScore/98) },
        { name: '사진 생존율 📸', val: getMutedStatVal(state.score/102, 20, 98), originalVal: Math.floor(state.originalScore/102) },
        { name: '피로연 프리패스 🍽️', val: getMutedStatVal(90 - (state.score/200), 40, 99), originalVal: Math.floor(90 - (state.originalScore/200)) },
        { name: '친척 잔소리 실드 🛡️', val: getMutedStatVal(state.score/100 + 10, 20, 99), originalVal: Math.floor(state.originalScore/100 + 10) }
      ]
    };
    state.stats = statsMapping[tpo] || statsMapping['일상'];
  } else {
    // API 분석 결과가 있는 경우, getMutedStatVal을 호출하여 isPatched 상향 보정(+15) 적용
    state.stats.forEach(stat => {
      stat.val = getMutedStatVal(stat.originalVal, 0, 100);
    });
  }

  dom.statsContainer.innerHTML = '';
  
  state.stats.forEach((stat, idx) => {
    // 5대 교차 컬러 배치 (Lavender, Mint, Peach, Cream, White)
    const colorClasses = ['bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-cream', 'bg-white'];
    const barColor = colorClasses[idx % colorClasses.length];

    const statItem = document.createElement('div');
    statItem.className = "flex flex-col gap-1 cursor-pointer group w-full";
    statItem.innerHTML = `
      <div class="flex items-center gap-2 w-full hover:translate-x-[2px] transition-transform">
        <span class="w-24 font-bold text-xs uppercase tracking-tight text-black">${stat.name}</span>
        <div class="flex-1 h-5 border-[3px] border-black bg-white flex overflow-hidden">
          <div class="stat-bar-fill ${barColor} border-r-[3px] border-black h-full transition-all duration-1000" style="width: 0%;"></div>
        </div>
        <span class="w-8 text-right text-xs font-headline font-black text-black">${stat.val}%</span>
      </div>
      <div class="stat-desc-container hidden w-full"></div>
    `;

    // 탭하여 스탯별 설명 팝업/토글 바인딩
    statItem.addEventListener('click', () => {
      const descContainer = statItem.querySelector('.stat-desc-container');
      const isHidden = descContainer.classList.contains('hidden');
      
      // 먼저 열려 있는 모든 다른 스탯 설명 닫기
      document.querySelectorAll('.stat-desc-container').forEach(el => el.classList.add('hidden'));
      
      if (isHidden) {
        const descText = statDescriptions[stat.name] || "상세 설명 정보가 없습니다.";
        descContainer.innerHTML = `
          <div class="text-[10px] font-bold bg-cream border-[2px] border-black p-2 mt-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black rotate-[-0.5deg]">
            💬 ${descText}
          </div>
        `;
        descContainer.classList.remove('hidden');
        playSound('select');
      } else {
        descContainer.classList.add('hidden');
      }
    });
    
    dom.statsContainer.appendChild(statItem);
    
    // 약간의 딜레이 후 애니메이션 차오르게 조정
    setTimeout(() => {
      const fillEl = statItem.querySelector('.stat-bar-fill');
      if (fillEl) fillEl.style.width = `${stat.val}%`;
    }, 50);
  });
}

// 스탯 백분율 안정화 도우미
function getMutedStatVal(formulaVal, min, max) {
  let val = Math.floor(formulaVal);
  if (state.isPatched) val += 15; // 코디 적용 시 상향 보정
  return Math.max(min, Math.min(max, val));
}

// 상황별 매운맛 한줄평 딕셔너리 연동
function getRoastComment(tpo, score, isPatched) {
  if (isPatched) {
    return "🎉 훌륭합니다! 워스트 부위를 트렌디한 아이템으로 코디 대체하자마자 착장 밸런스가 한층 안정되었습니다. 안구 정화 완료! 😎";
  }

  const roastComments = {
    '일상': {
      challenger: "걸어 다니는 스트릿 화보 그 자체. 동네 마실이 아니라 밀라노 패션위크 런웨이 수준이군요!",
      elite: "상당히 트렌디하고 정갈하네요. 군더더기 없이 조화가 좋은 고감도 데일리 착장입니다.",
      silver: "나쁘진 않지만, 길거리에 널린 흔한 크론 인간 4호 같은 느낌. 개성을 한 스푼 더 얹어보세요.",
      iron: "차라리 옷을 입지 않는 것이 패션 아레나의 평화와 인류의 시각 보호를 위해 이로울지도 문지릅니다."
    },
    '데이트': {
      challenger: "상대방의 동공 지진 완료. 설렘 지수가 한계를 돌파했습니다. 오늘 고백 성공률 99.9%!",
      elite: "센스 넘치고 호감도가 급상승하는 룩. 적절한 악세서리와 조화로운 톤온톤 매칭이 돋보입니다.",
      silver: "지나치게 평범하고 안전제일주의 코디. 첫인상에 강렬함을 주기엔 너무 싱거운 국물 같습니다.",
      iron: "상대방이 밥만 먹고 '갑자기 급한 회사 업무가 생겼다'며 30분 만에 도망치기 딱 좋은 재난형 착장."
    },
    '출근': {
      challenger: "부장님도 사장님도 옷깃을 여미며 예의를 차릴 고품격 비즈니스 웨어. 당장 사내 패션 대표로 취임하세요.",
      elite: "단정함과 스마트함을 겸비한 정석 오피스 코디. 신뢰감 주는 미니멀한 구성이 일 처리를 잘해보이게 합니다.",
      silver: "전형적인 월요일 아침 야근에 지친 직장인 룩. 생존을 위해 대충 걸치고 나온 느낌이 강합니다.",
      iron: "부장님 돋보기안경 긴급 장착! 복장 단속 사내 공지에 워스트 대표 예시로 캡처 박히기 딱 좋습니다."
    },
    '운동': {
      challenger: "스쿼트 덤벨 따위 안 들어도 3대 500 헬창들의 리스펙 시선이 꽂히는 무결점 애슬레저 핏.",
      elite: "피트니스 클럽 거울 셀카 득표율 90% 이상 예상. 기능성과 간지를 동시에 챙긴 훌륭한 짐웨어.",
      silver: "운동은 열심히 하는 것 같은데 옷태가 묻히는 아쉬운 착장. 동네 약수터 산책 감성에 가깝습니다.",
      iron: "이 바지에 이 신발은 패션 근손실이 120% 일어난 참사. 거울에 비친 본인 모습 보고 기겁 요망."
    },
    '하객': {
      challenger: "신랑 신부 옆에서 너무 단정하면서도 광채가 나서, 사진 기사님이 줌인을 당길까 겁나는 명품 하객 룩.",
      elite: "결혼식장 TPO 예의의 표본. 신부를 가리지 않으면서도 세련된 클래식 무드가 단연 돋보입니다.",
      silver: "격식은 갖췄는데 지나치게 답답하거나 올드해 보입니다. 친척들의 잔소리가 귓전을 스칠 우려 농후.",
      iron: "흰색 수트를 뒤덮어 신부 시선을 강탈하는 민폐 하객 테러리스트. 뷔페 식권 회수 및 퇴출 조치가 시급합니다."
    }
  };

  const currentRoast = roastComments[tpo] || roastComments['일상'];

  if (score >= 9000) return `🔥 ${currentRoast.challenger}`;
  if (score >= 7500) return `✨ ${currentRoast.elite}`;
  if (score >= 5000) return `⚠️ ${currentRoast.silver}`;
  return `🚨 ${currentRoast.iron}`;
}

// 로컬 난수 보정기
function getRandomOffset(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 다시 시작하기 (Retry)
function resetToUploadScreen() {
  state.currentOotdImage = null;
  state.score = 0;
  state.isPatched = false;
  state.apiData = null; // API 데이터 리셋
  
  // 핀 복원 및 클릭 리스너 청소
  dom.pinDevil.classList.remove('hidden');
  dom.pinDevil.querySelector('span').textContent = "😈";
  dom.pinDevil.className = "absolute bg-error-container border-[3px] border-black rounded-full p-2.5 neo-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none z-20 cursor-pointer text-2xl transition-all flex items-center justify-center w-12 h-12 group gap-1";
  dom.virtualStickerOverlay.onclick = null;
  
  // 배틀 상태 해제 및 URL 클리닝
  if (state.isBattleMode) {
    state.isBattleMode = false;
    state.opponentScore = 0;
    
    // URL 쿼리 파라미터 클리닝
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // TPO 칩 활성화 상태 복구
    dom.tpoChips.forEach(chip => {
      chip.disabled = false;
      chip.classList.remove('opacity-70', 'cursor-not-allowed');
    });
    
    // 배틀 카드 숨기기
    if (dom.battleChallengeCard) {
      dom.battleChallengeCard.classList.add('hidden');
    }
    
    // 헤더 배지 복원
    if (dom.resultHeaderBadge) {
      dom.resultHeaderBadge.textContent = "QC PASSED ✅";
      dom.resultHeaderBadge.className = "bg-secondary border-[2px] border-black px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold rotate-[2deg] text-black";
    }
    
    // 버튼 텍스트 복구
    if (dom.btnSubmitScan) {
      const spanEl = dom.btnSubmitScan.querySelector('span');
      if (spanEl) spanEl.textContent = "패션력 측정하기";
    }
  }

  // 버튼 비활성화
  dom.btnSubmitScan.disabled = true;

  // 미리보기 리셋
  dom.uploadPreviewContainer.classList.add('hidden');
  dom.uploadPlaceholder.classList.remove('hidden');
  dom.uploadPreviewImg.src = "";
  dom.imageFileInput.value = "";

  // 상단 통합 헤더 노출
  if (dom.appHeader) dom.appHeader.classList.remove('hidden');

  // 화면 전환 (Result -> Upload)
  dom.screenResult.classList.remove('active-screen');
  dom.screenUpload.classList.add('active-screen');
  playSound('retry');
}

// ========================================================
// 5단계: HTML5 CANVAS INSTAGRAM STORY EXPORTER
// ========================================================

function exportInstagramStory() {
  const canvas = dom.instagramExportCanvas;
  const ctx = canvas.getContext('2d');
  
  // 로딩 알림 Toast 노출
  showToast("인스타 스토리 공유 카드 생성 중... 🎨");

  // 1. 배경 그라데이션 그리기 (Neo-Brutalist 힙한 연보라 대각선 그라데이션)
  const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
  grad.addColorStop(0, '#eae6ff'); // Lavender
  grad.addColorStop(1, '#ffefea'); // Peach
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1080, 1920);

  // 2. 외곽 15px 두꺼운 블랙 보더 라인
  ctx.lineWidth = 30;
  ctx.strokeStyle = '#000000';
  ctx.strokeRect(0, 0, 1080, 1920);

  // 3. 타이틀 텍스트 그리기 (Montserrat 스타일 볼드 블랙)
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = '900 80px Montserrat, sans-serif';
  ctx.fillText(state.isBattleMode ? 'FITCHECK! BATTLE' : 'FITCHECK! VERDICT', 540, 150);

  // 4. OOTD 사진 그리기 (일반 모드는 1:1, 배틀 모드는 5:5 분할 드로잉)
  const imgElement = state.isBattleMode ? dom.resultOotdImgChallenger : dom.resultOotdImg;
  const imgWidth = 650;
  const imgHeight = 650;
  const imgX = (1080 - imgWidth) / 2; // 215
  const imgY = 240;

  // 4-1. 사진 아래 15px 블랙 그림자 사각형
  ctx.fillStyle = '#000000';
  ctx.fillRect(imgX + 15, imgY + 15, imgWidth, imgHeight);

  if (state.isBattleMode) {
    // === 배틀 모드: 5:5 좌우 분할 드로잉 ===
    const halfW = imgWidth / 2; // 325

    // [왼쪽: 상대방 정보 카드]
    ctx.fillStyle = '#fff9e6'; // Cream background for opponent
    ctx.fillRect(imgX, imgY, halfW, imgHeight);

    // 상대방 실루엣 원 그리기
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(imgX + 162.5, imgY + 180, 70, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 👤 이모지 그리기
    ctx.fillStyle = '#000000';
    ctx.font = '80px Lexend, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👤', imgX + 162.5, imgY + 180);

    // OPPONENT 배너
    ctx.fillStyle = '#000000';
    ctx.fillRect(imgX + 62.5, imgY + 280, 200, 45);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Montserrat, sans-serif';
    ctx.fillText('OPPONENT', imgX + 162.5, imgY + 305);

    // 상대방 점수
    ctx.fillStyle = '#000000';
    ctx.font = '900 42px Montserrat, sans-serif';
    ctx.fillText(`${state.opponentScore.toLocaleString()} PTS`, imgX + 162.5, imgY + 390);

    // 상대방 티어
    ctx.fillStyle = '#47464c';
    ctx.font = 'bold 22px Lexend, sans-serif';
    ctx.fillText(calculateTier(state.opponentScore), imgX + 162.5, imgY + 440);

    // [오른쪽: 도전자 내 이미지]
    ctx.fillStyle = '#eeeeee';
    ctx.fillRect(imgX + halfW, imgY, halfW, imgHeight);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const naturalWidth = imgElement.naturalWidth || imgElement.width || halfW;
    const naturalHeight = imgElement.naturalHeight || imgElement.height || imgHeight;

    let drawW = halfW;
    let drawH = imgHeight;
    let offsetX = 0;
    let offsetY = 0;

    const containerRatio = halfW / imgHeight;
    const imgRatio = naturalWidth / naturalHeight;

    if (imgRatio > containerRatio) {
      drawH = halfW / imgRatio;
      offsetY = (imgHeight - drawH) / 2;
    } else {
      drawW = imgHeight * imgRatio;
      offsetX = (halfW - drawW) / 2;
    }

    ctx.drawImage(imgElement, imgX + halfW + offsetX, imgY + offsetY, drawW, drawH);

    // 분할선 그리기
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(imgX + halfW, imgY);
    ctx.lineTo(imgX + halfW, imgY + imgHeight);
    ctx.stroke();

    // 외곽 보더라인 그리기
    ctx.lineWidth = 10;
    ctx.strokeRect(imgX, imgY, imgWidth, imgHeight);

    // 승패 캔버스 도장 드로잉
    function drawCanvasStamp(centerX, centerY, text, isWin) {
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(isWin ? 12 * Math.PI / 180 : -12 * Math.PI / 180);
      
      ctx.font = '900 36px Montserrat, sans-serif';
      const textWidth = ctx.measureText(text).width;
      const rectW = textWidth + 40;
      const rectH = 65;
      
      // Shadow
      ctx.fillStyle = '#000000';
      ctx.fillRect(-rectW/2 + 6, -rectH/2 + 6, rectW, rectH);
      
      // Border & Background
      ctx.fillStyle = isWin ? '#e2f4eb' : '#ffdad6'; // Mint or Salmon
      ctx.fillRect(-rectW/2, -rectH/2, rectW, rectH);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(-rectW/2, -rectH/2, rectW, rectH);
      
      // Text
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 0, 3);
      
      ctx.restore();
    }

    if (state.score > state.opponentScore) {
      drawCanvasStamp(imgX + 162.5, imgY + 520, 'LOSE 💀', false);
      drawCanvasStamp(imgX + 487.5, imgY + 520, 'WIN 🏆', true);
    } else {
      drawCanvasStamp(imgX + 162.5, imgY + 520, 'WIN 🏆', true);
      drawCanvasStamp(imgX + 487.5, imgY + 520, 'LOSE 💀', false);
    }

  } else {
    // === 일반 모드: 단일 이미지 드로잉 ===
    ctx.fillStyle = '#eeeeee';
    ctx.fillRect(imgX, imgY, imgWidth, imgHeight);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const naturalWidth = imgElement.naturalWidth || imgElement.width || imgWidth;
    const naturalHeight = imgElement.naturalHeight || imgElement.height || imgHeight;

    let drawW = imgWidth;
    let drawH = imgHeight;
    let offsetX = 0;
    let offsetY = 0;

    const containerRatio = imgWidth / imgHeight;
    const imgRatio = naturalWidth / naturalHeight;

    if (imgRatio > containerRatio) {
      drawH = imgWidth / imgRatio;
      offsetY = (imgHeight - drawH) / 2;
    } else {
      drawW = imgHeight * imgRatio;
      offsetX = (imgWidth - drawW) / 2;
    }

    ctx.drawImage(imgElement, imgX + offsetX, imgY + offsetY, drawW, drawH);

    ctx.lineWidth = 10;
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(imgX, imgY, imgWidth, imgHeight);
  }

  // 4-5. 만약 코디 개선 패치가 적용되었다면, 캔버스에도 귀여운 "UPGRADED" 스티커 도장 합성 (일반모드 한정)
  if (!state.isBattleMode && state.isPatched) {
    ctx.fillStyle = '#e2f4eb'; // Mint
    ctx.fillRect(250, 840, 240, 60);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(250, 840, 240, 60);
    
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px Lexend, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡ STYLE UPGRADED', 370, 870);
  }

  // 5. 점수 및 등급 텍스트 합성
  // 점수 백그라운드 스티커 박스
  ctx.fillStyle = '#fff9e6'; // Cream
  ctx.fillRect(215, 930, 650, 160);
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#000000';
  ctx.strokeRect(215, 930, 650, 160);

  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  if (state.isBattleMode) {
    ctx.font = '900 52px Montserrat, sans-serif';
    ctx.fillText(`BATTLE ${state.score > state.opponentScore ? 'VICTORY 🏆' : 'DEFEAT 💀'}`, 540, 1000);
    
    ctx.font = 'bold 32px Lexend, sans-serif';
    ctx.fillText(`상대방: ${state.opponentScore.toLocaleString()}점 VS 나: ${state.score.toLocaleString()}점`, 540, 1055);
  } else {
    ctx.font = '900 64px Montserrat, sans-serif';
    ctx.fillText(`${state.score.toLocaleString()} / 10,000 PTS`, 540, 1005);
    
    ctx.font = 'bold 36px Lexend, sans-serif';
    ctx.fillText(`상황: ${state.selectedTpo} | 티어: ${state.tier}`, 540, 1060);
  }

  // 6. 뼈 때리는 한줄평 멘트 (멀티라인 드로잉 처리)
  ctx.fillStyle = '#ffefea'; // Peach
  ctx.fillRect(115, 1130, 850, 180);
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#000000';
  ctx.strokeRect(115, 1130, 850, 180);

  ctx.fillStyle = '#000000';
  ctx.font = 'italic bold 28px Lexend, sans-serif';
  ctx.textAlign = 'left';
  
  const roastWords = dom.resultRoastText.textContent;
  wrapText(ctx, roastWords, 150, 1195, 780, 42);

  // 7. 5대 스탯 바차트 합성
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.font = '900 32px Montserrat, sans-serif';
  ctx.fillText('VIBE CHECK SPECS', 540, 1375);

  const startStatY = 1430;
  const colors = ['#eae6ff', '#e2f4eb', '#ffefea', '#fff9e6', '#ffffff'];

  state.stats.forEach((stat, idx) => {
    const curY = startStatY + (idx * 75);
    
    // 스탯 이름
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 22px Lexend, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(stat.name, 140, curY + 22);

    // 스탯 바 테두리
    const barWidth = 550;
    const barHeight = 32;
    ctx.strokeRect(360, curY, barWidth, barHeight);
    
    // 스탯 차오르는 바 그리기
    ctx.fillStyle = colors[idx % colors.length];
    const fillWidth = (stat.val / 100) * barWidth;
    ctx.fillRect(360, curY, fillWidth, barHeight);
    ctx.strokeRect(360, curY, fillWidth, barHeight);

    // 스탯 백분율 수치
    ctx.fillStyle = '#000000';
    ctx.font = '900 24px Montserrat, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${stat.val}%`, 1000, curY + 24);
  });

  // 8. 풋터 마크 로고
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.font = 'bold 26px Lexend, sans-serif';
  ctx.fillText(state.isBattleMode ? '대결을 수락하고 덤벼라! @team.letsgo_fit' : '내 친구들은 몇점? @team.letsgo_fit', 540, 1850);

  // 9. 공유 파일에는 결과 화면이나 스토리 카드가 아닌 업로드 사진만 담는다.
  // 고해상도 원본으로 인한 모바일 메모리 문제를 막기 위해 긴 변을 제한한다.
  const shareImage = state.isBattleMode ? dom.resultOotdImgChallenger : dom.resultOotdImg;
  const sourceWidth = shareImage.naturalWidth || shareImage.width;
  const sourceHeight = shareImage.naturalHeight || shareImage.height;
  const maxShareDimension = 2160;
  const scale = Math.min(1, maxShareDimension / Math.max(sourceWidth, sourceHeight));

  canvas.width = Math.max(1, Math.round(sourceWidth * scale));
  canvas.height = Math.max(1, Math.round(sourceHeight * scale));
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(shareImage, 0, 0, canvas.width, canvas.height);

  // 10. 이미지 다운로드 트리거 및 모달 오픈
  setTimeout(() => {
    try {
      const dataUrl = canvas.toDataURL('image/png');
      
      // 모달에 미리보기 이미지 설정
      if (dom.instagramPreviewImg) {
        dom.instagramPreviewImg.src = dataUrl;
      }

      const downloadLink = document.createElement('a');
      downloadLink.download = `fitcheck_ootd_${state.score}.png`;
      downloadLink.href = dataUrl;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      showToast("업로드한 사진이 이미지 파일로 다운로드되었습니다! 💾");
      playSound('download');

      // 모달 오버레이 오픈 (사용자 인스타 연동 UX)
      if (dom.instagramRedirectModal) {
        dom.instagramRedirectModal.classList.remove('hidden');
      }
    } catch (err) {
      console.error("Canvas export failed", err);
      showToast("이미지 렌더링에 실패했습니다. (CORS 보안 설정 우려)");
    }
  }, 100);
}

// 텍스트 여러 줄 정렬 도우미
function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';

  for (let n = 0; n < words.length; n++) {
    let testLine = line + words[n] + ' ';
    let metrics = context.measureText(testLine);
    let testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  context.fillText(line, x, y);
}

// ========================================================
// ⚙️ 사운드 효과음 에뮬레이터 (Mock Web Audio API)
// ========================================================
function playSound(type) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'beep') {
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'select' || type === 'chip') {
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'success') {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.3); // C6
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'upgrade') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'scan_start') {
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'retry') {
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch (e) {
    // 오디오 컨텍스트 차단 무시
  }
}

// 배틀 대결 링크 복사 기능 (클립보드 API)
function copyBattleLink() {
  playSound('select');
  const battleUrl = `${window.location.origin}${window.location.pathname}?score=${state.score}&tpo=${encodeURIComponent(state.selectedTpo)}`;
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(battleUrl)
      .then(() => {
        showToast("배틀 대결 링크가 복사되었습니다! 친구들에게 공유해보세요! 🔗");
        playSound('success');
      })
      .catch(() => {
        fallbackCopyTextToClipboard(battleUrl);
      });
  } else {
    fallbackCopyTextToClipboard(battleUrl);
  }
}

// 구형 브라우저 대응용 폴백 복사 로직
function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    const successful = document.execCommand('copy');
    if (successful) {
      showToast("배틀 대결 링크가 복사되었습니다! 🔗");
      playSound('success');
    } else {
      showToast("링크 복사에 실패했습니다. 주소를 직접 복사해주세요.");
    }
  } catch (err) {
    showToast("링크 복사에 실패했습니다.");
  }
  document.body.removeChild(textArea);
}

// 인스타그램 딥링크 연결 (모바일 기기 판단 및 Fallback 지원)
function openInstagramApp() {
  playSound('select');
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = "instagram://";
    // 1.2초 후 백그라운드 웹 연동(인스타그램 미설치 시)
    setTimeout(() => {
      window.open("https://www.instagram.com/", "_blank");
    }, 1200);
  } else {
    // 데스크탑 브라우저는 바로 인스타그램 웹 연동
    window.open("https://www.instagram.com/", "_blank");
  }
}

// 실행
document.addEventListener('DOMContentLoaded', init);
