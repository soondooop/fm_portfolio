export type StatKey =
  | 'finishing'
  | 'passing'
  | 'technique'
  | 'vision'
  | 'composure'
  | 'acceleration'
  | 'newGen'

export interface PlayerProfile {
  id: number
  name: string
  displayName: string
  position: string
  shortPosition: string
  seasons: number
  club: string
  nationality: string
  preferredFoot: string
  tagline: string
  bio: string
  portrait?: string
}

export interface SeasonStats {
  finishing: number
  passing: number
  technique: number
  vision: number
  composure: number
  acceleration: number
  newGen: number
}

export interface Season {
  id: string
  label: string
  range: string
  role: string
  club: string
  scoutNote: string
  stats: SeasonStats
  highlights: string[]
}

export interface StatLabel {
  name: string
  desc: string
}

export interface AttributeItem {
  key: string
  label: string
  value: number
  note?: string
}

export interface AttributesData {
  technical: AttributeItem[]
  mental: AttributeItem[]
  delivery: AttributeItem[]
  developing: AttributeItem[]
}

export interface TransferLink {
  label: string
  href: string
}

export interface TransferData {
  headline: string
  sub: string
  email: string
  terms: string[]
  links: TransferLink[]
}

export interface PortfolioData {
  player: PlayerProfile
  seasons: Season[]
  statLabels: Record<StatKey, StatLabel>
  attributes: AttributesData
  transfer: TransferData
}

export type PortfolioTab =
  | 'overview'
  | 'career'
  | 'attributes'
  | 'matches'
  | 'transfer'
