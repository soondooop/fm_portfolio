import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPortfolio } from '../api/portfolio'
import { fetchProjects } from '../api/projects'
import type { MatchItem } from '../types/projects'
import type { PortfolioData } from '../types/portfolio'
import PhaserGame from './PhaserGame'
import VirtualPad from './VirtualPad'
import DotModal from './DotModal'
import TalkDialog from './TalkDialog'
import BreakoutGame from './BreakoutGame'
import PlayIntro from './PlayIntro'
import Minimap from './Minimap'
import ProjectDetail from './ProjectDetail'
import ProjectSigns from './ProjectSigns'
import type { ProjectSignsHandle } from './ProjectSigns'
import {
  PLAY_SECTIONS,
  type PlayInputState,
  type PlayMinigamePayload,
  type PlayOpenPayload,
  type PlayProjectBooth,
  type PlayProjectPayload,
  type PlaySection,
  type PlayTalkPayload,
  type PlayVisitPayload,
  type PlayWorldState,
} from './events'
import './play.css'

export default function PlayApp() {
  const [data, setData] = useState<PortfolioData | null>(null)
  const [projects, setProjects] = useState<MatchItem[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [projectsError, setProjectsError] = useState('')
  const [error, setError] = useState('')
  const [started, setStarted] = useState(false)
  const [section, setSection] = useState<PlaySection | null>(null)
  const [projectKey, setProjectKey] = useState<string | null>(null)
  const [talk, setTalk] = useState<PlayTalkPayload | null>(null)
  const [talkLine, setTalkLine] = useState(0)
  const [minigame, setMinigame] = useState<PlayMinigamePayload['id'] | null>(
    null,
  )
  const [visited, setVisited] = useState<PlaySection[]>([])
  const [townComplete, setTownComplete] = useState(false)
  const [showCompleteBanner, setShowCompleteBanner] = useState(false)
  const [worldState, setWorldState] = useState<PlayWorldState | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const stickRef = useRef<PlayInputState>({ x: 0, y: 0 })
  const signsRef = useRef<ProjectSignsHandle | null>(null)

  const booths: PlayProjectBooth[] = useMemo(
    () =>
      [...projects]
        .sort((a, b) => Number(b.featured) - Number(a.featured))
        .map((p) => ({
          key: p.key,
          title: p.title,
          image: p.image,
        })),
    [projects],
  )

  const activeProject = useMemo(
    () => projects.find((p) => p.key === projectKey) ?? null,
    [projects, projectKey],
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = () => setReducedMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    let alive = true
    fetchPortfolio()
      .then((json) => {
        if (alive) setData(json)
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
    if (!section && !talk && !minigame && !projectKey) return undefined
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (minigame) closeMinigame()
        else if (talk) closeTalk()
        else if (projectKey) closeProject()
        else closeOverlay()
      } else if (talk && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        advanceTalk()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [section, talk, talkLine, minigame, projectKey])

  const closeOverlay = () => {
    setSection(null)
    window.dispatchEvent(new CustomEvent('play:close-overlay'))
  }

  const closeTalk = () => {
    setTalk(null)
    setTalkLine(0)
    window.dispatchEvent(new CustomEvent('play:close-talk'))
  }

  const closeMinigame = () => {
    setMinigame(null)
    window.dispatchEvent(new CustomEvent('play:close-minigame'))
  }

  const closeProject = () => {
    setProjectKey(null)
    window.dispatchEvent(new CustomEvent('play:close-overlay'))
  }

  const advanceTalk = () => {
    if (!talk) return
    if (talkLine >= talk.lines.length - 1) {
      closeTalk()
      return
    }
    setTalkLine((n) => n + 1)
  }

  const onOpen = (payload: PlayOpenPayload) => {
    setTalk(null)
    setMinigame(null)
    setProjectKey(null)
    setSection(payload.section)
  }

  const onTalk = (payload: PlayTalkPayload) => {
    setSection(null)
    setMinigame(null)
    setProjectKey(null)
    setTalk(payload)
    setTalkLine(0)
  }

  const onMinigame = (payload: PlayMinigamePayload) => {
    setSection(null)
    setTalk(null)
    setProjectKey(null)
    setMinigame(payload.id)
  }

  const onProject = (payload: PlayProjectPayload) => {
    setSection(null)
    setTalk(null)
    setMinigame(null)
    setProjectKey(payload.key)
  }

  const onVisit = (payload: PlayVisitPayload) => {
    setVisited(payload.visited)
    if (payload.complete && !townComplete) {
      setTownComplete(true)
      setShowCompleteBanner(true)
      window.setTimeout(() => setShowCompleteBanner(false), 4200)
    }
  }

  if (error) {
    return (
      <div className="play-shell play-shell--error">
        <p>{error}</p>
        <Link to="/overview">클래식 포트폴리오로</Link>
      </div>
    )
  }

  if (reducedMotion) {
    return (
      <div className="play-shell play-shell--reduced">
        <h1>Play mode</h1>
        <p>모션 감소 설정이 켜져 있어 게임 맵 대신 클래식 UI를 권장합니다.</p>
        <Link className="play-skip" to="/overview">
          Skip to classic portfolio
        </Link>
      </div>
    )
  }

  const ready = Boolean(data) && !projectsLoading

  return (
    <div className="play-shell play-shell--gbc">
      {!started ? (
        <PlayIntro onPlay={() => setStarted(true)} ready={ready} />
      ) : null}

      {started ? (
        <>
          <header className="play-topbar">
            <div className="play-topbar__brand">
              <strong>SOONDOOOP TOWN</strong>
            </div>
            <div className="play-topbar__right">
              <span className="town-log" title="탐험한 구역 수">
                Town Log {visited.length}/{PLAY_SECTIONS.length}
              </span>
              <Link className="play-skip" to="/overview">
                Skip to classic
              </Link>
            </div>
          </header>

          <div className="play-stage">
            <div className="play-canvas-wrap">
              <PhaserGame
                onOpen={onOpen}
                onTalk={onTalk}
                onVisit={onVisit}
                onMinigame={onMinigame}
                onProject={onProject}
                onState={setWorldState}
                onBooths={(next) => signsRef.current?.apply(next)}
                projects={booths}
                stickRef={stickRef}
              />
              <ProjectSigns ref={signsRef} items={booths} />
            </div>
            <Minimap state={worldState} visited={visited} />
            <VirtualPad stickRef={stickRef} />
          </div>

          {showCompleteBanner ? (
            <div className="town-complete" role="status">
              Town Log 완성! 주요 구역을 모두 둘러봤어.
            </div>
          ) : null}

          {section && data ? (
            <DotModal
              section={section}
              data={data}
              projects={projects}
              projectsLoading={projectsLoading}
              projectsError={projectsError}
              onClose={closeOverlay}
            />
          ) : null}

          {activeProject ? (
            <ProjectDetail project={activeProject} onClose={closeProject} />
          ) : null}

          {talk ? (
            <TalkDialog
              talk={talk}
              lineIndex={talkLine}
              onNext={advanceTalk}
              onClose={closeTalk}
            />
          ) : null}

          {minigame === 'breakout' ? (
            <BreakoutGame onClose={closeMinigame} />
          ) : null}
        </>
      ) : null}
    </div>
  )
}
