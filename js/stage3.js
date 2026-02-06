/**
 * 3단계: 잘 어울리는 컬러 진단
 * 2단계 결과에 따라: 웜톤 → 봄/가을만, 쿨톤 → 여름/겨울만
 * 2단계와 동일한 방식: 컬러별(PINK,RED,YELLOW,GREEN,BLUE) 선택, 하단 체크표, 선택 결과 표시
 */

const COLORS = ['pink', 'red', 'yellow', 'green', 'blue'];

// 컬러별 계절 컬러 스와치 (row 0=pink, 1=red, 2=yellow, 3=green, 4=blue)
const COLOR_PALETTE = {
    spring: ['#F5D0C5', '#C62828', '#FFD93D', '#AED581', '#80CBC4'],
    autumn: ['#D4A574', '#A0522D', '#D4A020', '#8B9A46', '#00695C'],
    summer: ['#E8B4B8', '#C94C7A', '#CDDC39', '#4DB6AC', '#64B5F6'],
    winter: ['#B39DDB', '#7B1FA2', '#66BB6A', '#2E7D32', '#3949AB']
};

// 2단계 결과에 따른 계절 쌍
let SEASON_PAIR = null; // { season1, season2, label1, label2 }
let ACTIVE_SEASONS = ['spring', 'autumn']; // 기본: 웜톤

const diagnosisResults = {
    pink: null,
    red: null,
    yellow: null,
    green: null,
    blue: null
};

let currentColorIndex = 0;

const criteriaText = {
    pink: '피부의 건강함, 잘 어울리는 컬러 비교',
    red: '피부 혈색과의 조화감, 잘 어울리는 컬러 비교',
    yellow: '피부의 투명감과 화사함, 잘 어울리는 컬러 비교',
    green: '얼굴윤곽, 눈동자와의 조화감 비교',
    blue: '얼굴윤곽과의 조화감, 피부 투명감 비교'
};

let currentSpeech = null;
let speechProgressInterval = null;

function speakText(text, progressBar, onComplete) {
    if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
    if (progressBar) progressBar.style.width = '0%';
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const ko = voices.find(v => v.lang.startsWith('ko'));
    if (ko) utterance.voice = ko;
    utterance.onstart = () => {
        let p = 0;
        speechProgressInterval = setInterval(() => {
            p += 0.5;
            if (progressBar && p <= 100) progressBar.style.width = p + '%';
        }, 50);
    };
    utterance.onend = () => {
        if (progressBar) {
            progressBar.style.width = '100%';
            if (speechProgressInterval) {
                clearInterval(speechProgressInterval);
                speechProgressInterval = null;
            }
            setTimeout(() => { progressBar.style.width = '0%'; }, 500);
        }
        currentSpeech = null;
        if (onComplete) onComplete();
    };
    utterance.onerror = () => {
        if (progressBar) progressBar.style.width = '0%';
        if (speechProgressInterval) {
            clearInterval(speechProgressInterval);
            speechProgressInterval = null;
        }
        currentSpeech = null;
    };
    currentSpeech = utterance;
    window.speechSynthesis.speak(utterance);
}

// 2단계 결과에서 dominantTone 읽기
function getStage2Tone() {
    try {
        const raw = localStorage.getItem('stage2Result');
        const data = raw ? JSON.parse(raw) : null;
        return (data && data.dominantTone) || null;
    } catch (_) {
        return null;
    }
}

