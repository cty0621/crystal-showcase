import { Gem, Sparkles, Users } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { GlassCard } from '@/components/ui/GlassCard'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { StatItem } from '@/types'

const stats: StatItem[] = [
  { value: '500+', label: '原创设计' },
  { value: '8年', label: '品牌历程' },
  { value: '3000+', label: '信任客户' },
]

const icons = [Gem, Sparkles, Users]

export const BrandIntro = () => {
  return (
    <section className="py-40 px-10">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          label="About CRYSTAL"
          title="以水晶之名"
          description="CRYSTAL 是一个专注于天然水晶珠宝设计的工作室。我们相信每一颗水晶都承载着地球的记忆，每一件作品都是自然与匠心的对话。"
        />

        <div className="grid grid-cols-3 gap-8 mt-20">
          {stats.map((stat, i) => {
            const Icon = icons[i]
            return (
              <ScrollReveal key={stat.label} delay={i * 0.15}>
                <GlassCard depth="shallow" hover={false} className="text-center py-12">
                  <Icon className="w-8 h-8 text-brand-ice/60 mx-auto mb-6" strokeWidth={1} />
                  <div className="text-4xl font-light text-brand-heading mb-3">{stat.value}</div>
                  <div className="text-sm text-brand-muted tracking-wider">{stat.label}</div>
                </GlassCard>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
