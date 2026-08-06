# SOONDOOOP — FM Style Portfolio + Club Desk

Football Manager식 UI를 바탕으로, IT·커리어 톤의 포트폴리오와 React + Redux Toolkit + Axios 데모 앱 **Club Desk**를 담은 프로젝트입니다.

**Live:** [https://soondooop.github.io](https://soondooop.github.io)

## Tech Stack

- React 19 + TypeScript + Vite
- React Router
- Phaser 3 (Play World)
- Redux Toolkit + Axios (Club Desk)
- json-server (로컬 Mock API)
- GitHub Pages (배포)

## Features

### Portfolio (`/`)
- Overview / Experience / Skills / Projects / Contact
- Light / Dark 테마
- 부트 로더, 프로젝트 리스트·모달
- 프로필·경력·스킬: 원격 `portfolio.json`
- 프로젝트 목록: 원격 `projects.json`

### Play World (`/play`)
- React + Phaser 도트 RPG형 탐험 맵
- Overview / Experience / Skills / Projects / Contact 존 상호작용
- Skip to classic, 모바일 가상 패드

### Club Desk (`/club-desk`)
- 데모 로그인
- Squad — 검색·필터·페이지네이션·CRUD·일괄 처리
- Inbox — 제안 수락·거절·일괄 거절

## Getting Started

```bash
npm install
npm run dev
```

| 구분 | URL |
|------|-----|
| Portfolio | http://localhost:5173 |
| Play World | http://localhost:5173/play |
| Club Desk | http://localhost:5173/club-desk |
| Mock API | http://localhost:3001 |

```bash
npm run build    # tsc 타입 검사 + Vite 빌드
npm run preview  # 빌드 결과 미리보기
```

## Project Structure

```
src/
  portfolio/       # 포트폴리오 앱 엔트리·라우팅
  components/      # Overview, Experience, Skillset, Projects…
  theme/           # ThemeProvider, ThemeToggle
  club-desk/       # Redux 데모 앱
  api/             # 원격 JSON / Club Desk API
  types/
public/            # 정적 자산 (favicon, 로컬 시드 등)
mock/club-desk/    # json-server 시드
```

## 데이터 수정

콘텐츠만 바꿀 때는 **앱을 다시 배포할 필요 없이** 아래 JSON을 수정·푸시하면 됩니다.  
저장소: [soondooop/soondooop.github.io](https://github.com/soondooop/soondooop.github.io)

| 데이터 | URL / 경로 |
|--------|------------|
| 프로필·경력·스킬·연락 | https://soondooop.github.io/data/portfolio.json |
| 프로젝트 리스트 | https://soondooop.github.io/data/projects.json |
| Club Desk 시드 (로컬) | `mock/club-desk/db.json` |

> `public/data/portfolio.json`은 로컬 참고용입니다. 라이브 사이트는 github.io의 JSON을 읽습니다.

## Club Desk 데모 계정

- email: `manager@clubdesk.test`
- password: `fm1234`

## Deploy

GitHub Pages(`soondooop.github.io`)에 정적 빌드를 올립니다.

```bash
npm run build
# dist/ 내용을 soondooop.github.io 루트에 복사
# data/portfolio.json, data/projects.json 은 유지
# SPA 딥링크용으로 index.html → 404.html 복사 권장
```

소스 저장소: [soondooop/fm_portfolio](https://github.com/soondooop/fm_portfolio)
