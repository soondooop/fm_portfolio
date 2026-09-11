import { useEffect, useRef, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { fetchPortfolio } from '../api/portfolio'
import { fetchProjects } from '../api/projects'
import AppShell from '../components/AppShell'
import BootLoader from '../components/BootLoader'
import Overview from '../components/Overview'
import Experience from '../components/Experience'
import Skillset from '../components/Skillset'
import ProjectsList from '../components/ProjectsList'
import Contact from '../components/Contact'
import type { MatchItem } from '../types/projects'
import type { PortfolioData } from '../types/portfolio'

const FADE_MS = 700

export default function PortfolioApp() {
  const [data, setData] = useState<PortfolioData | null>(null)
  const [projects, setProjects] = useState<MatchItem[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [projectsError, setProjectsError] = useState('')
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const [dataReady, setDataReady] = useState(false)
  const [fading, setFading] = useState(false)
  const [bootDone, setBootDone] = useState(false)
  const progressRef = useRef(0)

  useEffect(() => {
    let alive = true

    fetchPortfolio()
      .then((json) => {
        if (!alive) return
        setData(json)
        setDataReady(true)
      })
      .catch(() => {
        if (alive) setError('프로필 데이터를 불러오지 못했습니다.')
      })

    fetchProjects()
      .then((list) => {
        if (!alive) return
        setProjects(list)
        setProjectsError('')
      })
      .catch(() => {
        if (!alive) return
        setProjectsError('프로젝트 리스트를 불러오지 못했습니다.')
        setProjects([])
      })
      .finally(() => {
        if (alive) setProjectsLoading(false)
      })

    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (bootDone || error) return undefined

    let frame = 0
    const tick = () => {
      const current = progressRef.current
      const target = dataReady ? 100 : 88
      const step = dataReady ? 2.4 : 0.55 + Math.random() * 0.9
      const next = Math.min(target, current + step)
      progressRef.current = next
      setProgress(next)

      if (next >= 100 && dataReady) {
        setFading(true)
        window.setTimeout(() => setBootDone(true), FADE_MS)
        return
      }

      frame = window.requestAnimationFrame(tick)
    }

    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [dataReady, bootDone, error])

  if (error) {
    return (
      <div className="app-error">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <>
      {!bootDone ? (
        <BootLoader progress={progress} fading={fading} />
      ) : null}

      {data ? (
        <div className={`boot-content ${bootDone ? 'is-visible' : ''}`}>
          <AppShell profile={data.profile}>
            <Routes>
              <Route index element={<Navigate to="overview" replace />} />
              <Route
                path="overview"
                element={<Overview profile={data.profile} />}
              />
              <Route
                path="experience"
                element={
                  <Experience
                    experience={data.experience}
                    skillLabels={data.skillLabels}
                  />
                }
              />
              <Route
                path="skills"
                element={<Skillset attributes={data.attributes} />}
              />
              <Route
                path="projects"
                element={
                  <ProjectsList
                    matches={projects}
                    loading={projectsLoading}
                    error={projectsError}
                  />
                }
              />
              <Route
                path="contact"
                element={<Contact contact={data.contact} />}
              />
              <Route path="*" element={<Navigate to="overview" replace />} />
            </Routes>
          </AppShell>
        </div>
      ) : null}
    </>
  )
}
