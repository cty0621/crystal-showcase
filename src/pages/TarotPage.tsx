import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { HandTracker } from '@/components/pages/tarot/HandTracker'
import { CardSpread } from '@/components/pages/tarot/CardSpread'
import { GestureGuide } from '@/components/pages/tarot/GestureGuide'
import { Sparkles, Monitor, Shuffle } from 'lucide-react'

export const TarotPage = () => {
  const [gestureEnabled, setGestureEnabled] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [handPosition, setHandPosition] = useState<{ x: number; y: number } | null>(null)
  const [shuffleKey, setShuffleKey] = useState(0)

  const handleShuffle = useCallback(() => setShuffleKey((k) => k + 1), [])

  return (
    <section className="relative h-screen overflow-hidden bg-brand-bg">
      {/* 背景柔光 */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-brand-ice/5 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-brand-lavender/5 blur-[100px]" />
      </div>

      {/* 摄像头手势追踪 */}
      <HandTracker
        enabled={gestureEnabled}
        onHandMove={setHandPosition}
        onShuffle={handleShuffle}
      />

      {/* 手势指示已由 HandTracker 画布上的魔法棒呈现（跟随手掌位置与朝向） */}

      {/* 引导蒙层 */}
      <GestureGuide show={showGuide} onDismiss={() => setShowGuide(false)} />

      {/* 顶部提示 */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10 text-center">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {gestureEnabled && handPosition && (
            <motion.span className="w-2.5 h-2.5 rounded-full bg-brand-ice shadow-[0_0_8px_rgba(126,200,227,0.6)]" />
          )}
          {gestureEnabled && !handPosition && (
            <motion.span
              className="w-2.5 h-2.5 rounded-full bg-yellow-400/60"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
          <p className="text-sm text-brand-muted tracking-[0.2em] font-light">
            {gestureEnabled
              ? handPosition
                ? '移动魔法棒对准牌面，停留 2.5 秒自动翻牌'
                : '请将手掌伸向摄像头...'
              : '用鼠标选择一张属于你的牌'}
          </p>
        </motion.div>
      </div>

      {/* 牌阵 */}
      <CardSpread
        key={shuffleKey}
        handPosition={handPosition}
        gestureEnabled={gestureEnabled}
      />

      {/* 底部控制栏 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
        {/* 洗牌 */}
        <motion.button
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-light tracking-wider bg-white/5 text-brand-muted hover:text-brand-heading transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShuffle}
        >
          <Shuffle className="w-4 h-4" strokeWidth={1} />
          洗牌
        </motion.button>

        {/* 手势模式 */}
        <motion.button
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-light tracking-wider transition-all duration-300 ${
            gestureEnabled
              ? 'glass-shallow text-brand-ice glow-border'
              : 'bg-white/5 text-brand-muted hover:text-brand-heading'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (!gestureEnabled) {
              setGestureEnabled(true)
              setShowGuide(true)
            } else {
              setGestureEnabled(false)
            }
          }}
        >
          <Sparkles className="w-4 h-4" strokeWidth={1} />
          {gestureEnabled ? '手势已开启' : '开启手势模式'}
        </motion.button>

        {gestureEnabled && (
          <motion.button
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-light tracking-wider glass-shallow text-brand-muted hover:text-brand-heading transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setGestureEnabled(false)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Monitor className="w-4 h-4" strokeWidth={1} />
            鼠标模式
          </motion.button>
        )}
      </div>
    </section>
  )
}
