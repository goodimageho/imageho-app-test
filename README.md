# 퍼스널컬러 셀프테스터 - 1단계 웹사이트

퍼스널컬러 4계절 진단 중 **1단계: 신체색 웜/쿨 체크**를 온라인에서 셀프로 진행할 수 있는 인터랙티브 웹사이트입니다.

## 🎯 주요 기능

1. **퍼스널컬러 개념 설명** - 웜톤/쿨톤의 기본 개념 안내
2. **음성 안내** - 전문 컨설턴트의 안내 스크립트를 음성으로 제공 (선택사항)
3. **인터랙티브 체크표** - 사용자가 직접 선택하여 체크할 수 있는 진단표
4. **결과 집계** - 웜/쿨 체크 개수 자동 카운트 및 결과 표시

## 📁 프로젝트 구조

```
/personal-color-tester/
├── index.html              # 메인 HTML 파일
├── css/
│   └── style.css          # 스타일시트
├── js/
│   └── app.js             # JavaScript 로직
├── assets/
│   ├── images/
│   │   └── warm-cool-check-sheet.png    # 체크 시트 이미지
│   └── audio/             # 음성 파일 (선택사항)
│       ├── intro.mp3
│       ├── concept.mp3
│       ├── stage1-intro.mp3
│       ├── lip-cheek-guide.mp3
│       ├── skin-guide.mp3
│       └── hair-eye-guide.mp3
└── README.md
```

## 🚀 사용 방법

1. 웹 브라우저에서 `index.html` 파일을 엽니다.
2. 퍼스널컬러 개념 설명을 확인합니다.
3. 체크 시트 이미지를 참고하여 본인의 신체색을 체크합니다.
4. 각 카테고리(Hair & Eye, Skin, Lip & Cheek)별로 웜톤 또는 쿨톤 중 하나를 선택합니다.
5. 결과 섹션에서 웜톤/쿨톤 카운트와 진단 결과를 확인합니다.

## 🎨 디자인 시스템

### 컬러 팔레트
- 웜톤 대표색: `#E8A87C`
- 쿨톤 대표색: `#D4A5B9`
- 강조색: `#FF6B9D`

### 폰트
- 제목: Noto Sans KR Bold (700)
- 본문: Noto Sans KR Regular (400)
- 강조: Noto Sans KR Medium (500)

## 📱 반응형 디자인

- **모바일**: 480px 이하
- **태블릿**: 481px ~ 768px
- **데스크톱**: 769px 이상

## 🔊 음성 파일 추가하기

음성 파일을 추가하려면 `assets/audio/` 폴더에 다음 파일들을 준비하세요:

- `concept.mp3` - 퍼스널컬러 개념 설명
- `stage1-intro.mp3` - 1단계 시작 안내
- `lip-cheek-guide.mp3` - 립앤치크 가이드
- `skin-guide.mp3` - 피부색 가이드
- `hair-eye-guide.mp3` - 헤어앤아이 가이드

음성 파일이 없어도 웹사이트는 정상적으로 작동합니다.

## 🔧 기술 스택

- **HTML5** - 시맨틱 마크업
- **CSS3** - Flexbox, Grid, CSS Variables
- **Vanilla JavaScript** - 순수 JavaScript로 구현

## 📝 라이선스

이 프로젝트는 개인/상업적 용도로 자유롭게 사용할 수 있습니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 등록해주세요.
