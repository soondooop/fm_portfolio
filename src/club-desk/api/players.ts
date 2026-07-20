import client from './client'
import type { PaginatedResult, PlayerInput, SquadPlayer, SquadQuery } from '../../types/clubDesk'

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

export async function fetchPlayers({
  page = 1,
  limit = 8,
  q = '',
  position = '',
  status = '',
}: Partial<SquadQuery> = {}): Promise<PaginatedResult<SquadPlayer>> {
  const params: FetchPlayersParams = {
    _sort: 'number',
    _order: 'asc',
  }

  if (position) params.position = position
  if (status) params.status = status

  if (q.trim()) {
    // 검색 시 넉넉히 가져온 뒤 클라이언트 필터 + 페이지 슬라이스
    params._page = 1
    params._per_page = 100
  } else {
    params._page = page
    params._per_page = limit
  }

  const { data } = await client.get<SquadPlayer[] | RawListPayload<SquadPlayer>>('/players', { params })
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
  const { data } = await client.post<SquadPlayer>('/players', payload)
  return data
}

export async function updatePlayer(
  id: SquadPlayer['id'],
  payload: PlayerInput,
): Promise<SquadPlayer> {
  const { data } = await client.put<SquadPlayer>(`/players/${id}`, payload)
  return data
}

export async function deletePlayer(id: SquadPlayer['id']): Promise<void> {
  await client.delete(`/players/${id}`)
}

export async function deletePlayers(ids: Array<SquadPlayer['id']>): Promise<void> {
  await Promise.all(ids.map((id) => client.delete(`/players/${id}`)))
}
