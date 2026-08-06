import { useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import type {
  AttributesData,
  CareerPeriod,
  ContactData,
  Profile,
  SkillKey,
  SkillLabel,
} from '../types/portfolio'
import type { MatchItem } from '../types/projects'
import {
  createMuseumSession,
  type MuseumInput,
  type MuseumSession,
  type MuseumState,
} from './createMuseum'

export interface StickState {
  x: number
  y: number
}

export interface LookStickState {
  x: number
  y: number
}

export interface MuseumSessionApi {
  setStaffAlert: (visible: boolean) => void
}

interface MuseumGameProps {
  profile: Profile | null
  attributes: AttributesData | null
  projects: MatchItem[]
  experience: CareerPeriod[]
  skillLabels: Record<SkillKey, SkillLabel> | null
  contact: ContactData | null
  stickRef: MutableRefObject<StickState>
  lookStickRef: MutableRefObject<LookStickState>
  sessionApiRef?: MutableRefObject<MuseumSessionApi | null>
  /** Pause look / movement while a modal is open */
  uiOpen?: boolean
  onState: (state: MuseumState) => void
  onProjectNear: (key: string | null) => void
}

export default function MuseumGame({
  profile,
  attributes,
  projects,
  experience,
  skillLabels,
  contact,
  stickRef,
  lookStickRef,
  sessionApiRef,
  uiOpen = false,
  onState,
  onProjectNear,
}: MuseumGameProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const sessionRef = useRef<MuseumSession | null>(null)
  const keysRef = useRef(new Set<string>())
  const jumpRef = useRef(false)
  const lookDownRef = useRef(false)
  const uiOpenRef = useRef(uiOpen)
  const onStateRef = useRef(onState)
  const onProjectRef = useRef(onProjectNear)
  onStateRef.current = onState
  onProjectRef.current = onProjectNear
  uiOpenRef.current = uiOpen

  useEffect(() => {
    const host = hostRef.current
    if (!host || sessionRef.current) return undefined

    const session = createMuseumSession(host)
    sessionRef.current = session
    if (sessionApiRef) {
      sessionApiRef.current = {
        setStaffAlert: (visible) => session.setStaffAlert(visible),
      }
    }

    const canvas = host.querySelector('canvas')
    if (!canvas) {
      session.dispose()
      sessionRef.current = null
      return undefined
    }

    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.code)
      if (e.code === 'Space' && !uiOpenRef.current) {
        e.preventDefault()
        jumpRef.current = true
      }
    }
    const onKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.code)

    const endLook = () => {
      lookDownRef.current = false
      canvas.style.cursor = 'default'
      if (document.pointerLockElement === canvas) {
        document.exitPointerLock()
      }
    }

    const onPointerDown = (e: PointerEvent) => {
      if (uiOpenRef.current) return
      if (e.button !== 0) return
      lookDownRef.current = true
      canvas.style.cursor = 'none'
      if (document.pointerLockElement !== canvas) {
        void canvas.requestPointerLock()
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      if (e.button !== 0 && e.type !== 'pointercancel') return
      endLook()
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!lookDownRef.current || uiOpenRef.current) return
      session.applyLook(e.movementX, e.movementY)
    }

    const onLockChange = () => {
      if (document.pointerLockElement !== canvas && lookDownRef.current) {
        lookDownRef.current = false
        canvas.style.cursor = 'default'
      }
    }

    const onBlur = () => endLook()

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    window.addEventListener('mousemove', onMouseMove)
    document.addEventListener('pointerlockchange', onLockChange)
    canvas.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
    canvas.style.cursor = 'default'

    let last = performance.now()
    let raf = 0
    let lastNear: string | null = null
    let lastExit: string | null = null
    let lastStaff = false
    let lastContactStaff = false
    let lastContactLink: string | null = null
    let lastHudAt = 0
    let lastHudX = 0
    let lastHudZ = 0

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      const paused = uiOpenRef.current
      if (paused && lookDownRef.current) endLook()

      const keys = keysRef.current
      let kx = 0
      let kz = 0
      if (!paused) {
        kx = (keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0)
        kz = (keys.has('KeyW') ? 1 : 0) - (keys.has('KeyS') ? 1 : 0)
        if (keys.has('ArrowRight')) kx += 1
        if (keys.has('ArrowLeft')) kx -= 1
        if (keys.has('ArrowUp')) kz += 1
        if (keys.has('ArrowDown')) kz -= 1

        const stick = stickRef.current
        if (Math.abs(stick.x) + Math.abs(stick.y) > 0.05) {
          kx = stick.x
          kz = -stick.y
        }

        const lookStick = lookStickRef.current
        if (Math.abs(lookStick.x) + Math.abs(lookStick.y) > 0.05) {
          session.applyLook(lookStick.x * 14, lookStick.y * 14)
        }
      }

      const input: MuseumInput = {
        moveX: kx,
        moveZ: kz,
        sprint: !paused && (keys.has('ShiftLeft') || keys.has('ShiftRight')),
        jump: !paused && jumpRef.current,
      }
      jumpRef.current = false

      session.setInput(input)
      const st = session.tick(dt)

      const moved =
        Math.hypot(st.x - lastHudX, st.z - lastHudZ) > 0.35 ||
        now - lastHudAt > 100
      const linkKey = st.nearContactLink
        ? `${st.nearContactLink.label}|${st.nearContactLink.href}`
        : null
      const interactionChanged =
        st.nearProjectKey !== lastNear ||
        st.nearExit !== lastExit ||
        st.nearStaff !== lastStaff ||
        st.nearContactStaff !== lastContactStaff ||
        linkKey !== lastContactLink

      if (moved || interactionChanged) {
        lastHudAt = now
        lastHudX = st.x
        lastHudZ = st.z
        lastExit = st.nearExit
        lastStaff = st.nearStaff
        lastContactStaff = st.nearContactStaff
        lastContactLink = linkKey
        if (st.nearProjectKey !== lastNear) {
          lastNear = st.nearProjectKey
          onProjectRef.current(st.nearProjectKey)
        } else {
          lastNear = st.nearProjectKey
        }
        onStateRef.current(st)
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      endLook()
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('pointerlockchange', onLockChange)
      canvas.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
      session.dispose()
      sessionRef.current = null
      if (sessionApiRef) sessionApiRef.current = null
    }
  }, [lookStickRef, sessionApiRef, stickRef])

  useEffect(() => {
    if (profile) sessionRef.current?.setProfile(profile)
  }, [profile])

  useEffect(() => {
    sessionRef.current?.setAttributes(attributes)
  }, [attributes])

  useEffect(() => {
    sessionRef.current?.setProjects(projects)
  }, [projects])

  useEffect(() => {
    sessionRef.current?.setExperience(experience, skillLabels)
  }, [experience, skillLabels])

  useEffect(() => {
    sessionRef.current?.setContact(contact)
  }, [contact])

  return <div className="museum-canvas" ref={hostRef} />
}
