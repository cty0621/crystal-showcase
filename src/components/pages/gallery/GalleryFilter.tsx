import { motion } from 'framer-motion'

export type Category = 'all' | 'necklace' | 'bracelet' | 'earrings' | 'ring'

interface GalleryFilterProps {
  active: Category
  onChange: (category: Category) => void
}

const categories: { key: Category; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'necklace', label: '项链' },
  { key: 'bracelet', label: '手链' },
  { key: 'earrings', label: '耳饰' },
  { key: 'ring', label: '戒指' },
]

export const GalleryFilter = ({ active, onChange }: GalleryFilterProps) => {
  return (
    <div className="flex items-center justify-center gap-3">
      {categories.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onChange(cat.key)}
          className="relative px-5 py-2 text-sm font-light tracking-wider transition-colors duration-300"
          style={{ color: active === cat.key ? '#ffffff' : '#8892a4' }}
        >
          {cat.label}
          {active === cat.key && (
            <motion.span
              layoutId="filter-pill"
              className="absolute inset-0 rounded-full glass-shallow"
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          )}
        </button>
      ))}
    </div>
  )
}
