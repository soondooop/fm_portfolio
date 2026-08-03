import client from './client'
import type { PaginatedResult, PlayerInput, SquadPlayer, SquadQuery } from '../../types/clubDesk'
import {
  isStaticClubDesk,
  mockCreatePlayer,
  mockDeletePlayer,
  mockDeletePlayers,
  mockFetchPlayers,
  mockUpdatePlayer,
} from './mockStore'

interface RawListPayload<T> {
  data?: T[]
  items?: number
}

function normalizeList<T>(payload: T[] | RawListPayload<T> | null | undefined): PaginatedResult<T> {
  if (Array.isArray(payload)) {
    return { list: payload, total: payload.length }
  }
  if (payload && Array.isArray(payload.data)) {
    return {
      list: payload.data,
      total: Number(payload.items ?? payload.data.length),
    }
  }
  return { list: [], total: 0 }
}

interface FetchPlayersParams {
  _sort: string
  _order: string
  position?: string
  status?: string
  _page?: number
  _per_page?: number
}

export async function fetchPlayers(
  query: Partial<SquadQuery> = {},
): Promise<PaginatedResult<SquadPlayer>> {
  if (isStaticClubDesk) return mockFetchPlayers(query)

  const { page = 1, limit = 8, q = '', position = '', status = '' } = query
  const params: FetchPlayersParams = {
    _sort: 'number',
    _order: 'asc',
  }

  if (position) params.position = position
  if (status) params.status = status

  if (q.trim()) {
    params._page = 1
    params._per_page = 100
  } else {
    params._page = page
    params._per_page = limit
  }

  const { data } = await client.get<SquadPlayer[] | RawListPayload<SquadPlayer>>('/players', {
    params,
  })
  let { list, total } = normalizeList(data)

  if (q.trim()) {
    const keyword = q.trim().toLowerCase()
    list = list.filter((p) => p.name.toLowerCase().includes(keyword))
    total = list.length
    const start = (page - 1) * limit
    list = list.slice(start, start + limit)
  }

  return { list, total }
}

export async function createPlayer(payload: PlayerInput): Promise<SquadPlayer> {
  if (isStaticClubDesk) return mockCreatePlayer(payload)
  const { data } = await client.post<SquadPlayer>('/players', payload)
  return data
}

export async function updatePlayer(
  id: SquadPlayer['id'],
  payload: PlayerInput,
): Promise<SquadPlayer> {
  if (isStaticClubDesk) return mockUpdatePlayer(id, payload)
  const { data } = await client.put<SquadPlayer>(`/players/${id}`, payload)
  return data
}

export async function deletePlayer(id: SquadPlayer['id']): Promise<void> {
  if (isStaticClubDesk) return mockDeletePlayer(id)
  await client.delete(`/players/${id}`)
}

export async function deletePlayers(ids: Array<SquadPlayer['id']>): Promise<void> {
  if (isStaticClubDesk) return mockDeletePlayers(ids)
  await Promise.all(ids.map((id) => client.delete(`/players/${id}`)))
}
