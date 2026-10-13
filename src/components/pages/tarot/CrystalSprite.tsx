import { useId } from 'react'

interface CrystalSpriteProps {
  /** 渲染尺寸（px），默认 44 */
  size?: number
  className?: string
}

/**
 * 水晶小精灵 —— 纯 SVG 绘制的宝石小精灵形象
 * 六边形晶柱身体 + 半透明小翅膀 + 眨眼表情 + 头顶闪烁星星，
 * 自带漂浮 / 扇翅 / 呼吸光晕动画。
 */
export const CrystalSprite = ({ size = 44, className }: CrystalSpriteProps) => {
  const uid = useId().replace(/:/g, '')
  const gemId = `crystal-gem-${uid}`

  return (
    <div className={className} style={{ width: size, height: size, position: 'relative' }} aria-hidden="true">
      {/* 呼吸光晕 */}
      <div
        className="sprite-aura absolute inset-[-28%] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(126,200,227,0.32) 0%, rgba(184,197,255,0.12) 45%, transparent 72%)' }}
      />
      <svg viewBox="0 0 64 64" className="relative h-full w-full">
        <style>{`
          @keyframes sprite-bob { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-3px) rotate(2deg); } }
          @keyframes sprite-wing-l { 0%,100% { transform: rotate(-10deg); } 50% { transform: rotate(12deg); } }
          @keyframes sprite-wing-r { 0%,100% { transform: rotate(10deg); } 50% { transform: rotate(-12deg); } }
          @keyframes sprite-blink { 0%,90%,100% { transform: scaleY(1); } 94% { transform: scaleY(0.08); } }
          @keyframes sprite-twinkle { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(0.7); } }
          @keyframes sprite-aura { 0%,100% { opacity: 0.7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.12); } }
          .sprite-aura { animation: sprite-aura 3.4s ease-in-out infinite; }
          .sprite-body { animation: sprite-bob 3.4s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 85%; }
          .sprite-wing-l { animation: sprite-wing-l 1.8s ease-in-out infinite; transform-box: fill-box; transform-origin: 95% 45%; }
          .sprite-wing-r { animation: sprite-wing-r 1.8s ease-in-out infinite; transform-box: fill-box; transform-origin: 5% 45%; }
          .sprite-eyes { animation: sprite-blink 4.6s infinite; transform-box: fill-box; transform-origin: center; }
          .sprite-star { animation: sprite-twinkle 2.1s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
          .sprite-star2 { animation: sprite-twinkle 2.6s ease-in-out 0.6s infinite; transform-box: fill-box; transform-origin: center; }
        `}</style>

        <defs>
          <linearGradient id={gemId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c4ecf9" />
            <stop offset="0.45" stopColor="#8fd4ea" />
            <stop offset="1" stopColor="#a9b6f5" />
          </linearGradient>
        </defs>

        {/* 小翅膀 */}
        <g className="sprite-wing-l">
          <path d="M22 25 C9 12 5 23 12 30 C16.5 34 20.5 32 22 25 Z" fill="rgba(184,197,255,0.32)" stroke="rgba(184,197,255,0.5)" strokeWidth="1" />
        </g>
        <g className="sprite-wing-r">
          <path d="M42 25 C55 12 59 23 52 30 C47.5 34 43.5 32 42 25 Z" fill="rgba(184,197,255,0.32)" stroke="rgba(184,197,255,0.5)" strokeWidth="1" />
        </g>

        {/* 身体：六边形晶柱 */}
        <g className="sprite-body">
          <path d="M32 10 L48 24 L48 44 L32 58 L16 44 L16 24 Z" fill={`url(#${gemId})`} stroke="rgba(255,255,255,0.55)" strokeWidth="1" />
          {/* 切面棱线 */}
          <path d="M32 10 L32 58 M16 24 L48 44 M48 24 L16 44" stroke="rgba(255,255,255,0.32)" strokeWidth="0.8" fill="none" />
          {/* 高光 */}
          <path d="M24 16 L29 16 L22 31 L17.5 31 Z" fill="rgba(255,255,255,0.5)" />
          {/* 眼睛（会眨眼） */}
          <g className="sprite-eyes">
            <circle cx="27" cy="33.5" r="2.6" fill="#221a2e" />
            <circle cx="37" cy="33.5" r="2.6" fill="#221a2e" />
            <circle cx="27.9" cy="32.6" r="0.9" fill="#fff" />
            <circle cx="37.9" cy="32.6" r="0.9" fill="#fff" />
          </g>
          {/* 腮红 */}
          <circle cx="23" cy="38.5" r="2.2" fill="rgba(240,150,170,0.4)" />
          <circle cx="41" cy="38.5" r="2.2" fill="rgba(240,150,170,0.4)" />
          {/* 嘴巴 */}
          <path d="M29.6 39 Q32 41.2 34.4 39" stroke="#221a2e" strokeWidth="1.1" fill="none" strokeLinecap="round" />
          {/* 小手 */}
          <circle cx="18.6" cy="41" r="2.5" fill="#9fd4ea" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
          <circle cx="45.4" cy="41" r="2.5" fill="#9fd4ea" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
        </g>

        {/* 头顶大星星 + 右上方金色小星星 */}
        <path className="sprite-star" d="M32 1.5 C33.5 5 35.5 6.4 39 7 C35.5 7.6 33.5 9 32 12.5 C30.5 9 28.5 7.6 25 7 C28.5 6.4 30.5 5 32 1.5 Z" fill="#ffffff" />
        <path className="sprite-star2" d="M45 8 C45.8 10 46.9 11 49 11.2 C46.9 11.4 45.8 12.4 45 14.4 C44.2 12.4 43.1 11.4 41 11.2 C43.1 11 44.2 10 45 8 Z" fill="#d4c090" />
      </svg>
    </div>
  )
}
