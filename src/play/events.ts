export type PlaySection =
  | 'overview'
  | 'experience'
  | 'skills'
  | 'projects'
  | 'contact'

export const PLAY_SECTIONS: { id: PlaySection; label: string; color: number }[] =
  [
    { id: 'overview', label: 'Overview', color: 0x6eb0ff },
    { id: 'experience', label: 'Experience', color: 0x8ec5ff },
    { id: 'skills', label: 'Skills', color: 0xf0c36a },
    { id: 'projects', label: 'Projects Village', color: 0x7dd3a0 },
    { id: 'contact', label: 'Contact', color: 0xef7b6a },
  ]

export const PLAY_EVENT = {
  OPEN: 'portfolio:open',
  CLOSE: 'portfolio:close',
  PROJECT: 'portfolio:project',
  TALK: 'town:talk',
  TALK_CLOSE: 'town:talk-close',
  VISIT: 'town:visit',
  MINIGAME: 'town:minigame',
  MINIGAME_CLOSE: 'town:minigame-close',
  STATE: 'town:state',
  BOOTHS: 'town:booths',
  PROJECTS_SYNC: 'town:projects-sync',
} as const

export type PlayMinigame = 'breakout'

export interface PlayMinigamePayload {
  id: PlayMinigame
}

export interface PlayOpenPayload {
  section: PlaySection
}

export interface PlayProjectPayload {
  key: string
}

export interface PlayTalkLink {
  label: string
  href: string
}

export interface PlayTalkPayload {
  id: string
  speaker: string
  lines: string[]
  link?: PlayTalkLink
}

export interface PlayVisitPayload {
  section: PlaySection
  visited: PlaySection[]
  complete: boolean
}

export interface PlayInputState {
  x: number
  y: number
}

export interface PlayWorldState {
  x: number
  y: number
  mapW: number
  mapH: number
  booths: PlayBoothScreen[]
}

export interface PlayBoothScreen {
  key: string
  title: string
  image: string | null
  x: number
  y: number
  w: number
  h: number
}

export interface PlayProjectBooth {
  key: string
  title: string
  image: string | null
}
