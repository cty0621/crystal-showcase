// @ts-nocheck
import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    Hands: any
    Camera: any
  }
}

interface HandTrackerProps {
  enabled: boolean
  onHandMove: (position: { x: number; y: number } | null) => void
  onShuffle: () => void
}

/** 魔法棒杖尖距掌心的偏移（px），与画布绘制的杖尖位置保持一致 */
const WAND_TIP_OFFSET = 94

export const HandTracker = ({ enabled, onHandMove, onShuffle }: HandTrackerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const handsRef = useRef<any>(null)
  const landmarksRef = useRef<Array<{ x: number; y: number }> | null>(null)
  // 魔法棒平滑状态：手掌位置 / 杖身朝向 / 显隐透明度
  const smoothPalmRef = useRef<{ x: number; y: number } | null>(null)
  const smoothDirRef = useRef<{ x: number; y: number }>({ x: 1, y: 0 })
  const wandOpacityRef = useRef(0)
  const animFrameRef = useRef<number | null>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 挥手检测：追踪手腕 X 位置的变化
  const waveHistory = useRef<number[]>([])
  const lastShuffleTime = useRef(0)

  useEffect(() => {
    if (!enabled) {
      setError(null)
      setCameraReady(false)
      onHandMove(null)
      return
    }

    let camera: any = null
    let isActive = true

    const initHands = async () => {
      try {
        let video = videoRef.current
        if (!video) {
          video = document.createElement('video')
          video.setAttribute('playsinline', '')
          video.setAttribute('muted', '')
          video.style.display = 'none'
          document.body.appendChild(video)
          videoRef.current = video
        }

        const hands = new window.Hands({
          locateFile: (file: string) => `/mediapipe/${file}`,
        })

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0,
          minDetectionConfidence: 0.3, // 降低阈值：更容易检测到手，响应更快
          minTrackingConfidence: 0.15,
        })

        hands.onResults((results) => {
          if (!isActive) return

          if (results.multiHandLandmarks?.length > 0) {
            const lm = results.multiHandLandmarks[0]
            const canvas = canvasRef.current
            const w = canvas?.width || window.innerWidth
            const h = canvas?.height || window.innerHeight

            // 镜像翻转 X 坐标（摄像头画面是镜像的）
            const screenLandmarks = lm.map((p) => ({
              x: (1 - p.x) * w,
              y: p.y * h,
            }))

            landmarksRef.current = screenLandmarks

            // 平滑插值：手掌位置（点9）+ 杖身朝向（点9 → 点12 中指方向）
            const rawPalm = screenLandmarks[9]
            const dx = screenLandmarks[12].x - rawPalm.x
            const dy = screenLandmarks[12].y - rawPalm.y
            const len = Math.hypot(dx, dy) || 1

            if (!smoothPalmRef.current) {
              smoothPalmRef.current = { x: rawPalm.x, y: rawPalm.y }
            } else {
              smoothPalmRef.current.x += (rawPalm.x - smoothPalmRef.current.x) * 0.45
              smoothPalmRef.current.y += (rawPalm.y - smoothPalmRef.current.y) * 0.45
            }
            const sd = smoothDirRef.current
            sd.x += (dx / len - sd.x) * 0.28
            sd.y += (dy / len - sd.y) * 0.28

            // 上报魔法棒杖尖位置（与画布绘制的杖尖一致），指向牌更精准
            onHandMove({
              x: smoothPalmRef.current.x + sd.x * WAND_TIP_OFFSET,
              y: smoothPalmRef.current.y + sd.y * WAND_TIP_OFFSET,
            })

            // 挥手检测：手腕（点0）X 坐标快速左右摆动
            const wristX = screenLandmarks[0].x
            waveHistory.current.push(wristX)
            if (waveHistory.current.length > 30) waveHistory.current.shift()

            if (waveHistory.current.length >= 12) {
              // 计算最近 12 帧的方向变化次数
              let directionChanges = 0
              for (let i = 2; i < waveHistory.current.length; i++) {
                const prev = waveHistory.current[i - 1] - waveHistory.current[i - 2]
                const curr = waveHistory.current[i] - waveHistory.current[i - 1]
                if (Math.abs(curr) > 8 && prev * curr < 0) directionChanges++
              }
              // 方向变化 > 5 次 = 挥手
              const now = Date.now()
              if (directionChanges >= 5 && now - lastShuffleTime.current > 2000) {
                lastShuffleTime.current = now
                onShuffle()
              }
            }
          } else {
            landmarksRef.current = null
            onHandMove(null)
          }
        })

        handsRef.current = hands
        await hands.initialize()

        camera = new window.Camera(video, {
          onFrame: async () => {
            if (handsRef.current && video && video.readyState >= 2) {
              await handsRef.current.send({ image: video })
            }
          },
          width: 640,
          height: 480,
        })

        await camera.start()
        if (isActive) setCameraReady(true)
      } catch (err: any) {
        if (isActive) {
          setError(err.name === 'NotAllowedError' ? '摄像头权限被拒绝' : '摄像头启动失败')
        }
      }
    }

    initHands()

    return () => {
      isActive = false
      camera?.stop().catch(() => {})
      onHandMove(null)
    }
  }, [enabled, onHandMove, onShuffle])

  // Canvas 魔法棒渲染（替代原来的手掌骨架显示）
  useEffect(() => {
    if (!enabled) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    /** 画四角星 */
    const drawStar = (x: number, y: number, r1: number, r2: number, fill: string, glow: number) => {
      ctx.shadowColor = glow > 0 ? 'rgba(255, 255, 255, 0.9)' : 'transparent'
      ctx.shadowBlur = glow
      ctx.fillStyle = fill
      ctx.beginPath()
      for (let i = 0; i < 8; i++) {
        const r = i % 2 === 0 ? r1 : r2
        const a = (i * Math.PI) / 4
        if (i === 0) ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r)
        else ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r)
      }
      ctx.closePath()
      ctx.fill()
    }

    const draw = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const lm = landmarksRef.current
      const hasHand = !!lm && lm.length >= 21

      // 平滑与杖尖计算在 onResults 回调中完成，这里只负责淡入淡出
      wandOpacityRef.current += ((hasHand ? 1 : 0) - wandOpacityRef.current) * 0.15
      const op = wandOpacityRef.current
      if (op < 0.02 || !smoothPalmRef.current) {
        animFrameRef.current = requestAnimationFrame(draw)
        return
      }

      const px = smoothPalmRef.current.x
      const py = smoothPalmRef.current.y
      const dl = Math.hypot(smoothDirRef.current.x, smoothDirRef.current.y) || 1
      const angle = Math.atan2(smoothDirRef.current.y / dl, smoothDirRef.current.x / dl)

      ctx.save()
      ctx.globalAlpha = op
      ctx.translate(px, py)
      ctx.rotate(angle)

      // ── 杖身（杖尖亮 → 尾端淡） ──
      const grad = ctx.createLinearGradient(-20, 0, 88, 0)
      grad.addColorStop(0, 'rgba(126, 200, 227, 0.2)')
      grad.addColorStop(0.3, 'rgba(126, 200, 227, 0.9)')
      grad.addColorStop(1, 'rgba(255, 255, 255, 0.95)')
      ctx.strokeStyle = grad
      ctx.lineWidth = 5
      ctx.lineCap = 'round'
      ctx.shadowColor = 'rgba(126, 200, 227, 0.8)'
      ctx.shadowBlur = 14
      ctx.beginPath()
      ctx.moveTo(-20, 0)
      ctx.lineTo(88, 0)
      ctx.stroke()

      // ── 杖尾圆珠（握柄端） ──
      ctx.shadowColor = 'rgba(184, 197, 255, 0.9)'
      ctx.shadowBlur = 10
      ctx.fillStyle = 'rgba(184, 197, 255, 0.85)'
      ctx.beginPath()
      ctx.arc(-26, 0, 7, 0, Math.PI * 2)
      ctx.fill()

      // ── 杖尖四角星 ──
      drawStar(94, 0, 12, 4, '#ffffff', 20)

      // ── 环绕闪烁小星星 ──
      const t = now / 600
      const sparks = [
        { d: 26, a: 0.7, r: 4, ph: 0 },
        { d: 36, a: 2.4, r: 3, ph: 2.1 },
        { d: 30, a: 4.0, r: 3.4, ph: 4.2 },
      ]
      for (const sp of sparks) {
        const tw = 0.45 + 0.55 * Math.abs(Math.sin(t + sp.ph))
        ctx.globalAlpha = op * tw
        drawStar(94 + Math.cos(sp.a) * sp.d, Math.sin(sp.a) * sp.d, sp.r, sp.r * 0.32, 'rgba(126, 200, 227, 0.95)', 6)
      }
      ctx.globalAlpha = 1

      ctx.restore()
      animFrameRef.current = requestAnimationFrame(draw)
    }

    animFrameRef.current = requestAnimationFrame(draw)
    return () => {
      window.removeEventListener('resize', resize)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-20 pointer-events-none"
        style={{ width: '100vw', height: '100vh' }}
      />
      {error && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-30">
          <div className="glass-medium rounded-xl px-6 py-3 text-center">
            <p className="text-sm text-red-400/80 font-light">{error}</p>
            <p className="text-xs text-brand-muted mt-1">请允许摄像头后刷新，或用鼠标模式</p>
          </div>
        </div>
      )}
      {!cameraReady && !error && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-30">
          <div className="glass-medium rounded-xl px-6 py-3 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-brand-ice animate-pulse" />
            <p className="text-sm text-brand-muted font-light">正在启动摄像头...</p>
          </div>
        </div>
      )}
    </>
  )
}
