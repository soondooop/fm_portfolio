import { useEffect, useState } from 'react'
import type { PortfolioData, PortfolioTab } from '../types/portfolio'
import type { MatchItem } from '../types/projects'
import { fetchPortfolio } from '../api/portfolio'
import { fetchProjects } from '../api/projects'
import AppShell from '../components/AppShell'
import Overview from '../components/Overview'
import Career from '../components/Career'
import Attributes from '../components/Attributes'
import MatchHistory from '../components/MatchHistory'
import Transfer from '../components/Transfer'

export default function PortfolioApp() {
  const [data, setData] = useState<PortfolioData | null>(null)
  const [matches, setMatches] = useState<MatchItem[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [projectsError, setProjectsError] = useState('')
  const [error, setError] = useState('')
  const [active, setActive] = useState<PortfolioTab>('overview')

  useEffect(() => {
    let alive = true

    fetchPortfolio()
      .then((json) => {
        if (alive) setData(json)
      })
      .catch(() => {
        if (alive) setError('스카우트 리포트를 불러오지 못했습니다.')
      })

    fetchProjects()
      .then((list) => {
        if (!alive) return
        setMatches(list)
        setProjectsError('')
      })
      .catch(() => {
        if (!alive) return
        setProjectsError('프로젝트 리스트를 불러오지 못했습니다.')
        setMatches([])
      })
      .finally(() => {
        if (alive) setProjectsLoading(false)
      })

    return () => {
      alive = false
    }
  }, [])

  if (error) {
    return (
      <div className="app-error">
        <p>{error}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="app-loading">
        <div className="app-loading__pulse" aria-hidden="true" />
        <p>Loading scout report…</p>
      </div>
    )
  }

  return (
    <AppShell active={active} onNavigate={setActive}>
      {active === 'overview' ? (
        <Overview player={data.player} onNavigate={setActive} />
      ) : null}
      {active === 'career' ? (
        <Career seasons={data.seasons} statLabels={data.statLabels} />
      ) : null}
      {active === 'attributes' ? (
        <Attributes attributes={data.attributes} />
      ) : null}
      {active === 'matches' ? (
        <MatchHistory
          matches={matches}
          loading={projectsLoading}
          error={projectsError}
        />
      ) : null}
      {active === 'transfer' ? (
        <Transfer transfer={data.transfer} />
      ) : null}
    </AppShell>
  )
}