// dominantTone에 따라 계절 쌍 설정
function initSeasonPair() {
    const tone = getStage2Tone();
    if (tone === 'warm') {
        SEASON_PAIR = {
            season1: 'spring',
            season2: 'autumn',
            label1: '[Warm] SPRING',
            label2: '[Warm] AUTUMN'
        };
        ACTIVE_SEASONS = ['spring', 'autumn'];
    } else if (tone === 'cool') {
        SEASON_PAIR = {
            season1: 'summer',
            season2: 'winter',
            label1: '[Cool] SUMMER',
            label2: '[Cool] WINTER'
        };
        ACTIVE_SEASONS = ['summer', 'winter'];
    } else {
        SEASON_PAIR = {
            season1: 'spring',
            season2: 'autumn',
            label1: '[Warm] SPRING',
            label2: '[Warm] AUTUMN'
        };
        ACTIVE_SEASONS = ['spring', 'autumn'];
    }

    // 헤더 부제목
    const subtitle = document.getElementById('stage3Subtitle');
    if (subtitle) {
        if (tone === 'warm') subtitle.textContent = '봄과 가을 컬러 중 잘 어울리는 것을 선택해보세요';
        else if (tone === 'cool') subtitle.textContent = '여름과 겨울 컬러 중 잘 어울리는 것을 선택해보세요';
        else subtitle.textContent = '봄과 가을 / 여름과 겨울 컬러 중 잘 어울리는 것을 선택해보세요';
    }

    // 하단 라벨
    const label1 = document.getElementById('navSeason1Label');
    const label2 = document.getElementById('navSeason2Label');
    const labels = { spring: '봄', autumn: '가을', summer: '여름', winter: '겨울' };
    if (label1) label1.textContent = labels[SEASON_PAIR.season1];
    if (label2) label2.textContent = labels[SEASON_PAIR.season2];

    // body에 톤 클래스 추가 (스타일용)
    document.body.classList.remove('warm-tone', 'cool-tone');
    if (tone === 'cool') document.body.classList.add('cool-tone');
    else document.body.classList.add('warm-tone'); // warm 또는 null
}

// UI 토글
function showSection(id) {
    document.querySelectorAll('.stage2-section').forEach(el => el.setAttribute('hidden', ''));
    const el = document.getElementById(id);
    if (el) el.removeAttribute('hidden');
}

function showSections(ids) {
    document.querySelectorAll('.stage2-section').forEach(el => el.setAttribute('hidden', ''));
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.removeAttribute('hidden');
    });
}

// 프로그레스 바
function renderProgress() {
    const steps = document.querySelectorAll('.progress-step');
    steps.forEach((s, i) => {
        s.classList.remove('active', 'completed');
        if (i < currentColorIndex) s.classList.add('completed');
        else if (i === currentColorIndex) s.classList.add('active');
    });
}

// 컬러 비교 UI 렌더링
function renderColorComparison() {
    if (!SEASON_PAIR) return;
    const color = COLORS[currentColorIndex];
    const s1 = SEASON_PAIR.season1;
    const s2 = SEASON_PAIR.season2;
    const res = diagnosisResults[color];
    const container = document.getElementById('colorComparisonContainer');
    if (!container) return;

    const c1 = COLOR_PALETTE[s1][COLORS.indexOf(color)];
    const c2 = COLOR_PALETTE[s2][COLORS.indexOf(color)];

    container.innerHTML = `
        <div class="color-comparison" data-color="${color}">
            <div class="diagnosis-criteria">
                <span class="color-name">${color.toUpperCase()}</span>
                <span class="criteria-text">${criteriaText[color]}</span>
            </div>
            <div class="comparison-area">
                <div class="tone-option warm ${res === 'season1' ? 'selected' : ''}" data-season="season1" role="button" tabindex="0">
                    <div class="color-swatch" style="background:${c1}"></div>
                    <span class="tone-label">${SEASON_PAIR.label1}</span>
                </div>
                <div class="vs-divider"><span>VS</span></div>
                <div class="tone-option cool ${res === 'season2' ? 'selected' : ''}" data-season="season2" role="button" tabindex="0">
                    <div class="color-swatch" style="background:${c2}"></div>
                    <span class="tone-label">${SEASON_PAIR.label2}</span>
                </div>
            </div>
            <button type="button" class="both-btn" data-season="both">둘 다 잘 어울려요</button>
        </div>
    `;

    container.querySelectorAll('.tone-option, .both-btn').forEach(el => {
        el.addEventListener('click', () => selectSeason(color, el.getAttribute('data-season')));
    });
}

