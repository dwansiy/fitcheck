// =========================================================
// FITBATTLE - CORE APP CONTROLLER
// =========================================================

// 1. 글로벌 상태 (State)
const state = {
  userXP: 8240,
  activeScreen: 'screen-scan',
  currentOotdImage: null,    // Base64 또는 Preset URL
  selectedPreset: null,      // high1, high2, low1, low2
  isWebcamActive: false,
  webcamStream: null,
  
  // 나의 패션력 및 스탯
  myScore: 0,
  myRank: 'B-Rank',
  mySubStats: {
    synergy: 0,
    color: 0,
    trend: 0,
    tpo: 0
  },

  // 내 OOTD 실시간 반응 데이터 (Screen 1 대시보드 연동)
  myOotdStats: {
    good: 0,
    bad: 0
  },
  dashboardIntervalId: null,

  // 단독 핏체크(FitCheck) 관련 상태 (Screen 3)
  fitcheckQueue: [],
  fitcheckCurrentIndex: 0,

  // 내 OOTD 갤러리 보관함 리스트
  myGalleryList: [],
  
  // 가상 대결 유저 풀 (Matchmaking DB)
  battlePool: [
    { id: 1, name: '크림라떼', score: 8950, type: 'vogue', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80', tagline: 'THE PERFECT OOTD: 톤온톤 미니멀의 진수', synergy: 90, color: 92, trend: 85, tpo: 91, wins: 142, total: 200 },
    { id: 2, name: '베이지보이', score: 7920, type: 'vogue', img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80', tagline: 'THE PERFECT OOTD: 내추럴 린넨 레이어드', synergy: 82, color: 80, trend: 78, tpo: 77, wins: 98, total: 150 },
    { id: 3, name: '퍼플샤워', score: 9210, type: 'vogue', img: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=80', tagline: 'THE PERFECT OOTD: 라벤더 감성 스트릿 스포티', synergy: 94, color: 95, trend: 92, tpo: 88, wins: 185, total: 240 },
    { id: 4, name: '민트초코코디', score: 8130, type: 'vogue', img: 'https://images.unsplash.com/photo-1496345875659-11f7dd282d1d?w=400&q=80', tagline: 'THE PERFECT OOTD: 세이지 그린 캐주얼 자켓', synergy: 83, color: 86, trend: 80, tpo: 76, wins: 64, total: 100 },
    { id: 5, name: '파스텔요정', score: 7120, type: 'vogue', img: 'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?w=400&q=80', tagline: 'THE PERFECT OOTD: 소프트 파스텔 믹스 매치', synergy: 72, color: 74, trend: 70, tpo: 69, wins: 41, total: 80 },
    { id: 6, name: '등산로신사', score: 4210, type: 'emergency', img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80', tagline: 'EMERGENCY: 아웃도어 등산복 결혼식 하객 룩', synergy: 38, color: 42, trend: 30, tpo: 22, wins: 12, total: 95 },
    { id: 7, name: '혼종콜렉터', score: 3150, type: 'emergency', img: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&q=80', tagline: 'EMERGENCY: 상의 정장 하의 트레이닝팬츠 슬리퍼', synergy: 28, color: 34, trend: 20, tpo: 15, wins: 8, total: 110 },
    { id: 8, name: '공룡대장', score: 4890, type: 'emergency', img: 'https://images.unsplash.com/photo-1530651788726-1dbf58eeef1f?w=400&q=80', tagline: 'EMERGENCY: 명동 한복판 거대 인형 탈 패션', synergy: 45, color: 50, trend: 60, tpo: 12, wins: 22, total: 85 },
    { id: 9, name: '형광매니아', score: 3950, type: 'emergency', img: 'https://images.unsplash.com/photo-1489980508314-941910ded1f4?w=400&q=80', tagline: 'EMERGENCY: 머리부터 발끝까지 형광 연두 깔맞춤', synergy: 35, color: 20, trend: 55, tpo: 30, wins: 15, total: 90 },
    { id: 10, name: '패션방랑자', score: 5820, type: 'emergency', img: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=400&q=80', tagline: 'EMERGENCY: 레트로 오버핏의 한계를 뛰어넘은 아빠옷', synergy: 56, color: 62, trend: 58, tpo: 50, wins: 34, total: 80 }
  ],
  
  // 현재 아레나 매치 유저 데이터
  currentMatch: {
    playerA: null,
    playerB: null
  },
  
  // 평론가 투표 참여 랭킹
  criticsList: [
    { name: '도합10단평론가', votes: 412, accuracy: '92%', xp: 12400 },
    { name: '골목패션왕', votes: 385, accuracy: '88%', xp: 11200 },
    { name: '스와이프마스터', votes: 350, accuracy: '85%', xp: 9800 },
    { name: '트렌드추적기', votes: 295, accuracy: '89%', xp: 8700 },
    { name: '패션폴리스반장', votes: 241, accuracy: '80%', xp: 7500 }
  ],

  // 3차 개편 추가 상태
  currentlyViewingOotdId: null,   // 상세 모달창에서 조회 중인 OOTD ID
  darkMode: false,
  soundEffects: true,
  fitcheckEvaluationsCount: 0,    // 핏체크 평가 누적 횟수
  tinderChallengeCleared: false,
  highScoreChallengeCleared: false
}

// 2. DOM 요소 셀렉터
const dom = {
  // 스크린 & 네비게이션
  screens: document.querySelectorAll('.app-screen'),
  navTabs: document.querySelectorAll('.nav-tab'),
  userXpDisplay: document.getElementById('header-user-score'),
  
  // 글로벌 토스트 알림
  appToastContainer: document.getElementById('app-toast-container'),
  toastMessage: document.getElementById('toast-message'),
  
  // 화면 1: 측정
  video: document.getElementById('webcam-stream'),
  imagePreview: document.getElementById('image-preview'),
  viewfinderContainer: document.getElementById('viewfinder-container'),
  radarBar: document.getElementById('radar-bar'),
  scanLoader: document.getElementById('scan-loader'),
  scanLoaderText: document.getElementById('scan-loader-text'),
  fileUploader: document.getElementById('file-uploader'),
  presetButtons: document.querySelectorAll('.btn-preset'),
  btnMeasureCombat: document.getElementById('btn-measure-combat'),
  
  // 내 OOTD 실시간 대시보드
  myOotdDashboard: document.getElementById('my-ootd-dashboard'),
  dashCountGood: document.getElementById('dash-count-good'),
  dashCountBad: document.getElementById('dash-count-bad'),
  dashRatioVal: document.getElementById('dash-ratio-val'),
  dashProgressFill: document.getElementById('dash-progress-fill'),
  
  // 내 OOTD 갤러리 섹션
  myOotdGallery: document.getElementById('my-ootd-gallery'),
  galleryCardsContainer: document.getElementById('gallery-cards-container'),
  galleryCountLbl: document.getElementById('gallery-count-lbl'),
  
  // 패션력 모달
  combatModal: document.getElementById('combat-result-modal'),
  btnCloseResult: document.getElementById('btn-close-result'),
  resultScoreValue: document.getElementById('result-score-value'),
  resultRankBadge: document.getElementById('result-rank-badge'),
  circleProgressRing: document.getElementById('circle-progress-ring'), // 원형 컴뱃 링 추가
  statFills: {
    synergy: document.getElementById('stat-fill-synergy'),
    color: document.getElementById('stat-fill-color'),
    trend: document.getElementById('stat-fill-trend'),
    tpo: document.getElementById('stat-fill-tpo')
  },
  statNums: {
    synergy: document.getElementById('stat-num-synergy'),
    color: document.getElementById('stat-num-color'),
    trend: document.getElementById('stat-num-trend'),
    tpo: document.getElementById('stat-num-tpo')
  },
  generatedMagazineTarget: document.getElementById('generated-magazine-target'),
  btnEnterArena: document.getElementById('btn-enter-arena'),
  
  // 모달 내부 개별 OOTD 실시간 피드백 패널
  modalOotdFeedbackPanel: document.getElementById('modal-ootd-feedback-panel'),
  modalDashCountGood: document.getElementById('modal-dash-count-good'),
  modalDashCountBad: document.getElementById('modal-dash-count-bad'),
  modalDashRatioVal: document.getElementById('modal-dash-ratio-val'),
  modalDashProgressFill: document.getElementById('modal-dash-progress-fill'),
  modalBattleTimerBar: document.getElementById('modal-battle-timer-bar'),
  modalBattleTimeLeft: document.getElementById('modal-battle-time-left'),
  
  // 화면 2: 아레나
  cardCompA: document.getElementById('card-comp-a'),
  cardCompB: document.getElementById('card-comp-b'),
  magazineFrameA: document.getElementById('magazine-frame-a'),
  magazineFrameB: document.getElementById('magazine-frame-b'),
  
  // 투표 결과 팝업
  voteResultPopup: document.getElementById('vote-result-popup'),
  popupPercentA: document.getElementById('popup-percent-a'),
  popupPercentB: document.getElementById('popup-percent-b'),
  popupScoreA: document.getElementById('popup-score-a'),
  popupScoreB: document.getElementById('popup-score-b'),
  popupProgressFill: document.getElementById('popup-progress-fill'),
  popupStatusMsg: document.getElementById('popup-status-msg'),
  
  // 화면 3: 단독 핏체크 평가 (FitCheck)
  fitcheckArenaContainer: document.querySelector('.fitcheck-arena-container'),
  fitcheckBgTextOverlay: document.getElementById('fitcheck-bg-text-overlay'),
  fitcheckCardTrack: document.getElementById('fitcheck-card-track'),
  fitcheckActiveCard: document.getElementById('fitcheck-active-card'),
  fitcheckMagazineFrame: document.getElementById('fitcheck-magazine-frame'),
  fitcheckResultBarOverlay: document.getElementById('fitcheck-result-bar-overlay'),
  fitcheckResultPercentGood: document.getElementById('fitcheck-result-percent-good'),
  fitcheckResultPercentBad: document.getElementById('fitcheck-result-percent-bad'),
  fitcheckResultProgressFill: document.getElementById('fitcheck-result-progress-fill'),
  
  // 핏체크 서브네비게이션 탭 스위치
  fitcheckSubTabs: document.querySelectorAll('.fitcheck-sub-tab'),
  fitcheckSubviews: document.querySelectorAll('.fitcheck-subview-content'),
  
  // 화면 4: 랭킹
  leaderboardPodium: document.getElementById('leaderboard-podium'),
  rankingListContainer: document.getElementById('ranking-list-container'),
  btnShareInstagram: document.getElementById('btn-share-instagram'),
  userMyRank: document.getElementById('user-my-rank'),
  userMyScore: document.getElementById('user-my-score'),
  
  // 화면 5: 전체메뉴
  checkboxDarkMode: document.getElementById('checkbox-dark-mode'),
  checkboxSoundEffect: document.getElementById('checkbox-sound-effect'),
  btnRequestAiAdvice: document.getElementById('btn-request-ai-advice'),
  aiCoachingText: document.getElementById('ai-coaching-text'),
  menuXpCurrent: document.getElementById('menu-xp-current'),
  menuProfileXpBar: document.getElementById('menu-profile-xp-bar'),
  challengeTinder: document.getElementById('challenge-tinder'),
  challengeHigh: document.getElementById('challenge-high'),
  
  // 공유 모달
  instagramShareModal: document.getElementById('instagram-share-modal'),
  btnCloseShare: document.getElementById('btn-close-share'),
  shareCanvas: document.getElementById('share-canvas'),
  sharePreviewImg: document.getElementById('share-preview-img'),
  btnDownloadImage: document.getElementById('btn-download-image')
}

// 3. 로컬 프리셋 이미지 에셋 매핑 (Canvas 그리기 및 프리셋용)
const presetImages = {
  high1: 'assets/preset_high1.png',
  high2: 'assets/preset_high2.png',
  low1: 'assets/preset_low1.png',
  low2: 'assets/preset_low2.png'
};

// =========================================================
// INITIALIZER & ROUTING
// =========================================================

function init() {
  bindEvents();
  updateXPDisplay();
  updateMenuXP(); // 전체메뉴 프로필 초기화
  // setupFallbackAssets(); // 로컬 고품질 AI 이미지가 준비되었으므로 실제 이미지를 로드합니다.
  setupArenaCardsSwipe(); // 배틀 아레나 엄지 스와이프 리스너 초기화
  setupFitCheckSubTabs(); // 핏체크 서브뷰 탭 리스너 초기화
  setupMenuListeners();   // 전체메뉴 설정/액션 리스너 초기화
  startBattleCountdownTimer(); // 24시간 배틀 남은시간 카운트다운 타이머 시작
}

// 바인딩
function bindEvents() {
  // 탭 네비게이션 (5개 탭 연동)
  dom.navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetScreen = tab.getAttribute('data-target');
      switchScreen(targetScreen);
    });
  });

  // 카메라 & 업로드 액션
  if (dom.viewfinderContainer) {
    dom.viewfinderContainer.style.cursor = 'pointer';
    dom.viewfinderContainer.addEventListener('click', () => {
      dom.fileUploader.click();
    });
  }
  dom.fileUploader.addEventListener('change', handleFileUpload);

  // 프리셋 선택
  dom.presetButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      selectPreset(e.currentTarget);
    });
  });

  // 패션력 측정 실행
  dom.btnMeasureCombat.addEventListener('click', startCombatMeasurement);

  // 모달 닫기
  dom.btnCloseResult.addEventListener('click', () => {
    dom.combatModal.classList.add('hidden');
    stopCamera();
    state.currentlyViewingOotdId = null; // 상세조회 상태 해제
  });

  dom.btnEnterArena.addEventListener('click', () => {
    dom.combatModal.classList.add('hidden');
    stopCamera();
    
    // 내 OOTD 대시보드 리셋 및 실시간 피드백 시작
    startMyOotdLiveDashboard();
    
    // 24시간 배틀 출전 완료 알림 Toast 노출
    showToast("배틀 아레나 출전이 완료되었습니다! 🚀");
    
    // 배틀 출전 즉시 내 OOTD 갤러리 탭으로 다이렉트 화면 이동
    switchScreen('screen-gallery');
  });

  // 아레나 투표 액션 (A/B 선택 버튼 비활성화됨)

  // 인스타 공유 모달
  dom.btnShareInstagram.addEventListener('click', openShareModal);
  dom.btnCloseShare.addEventListener('click', () => dom.instagramShareModal.classList.add('hidden'));
  dom.btnDownloadImage.addEventListener('click', downloadShareCard);

  // 결과창 매거진 커버 돋보기 줌 활성화
  if (dom.generatedMagazineTarget) {
    dom.generatedMagazineTarget.style.cursor = 'zoom-in';
    dom.generatedMagazineTarget.addEventListener('click', () => {
      openFullscreenMagazine(dom.generatedMagazineTarget.innerHTML);
    });
  }
}

