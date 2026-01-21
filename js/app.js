// 전역 변수
let selectedItems = {
    hairEye: null,
    skin: null,
    lipCheek: null
};

// DOM 요소
const warmCountEl = document.getElementById('warmCount');
const coolCountEl = document.getElementById('coolCount');
const resultMessageEl = document.getElementById('resultMessage');
const radioInputs = document.querySelectorAll('input[type="radio"]');

// TTS 텍스트 내용
const ttsTexts = {
    concept: '퍼스널컬러란 개인의 고유 신체색인 머리카락 색, 눈동자 색, 피부색, 볼의 혈색, 입술색 등과 자연스럽게 조화를 이루는 컬러를 말합니다. 퍼스널컬러는 크게 웜톤과 쿨톤 두 가지로 분류합니다. 봄과 가을 계절은 각 컬러에 노란색이 들어가 있어 따뜻함이 느껴져서 웜톤이라고 합니다. 여름과 겨울 계절은 각 컬러에 파란색이 들어가 있어 시원함이 느껴져서 쿨톤이라고 합니다.',
    stage1: '1단계 신체색 웜쿨 체크를 시작하겠습니다. 웜쿨 체크 시트에서 피부색, 입술색, 볼 혈색, 눈동자색, 머리카락색이 웜쿨 어느 쪽에 가까운지 가볍게 체크해보세요.',
    'hair-eye-guide': '마지막으로 눈동자색과 머리카락색을 확인해보세요. 자연광 아래에서 눈동자와 모발의 색상을 확인하시고, 가장 가까워 보이는 색상을 선택해주세요. 염색을 하셨다면 염색한 모발 기준으로 체크하시면 됩니다.',
    'skin-guide': '다음은 피부색입니다. 귀 앞쪽이나 목 부분의 피부색을 기준으로 확인해보세요. 웜톤과 쿨톤의 스킨 컬러 중 가장 가까워 보이는 색상을 선택해주세요.',
    'lip-cheek-guide': '먼저 입술색과 볼의 혈색을 확인해보세요. 화면의 립앤치크 컬러 중 가장 가까워 보이는 색상을 선택해주세요. 웜톤의 1번부터 4번, 쿨톤의 1번부터 4번 중에서 선택하시면 됩니다.'
};

// 전역 TTS 상태 관리
let currentSpeech = null;
let speechProgressInterval = null;
let ttsSupported = true; // TTS 지원 여부

