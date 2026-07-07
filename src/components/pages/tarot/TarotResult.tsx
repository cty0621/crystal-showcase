import { motion } from 'framer-motion'
import { Sparkles, RefreshCw, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { GlassCard } from '@/components/ui/GlassCard'
import { MagneticButton } from '@/components/ui/MagneticButton'
import type { TarotCard } from '@/types'

const groupLabels: Record<string, string> = {
  emotion: '🌙 情绪', energy: '🌟 能量', guardian: '🛡️ 守护', destiny: '💫 缘份',
}

interface TarotResultProps { card: TarotCard; onReset: () => void }

const crystalImages: Record<string, string> = {
  '月光石':'/assets/textures/products/prod_034.webp','红玛瑙':'/assets/textures/products/prod_017.webp',
  '白水晶':'/assets/textures/products/prod_052.webp','蓝晶':'/assets/textures/products/prod_039.webp',
  '黄水晶':'/assets/textures/products/prod_088.webp','黑曜石':'/assets/textures/products/prod_028.webp',
  '绿幽灵':'/assets/textures/products/prod_019.webp','紫水晶':'/assets/textures/products/prod_067.webp',
  '虎眼石':'/assets/textures/products/prod_084.webp','茶晶':'/assets/textures/products/prod_073.webp',
  '石榴石':'/assets/textures/products/prod_045.webp','海蓝宝':'/assets/textures/products/prod_039.webp',
  '粉水晶':'/assets/textures/products/prod_064.webp','红纹石':'/assets/textures/products/prod_078.webp',
  '草莓晶':'/assets/textures/products/prod_076.webp','橄榄石':'/assets/textures/products/prod_043.webp',
}

/** 塔罗牌水晶名 → DIY 工具的分类名（不一致的做映射，其余按原名） */
const CRYSTAL_TO_CATEGORY: Record<string, string> = {
  '蓝晶': '海蓝宝',
  '黑曜石': '曜石',
  '绿幽灵': '幽灵水晶',
  '红玛瑙': '玛瑙',
  '茶晶': '茶水晶',
  '石榴石': '其他',
  '红纹石': '其他',
  '橄榄石': '其他',
}

export const TarotResult = ({ card, onReset }: TarotResultProps) => {
  const navigate = useNavigate()
  const crystalImg = crystalImages[card.crystal.name]

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }} onClick={onReset}>
      <motion.div className="max-w-lg w-full mx-4"
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        onClick={(e) => e.stopPropagation()}>
        <GlassCard depth="medium" className="text-center !p-10 glow-border"
          style={{
            background: `linear-gradient(170deg, #1a1520 0%, #0d0a12 100%)`,
            border: '1.5px solid rgba(200,170,100,0.3)',
          }}>

          {/* 牌面图案 */}
          <motion.div
            className="w-24 h-24 rounded-2xl mx-auto mb-6 flex items-center justify-center relative overflow-hidden"
            style={{
              background: card.image ? 'transparent' : `linear-gradient(135deg, ${card.color}40 0%, ${card.color}15 50%, #0d0a12 100%)`,
              border: `2px solid ${card.color}50`,
              boxShadow: `0 0 40px ${card.color}30, inset 0 1px 0 rgba(255,255,255,0.05)`,
            }}
            initial={{ rotateY: 180 }} animate={{ rotateY: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}>
            {card.image ? (
              <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
            ) : (
              <>
                <div className="absolute inset-2 rounded-xl border border-white/[0.06]" />
                <Sparkles className="w-10 h-10 relative z-10" style={{ color: card.color }} strokeWidth={1} />
              </>
            )}
          </motion.div>

          {/* 组别 */}
          <p className="text-xs tracking-[0.3em] text-[#d4c090]/60 mb-3">{groupLabels[card.group]}</p>

          {/* 牌名 */}
          <motion.h2 className="text-3xl font-light text-[#d4c090] mb-2"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
            {card.name}
          </motion.h2>

          {/* 关键词 */}
          <motion.p className="text-lg font-light mb-6"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
            style={{ color: card.color }}>
            「{card.keyword}」
          </motion.p>

          {/* 运势解读 */}
          <motion.p className="text-white/50 font-light leading-relaxed mb-8 text-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>
            {card.reading}
          </motion.p>

          {/* 分隔线 */}
          <div className="w-16 h-px mx-auto mb-6" style={{ background: `linear-gradient(90deg, transparent, ${card.color}50, ${card.color}50, transparent)` }} />

          {/* 水晶推荐卡片 */}
          <motion.div className="rounded-xl p-5 mb-8 text-left"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }}
            style={{ background: `${card.color}08`, border: `1px solid ${card.color}20` }}>
            <div className="flex items-center gap-4">
              {crystalImg ? (
                <img src={crystalImg} alt={card.crystal.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0 border-2" style={{ borderColor: card.color+'30' }} />
              ) : (
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `${card.color}15` }}>
                  <Sparkles className="w-5 h-5" style={{ color: card.color }} strokeWidth={1.5} />
                </div>
              )}
              <div>
                <p className="text-xs tracking-wider mb-0.5" style={{ color: card.color, opacity: 0.7 }}>💎 今日推荐水晶</p>
                <p className="text-lg font-light text-[#d4c090]">{card.crystal.name}</p>
                <p className="text-sm text-white/40 font-light">{card.crystal.reason}</p>
              </div>
            </div>
          </motion.div>

          {/* 按钮 */}
          <motion.div className="flex items-center justify-center gap-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.4 }}>
            <MagneticButton onClick={onReset} variant="secondary">
              <RefreshCw className="w-4 h-4" strokeWidth={1} />重新抽卡
            </MagneticButton>
            <MagneticButton onClick={() => navigate(`/diy?crystal=${encodeURIComponent(CRYSTAL_TO_CATEGORY[card.crystal.name] ?? card.crystal.name)}`)} variant="primary">
              查看水晶<ArrowRight className="w-4 h-4" strokeWidth={1} />
            </MagneticButton>
          </motion.div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}
