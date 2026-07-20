export interface RemoteProject {
  id: number | string
  title: string
  description?: string
  image?: string | null
  tags?: string[]
  link?: string | null
}

export interface MatchItem {
  key: string
  id: number | string
  title: string
  summary: string
  image: string | null
  stack: string[]
  link: string | null
  featured: boolean
  role: string
  competition: string
  contribution: string[]
}
