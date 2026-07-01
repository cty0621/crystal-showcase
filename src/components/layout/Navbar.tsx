import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gem } from 'lucide-react'
import { siteConfig } from '@/data/site'

export const Navbar = () => {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass-shallow shadow-lg shadow-black/20' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-10 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-brand-heading font-light text-lg tracking-[0.2em]"
        >
          <Gem className="w-5 h-5 text-brand-ice" strokeWidth={1.5} />
          <span style={{ fontFamily:"'Cormorant Garamond','Times New Roman',serif", fontWeight:300, letterSpacing:'0.18em', textTransform:'uppercase' }}>{siteConfig.name}</span>
        </Link>

        <div className="flex items-center gap-10">
          {siteConfig.nav.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className="relative py-1.5 text-sm font-light tracking-[0.15em] transition-colors duration-300 hover:text-brand-heading"
                style={{ color: isActive ? '#ffffff' : '#8892a4' }}
              >
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-0.5 left-0 right-0 h-px bg-gradient-to-r from-brand-ice to-brand-lavender"
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      <div
        className={`h-px transition-opacity duration-500 ${
          scrolled ? 'opacity-100' : 'opacity-0'
        } bg-gradient-to-r from-transparent via-white/[0.06] to-transparent`}
      />
    </motion.header>
  )
}
