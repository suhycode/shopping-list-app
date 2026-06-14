# 🛒 쇼핑 리스트 앱

바닐라 JavaScript로 만든 단일 파일 쇼핑 리스트 앱입니다. 빌드 단계가 없으며, `shopping-list.html`을 브라우저에서 바로 열면 동작합니다.

## 기능

- 항목 추가 (추가 버튼 또는 Enter 키)
- 체크 / 체크 해제 토글 (체크 동그라미 또는 라벨 클릭)
- 항목 삭제
- 완료 항목 일괄 비우기
- 미완료 항목을 위로 정렬
- `localStorage` 기반 영속성 (새로고침해도 유지)

## 사용 방법

`shopping-list.html`을 브라우저에서 엽니다. 서버나 빌드가 필요 없습니다.

## 테스트

Playwright(Chromium)로 주요 기능을 자동 검증합니다.

```bash
npm install
npx playwright install chromium
npm test
```

## 기술 스택

- HTML / CSS / Vanilla ES6 (단일 파일, 런타임 의존성 없음)
- localStorage
- Playwright (테스트 전용)
