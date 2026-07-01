import { useMemo } from 'react'
import { motion } from 'framer-motion'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  duration: number
  delay: number
  driftX: number
  driftY: number
}

interface ParticleFieldProps {
  count?: number
  className?: string
}

export const ParticleField = ({ count = 25, className = '' }: ParticleFieldProps) => {
  const particles = useMemo<Particle[]>(() => {
    const colors = ['#7ec8e3', '#b8c5ff', '#ffffff']
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 10,
      driftX: (Math.random() - 0.5) * 30,
      driftY: (Math.random() - 0.5) * 30,
    }))
  }, [count])

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
          animate={{
            x: [0, p.driftX, 0, -p.driftX, 0],
            y: [0, -p.driftY, 0, p.driftY, 0],
            opacity: [0.1, 0.5, 0.1, 0.4, 0.1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}