// TTS 재생 함수
function speakText(text, playBtn, progressBar, onComplete) {
    // TTS를 지원하지 않으면 중단
    if (!ttsSupported || !window.speechSynthesis) {
        console.warn('TTS가 지원되지 않습니다.');
        return;
    }
    
    // 기존 재생 중인 음성 중지
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
    
    // 진행바 초기화
    if (progressBar) {
        progressBar.style.width = '0%';
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // 한국어 음성 설정
    utterance.lang = 'ko-KR';
    utterance.rate = 1.0; // 속도
    utterance.pitch = 1.0; // 높이
    utterance.volume = 1.0; // 볼륨
    
    // 한국어 음성 선택 시도
    const voices = window.speechSynthesis.getVoices();
    const koreanVoice = voices.find(voice => 
        voice.lang.startsWith('ko') || voice.lang.startsWith('ko-KR')
    );
    if (koreanVoice) {
        utterance.voice = koreanVoice;
    }
    
    // 재생 시작
    utterance.onstart = () => {
        if (playBtn) {
            playBtn.classList.add('playing');
            const playText = playBtn.querySelector('.play-text');
            if (playText) playText.textContent = '일시정지';
        }
        
        // 진행바 시뮬레이션 (정확한 길이를 알 수 없으므로 애니메이션 사용)
        if (progressBar) {
            let progress = 0;
            speechProgressInterval = setInterval(() => {
                progress += 0.5;
                if (progress <= 100) {
                    progressBar.style.width = progress + '%';
                }
            }, 50);
        }
    };
    
    // 재생 완료
    utterance.onend = () => {
        if (progressBar) {
            progressBar.style.width = '100%';
            if (speechProgressInterval) {
                clearInterval(speechProgressInterval);
                speechProgressInterval = null;
            }
            setTimeout(() => {
                progressBar.style.width = '0%';
            }, 500);
        }
        
        if (playBtn) {
            playBtn.classList.remove('playing');
            const playText = playBtn.querySelector('.play-text');
            if (playText) playText.textContent = playText.textContent.includes('안내') ? '안내 듣기' : '설명 듣기';
        }
        
        currentSpeech = null;
        if (onComplete) onComplete();
    };
    
    // 오류 처리
    utterance.onerror = (event) => {
        console.warn('TTS 재생 오류:', event.error);
        if (playBtn) {
            playBtn.classList.remove('playing');
            const playText = playBtn.querySelector('.play-text');
            if (playText) playText.textContent = playText.textContent.includes('안내') ? '안내 듣기' : '설명 듣기';
        }
        if (progressBar) {
            progressBar.style.width = '0%';
        }
        if (speechProgressInterval) {
            clearInterval(speechProgressInterval);
            speechProgressInterval = null;
        }
        currentSpeech = null;
    };
    
    currentSpeech = utterance;
    window.speechSynthesis.speak(utterance);
}

// TTS 정지 함수
function stopTTS() {
    if (ttsSupported && window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
    if (speechProgressInterval) {
        clearInterval(speechProgressInterval);
        speechProgressInterval = null;
    }
    currentSpeech = null;
}

// 음성 목록 로드 대기 (브라우저마다 다름)
if (typeof window.speechSynthesis !== 'undefined' && window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
        // 음성 목록이 로드되었을 때 처리
    };
}

// 오디오 플레이어 요소들
const conceptAudio = document.getElementById('conceptAudio');
const conceptPlayBtn = document.getElementById('conceptPlayBtn');
const conceptProgress = document.getElementById('conceptProgress');
const stage1Audio = document.getElementById('stage1Audio');
const stage1PlayBtn = document.getElementById('stage1PlayBtn');
const stage1Progress = document.getElementById('stage1Progress');

// 오디오 플레이어 초기화 (TTS 사용)
function initAudioPlayer(playBtn, progressBar, textKey) {
    if (!playBtn || !textKey) return;
    
    const text = ttsTexts[textKey];
    if (!text) return;
    
    // TTS를 지원하지 않으면 버튼 비활성화
    if (!ttsSupported) {
        playBtn.disabled = true;
        playBtn.style.opacity = '0.5';
        playBtn.style.cursor = 'not-allowed';
        const playText = playBtn.querySelector('.play-text');
        if (playText) playText.textContent = '지원 안됨';
        return;
    }
    
    let isPlaying = false;
    
    // 재생/일시정지 토글
    playBtn.addEventListener('click', () => {
        if (window.speechSynthesis.speaking && currentSpeech) {
            // 일시정지
            stopTTS();
            isPlaying = false;
            playBtn.classList.remove('playing');
            const playText = playBtn.querySelector('.play-text');
            if (playText) {
                playText.textContent = playText.textContent.includes('안내') ? '안내 듣기' : '설명 듣기';
            }
            if (progressBar) {
                progressBar.style.width = '0%';
            }
        } else {
            // 재생
            isPlaying = true;
            speakText(text, playBtn, progressBar);
        }
    });
}

// 가이드 버튼 이벤트 리스너 (TTS 사용)
function initGuideButtons() {
    const guideButtons = document.querySelectorAll('.guide-btn');
    
    guideButtons.forEach(btn => {
        const audioFile = btn.getAttribute('data-audio');
        if (!audioFile) return;
        
        // data-audio에서 키 추출 (예: "hair-eye-guide.mp3" -> "hair-eye-guide")
        const textKey = audioFile.replace('.mp3', '');
        const text = ttsTexts[textKey];
        
        if (!text) {
            console.warn('가이드 텍스트를 찾을 수 없습니다:', textKey);
            return;
        }
        
        // TTS를 지원하지 않으면 버튼 비활성화
        if (!ttsSupported) {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
            btn.textContent = '지원 안됨';
            return;
        }
        
        let isPlaying = false;
        
        btn.addEventListener('click', () => {
            // 다른 모든 TTS 중지
            stopTTS();
            
            // 다른 가이드 버튼 상태 초기화
            guideButtons.forEach(otherBtn => {
                if (otherBtn !== btn) {
                    otherBtn.classList.remove('playing');
                    otherBtn.textContent = '가이드 듣기';
                    otherBtn.isPlaying = false;
                }
            });
            
            // 재생/일시정지 토글
            if (!isPlaying || !btn.isPlaying) {
                isPlaying = true;
                btn.isPlaying = true;
                speakText(text, btn, null, () => {
                    btn.isPlaying = false;
                    isPlaying = false;
                });
            } else {
                stopTTS();
                isPlaying = false;
                btn.isPlaying = false;
                btn.classList.remove('playing');
                btn.textContent = '가이드 듣기';
            }
        });
        
        btn.isPlaying = false;
    });
}

// 라디오 버튼 이벤트 리스너
function initRadioButtons() {
    radioInputs.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const value = e.target.value;
            const tone = e.target.getAttribute('data-tone');
            const name = e.target.name;
            
            // 선택 항목 저장
            selectedItems[name] = {
                value: value,
                tone: tone
            };
            
            // 결과 업데이트
            updateResult();
        });
    });
}

