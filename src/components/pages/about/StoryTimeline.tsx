import { motion } from 'framer-motion'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { GlassCard } from '@/components/ui/GlassCard'
import { milestones } from '@/data/about'

export const StoryTimeline = () => {
  return (
    <section className="pt-32 pb-40 px-10">
      <div className="max-w-3xl mx-auto">
        <SectionHeading
          label="Our Story"
          title="品牌历程"
          description="从一间小小的工作室开始，CRYSTAL 走过了七年的旅程。每一步都凝结着对水晶的热爱与对工艺的执着。"
        />

        <div className="mt-20 relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-brand-ice/30 via-brand-lavender/20 to-transparent" />

          <div className="space-y-16">
            {milestones.map((milestone, i) => (
              <ScrollReveal key={milestone.year} delay={i * 0.1}>
                <div className="relative pl-20">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 + 0.2 }}
                    className="absolute left-[26px] top-2 w-[13px] h-[13px] rounded-full border-2 border-brand-ice/40 bg-brand-bg"
                  />

                  <GlassCard depth="shallow" hover={false} className="!p-6">
                    <span className="text-xs font-light tracking-[0.3em] text-brand-ice/70">
                      {milestone.year}
                    </span>
                    <h3 className="text-xl font-light text-brand-heading mt-2 mb-3">
                      {milestone.title}
                    </h3>
                    <p className="text-sm text-brand-muted font-light leading-relaxed">
                      {milestone.description}
                    </p>
                  </GlassCard>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
