import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchPortfolio } from '../api/portfolio'
import { fetchProjects } from '../api/projects'
import type { MatchItem } from '../types/projects'
import type { PortfolioData } from '../types/portfolio'
import ProjectDetail from '../play/ProjectDetail'
import ContactMailForm from './ContactMailForm'
import ExitChoice from './ExitChoice'
import MuseumGame from './MuseumGame'
import type { LookStickState, MuseumSessionApi, StickState } from './MuseumGame'
import MuseumMinimap from './MuseumMinimap'
import MuseumPad from './MuseumPad'
import type { MuseumState } from './createMuseum'
import { CONTACT_STAFF_LINE, STAFF_LINES } from './staff'
import StaffTalk from './StaffTalk'
import { createMuseumAudio } from './museumAudio'
import '../play/play.css'
import './museum.css'

export default function MuseumApp() {
  const navigate = useNavigate()
  const [data, setData] = useState<PortfolioData | null>(null)
  const [projects, setProjects] = useState<MatchItem[]>([])
  const [error, setError] = useState('')
  const [worldState, setWorldState] = useState<MuseumState | null>(null)
  const [projectKey, setProjectKey] = useState<string | null>(null)
  const [hintKey, setHintKey] = useState<string | null>(null)
  const [staffTalk, setStaffTalk] = useState(false)
  const [staffLine, setStaffLine] = useState(0)
  const [contactTalk, setContactTalk] = useState(false)
  const [contactForm, setContactForm] = useState(false)
  const [exitOpen, setExitOpen] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)
  const [musicOn, setMusicOn] = useState(true)
  const stickRef = useRef<StickState>({ x: 0, y: 0 })
  const lookStickRef = useRef<LookStickState>({ x: 0, y: 0 })
  const sessionApiRef = useRef<MuseumSessionApi | null>(null)
  const ambientRef = useRef<ReturnType<typeof createMuseumAudio> | null>(null)
  const lastNoticeRef = useRef<string | null>(null)

  const playSfx = (kind: 'notice' | 'interact' | 'ui') => {
    ambientRef.current?.playSfx(kind)
  }

  const startStaffTalk = () => {
    playSfx('interact')
    setStaffLine(0)
    setStaffTalk(true)
    sessionApiRef.current?.setStaffAlert(false)
  }

  const closeStaffTalk = () => {
    playSfx('ui')
    setStaffTalk(false)
    sessionApiRef.current?.setStaffAlert(true)
  }

  const startContactHire = () => {
    playSfx('interact')
    setContactTalk(true)
    setContactForm(false)
    sessionApiRef.current?.setStaffAlert(false)
  }

  const closeContactHire = () => {
    playSfx('ui')
    setContactTalk(false)
    setContactForm(false)
    sessionApiRef.current?.setStaffAlert(true)
  }

  const openContactForm = () => {
    playSfx('interact')
    setContactTalk(false)
    setContactForm(true)
  }

  const openProject = (key: string) => {
    playSfx('interact')
    setProjectKey(key)
  }
  const closeProject = () => {
    playSfx('ui')
    setProjectKey(null)
  }
  const openExit = () => {
    playSfx('interact')
    setExitOpen(true)
  }
  const closeExit = () => {
    playSfx('ui')
    setExitOpen(false)
  }
  const toggleMap = () => {
    playSfx('ui')
    setMapOpen((v) => !v)
  }
  const closeMap = () => {
    playSfx('ui')
    setMapOpen(false)
  }
  const openContactLink = (href: string) => {
    if (!href) return
    playSfx('interact')
    window.open(href, '_blank', 'noopener,noreferrer')
  }

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
        if (alive) setProjects(list)
      })
      .catch(() => {
        if (alive) setProjects([])
      })
    return () => {
      alive = false
    }
  }, [])

  // Museum audio — unlock on first gesture
  useEffect(() => {
    const audio = createMuseumAudio()
    ambientRef.current = audio
    let unlocked = false
    const unlock = () => {
      if (unlocked) return
      unlocked = true
      audio.unlock()
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
      audio.dispose()
      ambientRef.current = null
    }
  }, [])

  useEffect(() => {
    ambientRef.current?.setMusicMuted(!musicOn)
  }, [musicOn])

  const toggleMusic = () => {
    setMusicOn((v) => {
      const next = !v
      ambientRef.current?.unlock()
      ambientRef.current?.setMusicMuted(!next)
      playSfx('ui')
      return next
    })
  }

  const experience = useMemo(() => data?.experience ?? [], [data?.experience])
  const skillLabels = data?.skillLabels ?? null
  const contact = data?.contact ?? null

  const activeProject = useMemo(
    () => projects.find((p) => p.key === projectKey) ?? null,
    [projects, projectKey],
  )

  const hintProject = useMemo(
    () => projects.find((p) => p.key === hintKey) ?? null,
    [projects, hintKey],
  )

  const hireOpen = contactTalk || contactForm
  const busy = Boolean(projectKey || staffTalk || hireOpen || exitOpen)

  // Soft chime when a new interaction target appears
  useEffect(() => {
    if (busy) return
    let key: string | null = null
    if (worldState?.nearStaff) key = 'staff'
    else if (worldState?.nearContactStaff) key = 'contact-staff'
    else if (worldState?.nearContactLink)
      key = `link:${worldState.nearContactLink.label}`
    else if (hintKey) key = `project:${hintKey}`
    else if (worldState?.nearExit) key = 'exit'
    if (key && key !== lastNoticeRef.current) {
      playSfx('notice')
    }
    lastNoticeRef.current = key
  }, [
    busy,
    hintKey,
    worldState?.nearContactLink,
    worldState?.nearContactStaff,
    worldState?.nearExit,
    worldState?.nearStaff,
  ])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (exitOpen) {
        if (e.code === 'Escape') closeExit()
        return
      }
      if (contactForm) {
        if (e.code === 'Escape') closeContactHire()
        return
      }
      if (contactTalk) {
        if (e.code === 'Escape') {
          closeContactHire()
          return
        }
        if (e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault()
          openContactForm()
        }
        return
      }
      if (staffTalk) {
        if (e.code === 'Escape') {
          closeStaffTalk()
          return
        }
        if (e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault()
          if (staffLine >= STAFF_LINES.length - 1) closeStaffTalk()
          else setStaffLine((n) => n + 1)
        }
        return
      }
      if (e.code === 'Escape' && projectKey) {
        closeProject()
        return
      }
      if (mapOpen) {
        if (e.code === 'Escape' || e.code === 'KeyM') {
          e.preventDefault()
          closeMap()
        }
        return
      }
      if (e.code === 'KeyM' && !busy) {
        e.preventDefault()
        toggleMap()
        return
      }
      if (e.code !== 'KeyE' && e.code !== 'Enter') return
      if (worldState?.nearStaff && !busy) {
        startStaffTalk()
        return
      }
      if (worldState?.nearContactStaff && !busy) {
        startContactHire()
        return
      }
      if (worldState?.nearContactLink && !busy) {
        openContactLink(worldState.nearContactLink.href)
        return
      }
      if (hintKey && !busy) {
        openProject(hintKey)
        return
      }
      if (worldState?.nearExit && !busy) {
        openExit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [
    busy,
    contactForm,
    contactTalk,
    exitOpen,
    hintKey,
    mapOpen,
    projectKey,
    staffLine,
    staffTalk,
    worldState?.nearContactLink,
    worldState?.nearContactStaff,
    worldState?.nearExit,
    worldState?.nearStaff,
  ])

  if (error) {
    return (
      <div className="museum-shell museum-shell--error">
        <p>{error}</p>
        <Link to="/overview">클래식 포트폴리오로</Link>
      </div>
    )
  }

  const uiOpen = Boolean(
    activeProject || staffTalk || hireOpen || exitOpen || mapOpen,
  )

  return (
    <div className={`museum-shell${uiOpen ? ' museum-shell--ui-open' : ''}`}>
      <header className="museum-topbar">
        <div className="museum-topbar__brand">
          <strong>SOONDOOOP Museum</strong>
          <span>
            WASD 이동 · 좌클릭 드래그로 시선 · SHIFT 달리기 · SPACE 점프 · E
            상호작용 · M 지도
          </span>
        </div>
        <div className="museum-topbar__links">
          <button
            type="button"
            className="museum-topbar__music"
            onClick={toggleMusic}
            aria-pressed={musicOn}
            title={musicOn ? '배경음악 끄기' : '배경음악 켜기'}
          >
            {musicOn ? 'Music On' : 'Music Off'}
          </button>
          <Link to="/overview">Classic</Link>
          <Link to="/play">Town</Link>
        </div>
      </header>

      <div className="museum-stage">
        <MuseumGame
          profile={data?.profile ?? null}
          attributes={data?.attributes ?? null}
          projects={projects}
          experience={experience}
          skillLabels={skillLabels}
          contact={contact}
          stickRef={stickRef}
          lookStickRef={lookStickRef}
          sessionApiRef={sessionApiRef}
          uiOpen={uiOpen}
          onState={setWorldState}
          onProjectNear={setHintKey}
        />
        <MuseumMinimap
          state={worldState}
          expanded={mapOpen}
          onToggle={toggleMap}
          onClose={closeMap}
        />
        <MuseumPad stickRef={stickRef} lookStickRef={lookStickRef} />

        {worldState?.nearStaff && !busy && !hireOpen && !exitOpen ? (
          <div className="museum-hint" role="status">
            <strong>안내 직원</strong>
            <span>E · 대화하기</span>
            <button
              type="button"
              className="museum-hint__btn"
              onClick={startStaffTalk}
            >
              Talk
            </button>
          </div>
        ) : null}

        {worldState?.nearContactStaff &&
        !worldState?.nearStaff &&
        !busy &&
        !exitOpen ? (
          <div className="museum-hint" role="status">
            <strong>접수 직원</strong>
            <span>E · 협업 문의</span>
            <button
              type="button"
              className="museum-hint__btn"
              onClick={startContactHire}
            >
              Talk
            </button>
          </div>
        ) : null}

        {worldState?.nearContactLink &&
        !worldState?.nearContactStaff &&
        !worldState?.nearStaff &&
        !busy &&
        !hireOpen &&
        !exitOpen ? (
          <div className="museum-hint" role="status">
            <strong>{worldState.nearContactLink.label}</strong>
            <span>E · 링크 열기</span>
            <button
              type="button"
              className="museum-hint__btn"
              onClick={() =>
                openContactLink(worldState.nearContactLink!.href)
              }
            >
              Open
            </button>
          </div>
        ) : null}

        {hintProject &&
        !busy &&
        !hireOpen &&
        !exitOpen &&
        !worldState?.nearStaff &&
        !worldState?.nearContactStaff &&
        !worldState?.nearContactLink ? (
          <div className="museum-hint" role="status">
            <strong>{hintProject.title}</strong>
            <span>E · 상세 보기</span>
            <button
              type="button"
              className="museum-hint__btn"
              onClick={() => openProject(hintProject.key)}
            >
              View
            </button>
          </div>
        ) : null}

        {worldState?.nearExit &&
        !busy &&
        !hireOpen &&
        !worldState?.nearStaff &&
        !worldState?.nearContactLink ? (
          <div className="museum-hint museum-hint--exit" role="status">
            <strong>Exit</strong>
            <span>E · 나가기</span>
            <button
              type="button"
              className="museum-hint__btn"
              onClick={openExit}
            >
              Exit
            </button>
          </div>
        ) : null}
      </div>

      {staffTalk ? (
        <StaffTalk
          lines={STAFF_LINES}
          lineIndex={staffLine}
          onNext={() => setStaffLine((n) => n + 1)}
          onClose={closeStaffTalk}
        />
      ) : null}

      {contactTalk ? (
        <StaffTalk
          lines={[CONTACT_STAFF_LINE]}
          lineIndex={0}
          speaker="접수 직원"
          doneLabel="문의하기"
          onNext={openContactForm}
          onClose={openContactForm}
        />
      ) : null}

      {contactForm && contact ? (
        <ContactMailForm
          contact={contact}
          greeting={CONTACT_STAFF_LINE}
          onClose={closeContactHire}
        />
      ) : null}

      {exitOpen ? (
        <ExitChoice
          onPick={(href) => navigate(href)}
          onClose={closeExit}
        />
      ) : null}

      {activeProject ? (
        <ProjectDetail project={activeProject} onClose={closeProject} />
      ) : null}
    </div>
  )
}
