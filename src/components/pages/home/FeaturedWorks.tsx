import { ArrowRight } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { GlassCard } from '@/components/ui/GlassCard'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { featuredWorks } from '@/data/works'

export const FeaturedWorks = () => {
  return (
    <section className="py-40 px-10">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          label="Featured Works"
          title="精选作品"
          description="每一件作品都是独一无二的艺术呈现，承载着水晶的能量与匠人的温度。"
        />

        <div className="grid grid-cols-2 gap-6 mt-20">
          {featuredWorks.map((work, i) => (
            <ScrollReveal key={work.id} delay={i * 0.1}>
              <GlassCard className="group h-full flex flex-col">
                <div className="aspect-[4/3] rounded-xl bg-white/[0.02] mb-6 overflow-hidden relative">
                  <img src={work.image} alt={work.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <span className="text-white text-sm tracking-[0.2em] font-light">查看详情</span>
                  </div>
                </div>

                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-[0.2em] text-brand-ice/60">
                      {work.category}
                    </span>
                    <h3 className="text-xl font-light text-brand-heading mt-2 mb-2">{work.title}</h3>
                    <p className="text-sm text-brand-muted font-light leading-relaxed max-w-sm">
                      {work.description}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.3}>
          <div className="text-center mt-16">
            <MagneticButton href="/gallery">
              浏览全部作品
              <ArrowRight className="w-4 h-4" strokeWidth={1} />
            </MagneticButton>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
