import { useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import type Phaser from 'phaser'
import {
  PLAY_EVENT,
  type PlayBoothScreen,
  type PlayInputState,
  type PlayMinigamePayload,
  type PlayOpenPayload,
  type PlayProjectBooth,
  type PlayProjectPayload,
  type PlayTalkPayload,
  type PlayVisitPayload,
  type PlayWorldState,
} from './events'

interface PhaserGameProps {
  onOpen: (payload: PlayOpenPayload) => void
  onTalk: (payload: PlayTalkPayload) => void
  onVisit: (payload: PlayVisitPayload) => void
  onMinigame: (payload: PlayMinigamePayload) => void
  onProject: (payload: PlayProjectPayload) => void
  onState: (payload: PlayWorldState) => void
  onBooths: (booths: PlayBoothScreen[]) => void
  projects: PlayProjectBooth[]
  stickRef: MutableRefObject<PlayInputState>
}

export default function PhaserGame({
  onOpen,
  onTalk,
  onVisit,
  onMinigame,
  onProject,
  onState,
  onBooths,
  projects,
  stickRef,
}: PhaserGameProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const creatingRef = useRef(false)
  const onOpenRef = useRef(onOpen)
  const onTalkRef = useRef(onTalk)
  const onVisitRef = useRef(onVisit)
  const onMinigameRef = useRef(onMinigame)
  const onProjectRef = useRef(onProject)
  const onStateRef = useRef(onState)
  const onBoothsRef = useRef(onBooths)
  onOpenRef.current = onOpen
  onTalkRef.current = onTalk
  onVisitRef.current = onVisit
  onMinigameRef.current = onMinigame
  onProjectRef.current = onProject
  onStateRef.current = onState
  onBoothsRef.current = onBooths

  useEffect(() => {
    const host = hostRef.current
    if (!host || gameRef.current || creatingRef.current) return undefined

    let cancelled = false
    creatingRef.current = true
    let resizeObserver: ResizeObserver | null = null

    const refreshScale = () => {
      gameRef.current?.scale.refresh()
    }

    void import('./createGame').then(({ createPlayGame }) => {
      if (cancelled || !hostRef.current || gameRef.current) {
        creatingRef.current = false
        return
      }

      const game = createPlayGame(hostRef.current)
      gameRef.current = game
      creatingRef.current = false

      game.events.on(PLAY_EVENT.OPEN, (payload: PlayOpenPayload) => {
        onOpenRef.current(payload)
      })
      game.events.on(PLAY_EVENT.TALK, (payload: PlayTalkPayload) => {
        onTalkRef.current(payload)
      })
      game.events.on(PLAY_EVENT.VISIT, (payload: PlayVisitPayload) => {
        onVisitRef.current(payload)
      })
      game.events.on(PLAY_EVENT.MINIGAME, (payload: PlayMinigamePayload) => {
        onMinigameRef.current(payload)
      })
      game.events.on(PLAY_EVENT.PROJECT, (payload: PlayProjectPayload) => {
        onProjectRef.current(payload)
      })
      game.events.on(PLAY_EVENT.STATE, (payload: PlayWorldState) => {
        onStateRef.current(payload)
      })
      game.events.on(PLAY_EVENT.BOOTHS, (payload: PlayBoothScreen[]) => {
        onBoothsRef.current(payload)
      })

      if (projects.length) {
        game.registry.set('projects', projects)
        game.events.emit(PLAY_EVENT.PROJECTS_SYNC, projects)
      }

      resizeObserver = new ResizeObserver(() => {
        refreshScale()
      })
      resizeObserver.observe(hostRef.current)
      window.addEventListener('resize', refreshScale)
      requestAnimationFrame(refreshScale)
    })

    const onCloseOverlay = () => {
      gameRef.current?.events.emit(PLAY_EVENT.CLOSE)
    }
    const onCloseTalk = () => {
      gameRef.current?.events.emit(PLAY_EVENT.TALK_CLOSE)
    }
    const onCloseMinigame = () => {
      gameRef.current?.events.emit(PLAY_EVENT.MINIGAME_CLOSE)
    }
    window.addEventListener('play:close-overlay', onCloseOverlay)
    window.addEventListener('play:close-talk', onCloseTalk)
    window.addEventListener('play:close-minigame', onCloseMinigame)

    const stickSync = window.setInterval(() => {
      gameRef.current?.registry.set('stick', { ...stickRef.current })
    }, 50)

    return () => {
      cancelled = true
      creatingRef.current = false
      window.clearInterval(stickSync)
      window.removeEventListener('play:close-overlay', onCloseOverlay)
      window.removeEventListener('play:close-talk', onCloseTalk)
      window.removeEventListener('play:close-minigame', onCloseMinigame)
      window.removeEventListener('resize', refreshScale)
      resizeObserver?.disconnect()
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
    // projects synced in separate effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stickRef])

  useEffect(() => {
    const game = gameRef.current
    if (!game || !projects.length) return
    game.registry.set('projects', projects)
    game.events.emit(PLAY_EVENT.PROJECTS_SYNC, projects)
  }, [projects])

  return <div className="play-canvas-host" ref={hostRef} />
}
