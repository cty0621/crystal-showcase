import { Gem } from 'lucide-react'
import { siteConfig } from '@/data/site'

export const Footer = () => {
  return (
    <footer className="relative border-t border-white/[0.04]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-brand-ice/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-10 py-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Gem className="w-4 h-4 text-brand-ice" strokeWidth={1.5} />
            <span className="text-brand-heading font-light text-sm" style={{ fontFamily:"'Cormorant Garamond','Times New Roman',serif", fontWeight:300, letterSpacing:'0.18em', textTransform:'uppercase' }}>
              {siteConfig.name}
            </span>
          </div>

          <p className="text-brand-muted font-light text-sm tracking-wider">
            {siteConfig.tagline}
          </p>

          <p className="text-brand-muted/60 font-light text-xs tracking-wider">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