// 화면 전환
function switchScreen(screenId) {
  state.activeScreen = screenId;
  
  // 화면 활성화
  dom.screens.forEach(screen => {
    if (screen.id === screenId) {
      screen.classList.add('active');
    } else {
      screen.classList.remove('active');
    }
  });

  // 네비 탭 활성화
  dom.navTabs.forEach(tab => {
    if (tab.getAttribute('data-target') === screenId) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // 스크린 진입 이벤트 처리
  if (screenId === 'screen-fitcheck') {
    // 활성화되어 있는 서브뷰에 맞추어 카드 또는 아레나 로드
    const activeSubTab = document.querySelector('.fitcheck-sub-tab.active');
    const subview = activeSubTab ? activeSubTab.getAttribute('data-subview') : 'feedback';
    if (subview === 'feedback') {
      loadNextFitCheckCard();
    } else {
      loadNextArenaMatchup();
    }
  } else if (screenId === 'screen-gallery') {
    renderOotdGallery();
  } else if (screenId === 'screen-leaderboard') {
    renderLeaderboard();
  } else if (screenId === 'screen-menu') {
    updateMenuXP();
    checkChallenges();
  }
}

// XP 갱신
function updateXPDisplay() {
  dom.userXpDisplay.textContent = `${state.userXP.toLocaleString()} XP`;
}

// XP 획득 연출
function gainXP(amount) {
  state.userXP += amount;
  updateXPDisplay();
  updateMenuXP(); // 전체메뉴 내 XP 수치 및 레벨 동기화 업데이트
}

// 전체메뉴 XP 바인딩 및 레벨 계산 연동
function updateMenuXP() {
  if (dom.menuXpCurrent) {
    dom.menuXpCurrent.textContent = state.userXP.toLocaleString();
    const currentXpInLevel = state.userXP % 10000;
    const progressPercent = (currentXpInLevel / 10000) * 100;
    dom.menuProfileXpBar.style.width = `${progressPercent}%`;
    
    // 10,000 XP당 1 레벨 상승 시뮬레이션
    const level = Math.floor(state.userXP / 10000) + 1;
    const badgeEl = document.querySelector('.profile-title-badge');
    if (badgeEl) {
      badgeEl.textContent = `패션 수호자 (Lv.${level})`;
    }
  }
}

// =========================================================
// SCREEN 1: CAMERA & FILE UPLOAD & PRESET
// =========================================================

// 카메라 스트림 제어
async function toggleCamera() {
  if (state.isWebcamActive) {
    stopCamera();
  } else {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', aspectRatio: 3/4 },
        audio: false
      });
      state.webcamStream = stream;
      if (dom.video) {
        dom.video.srcObject = stream;
        dom.video.classList.remove('hidden');
      }
      if (dom.imagePreview) {
        dom.imagePreview.classList.add('hidden');
      }
      state.isWebcamActive = true;
      if (dom.btnCameraToggle) {
        const span = dom.btnCameraToggle.querySelector('span');
        if (span) span.textContent = '카메라 끄기';
      }
      state.selectedPreset = null;
      dom.presetButtons.forEach(b => b.classList.remove('active'));
      
      // 촬영가능 상태로 활성화
      dom.btnMeasureCombat.classList.remove('disabled');
      dom.btnMeasureCombat.disabled = false;
      
      // 스캔 중이 아님을 마킹
      dom.viewfinderContainer.classList.remove('scanning');
    } catch (err) {
      console.warn('카메라를 활성화할 수 없어 파일 업로드 및 프리셋 사용을 권장합니다.', err);
      alert('카메라 장치를 사용할 수 없습니다. 사진 업로드나 프리셋 코디를 선택해 주세요!');
    }
  }
}

function stopCamera() {
  if (state.webcamStream) {
    state.webcamStream.getTracks().forEach(track => track.stop());
  }
  state.webcamStream = null;
  if (dom.video) {
    dom.video.srcObject = null;
    dom.video.classList.add('hidden');
  }
  state.isWebcamActive = false;
  if (dom.btnCameraToggle) {
    const span = dom.btnCameraToggle.querySelector('span');
    if (span) span.textContent = '카메라 켜기';
  }
}

// 파일 업로드 처리
function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  stopCamera();
  
  const reader = new FileReader();
  reader.onload = function(event) {
    state.currentOotdImage = event.target.result;
    state.selectedPreset = null;
    dom.presetButtons.forEach(b => b.classList.remove('active'));
    
    // 미리보기 이미지 렌더링
    dom.imagePreview.innerHTML = `<img src="${state.currentOotdImage}" alt="OOTD Preview" style="width:100%; height:100%; object-fit:cover; border-radius:18px;">`;
    dom.imagePreview.classList.remove('hidden');
    
    // 측정 버튼 활성화
    dom.btnMeasureCombat.classList.remove('disabled');
    dom.btnMeasureCombat.disabled = false;
  };
  reader.readAsDataURL(file);
}

// 프리셋 착장 선택
function selectPreset(buttonEl) {
  stopCamera();
  
  dom.presetButtons.forEach(b => b.classList.remove('active'));
  buttonEl.classList.add('active');
  
  const presetKey = buttonEl.getAttribute('data-preset');
  state.selectedPreset = presetKey;
  state.currentOotdImage = presetImages[presetKey];
  
  // 프리셋 가시 이미지 출력
  dom.imagePreview.innerHTML = `<img src="${state.currentOotdImage}" alt="Preset Preview" style="width:100%; height:100%; object-fit:cover; border-radius:18px;">`;
  dom.imagePreview.classList.remove('hidden');
  
  // 측정 버튼 활성화
  dom.btnMeasureCombat.classList.remove('disabled');
  dom.btnMeasureCombat.disabled = false;
}

// =========================================================
// SCREEN 1: COMBAT POWER MEASUREMENT ENGINE
// =========================================================

function startCombatMeasurement() {
  dom.btnMeasureCombat.disabled = true;
  dom.btnMeasureCombat.classList.add('disabled');
  
  // 스캔 레이더 가동 및 로더 오픈
  dom.viewfinderContainer.classList.add('scanning');
  dom.scanLoader.classList.remove('hidden');
  
  const scanTexts = [
    '스냅샷 픽셀 마이닝 중...',
    '코디 실루엣 비대칭 검출 중...',
    '상하의 보색 조합 및 톤온톤 매칭 분석 중...',
    '글로벌 트렌드 파스텔 인덱싱 매칭 완료!'
  ];
  
  let textIndex = 0;
  dom.scanLoaderText.textContent = scanTexts[0];
  const textTimer = setInterval(() => {
    textIndex++;
    if (textIndex < scanTexts.length) {
      dom.scanLoaderText.textContent = scanTexts[textIndex];
    }
  }, 600);
  
  // 2.5초 후 패션력 연산 완료 및 모달 노출
  setTimeout(() => {
    clearInterval(textTimer);
    dom.viewfinderContainer.classList.remove('scanning');
    dom.scanLoader.classList.add('hidden');
    dom.btnMeasureCombat.disabled = false;
    dom.btnMeasureCombat.classList.remove('disabled');
    
    calculateAndShowCombatResult();
  }, 2500);
}

