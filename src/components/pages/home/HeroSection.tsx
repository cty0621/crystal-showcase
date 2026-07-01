import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, Gem } from 'lucide-react'
import { ParticleField } from '@/components/ui/ParticleField'
import { Lightning } from '@/components/ui/Lightning'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { siteConfig } from '@/data/site'

export const HeroSection = () => {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section
      ref={ref}
      className="relative h-screen flex items-center justify-center overflow-hidden"
    >
      <ParticleField count={30} />
      <Lightning hue={210} xOffset={0} speed={0.6} intensity={0.4} size={1.2} />

      <motion.div style={{ y, opacity }} className="relative z-10 text-center px-10">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-8 inline-flex"
        >
          <Gem className="w-12 h-12 text-brand-ice" strokeWidth={1} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
          className="text-8xl mb-6 text-brand-heading"
          style={{
            fontFamily: "'Cormorant Garamond', 'Playfair Display', 'Times New Roman', serif",
            fontWeight: 300,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          {siteConfig.name}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          className="text-xl font-light tracking-[0.3em] text-brand-muted mb-12"
        >
          {siteConfig.tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
        >
          <MagneticButton href="/gallery" variant="primary">
            探索作品
            <ArrowDown className="w-4 h-4" strokeWidth={1} />
          </MagneticButton>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-brand-bg to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{
          opacity: { delay: 1.5, duration: 0.6 },
          y: { delay: 1.5, duration: 2, repeat: Infinity },
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-5 h-8 rounded-full border border-white/10 flex items-start justify-center p-1">
          <div className="w-1 h-2 rounded-full bg-brand-ice/60" />
        </div>
      </motion.div>
    </section>
  )
}
