/**
 * 2단계: 퍼스널컬러 웜쿨 진단
 * 설계서: 5컬러(PINK,RED,YELLOW,GREEN,BLUE) 웜/쿨 비교, 체크표, 결과 집계
 */

const COLORS = ['pink', 'red', 'yellow', 'green', 'blue'];

const DiagnosisState = {
    INTRO: 'intro',
    SHEET: 'sheet',
    PINK: 'pink',
    RED: 'red',
    YELLOW: 'yellow',
    GREEN: 'green',
    BLUE: 'blue',
    RESULT: 'result'
};

let currentState = DiagnosisState.INTRO;
let sheetType = null; // 'spring-summer' | 'autumn-winter'
let currentColorIndex = 0;

const diagnosisResults = {
    pink: null,
    red: null,
    yellow: null,
    green: null,
    blue: null
};

// TTS 스크립트 (설계서)
const ttsTexts = {
    intro: '2단계 퍼스널컬러 웜쿨 진단을 시작합니다. 이 단계에서는 웜톤과 쿨톤 시트를 얼굴 아래에 대고, 어떤 컬러가 얼굴을 더 건강하게 보이게 하는지 관찰합니다. 핑크, 레드, 옐로, 그린, 블루 총 5가지 컬러로 진단하며, 각 컬러마다 웜톤과 쿨톤을 비교합니다. 1단계에서 피부색, 입술색이 일번에서 이번이 더 많이 나온 분은 봄, 여름 시트로 진단하시고, 삼번에서 사번이 더 많이 나온 분은 가을, 겨울 시트로 진단합니다. 준비되셨으면 시작 버튼을 눌러주세요.',
    'pink-guide': '첫 번째, 핑크 컬러로 진단합니다. 핑크는 피부의 건강함을 진단합니다. 웜핑크와 쿨핑크를 번갈아 얼굴 아래에 대어보세요. 어떤 컬러가 피부를 더 건강하고 윤기있게 보이게 하는지 관찰해주세요.',
    'pink-detail': '피부가 건강해 보일 경우, 피부가 윤기 있어 보이고 피부색이 화사해 보입니다. 더 건강해 보이는 쪽을 선택해주세요.',
    'red-guide': '두 번째, 레드 컬러로 진단합니다. 레드는 혈색과의 조화감을 진단합니다. 웜레드와 쿨레드를 번갈아 비교해보세요.',
    'red-detail': '혈색과의 조화감이 좋을 경우, 피부나 볼의 혈색이 한 톤으로 정돈되어 보입니다. 더 조화로워 보이는 쪽을 선택해주세요.',
    'yellow-guide': '세 번째, 옐로 컬러로 진단합니다. 옐로는 피부의 투명감과 화사함을 진단합니다. 웜옐로와 쿨옐로를 번갈아 비교해보세요.',
    'yellow-detail': '피부가 더 환하고 화사해 보이는 쪽을 찾아보세요. 더 화사해 보이는 쪽을 선택해주세요.',
    'green-guide': '네 번째, 그린 컬러로 진단합니다. 그린은 얼굴 윤곽, 눈동자나 헤어 컬러와의 조화감을 진단합니다.',
    'green-detail': '턱 라인과 얼굴 윤곽이 어떻게 보이는지 관찰해주세요. 더 조화로운 쪽을 선택해주세요.',
    'blue-guide': '마지막, 블루 컬러로 진단합니다. 블루는 전반적인 조화감을 진단합니다. 웜블루와 쿨블루를 번갈아 비교해보세요.',
    'blue-detail': '얼굴 전체의 밸런스와 조화를 관찰해주세요. 더 조화로운 쪽을 선택해주세요.',
    'result-guide': '모든 진단이 완료되었습니다. 웜톤과 쿨톤 중 더 많이 체크된 쪽이 당신의 퍼스널컬러 톤입니다.'
};