// 10,000점 기준 패션력 연산
function calculateAndShowCombatResult() {
  let score = 0;
  
  // 1. 프리셋 및 업로드 상태에 따른 점수 분기
  if (state.selectedPreset) {
    if (state.selectedPreset === 'high1') {
      score = Math.floor(8200 + Math.random() * 1100); // 8200 ~ 9300
    } else if (state.selectedPreset === 'high2') {
      score = Math.floor(7900 + Math.random() * 1400); // 7900 ~ 9300
    } else if (state.selectedPreset === 'low1') {
      score = Math.floor(2500 + Math.random() * 2000); // 2500 ~ 4500
    } else if (state.selectedPreset === 'low2') {
      score = Math.floor(4000 + Math.random() * 2000); // 4000 ~ 6000
    }
  } else {
    // 커스텀 이미지 (해시 성격으로 길이에 의존하여 다르게 추출하되 리얼리티 구현)
    const lengthHash = state.currentOotdImage ? state.currentOotdImage.length : 12345;
    score = Math.floor(4500 + (lengthHash % 4800)); // 4500 ~ 9300
  }
  
  // 2. 10,000점 스케일 제한 및 바인딩
  score = Math.max(1000, Math.min(10000, score));
  state.myScore = score;
  
  // 세부 스탯 바인딩 (평균 스케일에 난수를 가미)
  const avgStat = Math.floor(score / 100); // 10 ~ 100 스케일
  state.mySubStats.synergy = Math.min(100, Math.max(15, avgStat + getRandomDiff(-6, 6)));
  state.mySubStats.color = Math.min(100, Math.max(15, avgStat + getRandomDiff(-7, 7)));
  state.mySubStats.trend = Math.min(100, Math.max(15, avgStat + getRandomDiff(-8, 8)));
  state.mySubStats.tpo = Math.min(100, Math.max(15, avgStat + getRandomDiff(-10, 10)));
  
  // 3. 등급 랭크 결정
  if (score >= 9000) state.myRank = 'S-Rank';
  else if (score >= 7500) state.myRank = 'A-Rank';
  else if (score >= 6000) state.myRank = 'B-Rank';
  else if (score >= 4000) state.myRank = 'C-Rank';
  else state.myRank = 'D-Rank';
  
  // 4. 모달 점수판 롤링 연출 및 원형 파워 게이지 링 렌더링
  dom.resultScoreValue.textContent = '0';
  dom.resultRankBadge.textContent = state.myRank;
  
  // 원형 프로그레스 링 초기화 (완전 비움)
  const circleRadius = 80;
  const circumference = 2 * Math.PI * circleRadius; // 502.65
  dom.circleProgressRing.style.strokeDasharray = circumference;
  dom.circleProgressRing.style.strokeDashoffset = circumference;
  
  // 새 착장 측정이므로 개별 피드백 패널 숨기기 및 출전 버튼 활성화
  dom.modalOotdFeedbackPanel.classList.add('hidden');
  dom.btnEnterArena.classList.remove('hidden');
  state.currentlyViewingOotdId = null;
  
  // 모달 켜기
  dom.combatModal.classList.remove('hidden');
  
  // 원형 게이지 차오르는 애니메이션 (0.1초 후 시작)
  setTimeout(() => {
    const scorePercentage = state.myScore / 10000;
    const offset = circumference - (circumference * scorePercentage);
    dom.circleProgressRing.style.strokeDashoffset = offset;
  }, 100);

  // 카운트업 타이머
  let currentVal = 0;
  const targetVal = state.myScore;
  const duration = 1200; // 1.2초
  const stepTime = 16;   // 60fps
  const increment = targetVal / (duration / stepTime);
  
  const timer = setInterval(() => {
    currentVal += increment;
    if (currentVal >= targetVal) {
      dom.resultScoreValue.textContent = targetVal.toLocaleString();
      clearInterval(timer);
    } else {
      dom.resultScoreValue.textContent = Math.floor(currentVal).toLocaleString();
    }
  }, stepTime);
  
  // 스탯 게이지 바 애니메이션 트리거
  setTimeout(() => {
    Object.keys(state.mySubStats).forEach(key => {
      const val = state.mySubStats[key];
      dom.statFills[key].style.width = `${val}%`;
      dom.statNums[key].textContent = val;
    });
  }, 100);

  // 5. 디지털 매거진 커버 생성 및 뷰 바인딩
  const coverType = score >= 7000 ? 'vogue' : 'emergency';
  const magazineHtml = generateMagazineCoverHTML({
    name: '나의 OOTD',
    score: state.myScore,
    type: coverType,
    img: state.currentOotdImage,
    tagline: coverType === 'vogue' 
      ? 'THE PERFECT OOTD: 패션의 정석을 보여주다' 
      : 'EMERGENCY: 패션 긴급 구조대 호출 착장'
  });
  
  dom.generatedMagazineTarget.innerHTML = magazineHtml;
  
  // 내 계정 정보를 매칭풀 및 랭킹에 동적 반영하기 위해 state.battlePool에 내 데이터 갱신/추가
  const myMatchData = {
    id: 99, // User ID 고정
    name: '나의 OOTD (ME)',
    score: state.myScore,
    type: coverType,
    img: state.currentOotdImage,
    tagline: coverType === 'vogue' ? 'THE PERFECT OOTD: 감성 파스텔 웨어' : 'EMERGENCY: 구조가 시급한 소년 코디',
    synergy: state.mySubStats.synergy,
    color: state.mySubStats.color,
    trend: state.mySubStats.trend,
    tpo: state.mySubStats.tpo,
    wins: 0,
    total: 0
  };
  
  // 기존 나(99번) 데이터 제거 후 가입
  state.battlePool = state.battlePool.filter(p => p.id !== 99);
  state.battlePool.push(myMatchData);
}

