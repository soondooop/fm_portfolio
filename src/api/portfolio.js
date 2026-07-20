import axios from 'axios'

const client = axios.create({
  baseURL: '/data',
  headers: { Accept: 'application/json' },
})

export async function fetchPortfolio() {
  const { data } = await client.get('/portfolio.json')
  return data
}
