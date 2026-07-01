import { type CSSProperties, type ReactNode, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface GlassCardProps {
  children: ReactNode
  className?: string
  depth?: 'shallow' | 'medium' | 'deep'
  hover?: boolean
  onClick?: () => void
  /** 内联样式透传（向后兼容，供调用方覆盖背景/边框等） */
  style?: CSSProperties
}

const depthMap = {
  shallow: 'glass-shallow',
  medium: 'glass-medium',
  deep: 'glass-deep',
}

export const GlassCard = ({
  children,
  className = '',
  depth = 'medium',
  hover = true,
  onClick,
  style,
}: GlassCardProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      ref={ref}
      onClick={onClick}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={hover ? { scale: 1.02 } : undefined}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`${depthMap[depth]} rounded-2xl p-8 transition-colors duration-500 cursor-default ${
        hover && isHovered ? 'glow-border' : ''
      } ${className}`}
    >
      {children}
    </motion.div>
  )
}
