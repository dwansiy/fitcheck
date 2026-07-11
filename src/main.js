import { TPO_OPTIONS } from './config.js';
import { analyzeOutfit } from './api.js';
import { createResultCard, optimizeImage } from './image.js';

const state = { image: '', tpo: '', result: null, opponent: null };
const elements = Object.fromEntries([...document.querySelectorAll('[id]')].map((element) => [element.id, element]));

function init() {
  renderTpoOptions();
  readChallenge();
  elements['image-input'].addEventListener('change', onImageSelected);
  elements['analyze-button'].addEventListener('click', analyze);
  document.addEventListener('click', onAction);
}

function renderTpoOptions() {
  elements['tpo-options'].replaceChildren(...TPO_OPTIONS.map(({ value, label }) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chip card';
    button.dataset.tpo = value;
    button.textContent = label;
    return button;
  }));
}

function readChallenge() {
  const params = new URLSearchParams(location.search);
  const score = Number(params.get('score'));
  const tpo = params.get('tpo');
  if (!Number.isInteger(score) || score < 0 || score > 10_000 || !TPO_OPTIONS.some((item) => item.value === tpo)) return;
  state.opponent = { score, tpo };
  state.tpo = tpo;
  elements.challenge.textContent = `⚔️ ${score.toLocaleString()}점의 도전장이 도착했습니다. 같은 상황(${tpo})으로 승부하세요!`;
  elements.challenge.hidden = false;
  selectTpo(tpo);
}

async function onImageSelected(event) {
  const [file] = event.target.files;
  if (!file) return;
  try {
    state.image = await optimizeImage(file);
    elements['image-preview'].src = state.image;
    elements['image-preview'].hidden = false;
    elements['upload-prompt'].hidden = true;
    updateSubmit();
  } catch (error) {
    showToast(error.message);
    event.target.value = '';
  }
}

function selectTpo(tpo) {
  state.tpo = tpo;
  document.querySelectorAll('[data-tpo]').forEach((button) => button.classList.toggle('selected', button.dataset.tpo === tpo));
  updateSubmit();
}

function updateSubmit() {
  elements['analyze-button'].disabled = !(state.image && state.tpo);
}

async function analyze() {
  showScreen('loading-screen');
  try {
    state.result = await analyzeOutfit(state.image, state.tpo);
    renderResult();
    showScreen('result-screen');
  } catch (error) {
    showToast(error.message || '분석 중 오류가 발생했습니다.');
    showScreen('upload-screen');
  }
}

function renderResult() {
  const result = state.result;
  elements['result-image'].src = state.image;
  elements.score.textContent = result.score.toLocaleString();
  elements.tier.textContent = result.tier;
  elements.roast.textContent = result.roast;
  elements['best-match'].textContent = result.bestMatch.name;
  elements['worst-match'].textContent = `${result.worstMatch.name} — ${result.worstMatch.recommendItem} 추천`;
  positionPin(elements['best-pin'], result.bestMatch);
  positionPin(elements['worst-pin'], result.worstMatch);
  elements.stats.replaceChildren(...Object.entries(result.stats).map(([name, value]) => createStat(name, value)));
  if (state.opponent) {
    const won = result.score > state.opponent.score;
    elements['battle-result'].textContent = won ? '🏆 승리! 상대보다 패션력이 높습니다.' : '💥 패배! 스타일을 보완하고 다시 도전하세요.';
    elements['battle-result'].hidden = false;
  }
}

function createStat(name, value) {
  const row = document.createElement('div');
  const label = document.createElement('span');
  const meter = document.createElement('meter');
  label.textContent = `${name} ${value}`;
  meter.min = 0; meter.max = 100; meter.value = value;
  row.append(label, meter);
  return row;
}

function positionPin(element, point) {
  element.style.left = `${point.x}%`;
  element.style.top = `${point.y}%`;
}

async function onAction(event) {
  const tpoButton = event.target.closest('[data-tpo]');
  if (tpoButton) selectTpo(tpoButton.dataset.tpo);
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'reset') reset();
  if (action === 'copy') await copyChallenge();
  if (action === 'share') await saveResult();
}

function reset() {
  Object.assign(state, { image: '', result: null });
  elements['image-input'].value = '';
  elements['image-preview'].hidden = true;
  elements['upload-prompt'].hidden = false;
  elements['battle-result'].hidden = true;
  updateSubmit();
  showScreen('upload-screen');
}

async function copyChallenge() {
  const url = new URL(location.origin + location.pathname);
  url.searchParams.set('score', state.result.score);
  url.searchParams.set('tpo', state.tpo);
  try {
    await navigator.clipboard.writeText(url.toString());
    showToast('대결 링크를 복사했습니다.');
  } catch { showToast('브라우저에서 클립보드 접근을 허용해 주세요.'); }
}

async function saveResult() {
  const dataUrl = await createResultCard({ image: state.image, result: state.result, tpo: state.tpo });
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `fitcheck-${state.result.score}.png`;
  link.click();
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach((screen) => { screen.hidden = screen.id !== id; });
}

let toastTimer;
function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  toastTimer = setTimeout(() => { elements.toast.hidden = true; }, 3000);
}

init();
