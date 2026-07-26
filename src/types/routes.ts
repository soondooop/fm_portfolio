import type { PortfolioTab } from './portfolio'

export interface PortfolioRoute {
  id: PortfolioTab
  path: string
  label: string
  index: string
}

export const PORTFOLIO_ROUTES: PortfolioRoute[] = [
  { id: 'overview', path: '/overview', label: 'Overview', index: '01' },
  { id: 'career', path: '/experience', label: 'Experience', index: '02' },
  { id: 'attributes', path: '/skills', label: 'Skills', index: '03' },
  { id: 'projects', path: '/projects', label: 'Projects', index: '04' },
  { id: 'contact', path: '/contact', label: 'Contact', index: '05' },
]
