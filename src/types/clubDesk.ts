export type PlayerPosition = 'GK' | 'DF' | 'MF' | 'FW'
export type PlayerStatus = 'available' | 'injured' | 'loaned'
export type OfferType = 'transfer' | 'contract' | 'loan'
export type OfferStatus = 'pending' | 'accepted' | 'rejected'

export interface ClubUser {
  id: number | string
  email: string
  name: string
  club: string
}

export interface AuthSession {
  token: string
  user: ClubUser
}

export interface SquadPlayer {
  id: number | string
  name: string
  position: PlayerPosition | string
  age: number
  rating: number
  number: number
  wage: number
  status: PlayerStatus | string
  nationality: string
}

export type PlayerInput = Omit<SquadPlayer, 'id'>

export interface Offer {
  id: number | string
  type: OfferType | string
  fromClub: string
  playerId: number | string
  playerName: string
  fee: number
  status: OfferStatus | string
  createdAt: string
}

export interface PaginatedResult<T> {
  list: T[]
  total: number
}

export interface SquadQuery {
  page: number
  limit: number
  q: string
  position: string
  status: string
}

export interface InboxQuery {
  page: number
  limit: number
  status: string
  type: string
}
