import axios from 'axios'
import type { PortfolioData } from '../types/portfolio'

const client = axios.create({
  baseURL: '/data',
  headers: { Accept: 'application/json' },
})

export async function fetchPortfolio(): Promise<PortfolioData> {
  const { data } = await client.get<PortfolioData>('/portfolio.json')
  return data
}
