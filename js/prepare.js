// TTS 텍스트 내용
const ttsTexts = {
    prepare: '퍼스널컬러 셀프테스터를 시작하기 전 케이프를 착용해주세요. 컬러시트 외의 다른 컬러가 비추어 올라오는 것을 막아줘요. 착용한 흰 케이프 앞면에 부착된 벨크로에 진단시트를 붙여 진단해보세요. 컬러별 2장을 겹쳐 붙이고 앞의 한장만 내렸다가, 올리면서 1장당 3초씩 천천히 비교하세요.'
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
        
        // 진행바 시뮬레이션
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
            if (playText) playText.textContent = '안내 듣기';
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
            if (playText) playText.textContent = '안내 듣기';
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

// 음성 목록 로드 대기
if (typeof window.speechSynthesis !== 'undefined' && window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
        // 음성 목록이 로드되었을 때 처리
    };
}

// DOM 요소
const preparePlayBtn = document.getElementById('preparePlayBtn');
const prepareProgress = document.getElementById('prepareProgress');
const backToConceptBtn = document.getElementById('backToConceptBtn');
const nextStepBtn = document.getElementById('nextStepBtn');

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
                playText.textContent = '안내 듣기';
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

// 네비게이션 버튼 이벤트
function initNavigationButtons() {
    // 개념설명으로 돌아가기 버튼
    if (backToConceptBtn) {
        backToConceptBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    
    // 1단계 시작하기 버튼
    if (nextStepBtn) {
        nextStepBtn.addEventListener('click', () => {
            // stage1.html로 이동
            window.location.href = 'stage1.html';
        });
    }
}

// 초기화
function init() {
    // TTS 지원 확인
    if (!window.speechSynthesis) {
        console.warn('이 브라우저는 TTS를 지원하지 않습니다.');
        ttsSupported = false;
    }
    
    // 오디오 플레이어 초기화 (TTS 사용)
    initAudioPlayer(preparePlayBtn, prepareProgress, 'prepare');
    
    // 네비게이션 버튼 초기화
    initNavigationButtons();
    
    console.log('퍼스널컬러 준비 페이지 초기화 완료');
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
