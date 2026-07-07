// @ts-nocheck
import { motion, AnimatePresence } from 'framer-motion'
import { Hand, Camera } from 'lucide-react'

interface GestureGuideProps {
  show: boolean
  onDismiss: () => void
}

export const GestureGuide = ({ show, onDismiss }: GestureGuideProps) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
        >
          <motion.div
            className="glass-medium rounded-2xl p-10 text-center max-w-md mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 图标 */}
            <div className="w-20 h-20 rounded-full bg-brand-ice/10 flex items-center justify-center mx-auto mb-6 relative">
              <Camera className="w-10 h-10 text-brand-ice" strokeWidth={1} />
              <motion.div
                className="absolute inset-0 rounded-full border border-brand-ice/30"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>

            <h3 className="text-xl font-light text-brand-heading mb-3">手势抽卡</h3>
            <p className="text-brand-muted font-light text-sm leading-relaxed mb-2">
              将手掌对准摄像头
            </p>
            <p className="text-xs text-brand-ice/60 font-light mb-6">
              （仅识别手部动作，不显示画面，手掌会化作魔法棒）
            </p>

            {/* 手势说明 */}
            <div className="flex items-center justify-center gap-6 text-xs text-brand-muted mb-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full glass-shallow flex items-center justify-center mx-auto mb-2 text-2xl">
                  ✋
                </div>
                <span>张开手掌</span>
                <br />
                <span className="text-brand-ice/60">移动光标</span>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full glass-shallow flex items-center justify-center mx-auto mb-2 text-2xl">
                  ✊
                </div>
                <span>握拳 0.3秒</span>
                <br />
                <span className="text-brand-ice/60">抽牌</span>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full glass-shallow flex items-center justify-center mx-auto mb-2 text-2xl">
                  👋
                </div>
                <span>左右挥手</span>
                <br />
                <span className="text-brand-ice/60">洗牌</span>
              </div>
            </div>

            <button
              onClick={onDismiss}
              className="px-8 py-2.5 rounded-full bg-white text-[#0a0e17] text-sm font-light tracking-wider hover:bg-brand-ice transition-colors duration-300"
            >
              开始体验
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
