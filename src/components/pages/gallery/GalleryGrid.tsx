import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { GalleryFilter, type Category } from './GalleryFilter'
import { GalleryCard } from './GalleryCard'
import { ProductDetail } from './ProductDetail'
import { galleryItems } from '@/data/works'
import type { GalleryItem } from '@/types'

export const GalleryGrid = () => {
  const [category, setCategory] = useState<Category>('all')
  const [selected, setSelected] = useState<GalleryItem | null>(null)

  const filtered =
    category === 'all'
      ? galleryItems
      : galleryItems.filter((item) => item.category === category)

  return (
    <div>
      <GalleryFilter active={category} onChange={setCategory} />

      <div className="grid grid-cols-3 gap-6 mt-12">
        <AnimatePresence mode="popLayout">
          {filtered.map((item, i) => (
            <GalleryCard
              key={item.id}
              item={item}
              index={i}
              onClick={() => setSelected(item)}
            />
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-brand-muted mt-20 text-lg font-light">
          暂无该分类下的作品
        </p>
      )}

      <ProductDetail item={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