// 웜톤/쿨톤 카운트 계산
function countTones() {
    let warmCount = 0;
    let coolCount = 0;
    
    Object.values(selectedItems).forEach(item => {
        if (item && item.tone === 'warm') {
            warmCount++;
        } else if (item && item.tone === 'cool') {
            coolCount++;
        }
    });
    
    return { warmCount, coolCount };
}

// 결과 메시지 생성
function generateResultMessage(warmCount, coolCount) {
    if (warmCount > coolCount) {
        return {
            message: '신체색이 웜톤에 가깝습니다',
            class: 'warm-result'
        };
    } else if (coolCount > warmCount) {
        return {
            message: '신체색이 쿨톤에 가깝습니다',
            class: 'cool-result'
        };
    } else {
        return {
            message: '웜톤과 쿨톤이 균형을 이룹니다',
            class: 'balance-result'
        };
    }
}

// 결과 업데이트
function updateResult() {
    const { warmCount, coolCount } = countTones();
    
    // 카운트 표시 업데이트
    warmCountEl.textContent = warmCount;
    coolCountEl.textContent = coolCount;
    
    // 선택된 항목이 있는지 확인
    const hasSelection = Object.values(selectedItems).some(item => item !== null);
    
    if (hasSelection) {
        const result = generateResultMessage(warmCount, coolCount);
        resultMessageEl.textContent = result.message;
        resultMessageEl.className = 'result-message has-result ' + result.class;
    } else {
        resultMessageEl.textContent = '체크를 완료하면 결과가 표시됩니다';
        resultMessageEl.className = 'result-message';
    }
    
    // 애니메이션 효과
    animateCount(warmCountEl);
    animateCount(coolCountEl);
}

// 카운트 애니메이션
function animateCount(element) {
    element.style.transform = 'scale(1.2)';
    element.style.transition = 'transform 0.2s ease';
    
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 200);
}

// 모든 체크 완료 여부 확인
function isAllChecked() {
    return Object.values(selectedItems).every(item => item !== null);
}

// 초기화
function init() {
    // TTS 지원 확인
    if (!window.speechSynthesis) {
        console.warn('이 브라우저는 TTS를 지원하지 않습니다.');
        ttsSupported = false;
        // TTS 없어도 계속 진행 (return 제거!)
    }
    
    // 오디오 플레이어 초기화 (TTS 사용)
    initAudioPlayer(conceptPlayBtn, conceptProgress, 'concept');
    initAudioPlayer(stage1PlayBtn, stage1Progress, 'stage1');
    
    // 가이드 버튼 초기화
    initGuideButtons();
    
    // 라디오 버튼 초기화 (TTS 여부와 관계없이 실행!)
    initRadioButtons();
    
    // 초기 결과 표시
    updateResult();
    
    console.log('퍼스널컬러 셀프테스터 초기화 완료');
    if (!ttsSupported) {
        console.log('음성 안내 기능은 이 브라우저에서 지원되지 않습니다.');
    }
}

// DOM 로드 완료 시 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// 키보드 접근성 개선
radioInputs.forEach(radio => {
    radio.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            radio.checked = true;
            radio.dispatchEvent(new Event('change'));
        }
    });
});
