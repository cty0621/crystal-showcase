import { motion } from 'framer-motion'

interface TarotCardProps {
  card: {
    id: string; name: string; keyword: string; color: string; crystal: { name: string }
    backImage?: string; image?: string
  }
  index: number; total: number
  isHovered: boolean; isRevealed: boolean
  isShuffling: boolean
  shuffleOffset: { x: number; y: number; rotate: number; scale: number }
  /** 手势悬停翻牌进度 0-1（仅手势模式且悬停中 > 0） */
  hoverProgress?: number
  onClick: () => void
  onHover: (hovered: boolean) => void
}

export const TarotCard = ({
  card, index, total, isHovered, isRevealed, isShuffling, shuffleOffset, hoverProgress = 0, onClick, onHover,
}: TarotCardProps) => {
  const angle = (index / total) * 360
  const rad = (angle * Math.PI) / 180
  const targetX = Math.cos(rad) * 40
  const targetY = Math.sin(rad) * 28
  const targetRotation = ((index * 37 + 13) % 10) - 5

  const backStyle = {
    background: '#0d0a12',
    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
  } as const

  return (
    <motion.div className="absolute cursor-pointer" style={{ perspective: '1000px' }}
      initial={isShuffling ? {
        left: `calc(50% + ${targetX + shuffleOffset.x}vw - 75px)`,
        top: `calc(50% + ${targetY + shuffleOffset.y}vh - 110px)`,
        opacity: 0, scale: shuffleOffset.scale, rotate: shuffleOffset.rotate,
      } : false}
      animate={{
        left: `calc(50% + ${targetX}vw - 75px)`,
        top: `calc(50% + ${targetY}vh - 110px)`,
        opacity: isRevealed && !isHovered ? 0 : 1,
        scale: isHovered ? 1.05 : 1,
        rotate: isHovered ? 0 : targetRotation,
        filter: isRevealed && !isHovered ? 'blur(2px)' : 'blur(0px)',
      }}
      transition={{
        left: { duration: 0.8, delay: index * 0.03, ease: [0.25, 0.46, 0.45, 0.94] },
        top: { duration: 0.8, delay: index * 0.03, ease: [0.25, 0.46, 0.45, 0.94] },
        opacity: { duration: 0.5, delay: isShuffling ? 0 : index * 0.03 },
        scale: { duration: 0.8, delay: index * 0.03, ease: 'easeOut' },
        rotate: { duration: 0.8, delay: index * 0.03, ease: 'easeOut' },
        y: { duration: 0.3, ease: 'easeOut' },
      }}
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {card.backImage ? (
        <img src={card.backImage} alt="" className="w-[150px] h-[220px] object-contain" style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.5))' }} />
      ) : (
        <div className="w-[150px] h-[220px] flex flex-col items-center justify-center relative overflow-hidden" style={backStyle}>
          <>
            {/* 纯黑背景 */}
            <div className="absolute inset-0 bg-[#0a0a0a]" />

            {/* 银黑镭射底纹 */}
            <div className="absolute inset-0" style={{
              background: `
                linear-gradient(160deg, #1a1a1a 0%, #111 30%, #0d0d0d 60%, #0a0a0a 100%),
                repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(180,160,120,0.025) 3px, rgba(180,160,120,0.025) 4px),
                repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(160,140,100,0.015) 5px, rgba(160,140,100,0.015) 6px)`,
            }} />

            {/* 中央星盘 */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-[68px] h-[68px] rounded-full relative flex items-center justify-center"
                style={{ border:'1.5px solid rgba(196,168,112,0.25)', boxShadow:'0 0 16px rgba(180,150,100,0.08), inset 0 0 8px rgba(180,150,100,0.04)' }}>
                <div className="w-[54px] h-[54px] rounded-full absolute"
                  style={{ border:'0.7px solid rgba(180,150,110,0.15)' }} />
                <svg viewBox="0 0 68 68" className="absolute inset-0 w-full h-full opacity-15" fill="none" stroke="#c4a870" strokeWidth="0.3">
                  <circle cx="34" cy="34" r="26" />
                  <line x1="34" y1="8" x2="34" y2="60" />
                  <line x1="8" y1="34" x2="60" y2="34" />
                </svg>
                <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[6px] opacity-25" style={{ color: '#d4c090' }}>☉</div>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[5px] opacity-20" style={{ color: '#c4a870' }}>☽</div>

                {/* 红宝石 */}
                <div className="w-[16px] h-[16px] rounded-full relative z-10 flex items-center justify-center"
                  style={{
                    background: 'radial-gradient(circle at 35% 35%, #ff3355 0%, #cc1133 40%, #880011 80%, #440008 100%)',
                    boxShadow: '0 0 10px rgba(220,30,50,0.4), 0 0 6px rgba(255,60,80,0.2), inset 0 1px 2px rgba(255,255,255,0.3)',
                  }}>
                  <div className="w-[5px] h-[5px] rounded-full bg-white/30 absolute" style={{ top:2.5, left:2.5 }} />
                </div>
              </div>

              <span className="text-[6px] tracking-[0.3em] font-light mt-1.5 opacity-20" style={{ color: '#d4c090' }}>MYSTIC ORACLE</span>
              <span className="text-[7px] tracking-[0.3em] font-light mt-0.5 opacity-25" style={{ color: '#c4a870' }}>TAROT</span>
            </div>
          </>
        </div>
        )}

      {/* 手势悬停翻牌倒计时进度条 */}
      {isHovered && hoverProgress > 0 && (
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-[150px]">
          <div className="h-[3px] w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-ice"
              style={{
                width: `${Math.round(hoverProgress * 100)}%`,
                boxShadow: '0 0 10px rgba(126,200,227,0.9)',
              }}
            />
          </div>
        </div>
      )}
    </motion.div>
  )
}
