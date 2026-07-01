import { motion } from 'framer-motion'

interface SectionHeadingProps {
  label: string
  title: string
  description?: string
  className?: string
}

export const SectionHeading = ({
  label,
  title,
  description,
  className = '',
}: SectionHeadingProps) => {
  return (
    <div className={`text-center ${className}`}>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-xs uppercase tracking-[0.3em] text-brand-ice/70 mb-4"
      >
        {label}
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-4xl font-light tracking-wide text-brand-heading"
      >
        {title}
      </motion.h2>

      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-12 h-px mx-auto mt-6 mb-6 bg-gradient-to-r from-brand-ice/50 to-brand-lavender/50"
      />

      {description && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-brand-muted font-light text-lg leading-relaxed max-w-2xl mx-auto"
        >
          {description}
        </motion.p>
      )}
    </div>
  )
}
