import axios from 'axios'
import type { PortfolioData } from '../types/portfolio'

const PORTFOLIO_URL = 'https://soondooop.github.io/data/portfolio.json'

export async function fetchPortfolio(): Promise<PortfolioData> {
  const { data } = await axios.get<PortfolioData>(PORTFOLIO_URL, {
    headers: { Accept: 'application/json' },
  })
  return data
}
