import client from './client'

function normalizeList(payload) {
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

export async function fetchOffers({
  page = 1,
  limit = 8,
  status = '',
  type = '',
} = {}) {
  const params = {
    _page: page,
    _per_page: limit,
    _sort: 'createdAt',
    _order: 'desc',
  }
  if (status) params.status = status
  if (type) params.type = type

  const { data } = await client.get('/offers', { params })
  return normalizeList(data)
}

export async function respondOffer(id, status) {
  const { data } = await client.patch(`/offers/${id}`, { status })
  return data
}

export async function bulkRespondOffers(ids, status) {
  await Promise.all(ids.map((id) => client.patch(`/offers/${id}`, { status })))
}
