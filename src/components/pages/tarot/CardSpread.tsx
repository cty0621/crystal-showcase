import { useState, useCallback, useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { TarotCard } from './TarotCard'
import { TarotResult } from './TarotResult'
import { tarotCards } from '@/data/tarot'
import type { TarotCard as TarotCardType } from '@/types'

interface CardSpreadProps {
  handPosition: { x: number; y: number } | null
  gestureEnabled: boolean
}

// 生成随机散开偏移
const getRandomOffsets = () =>
  tarotCards.map(() => ({
    x: (Math.random() - 0.5) * 120,
    y: (Math.random() - 0.5) * 100,
    rotate: (Math.random() - 0.5) * 180,
    scale: Math.random() * 0.5 + 0.3,
  }))

export const CardSpread = ({ handPosition, gestureEnabled }: CardSpreadProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedCard, setSelectedCard] = useState<TarotCardType | null>(null)
  const [isShuffling, setIsShuffling] = useState(true)
  const [shuffleOffsets] = useState(getRandomOffsets)

  // 悬停计时——手势模式下同一张牌持续悬停 DWELL_MS 后翻牌；
  // 进度通过 hoverProgress 反馈到牌面进度条，中途移开可取消，避免误触
  const DWELL_MS = 2500
  const hoverTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const hoverStartId = useRef<string | null>(null)
  const hoverStartAt = useRef(0)
  const hoverLostAt = useRef<number | null>(null)
  const [hoverProgress, setHoverProgress] = useState(0)

  // 计算手势位置最近的牌
  const getClosestCard = useCallback(
    (pos: { x: number; y: number }): string | null => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      const rx = ((pos.x - cx) / cx) * 40
      const ry = ((pos.y - cy) / cy) * 28

      let best: string | null = null
      let bestDist = Infinity
      tarotCards.forEach((_, i) => {
        const angle = (i / tarotCards.length) * 360
        const rad = (angle * Math.PI) / 180
        const bx = Math.cos(rad) * 40
        const by = Math.sin(rad) * 28
        const d = Math.hypot(rx - bx, ry - by)
        if (d < bestDist) { bestDist = d; best = tarotCards[i].id }
      })
      return bestDist < 15 ? best : null
    },
    [],
  )

  // 手势位置变化时更新悬停牌
  useEffect(() => {
    if (!gestureEnabled || !handPosition || selectedCard || isShuffling) return

    const closestId = getClosestCard(handPosition)
    const now = Date.now()

    if (!closestId) {
      // 杖尖短暂移出（抖动/越界）给 400ms 宽限，避免进度清零
      if (hoverStartId.current && hoverLostAt.current === null) {
        hoverLostAt.current = now
      }
      if (hoverLostAt.current !== null && now - hoverLostAt.current > 400) {
        hoverStartId.current = null
        hoverLostAt.current = null
        setHoveredId(null)
        setHoverProgress(0)
        if (hoverTimer.current) { clearInterval(hoverTimer.current); hoverTimer.current = null }
      }
      return
    }
    hoverLostAt.current = null

    if (hoverStartId.current !== closestId) {
      // 换了一张牌 → 重新计时
      hoverStartId.current = closestId
      hoverStartAt.current = now
      setHoverProgress(0)
      if (hoverTimer.current) clearInterval(hoverTimer.current)
      hoverTimer.current = setInterval(() => {
        const elapsed = Date.now() - hoverStartAt.current
        const p = Math.min(1, elapsed / DWELL_MS)
        setHoverProgress(p)
        if (p >= 1) {
          if (hoverTimer.current) { clearInterval(hoverTimer.current); hoverTimer.current = null }
          const card = tarotCards.find((c) => c.id === hoverStartId.current)
          if (card) setSelectedCard(card)
        }
      }, 50)
    }
    setHoveredId(closestId)
  }, [handPosition, gestureEnabled, selectedCard, isShuffling, getClosestCard])

  // 鼠标模式下的 hover
  const handleMouseHover = useCallback(
    (cardId: string | null) => {
      if (gestureEnabled) return // 手势模式下由 useEffect 处理
      setHoveredId(cardId)
    },
    [gestureEnabled],
  )

  // 点击选中（鼠标模式）
  const handleSelect = useCallback((card: TarotCardType) => {
    setSelectedCard(card)
  }, [])

  // 重新抽卡 + 洗牌
  const handleReset = useCallback(() => {
    setSelectedCard(null)
    setHoveredId(null)
    setHoverProgress(0)
    hoverStartId.current = null
    hoverLostAt.current = null
    if (hoverTimer.current) { clearInterval(hoverTimer.current); hoverTimer.current = null }

    const newOffsets = tarotCards.map(() => ({
      x: (Math.random() - 0.5) * 120,
      y: (Math.random() - 0.5) * 100,
      rotate: (Math.random() - 0.5) * 180,
      scale: Math.random() * 0.5 + 0.3,
    }))
    shuffleOffsets.splice(0, shuffleOffsets.length, ...newOffsets)
    setIsShuffling(true)
    setTimeout(() => setIsShuffling(false), 600)
  }, [shuffleOffsets])

  // 初次加载自动洗牌
  useEffect(() => {
    const t = setTimeout(() => setIsShuffling(false), 600)
    return () => clearTimeout(t)
  }, [])

  // 卸载时清理悬停计时器
  useEffect(() => () => { if (hoverTimer.current) clearInterval(hoverTimer.current) }, [])

  return (
    <div className="relative w-full h-full">
      <AnimatePresence>
        {!selectedCard &&
          tarotCards.map((card, i) => (
            <TarotCard
              key={card.id}
              card={card}
              index={i}
              total={tarotCards.length}
              isHovered={hoveredId === card.id}
              isRevealed={!!selectedCard}
              isShuffling={isShuffling}
              shuffleOffset={shuffleOffsets[i]}
              hoverProgress={hoveredId === card.id ? hoverProgress : 0}
              onClick={() => !isShuffling && !gestureEnabled && handleSelect(card)}
              onHover={(h) => handleMouseHover(h ? card.id : null)}
            />
          ))}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCard && <TarotResult card={selectedCard} onReset={handleReset} />}
      </AnimatePresence>
    </div>
  )
}
