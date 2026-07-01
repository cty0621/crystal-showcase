import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import type { GalleryItem } from '@/types'

const categoryLabels: Record<string, string> = {
  necklace: '项链', bracelet: '手链', earrings: '耳饰', ring: '戒指',
}

interface GalleryCardProps {
  item: GalleryItem
  index: number
  onClick: () => void
}

export const GalleryCard = ({ item, index, onClick }: GalleryCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      layout
    >
      <GlassCard className="group h-full cursor-pointer" onClick={onClick}>
        <div className="aspect-square rounded-xl bg-white/[0.02] mb-5 overflow-hidden relative">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end items-center p-6 gap-2">
            <span className="text-xs text-white/80 tracking-[0.2em]">{item.material}</span>
            <span className="text-[10px] text-brand-ice/80 tracking-[0.3em]">点击查看详情</span>
          </div>
        </div>

        <span className="text-xs uppercase tracking-[0.2em] text-brand-ice/60">
          {categoryLabels[item.category]}
        </span>
        <h3 className="text-lg font-light text-brand-heading mt-1.5 mb-2">{item.title}</h3>
        <p className="text-sm text-brand-muted font-light leading-relaxed">{item.description}</p>
      </GlassCard>
    </motion.div>
  )
}
