import { useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

interface MagneticButtonProps {
  children: ReactNode
  href?: string
  onClick?: () => void
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost'
}

const variantStyles = {
  primary: 'bg-white text-[#0a0e17] hover:bg-brand-ice',
  secondary: 'glass-shallow text-brand-heading hover:text-brand-ice',
  ghost: 'bg-transparent text-brand-muted hover:text-brand-heading',
}

export const MagneticButton = ({
  children,
  href,
  onClick,
  className = '',
  variant = 'secondary',
}: MagneticButtonProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * 0.3
    const y = (e.clientY - rect.top - rect.height / 2) * 0.3
    setPosition({ x, y })
  }

  const handleMouseLeave = () => setPosition({ x: 0, y: 0 })

  const baseClasses = `inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-light tracking-[0.1em] transition-colors duration-300 ${variantStyles[variant]} ${className}`

  return (
    <motion.div
      ref={ref}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {href ? (
        <Link to={href} className={baseClasses}>
          {children}
        </Link>
      ) : (
        <button onClick={onClick} className={baseClasses}>
          {children}
        </button>
      )}
    </motion.div>
  )
}
