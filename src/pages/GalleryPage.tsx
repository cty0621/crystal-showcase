import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { GalleryGrid } from '@/components/pages/gallery/GalleryGrid'

export const GalleryPage = () => {
  return (
    <section className="pt-32 pb-40 px-10">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <SectionHeading
            label="Gallery"
            title="作品集"
            description="每一件作品都是自然与匠心的对话。探索我们的水晶珠宝系列，感受天然宝石的独特魅力。"
          />
        </ScrollReveal>

        <div className="mt-20">
          <GalleryGrid />
        </div>
      </div>
    </section>
  )
}
