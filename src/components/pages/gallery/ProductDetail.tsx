import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { X, ShoppingBag } from 'lucide-react'
import { ModelViewer } from '@/components/gallery/ModelViewer'
import type { GalleryItem } from '@/types'

const categoryLabels: Record<string, string> = {
  necklace: '项链', bracelet: '手链', earrings: '耳饰', ring: '戒指',
}

interface Props { item: GalleryItem | null; onClose: () => void }

export const ProductDetail = ({ item, onClose }: Props) => {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const targetX = useRef(0); const targetY = useRef(0)
  const autoAngle = useRef(0); const [isDragging, setIsDragging] = useState(false)
  const lastPos = useRef({ x: 0, y: 0 })

  const rotX = useRef(0); const rotY = useRef(0)
  const animate = useCallback(() => {
    if (!isDragging) { autoAngle.current += 0.3; targetX.current = Math.sin(autoAngle.current * Math.PI / 180) * 20; targetY.current = 15 }
    rotX.current += (targetX.current - rotX.current) * 0.08; rotY.current += (targetY.current - rotY.current) * 0.08
    if (containerRef.current) containerRef.current.style.transform = `perspective(1000px) rotateX(${rotY.current}deg) rotateY(${rotX.current}deg)`
    requestAnimationFrame(animate)
  }, [isDragging])

  useEffect(() => { const id = requestAnimationFrame(animate); return () => cancelAnimationFrame(id) }, [animate])

  const pd = (e: React.PointerEvent) => { setIsDragging(true); lastPos.current = { x: e.clientX, y: e.clientY }; (e.target as HTMLElement).setPointerCapture(e.pointerId) }
  const pm = (e: React.PointerEvent) => { if (!isDragging) return; targetX.current += (e.clientX - lastPos.current.x) * 0.5; targetY.current = Math.max(-40, Math.min(40, targetY.current - (e.clientY - lastPos.current.y) * 0.5)); lastPos.current = { x: e.clientX, y: e.clientY } }
  const pu = () => setIsDragging(false)

  return (
    <AnimatePresence>
      {item && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="glass-medium rounded-2xl max-w-4xl w-[90%] max-h-[90vh] flex flex-col md:flex-row overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }} transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={e => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
              <X className="w-4 h-4 text-white/70" strokeWidth={1} />
            </button>

            {/* 左侧 — 3D 预览 */}
            <div className="flex-1 md:flex-[6] bg-white/[0.01] relative overflow-hidden min-h-[400px]">
              {item.model3d ? (
                <ModelViewer
                  modelPath={item.model3d}
                  mode={item.category === 'necklace' ? 'necklace' : item.category === 'earrings' ? 'earrings' : item.category === 'ring' ? 'ring' : 'default'}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
                  onPointerDown={pd} onPointerMove={pm} onPointerUp={pu} onPointerLeave={pu}>
                  <div className="absolute w-48 h-48 rounded-full bg-brand-ice/10 blur-[80px]" />
                  <div ref={containerRef} className="relative w-64 h-64" style={{ transformStyle: 'preserve-3d' }}>
                    <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'translateZ(40px)' }}>
                      <div className="w-36 h-36 rounded-full bg-gradient-to-br from-brand-ice/15 to-brand-lavender/10 border-2 border-white/10 flex items-center justify-center"
                        style={{ boxShadow: '0 0 60px rgba(126,200,227,0.2), 0 0 0 16px rgba(126,200,227,0.04), 0 0 0 32px rgba(126,200,227,0.02)' }}>
                        <div className="w-16 h-16 rounded-full bg-brand-ice/25 flex items-center justify-center"
                          style={{ boxShadow: '0 0 40px rgba(126,200,227,0.4)' }}><span className="text-2xl">💎</span></div>
                      </div>
                    </div>
                    <div className="absolute inset-0 rounded-full border border-brand-ice/15" style={{ transform: 'rotateX(70deg)', animation: 'spinA 8s linear infinite' }} />
                    <div className="absolute inset-0 rounded-full border border-brand-lavender/12" style={{ transform: 'rotateY(70deg)', animation: 'spinB 10s linear infinite' }} />
                  </div>
                </div>
              )}
            </div>

            {/* 右侧详情 */}
            <div className="flex-1 md:flex-[4] p-6 flex flex-col justify-center">
              <span className="text-xs uppercase tracking-[0.25em] text-brand-ice/60 mb-3">{categoryLabels[item.category]}</span>
              <h2 className="text-3xl font-light text-brand-heading mb-2">{item.title}</h2>
              <p className="text-sm text-brand-muted font-light leading-relaxed mb-6">{item.description}</p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3"><span className="text-xs text-brand-muted/60 tracking-wider w-16">材质</span><span className="text-sm text-brand-heading font-light">{item.material}</span></div>
                <div className="flex items-center gap-3"><span className="text-xs text-brand-muted/60 tracking-wider w-16">工艺</span><span className="text-sm text-brand-heading font-light">手工精制</span></div>
                <div className="flex items-center gap-3"><span className="text-xs text-brand-muted/60 tracking-wider w-16">编号</span><span className="text-sm text-brand-heading font-light">#{item.id}</span></div>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => { onClose(); navigate('/diy') }}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#0a0e17] text-sm font-light tracking-[0.1em] hover:bg-brand-ice transition-colors duration-300">
                  <ShoppingBag className="w-4 h-4" strokeWidth={1} />定制咨询
                </button>
                <button className="px-6 py-3 rounded-full glass-shallow text-sm font-light tracking-[0.1em] text-brand-heading hover:text-brand-ice transition-colors duration-300">了解更多</button>
              </div>
            </div>
          </motion.div>
          <style>{`
            @keyframes spinA { from { transform: rotateX(70deg) rotate(0deg); } to { transform: rotateX(70deg) rotate(360deg); } }
            @keyframes spinB { from { transform: rotateY(70deg) rotate(0deg); } to { transform: rotateY(70deg) rotate(360deg); } }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