const criteriaText = {
    pink: '피부의 건강함, 진단시트와의 조화감 비교',
    red: '피부 혈색과의 조화감 비교',
    yellow: '피부의 투명감과 화사함 비교',
    green: '얼굴윤곽, 눈동자의 그윽함이나 뚜렷함 비교',
    blue: '얼굴윤곽과의 조화감이나 피부 투명감 비교'
};

// 시트별 계절 (웜/쿨)
const SEASONS = {
    'spring-summer': [
        { id: 'spring', label: '[Warm] SPRING', bg: '#FFE4B5' },
        { id: 'summer', label: '[Cool] SUMMER', bg: '#DDA0DD' }
    ],
    'autumn-winter': [
        { id: 'autumn', label: '[Warm] AUTUMN', bg: '#9ACD32' },
        { id: 'winter', label: '[Cool] WINTER', bg: '#4169E1' }
    ]
};

let currentSpeech = null;
let speechProgressInterval = null;

function speakText(text, progressBar, onComplete) {
    if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
    if (progressBar) progressBar.style.width = '0%';
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
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
            if (speechProgressInterval) { clearInterval(speechProgressInterval); speechProgressInterval = null; }
            setTimeout(() => { progressBar.style.width = '0%'; }, 500);
        }
        currentSpeech = null;
        if (onComplete) onComplete();
    };
    utterance.onerror = () => {
        if (progressBar) progressBar.style.width = '0%';
        if (speechProgressInterval) { clearInterval(speechProgressInterval); speechProgressInterval = null; }
        currentSpeech = null;
    };
    currentSpeech = utterance;
    window.speechSynthesis.speak(utterance);
}

function stopTTS() {
    if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
    if (speechProgressInterval) { clearInterval(speechProgressInterval); speechProgressInterval = null; }
}

// ——— UI 토글 ———
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

// ——— 인트로 ———
function initIntro() {
    const playBtn = document.getElementById('introPlayBtn');
    const progress = document.getElementById('introProgress');
    if (playBtn && progress) {
        playBtn.addEventListener('click', () => {
            if (window.speechSynthesis.speaking && currentSpeech) {
                stopTTS();
            } else {
                speakText(ttsTexts.intro, progress);
            }
        });
    }
}

// 1단계 결과 기반 추천
function applyRecommendedSheet() {
    try {
        const raw = localStorage.getItem('stage1Result');
        const data = raw ? JSON.parse(raw) : null;
        const rec = data && data.recommendedSheet;
        const spring = document.getElementById('recommendSpringSummer');
        const autumn = document.getElementById('recommendAutumnWinter');
        if (spring) spring.hidden = rec !== 'spring-summer';
        if (autumn) autumn.hidden = rec !== 'autumn-winter';
    } catch (_) {}
}

// ——— 시트 선택 ———
function initSheetSelection() {
    const spring = document.getElementById('sheetSpringSummer');
    const autumn = document.getElementById('sheetAutumnWinter');
    [spring, autumn].forEach(btn => {
        if (!btn) return;
        btn.addEventListener('click', () => {
            sheetType = btn.getAttribute('data-sheet');
            spring.classList.toggle('selected', sheetType === 'spring-summer');
            autumn.classList.toggle('selected', sheetType === 'autumn-winter');
            currentState = DiagnosisState.PINK;
            currentColorIndex = 0;
            renderProgress();
            renderColorComparison();
            renderCheckboxGrid();
            updateNavCounts();
            showSections(['sectionProgress', 'sectionColor', 'sectionCheckbox', 'sectionNav']);
        });
    });
}

// ——— 프로그레스 ———
function renderProgress() {
    const steps = document.querySelectorAll('.progress-step');
    steps.forEach((s, i) => {
        const color = COLORS[i];
        s.classList.remove('active', 'completed');
        if (i < currentColorIndex) s.classList.add('completed');
        else if (i === currentColorIndex) s.classList.add('active');
    });
}

