import { useEffect, useRef, useState } from 'react'

interface BreakoutGameProps {
  onClose: () => void
}

const W = 360
const H = 420
const PADDLE_W = 64
const PADDLE_H = 10
const BALL_R = 5
const BRICK_COLS = 8
const BRICK_ROWS = 5
const BRICK_W = 38
const BRICK_H = 14
const BRICK_GAP = 4
const BRICK_TOP = 56
const LIVES_MAX = 3

const BRICK_COLORS = ['#ef7b6a', '#f0c36a', '#7dd3a0', '#6eb0ff', '#8ec5ff']

type Phase = 'ready' | 'playing' | 'won' | 'lost'

export default function BreakoutGame({ onClose }: BreakoutGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(LIVES_MAX)
  const [phase, setPhase] = useState<Phase>('ready')
  const phaseRef = useRef<Phase>('ready')
  const scoreRef = useRef(0)
  const livesRef = useRef(LIVES_MAX)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    const bricks: { x: number; y: number; alive: boolean; color: string }[] =
      []
    const marginX =
      (W - BRICK_COLS * BRICK_W - (BRICK_COLS - 1) * BRICK_GAP) / 2
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        bricks.push({
          x: marginX + c * (BRICK_W + BRICK_GAP),
          y: BRICK_TOP + r * (BRICK_H + BRICK_GAP),
          alive: true,
          color: BRICK_COLORS[r % BRICK_COLORS.length],
        })
      }
    }

    let paddleX = (W - PADDLE_W) / 2
    let ballX = W / 2
    let ballY = H - 48
    let vx = 0
    let vy = 0
    let pointerX: number | null = null
    const keys = { left: false, right: false }
    let raf = 0
    let last = performance.now()

    const setPhaseLocal = (p: Phase) => {
      phaseRef.current = p
      setPhase(p)
    }

    const resetBall = (serve: boolean) => {
      ballX = paddleX + PADDLE_W / 2
      ballY = H - 48
      if (serve) {
        vx = (Math.random() > 0.5 ? 1 : -1) * 160
        vy = -210
        setPhaseLocal('playing')
      } else {
        vx = 0
        vy = 0
        setPhaseLocal('ready')
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.left = true
        e.preventDefault()
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keys.right = true
        e.preventDefault()
      }
      if (
        (e.key === ' ' || e.key === 'Enter') &&
        phaseRef.current === 'ready'
      ) {
        e.preventDefault()
        resetBall(true)
      }
      if (
        (e.key === ' ' || e.key === 'Enter') &&
        (phaseRef.current === 'won' || phaseRef.current === 'lost')
      ) {
        e.preventDefault()
        bricks.forEach((b) => {
          b.alive = true
        })
        scoreRef.current = 0
        livesRef.current = LIVES_MAX
        setScore(0)
        setLives(LIVES_MAX)
        paddleX = (W - PADDLE_W) / 2
        resetBall(false)
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.left = false
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keys.right = false
      }
    }

    const pointerPos = (clientX: number) => {
      const rect = canvas.getBoundingClientRect()
      return ((clientX - rect.left) / rect.width) * W
    }
    const onPointerMove = (e: PointerEvent) => {
      pointerX = pointerPos(e.clientX)
    }
    const onPointerDown = (e: PointerEvent) => {
      pointerX = pointerPos(e.clientX)
      if (phaseRef.current === 'ready') resetBall(true)
      if (phaseRef.current === 'won' || phaseRef.current === 'lost') {
        bricks.forEach((b) => {
          b.alive = true
        })
        scoreRef.current = 0
        livesRef.current = LIVES_MAX
        setScore(0)
        setLives(LIVES_MAX)
        paddleX = (W - PADDLE_W) / 2
        resetBall(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerdown', onPointerDown)

    const tick = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000)
      last = now

      const speed = 320
      if (pointerX != null) {
        paddleX = pointerX - PADDLE_W / 2
      } else {
        if (keys.left) paddleX -= speed * dt
        if (keys.right) paddleX += speed * dt
      }
      paddleX = Math.max(8, Math.min(W - PADDLE_W - 8, paddleX))

      if (phaseRef.current === 'ready') {
        ballX = paddleX + PADDLE_W / 2
        ballY = H - 48
      }

      if (phaseRef.current === 'playing') {
        ballX += vx * dt
        ballY += vy * dt

        if (ballX < BALL_R + 4) {
          ballX = BALL_R + 4
          vx = Math.abs(vx)
        } else if (ballX > W - BALL_R - 4) {
          ballX = W - BALL_R - 4
          vx = -Math.abs(vx)
        }
        if (ballY < BALL_R + 4) {
          ballY = BALL_R + 4
          vy = Math.abs(vy)
        }

        const py = H - 28
        if (
          vy > 0 &&
          ballY + BALL_R >= py &&
          ballY - BALL_R <= py + PADDLE_H &&
          ballX >= paddleX - 2 &&
          ballX <= paddleX + PADDLE_W + 2
        ) {
          const hit = (ballX - (paddleX + PADDLE_W / 2)) / (PADDLE_W / 2)
          vx = hit * 220
          vy = -Math.abs(vy)
          ballY = py - BALL_R
          const mag = Math.hypot(vx, vy)
          const target = 250
          vx = (vx / mag) * target
          vy = (vy / mag) * target
        }

        for (const b of bricks) {
          if (!b.alive) continue
          if (
            ballX + BALL_R > b.x &&
            ballX - BALL_R < b.x + BRICK_W &&
            ballY + BALL_R > b.y &&
            ballY - BALL_R < b.y + BRICK_H
          ) {
            b.alive = false
            scoreRef.current += 10
            setScore(scoreRef.current)
            const overlapL = ballX + BALL_R - b.x
            const overlapR = b.x + BRICK_W - (ballX - BALL_R)
            const overlapT = ballY + BALL_R - b.y
            const overlapB = b.y + BRICK_H - (ballY - BALL_R)
            const minX = Math.min(overlapL, overlapR)
            const minY = Math.min(overlapT, overlapB)
            if (minX < minY) vx = -vx
            else vy = -vy
            break
          }
        }

        if (bricks.every((b) => !b.alive)) {
          setPhaseLocal('won')
          vx = 0
          vy = 0
        }

        if (ballY > H + 20) {
          livesRef.current -= 1
          setLives(livesRef.current)
          if (livesRef.current <= 0) {
            setPhaseLocal('lost')
          } else {
            resetBall(false)
          }
        }
      }

      ctx.fillStyle = '#0a101c'
      ctx.fillRect(0, 0, W, H)
      ctx.strokeStyle = '#2a4060'
      ctx.lineWidth = 3
      ctx.strokeRect(2, 2, W - 4, H - 4)

      ctx.fillStyle = '#e6eef8'
      ctx.font = '10px "Press Start 2P", monospace'
      ctx.fillText(`SCORE ${scoreRef.current}`, 12, 24)
      ctx.fillText(`♥ ${livesRef.current}`, W - 70, 24)

      for (const b of bricks) {
        if (!b.alive) continue
        ctx.fillStyle = b.color
        ctx.fillRect(b.x, b.y, BRICK_W, BRICK_H)
        ctx.fillStyle = 'rgba(255,255,255,0.18)'
        ctx.fillRect(b.x, b.y, BRICK_W, 3)
      }

      ctx.fillStyle = '#8ec5ff'
      ctx.fillRect(paddleX, H - 28, PADDLE_W, PADDLE_H)
      ctx.fillStyle = '#e6eef8'
      ctx.beginPath()
      ctx.arc(ballX, ballY, BALL_R, 0, Math.PI * 2)
      ctx.fill()

      if (phaseRef.current !== 'playing') {
        ctx.fillStyle = 'rgba(10,16,28,0.72)'
        ctx.fillRect(24, H / 2 - 48, W - 48, 96)
        ctx.fillStyle = '#f0c36a'
        ctx.font = '11px "Press Start 2P", monospace'
        ctx.textAlign = 'center'
        const title =
          phaseRef.current === 'ready'
            ? 'PIXEL BREAKER'
            : phaseRef.current === 'won'
              ? 'CLEAR!'
              : 'GAME OVER'
        ctx.fillText(title, W / 2, H / 2 - 8)
        ctx.fillStyle = '#e6eef8'
        ctx.font = '9px "NeoDunggeunmo", monospace'
        ctx.fillText(
          phaseRef.current === 'ready'
            ? 'SPACE / 탭으로 시작'
            : 'SPACE / 탭으로 재시작',
          W / 2,
          H / 2 + 20,
        )
        ctx.textAlign = 'left'
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerdown', onPointerDown)
    }
  }, [])

  return (
    <div className="breakout" role="dialog" aria-modal="true" aria-label="블록깨기">
      <div className="breakout__panel">
        <header className="breakout__head">
          <strong>PIXEL BREAKER</strong>
          <button type="button" className="breakout__close" onClick={onClose}>
            닫기
          </button>
        </header>
        <canvas
          ref={canvasRef}
          className="breakout__canvas"
          width={W}
          height={H}
        />
        <p className="breakout__hint">
          ← → / A D · 마우스 · {phase === 'playing' ? `점수 ${score} · 목숨 ${lives}` : 'E는 마을로'}
        </p>
      </div>
    </div>
  )
}