function getRandomDiff(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 매거진 카드 템플릿 마크업 빌더
function generateMagazineCoverHTML(data, isArena = false) {
  if (data.type === 'vogue') {
    // Elegant Pastel Vogue Style (KINFOLK 느낌)
    // 배틀 아레나에서는 사진을 가리지 않도록 점수(측정정보) 뱃지 감춤
    const badgeHtml = isArena ? '' : `<span class="vogue-badge-power">${data.score.toLocaleString()} PTS</span>`;
    return `
      <div class="magazine-card" id="mag-card-${data.id}">
        <img src="${data.img}" class="magazine-bg-image" alt="OOTD Model">
        <div class="magazine-template-vogue">
          <div class="vogue-title-row">
            <span class="vogue-main-title">KINFOLK</span>
          </div>
          <div class="vogue-bottom-info">
            <span class="vogue-sub">OOTD BATTLE ARENA</span>
            <p class="vogue-headline">${data.tagline}</p>
            ${badgeHtml}
          </div>
        </div>
      </div>
    `;
  } else {
    // Tabloid Style Cute Warning (패션 구조대)
    // 배틀 아레나에서는 사진을 가리지 않도록 점수(측정정보) 뱃지 감춤
    const badgeHtml = isArena ? '' : `<span class="emergency-score-tag">패션력: ${data.score.toLocaleString()}</span>`;
    return `
      <div class="magazine-card" id="mag-card-${data.id}" style="background-color: #FFFDE7;">
        <img src="${data.img}" class="magazine-bg-image" alt="OOTD Model">
        <div class="magazine-template-emergency">
          <div class="emergency-header">
            <span class="emergency-title">FASHION EMERGENCY!</span>
            <div class="emergency-subtitle">※ 패션 구조대 긴급 출동 요망 ※</div>
          </div>
          <div class="emergency-bottom">
            <p class="emergency-headline">"SOS! 긴급 수혈이 필요한 스타일!"</p>
            ${badgeHtml}
          </div>
        </div>
      </div>
    `;
  }
}

// =========================================================
// SCREEN 2: BATTLE ARENA (SWIPE MATCHMAKING ENGINE)
// =========================================================

function loadNextArenaMatchup() {
  // 매칭 상대 검출 알고리즘
  // 15%의 확률로 '최고점 vs 최저점' 밈(Meme) 매치 발생
  // 85% 확률로 유사 패션력 매치
  
  const pool = state.battlePool;
  if (pool.length < 2) return;
  
  let playerA = null;
  let playerB = null;
  
  const isMemeMatch = Math.random() < 0.15;
  
  if (isMemeMatch) {
    // 최고점 유저와 최저점 유저 매치
    const sorted = [...pool].sort((x, y) => y.score - x.score);
    playerA = sorted[0]; // 최고점
    playerB = sorted[sorted.length - 1]; // 최저점
    
    // 좌우 배치 무작위성 부여
    if (Math.random() < 0.5) {
      const temp = playerA;
      playerA = playerB;
      playerB = temp;
    }
  } else {
    // 유사 패션력 매치 (랜덤하게 하나를 뽑고, 해당 상대와 점수차가 가까운 유저 매칭)
    const indexA = Math.floor(Math.random() * pool.length);
    playerA = pool[indexA];
    
    // 점수 오차가 가장 가까운 후보들 필터링
    const candidates = pool.filter(p => p.id !== playerA.id)
                           .sort((x, y) => Math.abs(x.score - playerA.score) - Math.abs(y.score - playerA.score));
    
    // 점수차가 너무 크지 않게 상위 3명 후보군 중 무작위 1인 매칭
    const sliceCount = Math.min(3, candidates.length);
    const indexB = Math.floor(Math.random() * sliceCount);
    playerB = candidates[indexB];
  }
  
  state.currentMatch.playerA = playerA;
  state.currentMatch.playerB = playerB;
  
  // DOM 렌더링
  dom.magazineFrameA.innerHTML = generateMagazineCoverHTML(playerA, true);
  dom.magazineFrameB.innerHTML = generateMagazineCoverHTML(playerB, true);
  
  // 프라이버시 효과 동기화
  toggleFaceBlurOverlay();
}

// 투표 행사 처리
function castVote(selectedSide) {
  const compA = state.currentMatch.playerA;
  const compB = state.currentMatch.playerB;
  if (!compA || !compB) return;
  
  // 비주얼 스와이프 피드백 오버레이 활성화
  if (selectedSide === 'left') {
    dom.cardCompA.classList.add('swiping-left');
    dom.cardCompA.querySelector('.card-action-overlay').style.opacity = 1;
  } else {
    dom.cardCompB.classList.add('swiping-right');
    dom.cardCompB.querySelector('.card-action-overlay').style.opacity = 1;
  }
  
  // 0.4초 후 실시간 득표율 팝업 연출
  setTimeout(() => {
    showVoteResultPopup(selectedSide);
  }, 400);
}

// 투표 결과 팝업 오버레이 제어
function showVoteResultPopup(selectedSide) {
  const compA = state.currentMatch.playerA;
  const compB = state.currentMatch.playerB;
  
  // 백엔드 모방 득표 비율 연산 로직
  // 패션력이 높을수록 기본 득표 성향이 높되, 일부 난수를 더해 박빙의 양상을 구현
  const scoreDiff = compA.score - compB.score; // 점수차
  let baseOdds = 50 + (scoreDiff / 120); // 100점당 0.8% 격차
  
  // 15%~85% 리밋
  baseOdds = Math.max(18, Math.min(82, baseOdds));
  
  // 득표율 산출
  const percentA = Math.floor(baseOdds + getRandomDiff(-5, 5));
  const percentB = 100 - percentA;
  
  // 승자 판정
  const winnerSide = percentA > percentB ? 'left' : 'right';
  const winnerUser = winnerSide === 'left' ? compA : compB;
  
  // 선택된 이미지에 Good 포인트 1점과 아레나 점수 기부
  let earnedXp = 25; // 투표 기본보상
  gainXP(earnedXp);
  
  // 모달 렌더링
  dom.popupPercentA.textContent = `${percentA}%`;
  dom.popupPercentB.textContent = `${percentB}%`;
  
  // 가상 배틀 스코어 가점 연출
  dom.popupScoreA.textContent = `+${Math.floor(percentA * 1.5)}`;
  dom.popupScoreB.textContent = `+${Math.floor(percentB * 1.5)}`;
  
  // 프로그레스 바 적용
  dom.popupProgressFill.style.width = `${percentA}%`;
  
  // 코멘트 (긍정적인 Good 포인트 기부 피드백)
  const votedUser = selectedSide === 'left' ? compA : compB;
  dom.popupStatusMsg.textContent = `${votedUser.name}님에게 Good 포인트 1점을 기부했습니다! 🎁`;
  
  // 팝업 오픈
  dom.voteResultPopup.classList.remove('hidden');
  
  // 2.2초 후 팝업 닫고 다음 매치업 준비
  setTimeout(() => {
    dom.voteResultPopup.classList.add('hidden');
    
    // 카드 제자리 트랜스폼 리셋
    dom.cardCompA.classList.remove('swiping-left');
    dom.cardCompB.classList.remove('swiping-right');
    dom.cardCompA.querySelector('.card-action-overlay').style.opacity = 0;
    dom.cardCompB.querySelector('.card-action-overlay').style.opacity = 0;
    
    dom.cardCompA.style.transition = 'none';
    dom.cardCompB.style.transition = 'none';
    dom.cardCompA.style.transform = 'translate(0px, 0px) rotate(0deg)';
    dom.cardCompB.style.transform = 'translate(0px, 0px) rotate(0deg)';
    
    // 리로드
    loadNextArenaMatchup();
  }, 2200);
}

// 프라이버시 체크에 따른 블러 온/오프
function toggleFaceBlurOverlay() {
  // 얼굴 블러 필터 기능 삭제됨
}

// =========================================================
// SCREEN 3: LEADERBOARD SYSTEM
// =========================================================

function renderLeaderboard() {
  // 포디엄 항시 활성화
  dom.leaderboardPodium.classList.remove('hidden');
  
  // 패션 모델 정렬 (패션력 순)
  const sortedModels = [...state.battlePool].sort((x, y) => y.score - x.score);
  
  // 1~3위 포디엄 바인딩
  if (sortedModels[0]) bindPodium(1, sortedModels[0]);
  if (sortedModels[1]) bindPodium(2, sortedModels[1]);
  if (sortedModels[2]) bindPodium(3, sortedModels[2]);
  
  // 나머지 4위 이하 리스트 렌더링
  let listHtml = '';
  for (let i = 3; i < sortedModels.length; i++) {
    const p = sortedModels[i];
    listHtml += `
      <div class="ranking-item" onclick="viewLeaderboardItemDetail(${p.id})" style="cursor: pointer;">
        <span class="rank-number">#${i + 1}</span>
        <div class="rank-avatar" style="background-image: url('${p.img}'); cursor: zoom-in;" onclick="zoomLeaderboardItemDetail(event, ${p.id})"></div>
        <div class="rank-info">
          <span class="rank-name">${p.name}</span>
          <span class="rank-stats-text">승률: ${Math.floor(80 - i*4.5 + Math.random()*2)}% / ${p.score.toLocaleString()} PTS</span>
        </div>
        <span class="rank-score-val">${p.score.toLocaleString()}점</span>
      </div>
    `;
  }
  dom.rankingListContainer.innerHTML = listHtml;
  
  // 내 순위 산출
  const myRankIdx = sortedModels.findIndex(p => p.id === 99);
  if (myRankIdx !== -1) {
    dom.userMyRank.textContent = `#${myRankIdx + 1}위`;
    dom.userMyScore.textContent = `${state.myScore.toLocaleString()}점`;
    const percentile = ((myRankIdx + 1) / sortedModels.length * 100).toFixed(1);
    document.querySelector('.my-rank-info .sub-label').textContent = `패션력 상위 ${percentile}% 달성!`;
  } else {
    // 측정 전 디폴트 표시
    dom.userMyRank.textContent = '#42위';
    dom.userMyScore.textContent = '7,920점';
    document.querySelector('.my-rank-info .sub-label').textContent = `패션력 상위 42%`;
  }
}

function bindPodium(rank, userData) {
  const avatarEl = document.getElementById(`podium-avatar-${rank}`);
  const nameEl = document.getElementById(`podium-name-${rank}`);
  const scoreEl = document.getElementById(`podium-score-${rank}`);
  
  if (userData.img.startsWith('data:image')) {
    avatarEl.style.backgroundImage = `url('${userData.img}')`;
  } else {
    avatarEl.style.backgroundImage = `url('${userData.img}')`;
  }
  nameEl.textContent = userData.name;
  scoreEl.textContent = `${userData.score.toLocaleString()}점`;
  
  // 아바타 클릭 시 풀스크린 확대보기 연동
  avatarEl.style.cursor = 'zoom-in';
  avatarEl.onclick = (event) => {
    event.stopPropagation();
    zoomLeaderboardItemDetail(event, userData.id);
  };
  
  // 포디엄 항목 클릭 시에도 상세 OOTD 카드 확대/분석 뷰 연결
  const stepEl = avatarEl.closest('.podium-step');
  if (stepEl) {
    stepEl.style.cursor = 'pointer';
    stepEl.onclick = (event) => {
      if (event.target !== avatarEl) {
        viewLeaderboardItemDetail(userData.id);
      }
    };
  }
}

// =========================================================
// INSTAGRAM STORY SHARING CARD CANVAS RENDERER
// =========================================================

function openShareModal() {
  // 1. 내 점수가 아직 측정이 안 된 디폴트 상태일 때 가이드
  if (state.myScore === 0) {
    alert('패션력 측정을 먼저 진행해 디지털 매거진을 발행해 주세요!');
    switchScreen('screen-scan');
    return;
  }
  
  dom.instagramShareModal.classList.remove('hidden');
  
  // 2. 캔버스 로딩 & 드로잉 수행
  drawInstagramStoryShareCard();
}

function drawInstagramStoryShareCard() {
  const canvas = dom.shareCanvas;
  const ctx = canvas.getContext('2d');
  
  // 스토리 규격: 1080x1920
  const width = canvas.width;
  const height = canvas.height;
  
  // 1. 파스텔 그라데이션 배경 채우기
  let gradient = ctx.createLinearGradient(0, 0, 0, height);
  if (state.myScore >= 7000) {
    // KINFOLK 파스텔 감성: 부드러운 오프화이트 -> 민트/퍼플
    gradient.addColorStop(0, '#FAF9F6');
    gradient.addColorStop(0.5, '#E8F5E9');
    gradient.addColorStop(1, '#E3F2FD');
  } else {
    // 패션 구조대 감성: 살구 핑크 -> 웜 옐로우
    gradient.addColorStop(0, '#FAF9F6');
    gradient.addColorStop(0.5, '#FFEBEE');
    gradient.addColorStop(1, '#FFFDE7');
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // 2. 장식용 그리드 라인 & 서클
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.03)';
  ctx.lineWidth = 2;
  for (let x = 100; x < width; x += 150) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  // 3. 로고 텍스트 (FITBATTLE)
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  
  ctx.fillStyle = '#1C1917';
  ctx.font = 'bold 72px Outfit';
  ctx.fillText('FITBATTLE', width / 2, 120);
  
  ctx.fillStyle = '#78716C';
  ctx.font = '500 24px Outfit';
  ctx.fillText('DIGITAL MAGAZINE COOTD BATTLE', width / 2, 210);
  
  // 4. 메인 매거진 커버 드로잉 (중앙 배치)
  // 비동기 이미지 로딩
  const modelImg = new Image();
  modelImg.onload = function() {
    // 중앙 캔버스 영역에 매거진 비율(3:4)에 맞는 카드 테두리 및 이미지 출력
    const cardWidth = 720;
    const cardHeight = 960;
    const cardX = (width - cardWidth) / 2;
    const cardY = 320;
    
    // 카드 섀도우 연출
    ctx.shadowColor = 'rgba(28, 25, 23, 0.12)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 15;
    
    // 카드 베이스 (흰 배경)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 32);
    ctx.fill();
    
    // 클리핑 마스크를 활용하여 내부 오차 없이 둥근 매거진 이미지 렌더링
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 32);
    ctx.clip();
    
    // 이미지 핏팅
    ctx.drawImage(modelImg, cardX, cardY, cardWidth, cardHeight);
    
    // 5. 잡지 템플릿 정보 각인 (캔버스 내 그래픽 레이어 오버레이)
    if (state.myScore >= 7000) {
      // KINFOLK 오버레이
      let overlayGrad = ctx.createLinearGradient(0, cardY + cardHeight * 0.5, 0, cardY + cardHeight);
      overlayGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      overlayGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
      ctx.fillStyle = overlayGrad;
      ctx.fillRect(cardX, cardY + cardHeight * 0.5, cardWidth, cardHeight * 0.5);
      
      // 타이틀
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 84px Playfair Display';
      ctx.fillText('KINFOLK', width / 2, cardY + 50);
      
      // 가로 분할 얇은 선
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cardX + 60, cardY + 160);
      ctx.lineTo(cardX + cardWidth - 60, cardY + 160);
      ctx.stroke();
      
      // 하단 텍스트
      ctx.textAlign = 'left';
      ctx.font = 'bold 24px Outfit';
      ctx.fillText('OOTD BATTLE ARENA HIGHLIGHT', cardX + 50, cardY + cardHeight - 140);
      ctx.font = 'italic 34px Playfair Display';
      ctx.fillText('THE PERFECT OOTD: 패션의 정석을 보여주다', cardX + 50, cardY + cardHeight - 90);
    } else {
      // 탭로이드 구조대 오버레이
      // 헤더 경고 박스
      ctx.fillStyle = '#FFFDE7';
      ctx.strokeStyle = '#EF9A9A';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(cardX + 40, cardY + 40, cardWidth - 80, 150, 16);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#C62828';
      ctx.font = 'bold 36px Fredoka';
      ctx.fillText('FASHION EMERGENCY!', width / 2, cardY + 70);
      
      ctx.fillStyle = '#E65100';
      ctx.font = 'bold 20px Outfit';
      ctx.fillText('※ 패션 구조대 긴급 출동 완료 ※', width / 2, cardY + 130);
      
      // 하단 말풍선 박스
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.strokeStyle = '#EF9A9A';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(cardX + 40, cardY + cardHeight - 160, cardWidth - 80, 120, 16);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#C62828';
      ctx.font = 'bold 24px Fredoka';
      ctx.fillText('"SOS! 긴급 수혈이 필요한 스타일!"', width / 2, cardY + cardHeight - 120);
      ctx.font = 'bold 20px Outfit';
      ctx.fillStyle = '#E65100';
      ctx.fillText(`FASHION SCORE: ${state.myScore.toLocaleString()}`, width / 2, cardY + cardHeight - 75);
    }
    
    ctx.restore();
    // 그림자 완전 초기화 (이후 요소 및 텍스트에 오프셋 그림자가 중복해서 그려지는 현상 방지)
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // 6. 하단 패션력 명예 엠블럼 박스
    const rankY = cardY + cardHeight + 80;
    
    // 등급 엠블럼 원
    ctx.fillStyle = '#1C1917';
    ctx.beginPath();
    ctx.arc(width / 2, rankY + 30, 90, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = 'bold 74px Outfit';
    ctx.textBaseline = 'middle';
    
    // 등급 문자 (S, A, B 등)
    const rankChar = state.myRank.split('-')[0];
    ctx.fillText(rankChar, width / 2, rankY + 30);
    
    // 스펙 라벨
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#1C1917';
    ctx.font = 'bold 32px Outfit';
    ctx.fillText('FASHION POWER', width / 2, rankY + 150);
    
    ctx.fillStyle = '#8D6E63';
    ctx.font = 'bold 64px Fredoka';
    ctx.fillText(`${state.myScore.toLocaleString()} PTS`, width / 2, rankY + 200);
    
    // 7. 하단 챌린지 성취 딱지 (승률 상위 3.8% 달성)
    const ribbonY = rankY + 300;
    
    // 리본 백그라운드
    ctx.fillStyle = '#E8F5E9';
    ctx.strokeStyle = '#A5D6A7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(width / 2 - 260, ribbonY, 520, 64, 16);
    ctx.fill();
    ctx.stroke();
    
    // 동적 백분율 계산
    const sortedModels = [...state.battlePool].sort((x, y) => y.score - x.score);
    const myRankIdx = sortedModels.findIndex(p => p.id === 99);
    const percentile = myRankIdx !== -1 
      ? ((myRankIdx + 1) / sortedModels.length * 100).toFixed(1) 
      : '3.8';

    ctx.fillStyle = '#2E7D32';
    ctx.font = 'bold 24px Outfit';
    ctx.fillText(`핏배틀 아레나 상위 ${percentile}% 달성`, width / 2, ribbonY + 20);
    
    // 8. 캔버스를 이미지 미리보기 DOM에 매핑
    dom.sharePreviewImg.src = canvas.toDataURL('image/png');
  };
  
  // 이미지 경로 지정하여 로드
  modelImg.src = state.currentOotdImage;
}

