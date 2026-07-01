import { Gem, Hand, Sparkles, Leaf } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { GlassCard } from '@/components/ui/GlassCard'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { craftValues } from '@/data/about'

import type { LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  Gem, Hand, Sparkles, Leaf,
}

export const CraftSection = () => {
  return (
    <section className="py-40 px-10">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          label="Our Craft"
          title="匠心之道"
          description="每一件 CRYSTAL 作品的诞生，都是天然之美与人文匠心的一次共鸣。"
        />

        <div className="grid grid-cols-4 gap-6 mt-20">
          {craftValues.map((value, i) => {
            const Icon = iconMap[value.icon]
            return (
              <ScrollReveal key={value.title} delay={i * 0.1}>
                <GlassCard depth="shallow" className="text-center h-full">
                  <div className="w-12 h-12 rounded-full bg-brand-ice/5 flex items-center justify-center mx-auto mb-5">
                    {Icon && <Icon className="w-5 h-5 text-brand-ice/60" strokeWidth={1.5} />}
                  </div>
                  <h3 className="text-base font-normal text-brand-heading mb-3 tracking-wide">
                    {value.title}
                  </h3>
                  <p className="text-sm text-brand-muted font-light leading-relaxed">
                    {value.description}
                  </p>
                </GlassCard>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