// ——— 컬러 비교 ———
function getWarmCoolVars(color) {
    const v = {
        pink: { warm: '#F8B4B4', cool: '#E8A0BF' },
        red: { warm: '#E57373', cool: '#C94C7A' },
        yellow: { warm: '#FFD93D', cool: '#FFF59D' },
        green: { warm: '#81C784', cool: '#80CBC4' },
        blue: { warm: '#64B5F6', cool: '#7986CB' }
    };
    return v[color] || v.pink;
}

function renderColorComparison() {
    const color = COLORS[currentColorIndex];
    const c = getWarmCoolVars(color);
    const selected = diagnosisResults[color];
    const container = document.getElementById('colorComparisonContainer');
    if (!container) return;

    const warmLabel = color === 'pink' ? '웜핑크' : color === 'red' ? '웜레드' : color === 'yellow' ? '웜옐로' : color === 'green' ? '웜그린' : '웜블루';
    const coolLabel = color === 'pink' ? '쿨핑크' : color === 'red' ? '쿨레드' : color === 'yellow' ? '쿨옐로' : color === 'green' ? '쿨그린' : '쿨블루';

    container.innerHTML = `
        <div class="color-comparison" data-color="${color}">
            <div class="diagnosis-criteria">
                <span class="color-name">${color.toUpperCase()}</span>
                <span class="criteria-text">${criteriaText[color]}</span>
            </div>
            <div class="comparison-area">
                <div class="tone-option warm ${selected === 'warm' ? 'selected' : ''}" data-tone="warm" role="button" tabindex="0">
                    <div class="color-swatch" style="background:${c.warm}"></div>
                    <span class="tone-label">${warmLabel}</span>
                </div>
                <div class="vs-divider"><span>VS</span></div>
                <div class="tone-option cool ${selected === 'cool' ? 'selected' : ''}" data-tone="cool" role="button" tabindex="0">
                    <div class="color-swatch" style="background:${c.cool}"></div>
                    <span class="tone-label">${coolLabel}</span>
                </div>
            </div>
            <button type="button" class="both-btn" data-tone="both">둘 다 잘 어울려요</button>
            <div class="audio-controls">
                <button type="button" class="play-guide" data-audio="${color}-guide">🔊 진단 방법 듣기</button>
                <button type="button" class="play-detail" data-audio="${color}-detail">📖 상세 설명 듣기</button>
            </div>
        </div>
    `;

    container.querySelectorAll('.tone-option, .both-btn').forEach(el => {
        el.addEventListener('click', () => selectTone(color, el.getAttribute('data-tone')));
    });
    container.querySelectorAll('.play-guide, .play-detail').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-audio');
            if (ttsTexts[key]) speakText(ttsTexts[key], null);
        });
    });
}

function selectTone(color, tone) {
    diagnosisResults[color] = tone;
    updateCheckboxFromResult(color, tone);
    updateNavCounts();

    // 웜, 쿨, 둘 다 선택 시 바로 다음 컬러(또는 결과 화면)로 이동
    if (currentColorIndex < COLORS.length - 1) {
        currentColorIndex++;
        renderProgress();
        renderColorComparison();
        updateNavCounts();
    } else {
        // 마지막 컬러 선택 시 결과 화면으로
        currentState = DiagnosisState.RESULT;
        showSection('sectionResult');
        renderResultScreen();
    }
}

