---
name: add-portfolio-section
description: >-
  Adds a new portfolio section end-to-end in fm_portfolio (component, route,
  types, JSON data, nav). Use when the user asks to add a portfolio tab/page/
  section, new nav item, or wire a new screen into PortfolioApp.
---

# Add Portfolio Section

새 포트폴리오 섹션을 추가할 때 아래 순서를 **모두** 처리한다. 요청 범위 밖 리팩터는 하지 않는다.

## Checklist

```
- [ ] 1. 이름 확정 (파일/export/path/label)
- [ ] 2. 컴포넌트 생성
- [ ] 3. 타입·데이터 (필요 시)
- [ ] 4. 라우트·네비 연결
- [ ] 5. 스타일 (기존 토큰/클래스 재사용)
- [ ] 6. 동작 확인 포인트 안내
```

## Step 1 — 이름

| 항목 | 규칙 | 예 |
|------|------|----|
| 파일 | `PascalCase.tsx` | `Writing.tsx` |
| export | 파일명과 동일 | `export default function Writing` |
| props | `NameProps` | `WritingProps` |
| path | kebab, `/` 접두 | `/writing` |
| tab id | camel/짧은 영문 | `writing` |
| nav label | 영문 UI 라벨 | `Writing` |

사용자 입력이 없으면 섹션 목적에 맞는 영문 이름을 제안한 뒤 진행한다.

## Step 2 — 컴포넌트

경로: `src/components/<Name>.tsx`

기존 섹션(`Overview`, `Experience`, `Skillset`, `Contact`)과 같은 뼈대:

```tsx
interface NameProps {
  /* portfolio.json / types에서 필요한 데이터만 */
}

export default function Name({ ... }: NameProps) {
  return (
    <section className="panel" aria-labelledby="name-title">
      <div className="section-head">
        <div>
          <p className="eyebrow">...</p>
          <h2 id="name-title">...</h2>
          <p>...</p>
        </div>
      </div>
      {/* 본문 */}
    </section>
  )
}
```

- 카피는 IT/커리어 톤(축구 용어 지양), UI 문구는 한국어 가능
- 인라인 스타일·새 카드 디자인 남발 금지 → `global.css` 클래스/`var(--*)` 재사용

## Step 3 — 타입·데이터

데이터가 필요하면:

1. `src/types/portfolio.ts` — 인터페이스 + `PortfolioData` 필드 + `PortfolioTab` 유니온
2. `public/data/portfolio.json` — 동일 키로 시드 데이터
3. 컴포넌트 props는 JSON 키와 맞출 것

정적 UI만이면 타입/JSON 변경은 생략 가능.

## Step 4 — 라우트·네비

1. `src/types/routes.ts` — `PORTFOLIO_ROUTES`에 항목 추가  
   - `index`는 기존 번호 체계 유지 (`01`…), 새 항목은 다음 번호  
   - `id` / `path` / `label` 일치
2. `src/portfolio/PortfolioApp.tsx`  
   - import  
   - `<Route path="..." element={<Name ... />} />`  
   - `data`에서 props 전달 (필요 시)
3. `AppShell`은 `PORTFOLIO_ROUTES`를 쓰므로 보통 추가 수정 없음

path는 Router 기준 상대 세그먼트와 `PORTFOLIO_ROUTES.path`가 어긋나지 않게 맞춘다.  
(예: routes에 `/writing`이면 Route는 `writing`)

## Step 5 — 스타일

- 새 CSS는 꼭 필요할 때만 `src/styles/global.css`에 최소 추가
- 색은 hex 하드코딩 대신 `var(--text)`, `var(--muted)`, `var(--accent)` 등

## Step 6 — 완료 시 보고

짧게 알려준다:

- 추가된 파일/수정 파일
- 접속 경로 (예: `/writing`)
- 데이터 키가 있으면 JSON에서 고칠 위치

## Do not

- 파일명과 다른 export 이름 사용
- Club Desk(`src/club-desk`)를 같이 건드리지 말 것 (요청 없는 한)
- 테마/부트 로더 구조를 섹션 추가만으로 리팩터하지 말 것
