// TTS 텍스트 내용
const ttsTexts = {
    concept: '퍼스널컬러란 개인의 고유 신체색인 머리카락 색, 눈동자 색, 피부색, 볼의 혈색, 입술색 등과 자연스럽게 조화를 이루는 컬러를 말합니다. 퍼스널컬러는 크게 웜톤과 쿨톤 두 가지로 분류합니다. 봄과 가을 계절은 각 컬러에 노란색이 들어가 있어 따뜻함이 느껴져서 웜톤이라고 합니다. 여름과 겨울 계절은 각 컬러에 파란색이 들어가 있어 시원함이 느껴져서 쿨톤이라고 합니다.'
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
            if (playText) playText.textContent = '설명 듣기';
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
            if (playText) playText.textContent = '설명 듣기';
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

// DOM 요소
const conceptPlayBtn = document.getElementById('conceptPlayBtn');
const conceptProgress = document.getElementById('conceptProgress');
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
                playText.textContent = '설명 듣기';
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

// 다음 단계 버튼 이벤트
function initNextStepButton() {
    if (!nextStepBtn) return;
    
    nextStepBtn.addEventListener('click', () => {
        // stage1.html로 이동
        window.location.href = 'stage1.html';
    });
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
    
    // 다음 단계 버튼 초기화 (TTS 여부와 관계없이 실행!)
    initNextStepButton();
    
    console.log('퍼스널컬러 개념 설명 페이지 초기화 완료');
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