function selectSeason(color, season) {
    diagnosisResults[color] = season;
    updateCheckboxFromResult(color, season);
    updateNavCounts();

    if (currentColorIndex < COLORS.length - 1) {
        currentColorIndex++;
        renderProgress();
        renderColorComparison();
        updateNavCounts();
    } else {
        showSection('sectionResult');
        renderResultScreen();
    }
}

// 체크표 렌더링
function renderCheckboxGrid() {
    if (!SEASON_PAIR) return;
    const s1 = SEASON_PAIR.season1;
    const s2 = SEASON_PAIR.season2;
    const container = document.getElementById('checkboxGridContainer');
    if (!container) return;

    let html = '<div class="grid-body">';
    COLORS.forEach(color => {
        const res = diagnosisResults[color];
        const idx = COLORS.indexOf(color);
        const checked1 = (res === 'season1' || res === 'both');
        const checked2 = (res === 'season2' || res === 'both');
        const c1 = COLOR_PALETTE[s1][idx];
        const c2 = COLOR_PALETTE[s2][idx];
        html += `
            <div class="grid-row" data-color="${color}">
                <span class="row-label">${color.toUpperCase()}</span>
                <div class="checkbox-cell" style="background:${c1}" data-season="season1" data-color="${color}">
                    <span class="season-label">${SEASON_PAIR.label1}</span>
                    <input type="checkbox" id="c-${color}-season1" ${checked1 ? 'checked' : ''} disabled>
                    <label for="c-${color}-season1" class="custom-checkbox"></label>
                </div>
                <div class="checkbox-cell" style="background:${c2}" data-season="season2" data-color="${color}">
                    <span class="season-label">${SEASON_PAIR.label2}</span>
                    <input type="checkbox" id="c-${color}-season2" ${checked2 ? 'checked' : ''} disabled>
                    <label for="c-${color}-season2" class="custom-checkbox"></label>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function updateCheckboxFromResult(color, season) {
    const s1Chk = document.getElementById(`c-${color}-season1`);
    const s2Chk = document.getElementById(`c-${color}-season2`);
    // 'both'일 때는 둘 다 체크 (둘 다 잘 어울려요)
    if (s1Chk) s1Chk.checked = (season === 'season1' || season === 'both');
    if (s2Chk) s2Chk.checked = (season === 'season2' || season === 'both');
}

// 하단 선택 결과 카운트
function getSeasonCounts() {
    let c1 = 0, c2 = 0;
    Object.values(diagnosisResults).forEach(v => {
        if (v === 'season1') c1++;
        else if (v === 'season2') c2++;
        else if (v === 'both') { c1 += 0.5; c2 += 0.5; }
    });
    return { season1: c1, season2: c2 };
}

function updateNavCounts() {
    const { season1, season2 } = getSeasonCounts();
    const c1El = document.getElementById('navSeason1Count');
    const c2El = document.getElementById('navSeason2Count');
    const prevBtn = document.getElementById('stage3PrevColor');
    const nextBtn = document.getElementById('stage3NextColor');
    const resultBtn = document.getElementById('stage3ResultBtn');
    if (c1El) c1El.textContent = season1;
    if (c2El) c2El.textContent = season2;
    if (prevBtn) prevBtn.disabled = currentColorIndex <= 0;
    if (nextBtn) nextBtn.hidden = currentColorIndex >= COLORS.length - 1;
    if (resultBtn) resultBtn.hidden = currentColorIndex < COLORS.length - 1;
}

// 네비게이션 버튼
function initNavButtons() {
    const prev = document.getElementById('stage3PrevColor');
    const next = document.getElementById('stage3NextColor');
    const result = document.getElementById('stage3ResultBtn');

    if (prev) {
        prev.addEventListener('click', () => {
            if (currentColorIndex <= 0) return;
            currentColorIndex--;
            renderProgress();
            renderColorComparison();
            updateNavCounts();
        });
    }
    if (next) {
        next.addEventListener('click', () => {
            if (currentColorIndex >= COLORS.length - 1) return;
            currentColorIndex++;
            renderProgress();
            renderColorComparison();
            updateNavCounts();
        });
    }
    if (result) {
        result.addEventListener('click', () => {
            showSection('sectionResult');
            renderResultScreen();
        });
    }
}

// 결과 화면
function renderResultScreen() {
    const { season1, season2 } = getSeasonCounts();
    const labels = { spring: '봄', autumn: '가을', summer: '여름', winter: '겨울' };
    const l1 = labels[SEASON_PAIR.season1];
    const l2 = labels[SEASON_PAIR.season2];

    let title, desc, recommendation;
    if (season1 > season2) {
        title = `${l1} 타입으로 진단되었습니다!`;
        desc = `${l1} ${season1}개 / ${l2} ${season2}개로, 당신은 ${l1} 퍼스널컬러입니다.`;
        recommendation = `${l1} 계열 컬러를 활용해보세요.`;
    } else if (season2 > season1) {
        title = `${l2} 타입으로 진단되었습니다!`;
        desc = `${l1} ${season1}개 / ${l2} ${season2}개로, 당신은 ${l2} 퍼스널컬러입니다.`;
        recommendation = `${l2} 계열 컬러를 활용해보세요.`;
    } else {
        title = `${l1}과 ${l2}가 균형을 이룹니다!`;
        desc = `${l1} ${season1}개 / ${l2} ${season2}개로, 두 계절 컬러 모두 잘 어울립니다.`;
        recommendation = `${l1}과 ${l2} 컬러를 함께 활용해보세요.`;
    }

    const list = Object.entries(diagnosisResults).map(([color, sel]) => {
        let season, c, sl;
        if (sel === 'season1') { season = SEASON_PAIR.season1; sl = labels[season]; }
        else if (sel === 'season2') { season = SEASON_PAIR.season2; sl = labels[season]; }
        else if (sel === 'both') { season = SEASON_PAIR.season1; sl = `${labels[SEASON_PAIR.season1]}/${labels[SEASON_PAIR.season2]}`; }
        else { season = null; sl = '미선택'; }
        c = season ? COLOR_PALETTE[season][COLORS.indexOf(color)] : '#ccc';
        return `<li><span class="color-dot" style="background:${c}"></span><span class="color-name">${color.toUpperCase()}</span><span class="tone-result">${sl}</span></li>`;
    }).join('');

    const container = document.getElementById('resultContent');
    if (!container) return;
    container.innerHTML = `
        <div class="result-header"><h2>${title}</h2></div>
        <div class="result-detail">
            <p class="description">${desc}</p>
            <p class="recommendation">${recommendation}</p>
        </div>
        <div class="result-summary">
            <h4>컬러별 진단 결과</h4>
            <ul class="color-results">${list}</ul>
        </div>
        <div class="result-actions">
            <button type="button" class="btn-retry" id="resultRetryBtn">다시 진단하기</button>
        </div>
    `;

    const retry = document.getElementById('resultRetryBtn');
    if (retry) retry.addEventListener('click', resetStage3);
}

function resetStage3() {
    COLORS.forEach(c => { diagnosisResults[c] = null; });
    currentColorIndex = 0;
    showSections(['sectionProgress', 'sectionColor', 'sectionCheckbox', 'sectionNav']);
    renderProgress();
    renderColorComparison();
    renderCheckboxGrid();
    updateNavCounts();
}

// 초기화
function init() {
    if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {};
    }
    initSeasonPair();
    showSections(['sectionProgress', 'sectionColor', 'sectionCheckbox', 'sectionNav']);
    renderProgress();
    renderColorComparison();
    renderCheckboxGrid();
    updateNavCounts();
    initNavButtons();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
