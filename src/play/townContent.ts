import type { PlayTalkPayload } from './events'

export interface TownNpc {
  id: string
  name: string
  x: number
  y: number
  sprite: 'npc-guide' | 'npc-joker' | 'npc-scout' | 'npc-cat'
  patrol?: { dx: number; dy: number; duration: number }
  lines: string[]
}

export interface TownEgg {
  id: string
  name: string
  x: number
  y: number
  radius: number
  sprite?: 'sign' | 'fountain' | 'arcade' | 'bench' | 'pond'
  minigame?: 'breakout'
  talk: PlayTalkPayload
}

export const TOWN_NPCS: TownNpc[] = [
  {
    id: 'guide',
    name: '가이드',
    x: 900,
    y: 420,
    sprite: 'npc-guide',
    patrol: { dx: 40, dy: 0, duration: 2200 },
    lines: [
      '어서 와, SOONDOOOP TOWN이야!',
      '남쪽 게이트로 가면 Projects Village가 나와.',
      '미니맵의 점으로 목적지를 확인해 봐.',
    ],
  },
  {
    id: 'joker',
    name: '농담봇',
    x: 780,
    y: 640,
    sprite: 'npc-joker',
    patrol: { dx: 0, dy: -28, duration: 2600 },
    lines: [
      '버그라고 부르지 마. 예상치 못한 기능이야.',
      '벤치에 앉으면 배포 스트레스가 1 줄어든대.',
      '오늘도 z-index는 9999야.',
    ],
  },
  {
    id: 'scout',
    name: '스카우터',
    x: 520,
    y: 700,
    sprite: 'npc-scout',
    lines: [
      'Projects Village 간판이 곧 포트폴리오 썸네일이야.',
      '가까이 가서 E를 누르면 상세 퀘스트가 열려.',
      'Club Desk는 동쪽 구석 표지판을 잘 봐.',
    ],
  },
  {
    id: 'cat',
    name: '픽셀냥',
    x: 980,
    y: 360,
    sprite: 'npc-cat',
    patrol: { dx: 56, dy: 12, duration: 3000 },
    lines: [
      '냐앙… (너는 퍼블리셔냐옹)',
      '연못에 동전을 던지면… 소원이 이뤄질지도?',
      '쓰다듬기는 아직 미구현이다옹.',
    ],
  },
]

export const TOWN_EGGS: TownEgg[] = [
  {
    id: 'fountain',
    name: '분수',
    x: 900,
    y: 380,
    radius: 58,
    sprite: 'fountain',
    talk: {
      id: 'fountain',
      speaker: '마을 분수',
      lines: [
        '차가운 물이 반짝인다.',
        '…누군가 “배포는 금요일에 하지 말자”고 새겨 둔 것 같다.',
      ],
    },
  },
  {
    id: 'club-sign',
    name: '비밀 표지판',
    x: 1680,
    y: 140,
    radius: 48,
    sprite: 'sign',
    talk: {
      id: 'club-sign',
      speaker: '낡은 표지판',
      lines: [
        '『CLUB DESK — 스쿼드 운영실』',
        '이 문을 열면 데모 어드민으로 이동한다.',
      ],
      link: { label: 'Club Desk 열기', href: '/club-desk' },
    },
  },
  {
    id: 'arcade',
    name: '오락기',
    x: 200,
    y: 500,
    radius: 52,
    sprite: 'arcade',
    minigame: 'breakout',
    talk: {
      id: 'arcade',
      speaker: 'PIXEL BREAKER',
      lines: ['코인을 넣자. 블록을 깨자.'],
    },
  },
  {
    id: 'bench',
    name: '벤치',
    x: 1100,
    y: 450,
    radius: 46,
    sprite: 'bench',
    talk: {
      id: 'bench',
      speaker: '마을 벤치',
      lines: [
        '잠깐 앉아 숨을 고른다.',
        '…커밋 메시지는 오늘도 한 줄로 충분하다.',
      ],
    },
  },
  {
    id: 'pond',
    name: '연못',
    x: 820,
    y: 690,
    radius: 64,
    sprite: 'pond',
    talk: {
      id: 'pond',
      speaker: '반짝이는 연못',
      lines: [
        '동전을 던졌다. 동그란 파문이 퍼진다.',
        '소원: 빌드가 한 번에 통과하길.',
      ],
    },
  },
]

export function npcTalk(npc: TownNpc): PlayTalkPayload {
  return {
    id: npc.id,
    speaker: npc.name,
    lines: npc.lines,
  }
}
