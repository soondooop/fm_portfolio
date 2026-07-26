export type SkillKey =
  | 'craft'
  | 'collab'
  | 'interaction'
  | 'structure'
  | 'stability'
  | 'learning'
  | 'modernStack'

export interface Profile {
  id: number
  name: string
  displayName: string
  position: string
  shortPosition: string
  years: number
  status: string
  based: string
  focus: string
  tagline: string
  bio: string
  portrait?: string
}

export interface SkillScores {
  craft: number
  collab: number
  interaction: number
  structure: number
  stability: number
  learning: number
  modernStack: number
}

export interface CareerPeriod {
  id: string
  label: string
  range: string
  role: string
  company: string
  summary: string
  skills: SkillScores
  highlights: string[]
}

export interface SkillLabel {
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
  frontend: AttributeItem[]
  styling: AttributeItem[]
  collaboration: AttributeItem[]
  delivery: AttributeItem[]
  designTools: AttributeItem[]
  developing: AttributeItem[]
}

export interface ContactLink {
  label: string
  href: string
}

export interface ContactData {
  headline: string
  sub: string
  email: string
  terms: string[]
  links: ContactLink[]
}

export interface PortfolioData {
  profile: Profile
  experience: CareerPeriod[]
  skillLabels: Record<SkillKey, SkillLabel>
  attributes: AttributesData
  contact: ContactData
}

export type PortfolioTab =
  | 'overview'
  | 'career'
  | 'attributes'
  | 'projects'
  | 'contact'
