import client from './client'
import type { InboxQuery, Offer, OfferStatus, PaginatedResult } from '../../types/clubDesk'
import {
  isStaticClubDesk,
  mockBulkRespondOffers,
  mockFetchOffers,
  mockRespondOffer,
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

interface FetchOffersParams {
  _page: number
  _per_page: number
  _sort: string
  _order: string
  status?: string
  type?: string
}

export async function fetchOffers(
  query: Partial<InboxQuery> = {},
): Promise<PaginatedResult<Offer>> {
  if (isStaticClubDesk) return mockFetchOffers(query)

  const { page = 1, limit = 8, status = '', type = '' } = query
  const params: FetchOffersParams = {
    _page: page,
    _per_page: limit,
    _sort: 'createdAt',
    _order: 'desc',
  }
  if (status) params.status = status
  if (type) params.type = type

  const { data } = await client.get<Offer[] | RawListPayload<Offer>>('/offers', { params })
  return normalizeList(data)
}

export async function respondOffer(id: Offer['id'], status: OfferStatus): Promise<Offer> {
  if (isStaticClubDesk) return mockRespondOffer(id, status)
  const { data } = await client.patch<Offer>(`/offers/${id}`, { status })
  return data
}

export async function bulkRespondOffers(
  ids: Array<Offer['id']>,
  status: OfferStatus,
): Promise<void> {
  if (isStaticClubDesk) return mockBulkRespondOffers(ids, status)
  await Promise.all(ids.map((id) => client.patch(`/offers/${id}`, { status })))
}
