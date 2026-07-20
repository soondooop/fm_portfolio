# SOONDOOOP — FM Style Portfolio + Club Desk

Football Manager 모티브 포트폴리오와, React + Redux Toolkit + Axios 데모 앱 **Club Desk**를 포함한 프로젝트입니다.

## 구성

### Scout Report (`/`)
- Overview / Career / Attributes / Match History / Transfer

### Club Desk (`/club-desk`)
- Login (데모 계정)
- Squad — 검색·필터·페이지네이션·CRUD·일괄 방출
- Inbox — 이적/계약 제안 수락·거절·일괄 거절

## 실행

```bash
npm install
npm run dev
```

- 포트폴리오: http://localhost:5173
- Club Desk: http://localhost:5173/club-desk
- Mock API: http://localhost:3001

### 데모 로그인
- email: `manager@clubdesk.test`
- password: `fm1234`

## 데이터 수정

- 포트폴리오: `public/data/portfolio.json`
- Club Desk 시드: `mock/club-desk/db.json`