function downloadShareCard() {
  const link = document.createElement('a');
  link.download = `fitbattle_score_${state.myScore}.png`;
  link.href = dom.shareCanvas.toDataURL('image/png');
  link.click();
  
  // 다운로드 완료 리워드 부여
  gainXP(100);
  alert('인증샷 다운로드가 완료되었습니다! 보너스 100 XP가 추가 적립되었습니다.');
  dom.instagramShareModal.classList.add('hidden');
}

// =========================================================
// FALLBACK ASSETS GENERATION & SVG PATH REPLACEMENTS
// =========================================================
function setupFallbackAssets() {
  // assets 폴더가 로컬에 생성되기 전에 오류 방지를 위해, SVG 데이터셋을 Fallback URL로 바인딩합니다.
  // 100% 독립 동작 웹을 만들기 위해 프리셋용 SVG 데이터 URL을 생성
  presetImages.high1 = createSVGDataURL('sage', 'minimalist');
  presetImages.high2 = createSVGDataURL('blue', 'trench');
  presetImages.low1 = createSVGDataURL('peach', 'chaos');
  presetImages.low2 = createSVGDataURL('yellow', 'dino');
}

// 캔버스/SVG 다이나믹 렌더링으로 로컬에 이미지가 없어도 100% 작동 보장
function createSVGDataURL(theme, style) {
  let mainColor = '#E8F5E9';
  let accentColor = '#2E7D32';
  let bodyDetail = '';
  
  if (theme === 'sage') {
    mainColor = '#E8F5E9';
    accentColor = '#81C784';
    bodyDetail = `
      <!-- 미니멀 자켓 & 팬츠 -->
      <rect x="70" y="140" width="60" height="150" fill="#E0E0E0" rx="6" />
      <rect x="70" y="240" width="28" height="130" fill="#3E2723" />
      <rect x="102" y="240" width="28" height="130" fill="#3E2723" />
      <rect x="62" y="140" width="16" height="110" fill="#E0E0E0" rx="4" />
      <rect x="122" y="140" width="16" height="110" fill="#E0E0E0" rx="4" />
      <circle cx="100" cy="110" r="24" fill="#FFCCBC" />
      <rect x="85" y="80" width="30" height="12" fill="#5D4037" rx="3" />
    `;
  } else if (theme === 'blue') {
    mainColor = '#E3F2FD';
    accentColor = '#64B5F6';
    bodyDetail = `
      <!-- 트렌치 코트 -->
      <rect x="70" y="130" width="60" height="170" fill="#D7CCC8" rx="8" />
      <rect x="70" y="270" width="26" height="100" fill="#1A237E" />
      <rect x="104" y="270" width="26" height="100" fill="#1A237E" />
      <line x1="100" y1="130" x2="100" y2="300" stroke="#8D6E63" stroke-width="2" />
      <circle cx="100" cy="100" r="22" fill="#FFE0B2" />
      <path d="M 80,90 Q 100,70 120,90" stroke="#3E2723" stroke-width="6" fill="none" />
    `;
  } else if (theme === 'peach') {
    mainColor = '#FFEBEE';
    accentColor = '#E57373';
    bodyDetail = `
      <!-- 아방가르드 혼종 (Mismatched) -->
      <rect x="70" y="130" width="60" height="120" fill="#F48FB1" rx="4" />
      <rect x="70" y="230" width="28" height="110" fill="#FFEB3B" />
      <rect x="102" y="230" width="28" height="110" fill="#81C784" />
      <!-- 거대 나비 넥타이 -->
      <polygon points="80,135 120,135 100,150" fill="#0288D1" />
      <circle cx="100" cy="95" r="22" fill="#FFD54F" />
      <rect x="80" y="65" width="40" height="18" fill="#E040FB" />
    `;
  } else if (theme === 'yellow') {
    mainColor = '#FFFDE7';
    accentColor = '#FFF176';
    bodyDetail = `
      <!-- 공룡 잠옷 (Dinosaur Pajama) -->
      <rect x="65" y="120" width="70" height="180" fill="#A5D6A7" rx="28" />
      <rect x="72" y="280" width="22" height="70" fill="#A5D6A7" rx="8" />
      <rect x="106" y="280" width="22" height="70" fill="#A5D6A7" rx="8" />
      <!-- 꼬리 & 등 뿔 -->
      <polygon points="50,160 65,150 65,180" fill="#C8E6C9" />
      <polygon points="50,210 65,200 65,230" fill="#C8E6C9" />
      <polygon points="50,260 65,250 65,280" fill="#C8E6C9" />
      <circle cx="100" cy="95" r="24" fill="#A5D6A7" />
      <circle cx="90" cy="95" r="3" fill="#000" />
      <circle cx="110" cy="95" r="3" fill="#000" />
      <path d="M 92,105 Q 100,115 108,105" stroke="#000" stroke-width="2" fill="none" />
    `;
  }

  // SVG를 String으로 만들고 Base64 인코딩
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 400" width="200" height="400">
      <rect width="100%" height="100%" fill="${mainColor}" />
      <circle cx="100" cy="180" r="140" fill="${accentColor}" opacity="0.1" />
      <g transform="translate(0, 10)">
        ${bodyDetail}
      </g>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// =========================================================
// 2차 개발 추가 기능: 내 OOTD 대시보드 & 단독 핏체크 스와이프
// =========================================================

// 1. 내 OOTD 실시간 반응 대시보드 & 갤러리 연동 시뮬레이터
function startMyOotdLiveDashboard() {
  const coverType = state.myScore >= 7000 ? 'vogue' : 'emergency';
  const newOotd = {
    id: 100 + state.myGalleryList.length,
    score: state.myScore,
    rank: state.myRank,
    type: coverType,
    img: state.currentOotdImage,
    good: 0,
    bad: 0,
    battleStartedAt: Date.now() // 배틀 시작 시간 기록 (24시간 타이머용)
  };
  
  state.myGalleryList.unshift(newOotd);
  
  // 갤러리 즉시 갱신
  renderOotdGallery();
  
  // 백그라운드 타이머 기동 (기존 타이머 해제)
  if (state.dashboardIntervalId) {
    clearInterval(state.dashboardIntervalId);
  }
  
  // 가상 평론가들의 실시간 투표 반영 (3초 주기로 동작)
  state.dashboardIntervalId = setInterval(() => {
    state.myGalleryList.forEach((ootd) => {
      // 24시간 배틀 종료 이전인 OOTD만 점수 상승
      const timeLeft = 24 * 60 * 60 * 1000 - (Date.now() - ootd.battleStartedAt);
      if (timeLeft > 0) {
        const isGood = Math.random() < 0.70;
        const votes = Math.floor(Math.random() * 2) + 1; // 1~2표 상승
        
        if (isGood) {
          ootd.good += votes;
        } else {
          ootd.bad += votes;
        }
      }
    });
    
    // 만약 현재 모달창에서 상세 정보가 조회 중이고 그 대상이 갤러리 아이템이라면 모달의 피드백도 실시간 갱신
    if (state.currentlyViewingOotdId !== null) {
      const item = state.myGalleryList.find(x => x.id === state.currentlyViewingOotdId);
      if (item) {
        updateModalFeedbackDashboard(item);
      }
    }
    
    // 이미지 깜박임 방지를 위해 텍스트 수치만 경량 업데이트
    updateOotdGalleryStatsOnly();
  }, 3000);
}

// OOTD 갤러리 리스트 드로잉 (24시간 배틀 남은시간 및 뱃지 연동)
function renderOotdGallery() {
  const container = dom.galleryCardsContainer;
  const countLbl = dom.galleryCountLbl;
  
  if (!container) return;
  
  if (state.myGalleryList.length === 0) {
    container.innerHTML = `<p class="gallery-empty-msg">아직 출전한 코디가 없습니다. 측정 후 배틀에 참가해 보세요!</p>`;
    countLbl.textContent = '0 items';
    return;
  }
  
  countLbl.textContent = `${state.myGalleryList.length} items`;
  
  let html = '';
  state.myGalleryList.forEach(ootd => {
    const timeLeft = 24 * 60 * 60 * 1000 - (Date.now() - ootd.battleStartedAt);
    const isInBattle = timeLeft > 0;
    const battleClass = isInBattle ? 'in-battle' : '';
    
    let battleBadgeHtml = '';
    let timerHtml = '';
    if (isInBattle) {
      battleBadgeHtml = `<span class="gallery-battle-badge">🔥 배틀 중</span>`;
      timerHtml = `<span class="gallery-battle-timer">⏱️ ${formatTimeText(timeLeft)}</span>`;
    } else {
      battleBadgeHtml = `<span class="gallery-battle-badge" style="background-color: #78716C;">📁 완료</span>`;
      timerHtml = `<span class="gallery-battle-timer" style="color: #78716C;">배틀 종료</span>`;
    }
    
    html += `
      <div class="gallery-card-item ${battleClass}" data-id="${ootd.id}" onclick="viewGalleryItemDetail(${ootd.id})">
        ${battleBadgeHtml}
        <div class="gallery-mini-magazine" onclick="zoomGalleryItemDetail(event, ${ootd.id})">
          <img src="${ootd.img}" alt="OOTD Mini">
          <span class="gallery-item-rank" style="position: absolute; top: 4px; right: 4px; z-index: 5;">${ootd.rank.split('-')[0]}</span>
        </div>
        <span class="gallery-item-score">${ootd.score.toLocaleString()}점</span>
        <div class="gallery-item-feedback">
          <span class="g">👍 ${ootd.good}</span>
          <span class="b">👎 ${ootd.bad}</span>
        </div>
        ${timerHtml}
      </div>
    `;
  });
  container.innerHTML = html;
}

// 갤러리 내의 미디어나 카드 이미지 깜박임 방지를 위해 텍스트 수치만 부분 업데이트하는 경량 함수
function updateOotdGalleryStatsOnly() {
  state.myGalleryList.forEach(ootd => {
    const cardEl = document.querySelector(`.gallery-card-item[data-id="${ootd.id}"]`);
    if (cardEl) {
      const gEl = cardEl.querySelector('.gallery-item-feedback .g');
      const bEl = cardEl.querySelector('.gallery-item-feedback .b');
      if (gEl) gEl.textContent = `👍 ${ootd.good}`;
      if (bEl) bEl.textContent = `👎 ${ootd.bad}`;
    }
  });
}

function updateOotdGalleryTimersOnly() {
  state.myGalleryList.forEach(ootd => {
    const cardEl = document.querySelector(`.gallery-card-item[data-id="${ootd.id}"]`);
    if (cardEl) {
      const timerEl = cardEl.querySelector('.gallery-battle-timer');
      if (timerEl) {
        const timeLeft = 24 * 60 * 60 * 1000 - (Date.now() - ootd.battleStartedAt);
        if (timeLeft > 0) {
          timerEl.textContent = `⏱️ ${formatTimeText(timeLeft)}`;
        } else {
          timerEl.textContent = '배틀 종료';
          timerEl.style.color = '#78716C';
          const badgeEl = cardEl.querySelector('.gallery-battle-badge');
          if (badgeEl) {
            badgeEl.textContent = '📁 완료';
            badgeEl.style.backgroundColor = '#78716C';
          }
          cardEl.classList.remove('in-battle');
        }
      }
    }
  });
}

// 갤러리 아이템 클릭 시 모달 띄워 원본 보기 지원 (개별 실시간 독자반응 패널 포함)
window.viewGalleryItemDetail = function(id) {
  const item = state.myGalleryList.find(x => x.id === id);
  if (!item) return;
  
  state.currentlyViewingOotdId = id; // 현재 보고 있는 OOTD ID 설정
  
  // 결과창 내용 주입 및 원형 컴뱃 게이지 복원
  dom.resultScoreValue.textContent = item.score.toLocaleString();
  dom.resultRankBadge.textContent = item.rank;
  
  // 1. 원형 SVG 게이지 드로잉 적용
  const circleRadius = 80;
  const circumference = 2 * Math.PI * circleRadius;
  dom.circleProgressRing.style.strokeDasharray = circumference;
  
  const scorePercentage = item.score / 10000;
  const offset = circumference - (circumference * scorePercentage);
  dom.circleProgressRing.style.strokeDashoffset = offset;
  
  // 2. 가상 스탯 바 분기
  const avgStat = Math.floor(item.score / 100);
  Object.keys(dom.statFills).forEach(key => {
    dom.statFills[key].style.width = `${avgStat}%`;
    dom.statNums[key].textContent = avgStat;
  });
  
  // 3. 잡지 커버 출력
  dom.generatedMagazineTarget.innerHTML = generateMagazineCoverHTML({
    name: '내 OOTD',
    score: item.score,
    type: item.type,
    img: item.img,
    tagline: item.type === 'vogue' 
      ? 'THE PERFECT OOTD: 패션의 정석을 보여주다' 
      : 'EMERGENCY: 패션 긴급 구조대 호출 착장'
  });
  
  // 4. 개별 OOTD 실시간 독자반응 대시보드 출력 및 연동 활성화
  updateModalFeedbackDashboard(item);
  dom.modalOotdFeedbackPanel.classList.remove('hidden');
  
  // 이미 출전한 OOTD이므로 아레나 출전하기 버튼은 감추기
  dom.btnEnterArena.classList.add('hidden');
  
  // 모달 켜기
  dom.combatModal.classList.remove('hidden');
};

// 2. 단독 핏체크 평가 대상 카드 로드 (Screen 3)
function loadNextFitCheckCard() {
  // 핏체크용 가상 유저 풀 정렬/무작위성 확보
  if (state.fitcheckQueue.length === 0) {
    // 가상 대결 풀에서 유저 복사 (내 카드 제외)
    state.fitcheckQueue = state.battlePool.filter(p => p.id !== 99);
  }
  
  // 큐 회전
  if (state.fitcheckCurrentIndex >= state.fitcheckQueue.length) {
    state.fitcheckCurrentIndex = 0;
    // 셔플
    state.fitcheckQueue.sort(() => Math.random() - 0.5);
  }
  
  const currentItem = state.fitcheckQueue[state.fitcheckCurrentIndex];
  
  // 핏체크 매거진 카드 렌더링
  dom.fitcheckMagazineFrame.innerHTML = generateMagazineCoverHTML(currentItem, false);
  
  // 얼굴 블러 옵션 동기화
  toggleFaceBlurOverlay();
  
  // 배경색 및 워터마크 초기화
  if (dom.fitcheckArenaContainer) {
    dom.fitcheckArenaContainer.style.backgroundColor = '';
  }
  if (dom.fitcheckBgTextOverlay) {
    dom.fitcheckBgTextOverlay.style.opacity = '0';
  }
  
  const card = dom.fitcheckActiveCard;
  card.style.transform = 'translate(0px, 0px) rotate(0deg)';
  card.style.transition = 'none';
  card.classList.remove('hidden');
  
  // 결과 바 숨김
  dom.fitcheckResultBarOverlay.classList.add('hidden');
  
  // 드래그 제스처 바인딩 초기화
  setupFitCheckCardDrag();
}

// 3. 단독 핏체크 카드 Tinder 스와이프 제스처 구현
function setupFitCheckCardDrag() {
  const card = dom.fitcheckActiveCard;
  
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let currentY = 0;
  let isDragging = false;
  
  // 마우스/터치 다운 이벤트 핸들러
  function onStart(e) {
    isDragging = true;
    card.classList.add('grabbing');
    card.style.transition = 'none';
    
    // 마우스 vs 터치 분기
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    startX = clientX;
    startY = clientY;
    
    // 이벤트 바인딩
    if (e.type.includes('touch')) {
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onEnd);
    } else {
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onEnd);
    }
  }
  
  // 마우스/터치 무브 이벤트 핸들러
  function onMove(e) {
    if (!isDragging) return;
    
    // 기본 드래그 제스처 모바일 스크롤 방지
    if (e.cancelable) e.preventDefault();
    
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    currentX = clientX - startX;
    currentY = clientY - startY;
    
    // 회전 및 스케일 변환 적용 (Tinder 물리효과)
    const rotateDeg = currentX * 0.08;
    card.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotateDeg}deg)`;
    
    // 배경색 동적 보간 (Glow) 및 글자 워터마크 피드백 적용
    if (dom.fitcheckArenaContainer) {
      if (currentX < 0) {
        const opacity = Math.min(0.8, -currentX / 150);
        dom.fitcheckArenaContainer.style.backgroundColor = `rgba(165, 214, 167, ${opacity})`; // 진하게 그린
        if (dom.fitcheckBgTextOverlay) {
          dom.fitcheckBgTextOverlay.textContent = '👍 GOOD';
          dom.fitcheckBgTextOverlay.style.opacity = opacity;
          dom.fitcheckBgTextOverlay.style.color = 'rgba(46, 125, 50, 0.85)';
          dom.fitcheckBgTextOverlay.style.transform = `translate(-50%, -50%) scale(${1 + opacity * 0.15})`;
        }
      } else if (currentX > 0) {
        const opacity = Math.min(0.8, currentX / 150);
        dom.fitcheckArenaContainer.style.backgroundColor = `rgba(255, 205, 210, ${opacity})`; // 진하게 레드
        if (dom.fitcheckBgTextOverlay) {
          dom.fitcheckBgTextOverlay.textContent = '👎 BAD';
          dom.fitcheckBgTextOverlay.style.opacity = opacity;
          dom.fitcheckBgTextOverlay.style.color = 'rgba(198, 40, 40, 0.85)';
          dom.fitcheckBgTextOverlay.style.transform = `translate(-50%, -50%) scale(${1 + opacity * 0.15})`;
        }
      } else {
        dom.fitcheckArenaContainer.style.backgroundColor = '';
        if (dom.fitcheckBgTextOverlay) {
          dom.fitcheckBgTextOverlay.style.opacity = '0';
        }
      }
    }
  }
  
  // 마우스/터치 업 이벤트 핸들러
  function onEnd() {
    isDragging = false;
    card.classList.remove('grabbing');
    
    // 이벤트 리스너 제거
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onEnd);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onEnd);
    
    // 스와이프 확정 임계점(100px) 분석
    const threshold = 100;
    
    if (currentX < -threshold) {
      // 1. 왼쪽 스와이프 확정 -> GOOD 투표
      swipeOutCard('left');
    } else if (currentX > threshold) {
      // 2. 오른쪽 스와이프 확정 -> BAD 투표
      swipeOutCard('right');
    } else {
      // 3. 임계값 미만 -> 부드럽게 원위치
      card.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      card.style.transform = 'translate(0px, 0px) rotate(0deg)';
      if (dom.fitcheckArenaContainer) {
        dom.fitcheckArenaContainer.style.backgroundColor = '';
      }
      if (dom.fitcheckBgTextOverlay) {
        dom.fitcheckBgTextOverlay.style.opacity = '0';
      }
    }
    
    // 위치 변수 초기화
    startX = 0; startY = 0; currentX = 0; currentY = 0;
  }
  
  // 카드 날려보내기 애니메이션 및 결과 연출
  function swipeOutCard(direction) {
    card.style.transition = 'transform 0.5s cubic-bezier(0.1, 0.8, 0.1, 1)';
    
    // 날아가는 궤적 및 회전 각도
    const throwX = direction === 'left' ? -600 : 600;
    const throwRotate = direction === 'left' ? -35 : 35;
    
    card.style.transform = `translate(${throwX}px, ${currentY}px) rotate(${throwRotate}deg)`;
    
    if (dom.fitcheckArenaContainer) {
      dom.fitcheckArenaContainer.style.backgroundColor = '';
    }
    if (dom.fitcheckBgTextOverlay) {
      dom.fitcheckBgTextOverlay.style.opacity = '0';
    }
    
    // 투표 처리 및 결과 레이어 노출
    setTimeout(() => {
      card.classList.add('hidden');
      showFitCheckResultOverlay(direction);
    }, 250);
  }
  
  // 마우스/터치 리스너 첫 바인딩
  card.addEventListener('mousedown', onStart);
  card.addEventListener('touchstart', onStart);
}

// 4. 단독 핏체크 평가 결과 막대 오버레이 렌더링
function showFitCheckResultOverlay(direction) {
  // 결과 비율 모의 연산
  const currentItem = state.fitcheckQueue[state.fitcheckCurrentIndex];
  
  // OOTD 고득점 룩은 기본적으로 Good이 높게 나옴
  let goodRatio = currentItem.score >= 7000 
    ? Math.floor(70 + Math.random() * 20) // 70% ~ 90%
    : Math.floor(25 + Math.random() * 30); // 25% ~ 55%
  
  // 만약 유저가 누른 투표 방향에 맞춰 일부 보정
  if (direction === 'left') {
    goodRatio = Math.min(96, goodRatio + 4);
  } else {
    goodRatio = Math.max(4, goodRatio - 4);
  }
  
  const badRatio = 100 - goodRatio;
  
  // XP 가점
  gainXP(25);
  
  // 핏체크 평가 횟수 누적 및 주간 챌린지 체크
  state.fitcheckEvaluationsCount++;
  checkChallenges();
  
  // DOM 적용
  dom.fitcheckResultPercentGood.textContent = `${goodRatio}%`;
  dom.fitcheckResultPercentBad.textContent = `${badRatio}%`;
  dom.fitcheckResultProgressFill.style.width = `${goodRatio}%`;
  
  // 결과 오버레이 켜기
  dom.fitcheckResultBarOverlay.classList.remove('hidden');
  
  // 1.8초 뒤 결과 바를 닫고 다음 카드로 부드럽게 롤링
  setTimeout(() => {
    dom.fitcheckResultBarOverlay.classList.add('hidden');
    state.fitcheckCurrentIndex++;
    loadNextFitCheckCard();
  }, 1800);
}

// 5. [추가] 배틀 아레나 카드 드래그 물리 모션 고도화 (이중 클릭 해결 및 트랜스폼 리셋 핫픽스)
function setupArenaCardsSwipe() {
  // 배틀 아레나의 두 카드 각각에 드래그 이벤트 적용
  [dom.cardCompA, dom.cardCompB].forEach(card => {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    const side = card.getAttribute('data-side'); // 'left' or 'right'
    
    function onStart(e) {
      isDragging = true;
      card.style.transition = 'none';
      const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      startX = clientX;
      
      if (e.type.includes('touch')) {
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);
      } else {
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
      }
    }
    
    function onMove(e) {
      if (!isDragging) return;
      if (e.cancelable) e.preventDefault();
      
      const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      currentX = clientX - startX;
      
      // 내 미는 방향에 맞는 시각 트랜스폼
      if (side === 'left' && currentX < 0) {
        card.style.transform = `translate(${currentX}px, ${currentX * 0.2}px) rotate(${currentX * 0.08}deg)`;
        card.querySelector('.card-action-overlay').style.opacity = Math.min(1, -currentX / 80);
      } else if (side === 'right' && currentX > 0) {
        card.style.transform = `translate(${currentX}px, -${currentX * 0.2}px) rotate(${currentX * 0.08}deg)`;
        card.querySelector('.card-action-overlay').style.opacity = Math.min(1, currentX / 80);
      }
    }
    
    function onEnd() {
      isDragging = false;
      
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
      
      const threshold = 70;
      const dragDistance = Math.abs(currentX);
      
      if (side === 'left' && currentX < -threshold) {
        // 던지기 애니메이션 연출
        card.style.transition = 'transform 0.4s cubic-bezier(0.1, 0.8, 0.1, 1)';
        card.style.transform = 'translate(-400px, -100px) rotate(-20deg)';
        castVote('left');
      } else if (side === 'right' && currentX > threshold) {
        // 던지기 애니메이션 연출
        card.style.transition = 'transform 0.4s cubic-bezier(0.1, 0.8, 0.1, 1)';
        card.style.transform = 'translate(400px, -100px) rotate(20deg)';
        castVote('right');
      } else if (dragDistance < 8) {
        // 핫픽스: 드래그 거리가 8px 이하인 경우 단순 클릭/탭 투표로 판정 (이중투표 버그 완벽 수정)
        castVote(side);
      } else {
        // 원위치 복귀
        card.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        card.style.transform = 'translate(0px, 0px) rotate(0deg)';
        card.querySelector('.card-action-overlay').style.opacity = 0;
      }
      
      currentX = 0;
    }
    
    card.addEventListener('mousedown', onStart);
    card.addEventListener('touchstart', onStart);
  });
}



// =========================================================
// 3차 고도화 추가 기능: 토스트 알림, 서브뷰 스위치, 전체메뉴 및 24시간 배틀 타이머
// =========================================================

// 1. 글로벌 토스트 알림 노출
function showToast(message) {
  if (!dom.appToastContainer) return;
  
  const emojiEl = dom.appToastContainer.querySelector('.toast-emoji');
  let emoji = '✨'; // 기본 데코용 에모지
  let cleanMessage = message;
  
  // 메시지 문자열에서 에모지 자동 검출 (시작 또는 끝에 있는 유니코드 에모지 추출)
  const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/;
  const match = message.match(emojiRegex);
  
  if (match) {
    emoji = match[0];
    // 메시지에서 첫 번째 발견된 에모지 제거 및 문자열 다듬기
    cleanMessage = message.replace(emojiRegex, '').trim();
  }
  
  // DOM 업데이트
  if (emojiEl) emojiEl.textContent = emoji;
  dom.toastMessage.textContent = cleanMessage;
  
  // 토스트 숨김 클래스 해제
  dom.appToastContainer.classList.remove('hidden');
  
  // 이미 실행 중인 타이머가 있는 경우 해제하여 큐가 꼬이거나 연속 클릭 시 바로 사라지는 버그 해결
  if (window.toastTimeoutId) {
    clearTimeout(window.toastTimeoutId);
  }
  
  // 2.5초 후 토스트 팝업 숨김
  window.toastTimeoutId = setTimeout(() => {
    dom.appToastContainer.classList.add('hidden');
  }, 2500);
}

// 2. 핏체크 세그먼트 서브뷰 토글 바인딩
function setupFitCheckSubTabs() {
  dom.fitcheckSubTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const subviewName = tab.getAttribute('data-subview');
      switchFitCheckSubview(subviewName);
    });
  });
}

function switchFitCheckSubview(subviewName) {
  dom.fitcheckSubTabs.forEach(tab => {
    if (tab.getAttribute('data-subview') === subviewName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  
  dom.fitcheckSubviews.forEach(view => {
    if (view.id === `fitcheck-subview-${subviewName}`) {
      view.classList.remove('hidden');
    } else {
      view.classList.add('hidden');
    }
  });
  
  // 활성화된 탭 리로드
  if (subviewName === 'feedback') {
    loadNextFitCheckCard();
  } else if (subviewName === 'arena') {
    loadNextArenaMatchup();
  }
}

// 3. 전체메뉴 설정 컨트롤러 및 AI 코칭 리스너
function setupMenuListeners() {
  // 다크모드 스위치 연동
  if (dom.checkboxDarkMode) {
    dom.checkboxDarkMode.addEventListener('change', (e) => {
      state.darkMode = e.target.checked;
      if (state.darkMode) {
        document.body.classList.add('dark-mode');
        showToast('🌙 다크 모드가 활성화되었습니다.');
      } else {
        document.body.classList.remove('dark-mode');
        showToast('☀️ 라이트 모드가 활성화되었습니다.');
      }
    });
  }
  
  // 얼굴 블러 필터 기능 삭제됨
  
  // 사운드 효과 설정 (모방 토스트 피드백)
  if (dom.checkboxSoundEffect) {
    dom.checkboxSoundEffect.addEventListener('change', (e) => {
      state.soundEffects = e.target.checked;
      showToast(state.soundEffects ? '🔊 효과음이 켜졌습니다.' : '🔇 효과음이 뮤트되었습니다.');
    });
  }
  
  // AI 피드백 분석 요청
  if (dom.btnRequestAiAdvice) {
    dom.btnRequestAiAdvice.addEventListener('click', () => {
      generateAiStylistAdvice();
    });
  }
}

// AI 코디 조언 동적 생성기 (내 서브스탯 기반 연산)
function generateAiStylistAdvice() {
  if (!dom.aiCoachingText) return;
  
  dom.aiCoachingText.textContent = "AI 스타일리스트가 최근 착장을 분석해 맞춤 조언을 만들고 있습니다...";
  
  setTimeout(() => {
    if (state.myScore === 0) {
      dom.aiCoachingText.textContent = "아직 스캔된 OOTD가 없습니다! '핏스캔' 탭에서 OOTD 사진을 올리거나 프리셋을 스캔해 패션력을 먼저 측정해 주세요.";
      return;
    }
    
    const colorScore = state.mySubStats.color;
    const synergyScore = state.mySubStats.synergy;
    const trendScore = state.mySubStats.trend;
    
    let advice = '';
    if (state.myScore >= 7500) {
      advice = `✨ 회원님의 최고 OOTD(패션력: ${state.myScore.toLocaleString()}점)는 매우 감각적인 수준입니다. 특히 컬러 매칭(${colorScore}점)과 조화도(${synergyScore}점)가 우수합니다! 여기에 실버 스퀘어 반지나 미니멀 숄더백을 매치하면 매거진 급 무드가 한층 돋보일 것입니다.`;
    } else if (state.myScore >= 5000) {
      advice = `🧥 현재 패션력은 ${state.myScore.toLocaleString()}점으로 준수합니다. 트렌드 감성(${trendScore}점)은 좋으나 매칭이 다소 밋밋합니다. 톤온톤 레이어링을 보강하고 크림 톤 스니커즈로 마감해 보시길 권장합니다.`;
    } else {
      advice = `🦖 현재 코디(패션력: ${state.myScore.toLocaleString()}점)는 개성이 뛰어나지만 매치 완성도가 조금 아쉽습니다! 컬러 조합(${colorScore}점)에 모노톤 비중을 60% 정도로 높여 차분함을 더하면 일상 배틀 대전에서도 승률이 수직 상승할 것입니다.`;
    }
    
    dom.aiCoachingText.textContent = advice;
    showToast("🤖 AI 코칭 스타일 피드백 생성 완료!");
  }, 1000);
}

// 4. 모달창 내 개별 OOTD 실시간 독자 피드백 보드 & 남은시간 렌더링
function updateModalFeedbackDashboard(item) {
  const good = item.good;
  const bad = item.bad;
  const total = good + bad;
  const ratio = total > 0 ? Math.floor((good / total) * 100) : 0;
  
  dom.modalDashCountGood.textContent = good.toLocaleString();
  dom.modalDashCountBad.textContent = bad.toLocaleString();
  dom.modalDashRatioVal.textContent = `${ratio}%`;
  dom.modalDashProgressFill.style.width = `${ratio}%`;
  
  // 24시간 배틀 남은 시간 타이머 연산
  const timeLeft = 24 * 60 * 60 * 1000 - (Date.now() - item.battleStartedAt);
  if (timeLeft > 0) {
    dom.modalBattleTimerBar.style.backgroundColor = 'var(--pastel-apricot-bg)';
    dom.modalBattleTimerBar.style.color = 'var(--pastel-apricot-text)';
    dom.modalBattleTimerBar.style.borderColor = 'var(--pastel-apricot-border)';
    dom.modalBattleTimeLeft.textContent = formatTimeText(timeLeft);
  } else {
    dom.modalBattleTimerBar.style.backgroundColor = 'rgba(0,0,0,0.05)';
    dom.modalBattleTimerBar.style.color = 'var(--text-muted)';
    dom.modalBattleTimerBar.style.borderColor = 'var(--border-color)';
    dom.modalBattleTimeLeft.textContent = '배틀 완료 (종료됨)';
  }
}

// 24시간 카운트다운 타이머 HH:MM:SS 포맷터
function formatTimeText(ms) {
  if (ms <= 0) return "00:00:00";
  const totalSecs = Math.floor(ms / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  
  const h = hours.toString().padStart(2, '0');
  const m = mins.toString().padStart(2, '0');
  const s = secs.toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

// 1초 주기 실시간 타이머 틱 연동
let battleTimerId = null;
function startBattleCountdownTimer() {
  if (battleTimerId) clearInterval(battleTimerId);
  battleTimerId = setInterval(() => {
    // 갤러리 화면이 활성화된 동안 매초마다 남은 시간 타이머 리렌더링 (깜박임 방지를 위해 타이머만 부분 업데이트)
    if (state.activeScreen === 'screen-gallery') {
      updateOotdGalleryTimersOnly();
    }
    // 상세조회 모달창이 활성화되어 있다면 남은 배틀 시간 타이머 실시간 갱신
    if (state.currentlyViewingOotdId !== null && !dom.combatModal.classList.contains('hidden')) {
      const item = state.myGalleryList.find(x => x.id === state.currentlyViewingOotdId);
      if (item) {
        const timeLeft = 24 * 60 * 60 * 1000 - (Date.now() - item.battleStartedAt);
        if (timeLeft > 0) {
          dom.modalBattleTimeLeft.textContent = formatTimeText(timeLeft);
        } else {
          dom.modalBattleTimeLeft.textContent = '배틀 완료 (종료됨)';
        }
      }
    }
  }, 1000);
}

// 5. 챌린지 미션 클리어 판정 엔진
function checkChallenges() {
  // 1) 단독 핏체크 평가 10회 참여 챌린지
  if (state.fitcheckEvaluationsCount >= 10 && !state.tinderChallengeCleared) {
    state.tinderChallengeCleared = true;
    const challengeEl = dom.challengeTinder;
    if (challengeEl) {
      challengeEl.classList.add('cleared');
      challengeEl.querySelector('.checkbox').textContent = '✔';
      gainXP(200);
      showToast('🏆 챌린지 달성! 핏체크 10회 평가 완료 (+200 XP)');
    }
  }
  
  // 2) 패션력 9,000점 이상 달성 챌린지
  if (state.myScore >= 9000 && !state.highScoreChallengeCleared) {
    state.highScoreChallengeCleared = true;
    const challengeEl = dom.challengeHigh;
    if (challengeEl) {
      challengeEl.classList.add('cleared');
      challengeEl.querySelector('.checkbox').textContent = '✔';
      gainXP(500);
      showToast('🏆 챌린지 달성! 패션력 9,000점 돌파 완료 (+500 XP)');
    }
  }
}

// 윈도우 로드 시 가동
window.onload = init;

// 오늘의 전당 항목(타인 OOTD) 클릭 시 상세 분석 결과 팝업 띄우기
window.viewLeaderboardItemDetail = function(id) {
  const item = state.battlePool.find(x => x.id === id);
  if (!item) return;
  
  state.currentlyViewingOotdId = null; // 타인의 OOTD이므로 라이브 스코어 봇 갱신은 비연동 처리
  
  // 결과창 내용 주입 및 원형 컴뱃 게이지 복원
  dom.resultScoreValue.textContent = item.score.toLocaleString();
  
  let rank = 'B-Rank';
  if (item.score >= 9000) rank = 'S-Rank';
  else if (item.score >= 7500) rank = 'A-Rank';
  else if (item.score >= 6000) rank = 'B-Rank';
  else if (item.score >= 4000) rank = 'C-Rank';
  else rank = 'D-Rank';
  
  dom.resultRankBadge.textContent = rank;
  
  // 1. 원형 SVG 게이지 드로잉 적용
  const circleRadius = 80;
  const circumference = 2 * Math.PI * circleRadius;
  dom.circleProgressRing.style.strokeDasharray = circumference;
  
  const scorePercentage = item.score / 10000;
  const offset = circumference - (circumference * scorePercentage);
  dom.circleProgressRing.style.strokeDashoffset = offset;
  
  // 2. 가상 스탯 바 분기
  dom.statFills.synergy.style.width = `${item.synergy}%`;
  dom.statNums.synergy.textContent = item.synergy;
  dom.statFills.color.style.width = `${item.color}%`;
  dom.statNums.color.textContent = item.color;
  dom.statFills.trend.style.width = `${item.trend}%`;
  dom.statNums.trend.textContent = item.trend;
  dom.statFills.tpo.style.width = `${item.tpo}%`;
  dom.statNums.tpo.textContent = item.tpo;
  
  // 3. 잡지 커버 출력
  dom.generatedMagazineTarget.innerHTML = generateMagazineCoverHTML({
    id: item.id,
    name: item.name,
    score: item.score,
    type: item.type,
    img: item.img,
    tagline: item.tagline
  });
  
  // 4. 타인의 OOTD이므로 개별 실시간 피드백 대시보드 패널은 숨기거나(hidden) 고정 수치 표시
  dom.modalOotdFeedbackPanel.classList.remove('hidden');
  dom.modalDashCountGood.textContent = item.wins.toLocaleString();
  dom.modalDashCountBad.textContent = (item.total - item.wins).toLocaleString();
  const ratio = item.total > 0 ? Math.floor((item.wins / item.total) * 100) : 100;
  dom.modalDashRatioVal.textContent = `${ratio}%`;
  dom.modalDashProgressFill.style.width = `${ratio}%`;
  
  dom.modalBattleTimerBar.style.backgroundColor = 'rgba(0,0,0,0.05)';
  dom.modalBattleTimerBar.style.color = 'var(--text-muted)';
  dom.modalBattleTimerBar.style.borderColor = 'var(--border-color)';
  dom.modalBattleTimeLeft.textContent = '아레나 대결 완료 아카이브';
  
  // 타인의 OOTD이므로 아레나 출전하기 버튼은 감추기
  dom.btnEnterArena.classList.add('hidden');
  
  // 모달 켜기
  dom.combatModal.classList.remove('hidden');
};

// 고화질 매거진 이미지 풀스크린 줌 팝업
window.openFullscreenMagazine = function(htmlContent) {
  const fsModal = document.getElementById('fullscreen-photo-modal');
  const fsContent = document.getElementById('fullscreen-photo-content');
  if (!fsModal || !fsContent) return;
  
  fsContent.innerHTML = htmlContent;
  
  // 돋보이게 카드 크기 조절
  const innerCard = fsContent.querySelector('.magazine-card');
  if (innerCard) {
    innerCard.style.maxWidth = '100%';
    innerCard.style.width = '100%';
    innerCard.style.boxShadow = 'none';
  }
  
  fsModal.classList.remove('hidden');
  setTimeout(() => {
    fsContent.style.transform = 'scale(1)';
  }, 50);
};

// 풀스크린 줌 팝업 닫기 이벤트 리스너 등록
document.getElementById('btn-close-fullscreen').addEventListener('click', () => {
  const fsModal = document.getElementById('fullscreen-photo-modal');
  const fsContent = document.getElementById('fullscreen-photo-content');
  fsContent.style.transform = 'scale(0.9)';
  setTimeout(() => {
    fsModal.classList.add('hidden');
  }, 200);
});

// 내 OOTD 갤러리 미니어처 직접 클릭 시 다이렉트 줌 연동
window.zoomGalleryItemDetail = function(event, id) {
  if (event) event.stopPropagation();
  const item = state.myGalleryList.find(x => x.id === id);
  if (!item) return;
  const html = generateMagazineCoverHTML({
    id: item.id,
    name: '나의 OOTD',
    score: item.score,
    type: item.type,
    img: item.img,
    tagline: item.type === 'vogue' 
      ? 'THE PERFECT OOTD: 패션의 정석을 보여주다' 
      : 'EMERGENCY: 패션 긴급 구조대 호출 착장'
  });
  openFullscreenMagazine(html);
};

// 오늘의 전당 아바타/포디엄 아바타 직접 클릭 시 다이렉트 줌 연동
window.zoomLeaderboardItemDetail = function(event, id) {
  if (event) event.stopPropagation();
  let item = state.battlePool.find(x => x.id === id);
  if (!item) {
    item = state.myGalleryList.find(x => x.id === id);
  }
  if (!item) return;
  const html = generateMagazineCoverHTML({
    id: item.id,
    name: item.name || '내 OOTD',
    score: item.score,
    type: item.type,
    img: item.img,
    tagline: item.tagline || (item.type === 'vogue' 
      ? 'THE PERFECT OOTD: 패션의 정석을 보여주다' 
      : 'EMERGENCY: 패션 긴급 구조대 호출 착장')
  });
  openFullscreenMagazine(html);
};
