import { ScrollReveal } from '@/components/ui/ScrollReveal'

export const ValueProposition = () => {
  return (
    <section className="py-40 px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 gap-20 items-center">
          <ScrollReveal direction="left">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-white/[0.06]">
              <img src={`${import.meta.env.BASE_URL}assets/textures/about/豆包 (2).png`} alt="" className="w-full h-full object-cover" />
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-ice/70 mb-4">Our Philosophy</p>
            <h2 className="text-4xl font-light tracking-wide text-brand-heading mb-8 leading-snug">
              设计，
              <br />
              是自然与人文的
              <br />
              <span className="text-gradient">交汇点</span>
            </h2>
            <div className="space-y-5">
              <p className="text-brand-muted font-light leading-relaxed">
                我们不相信珠宝应该只是装饰。每一颗天然水晶都经历了亿万年的地质演变，承载着地球深处的能量与故事。CRYSTAL
                的设计哲学，是在不掩盖水晶天然之美的前提下，以最精炼的工艺语言，让它与佩戴者产生情感的连接。
              </p>
              <p className="text-brand-muted font-light leading-relaxed">
                从原料的挑选到最终成品的呈现，我们坚持手工精制每一件作品。这不仅仅是对品质的承诺，更是对自然造物的尊重与敬畏。
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
