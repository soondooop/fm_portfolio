import seed from '../../../mock/club-desk/db.json'
import type {
  Offer,
  OfferStatus,
  PaginatedResult,
  PlayerInput,
  SquadPlayer,
  SquadQuery,
  InboxQuery,
} from '../../types/clubDesk'

type SeedPlayer = SquadPlayer & { id: string | number }
type SeedOffer = Offer & { id: string | number }

interface ClubDeskSeed {
  players: SeedPlayer[]
  offers: SeedOffer[]
}

const source = seed as ClubDeskSeed

let players: SquadPlayer[] = structuredClone(source.players).map((p) => ({
  ...p,
  id: String(p.id),
}))
let offers: Offer[] = structuredClone(source.offers).map((o) => ({
  ...o,
  id: String(o.id),
}))
let nextPlayerId = players.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0) + 1

function paginate<T>(list: T[], page: number, limit: number): PaginatedResult<T> {
  const start = (page - 1) * limit
  return {
    list: list.slice(start, start + limit),
    total: list.length,
  }
}

export const isStaticClubDesk =
  import.meta.env.PROD || import.meta.env.VITE_CLUB_DESK_MOCK === '1'

export async function mockFetchPlayers({
  page = 1,
  limit = 8,
  q = '',
  position = '',
  status = '',
}: Partial<SquadQuery> = {}): Promise<PaginatedResult<SquadPlayer>> {
  let list = [...players]
  if (position) list = list.filter((p) => p.position === position)
  if (status) list = list.filter((p) => p.status === status)
  if (q.trim()) {
    const keyword = q.trim().toLowerCase()
    list = list.filter((p) => p.name.toLowerCase().includes(keyword))
  }
  list.sort((a, b) => Number(a.number) - Number(b.number))
  return paginate(list, page, limit)
}

export async function mockCreatePlayer(payload: PlayerInput): Promise<SquadPlayer> {
  const created: SquadPlayer = {
    ...payload,
    id: String(nextPlayerId++),
  }
  players = [...players, created]
  return created
}

export async function mockUpdatePlayer(
  id: SquadPlayer['id'],
  payload: PlayerInput,
): Promise<SquadPlayer> {
  const sid = String(id)
  players = players.map((p) => (String(p.id) === sid ? { ...p, ...payload, id: p.id } : p))
  const found = players.find((p) => String(p.id) === sid)
  if (!found) throw new Error('Player not found')
  return found
}

export async function mockDeletePlayer(id: SquadPlayer['id']): Promise<void> {
  players = players.filter((p) => String(p.id) !== String(id))
}

export async function mockDeletePlayers(ids: Array<SquadPlayer['id']>): Promise<void> {
  const set = new Set(ids.map(String))
  players = players.filter((p) => !set.has(String(p.id)))
}

export async function mockFetchOffers({
  page = 1,
  limit = 8,
  status = '',
  type = '',
}: Partial<InboxQuery> = {}): Promise<PaginatedResult<Offer>> {
  let list = [...offers]
  if (status) list = list.filter((o) => o.status === status)
  if (type) list = list.filter((o) => o.type === type)
  list.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
  return paginate(list, page, limit)
}

export async function mockRespondOffer(
  id: Offer['id'],
  status: OfferStatus,
): Promise<Offer> {
  const sid = String(id)
  offers = offers.map((o) => (String(o.id) === sid ? { ...o, status } : o))
  const found = offers.find((o) => String(o.id) === sid)
  if (!found) throw new Error('Offer not found')
  return found
}

export async function mockBulkRespondOffers(
  ids: Array<Offer['id']>,
  status: OfferStatus,
): Promise<void> {
  const set = new Set(ids.map(String))
  offers = offers.map((o) => (set.has(String(o.id)) ? { ...o, status } : o))
}