// ——— 체크표 ———
function renderCheckboxGrid() {
    if (!sheetType) return;
    const seasons = SEASONS[sheetType];
    const container = document.getElementById('checkboxGridContainer');
    if (!container) return;

    let html = '<div class="grid-body">';
    COLORS.forEach(color => {
        const res = diagnosisResults[color];
        const warmId = seasons[0].id;
        const coolId = seasons[1].id;
        const warmChecked = res === 'warm';
        const coolChecked = res === 'cool';
        html += `
            <div class="grid-row" data-color="${color}">
                <span class="row-label">${color.toUpperCase()}</span>
                <div class="checkbox-cell" style="background:${seasons[0].bg}" data-season="${warmId}" data-color="${color}">
                    <span class="season-label">${seasons[0].label}</span>
                    <input type="checkbox" id="c-${color}-${warmId}" ${warmChecked ? 'checked' : ''} disabled>
                    <label for="c-${color}-${warmId}" class="custom-checkbox"></label>
                </div>
                <div class="checkbox-cell" style="background:${seasons[1].bg}" data-season="${coolId}" data-color="${color}">
                    <span class="season-label">${seasons[1].label}</span>
                    <input type="checkbox" id="c-${color}-${coolId}" ${coolChecked ? 'checked' : ''} disabled>
                    <label for="c-${color}-${coolId}" class="custom-checkbox"></label>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function updateCheckboxFromResult(color, tone) {
    if (!sheetType) return;
    const seasons = SEASONS[sheetType];
    const warmId = seasons[0].id;
    const coolId = seasons[1].id;
    const warmChk = document.getElementById(`c-${color}-${warmId}`);
    const coolChk = document.getElementById(`c-${color}-${coolId}`);
    if (warmChk) warmChk.checked = tone === 'warm';
    if (coolChk) coolChk.checked = tone === 'cool';
}

// ——— 네비 카운트 & 버튼 ———
function getWarmCoolCounts() {
    let w = 0, c = 0;
    Object.values(diagnosisResults).forEach(v => {
        if (v === 'warm') w++;
        else if (v === 'cool') c++;
        else if (v === 'both') { w += 0.5; c += 0.5; }
    });
    return { warm: w, cool: c };
}

function updateNavCounts() {
    const { warm, cool } = getWarmCoolCounts();
    const wEl = document.getElementById('navWarmCount');
    const cEl = document.getElementById('navCoolCount');
    if (wEl) wEl.textContent = warm;
    if (cEl) cEl.textContent = cool;

    const prevBtn = document.getElementById('stage2PrevColor');
    const nextBtn = document.getElementById('stage2NextColor');
    const resultBtn = document.getElementById('stage2ResultBtn');
    if (prevBtn) prevBtn.disabled = currentColorIndex <= 0;
    if (nextBtn) nextBtn.hidden = currentColorIndex >= COLORS.length - 1;
    if (resultBtn) resultBtn.hidden = currentColorIndex < COLORS.length - 1;
}

function initNavButtons() {
    const prev = document.getElementById('stage2PrevColor');
    const next = document.getElementById('stage2NextColor');
    const result = document.getElementById('stage2ResultBtn');

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
            currentState = DiagnosisState.RESULT;
            showSection('sectionResult');
            renderResultScreen();
        });
    }
}

// ——— 결과 ———
function calculateFinalResult() {
    let warm = 0, cool = 0;
    Object.values(diagnosisResults).forEach(v => {
        if (v === 'warm') warm++;
        else if (v === 'cool') cool++;
        else if (v === 'both') { warm += 0.5; cool += 0.5; }
    });
    const total = 5;
    return {
        warmCount: warm,
        coolCount: cool,
        dominantTone: warm > cool ? 'warm' : cool > warm ? 'cool' : 'neutral',
        percentage: {
            warm: Math.round((warm / total) * 100),
            cool: Math.round((cool / total) * 100)
        }
    };
}

function getToneLabel(tone) {
    if (tone === 'warm') return '웜톤 ☀️';
    if (tone === 'cool') return '쿨톤 ❄️';
    if (tone === 'both') return '둘 다 ✨';
    return '미선택';
}

function getColorVar(color, tone) {
    const t = tone === 'warm' ? 'warm' : 'cool';
    const v = { pink: { warm: '#F8B4B4', cool: '#E8A0BF' }, red: { warm: '#E57373', cool: '#C94C7A' }, yellow: { warm: '#FFD93D', cool: '#FFF59D' }, green: { warm: '#81C784', cool: '#80CBC4' }, blue: { warm: '#64B5F6', cool: '#7986CB' } };
    return (v[color] && v[color][t]) ? v[color][t] : '#ccc';
}

function renderResultScreen() {
    const r = calculateFinalResult();
    let title, desc, recommendation;
    if (r.dominantTone === 'warm') {
        title = '웜톤으로 진단되었습니다! 🌸🍂';
        desc = `웜톤 ${r.warmCount}개 / 쿨톤 ${r.coolCount}개로, 당신은 봄(Spring) 또는 가을(Autumn) 타입입니다. 노란빛이 도는 따뜻한 컬러가 얼굴을 더 건강하고 화사하게 만들어줍니다.`;
        recommendation = '코랄, 피치, 오렌지, 올리브, 카멜 컬러를 추천드립니다.';
    } else if (r.dominantTone === 'cool') {
        title = '쿨톤으로 진단되었습니다! ❄️🌊';
        desc = `웜톤 ${r.warmCount}개 / 쿨톤 ${r.coolCount}개로, 당신은 여름(Summer) 또는 겨울(Winter) 타입입니다. 파란빛이 도는 시원한 컬러가 얼굴을 더 맑고 선명하게 만들어줍니다.`;
        recommendation = '로즈, 라벤더, 버건디, 네이비, 블랙 컬러를 추천드립니다.';
    } else {
        title = '웜톤과 쿨톤이 균형을 이룹니다 ⚖️';
        desc = `웜톤 ${r.warmCount}개 / 쿨톤 ${r.coolCount}개로, 두 톤 모두 잘 어울리는 뉴트럴 타입입니다.`;
        recommendation = '베이지, 네이비, 버건디 등 중성 컬러를 추천드립니다.';
    }

    const list = Object.entries(diagnosisResults).map(([color, tone]) => {
        const c = tone ? getColorVar(color, tone === 'both' ? 'warm' : tone) : '#ccc';
        return `<li class="${tone || ''}"><span class="color-dot" style="background:${c}"></span><span class="color-name">${color.toUpperCase()}</span><span class="tone-result">${getToneLabel(tone)}</span></li>`;
    }).join('');

    const container = document.getElementById('resultContent');
    if (!container) return;
    container.innerHTML = `
        <div class="result-header"><h2>${title}</h2></div>
        <div class="result-chart">
            <div class="bar-chart">
                <div class="warm-bar" style="width:${r.percentage.warm}%"><span>웜톤 ${r.percentage.warm}%</span></div>
                <div class="cool-bar" style="width:${r.percentage.cool}%"><span>쿨톤 ${r.percentage.cool}%</span></div>
            </div>
        </div>
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
            <button type="button" class="btn-stage3" id="resultStage3Btn">3단계로 이동 (4계절 진단)</button>
        </div>
    `;

    const retry = document.getElementById('resultRetryBtn');
    const stage3 = document.getElementById('resultStage3Btn');
    if (retry) retry.addEventListener('click', resetAndGoSheet);
    if (stage3) stage3.addEventListener('click', () => {
        localStorage.setItem('stage2Result', JSON.stringify({
            sheetType,
            results: diagnosisResults,
            ...calculateFinalResult()
        }));
        window.location.href = 'stage3.html';
    });
}

function resetAndGoSheet() {
    COLORS.forEach(c => { diagnosisResults[c] = null; });
    currentColorIndex = 0;
    currentState = DiagnosisState.SHEET;
    sheetType = null;
    showSections(['sectionIntro', 'sectionSheet']);
    document.getElementById('sheetSpringSummer').classList.remove('selected');
    document.getElementById('sheetAutumnWinter').classList.remove('selected');
    applyRecommendedSheet();
}

// ——— init ———
function init() {
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {};
    }
    // 인트로 + 시트 선택을 같은 페이지에 표시
    showSections(['sectionIntro', 'sectionSheet']);
    applyRecommendedSheet();
    initIntro();
    initSheetSelection();
    initNavButtons();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
