import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, X, Check } from 'lucide-react'

interface GiftStyle {
  id: string
  name: string
  desc: string
  price: number
  box: string       // 盒身颜色
  lid: string       // 盒盖颜色
  ribbon: string    // 丝带颜色
  inner: string     // 内衬颜色
  style: 'classic' | 'luxe' | 'modern' | 'floral'
}

const giftStyles: GiftStyle[] = [
  {
    id: 'classic-brown', name: '经典牛皮', desc: '复古牛皮纸盒 · 酒红丝带',
    price: 68, box: '#c4a87c', lid: '#b8956a', ribbon: '#8B1A2B', inner: '#f5f0e8',
    style: 'classic',
  },
  {
    id: 'velvet-red', name: '丝绒酒红', desc: '丝绒质感礼盒 · 金色丝带',
    price: 88, box: '#6B1A2A', lid: '#7a1e30', ribbon: '#DAA520', inner: '#fdf6f0',
    style: 'luxe',
  },
  {
    id: 'white-gold', name: '象牙鎏金', desc: '象牙白钢琴烤漆 · 香槟金丝带',
    price: 98, box: '#f5f0e8', lid: '#ede4d5', ribbon: '#d4c380', inner: '#fdfaf4',
    style: 'luxe',
  },
  {
    id: 'blush-pink', name: '裸粉浪漫', desc: '哑光裸粉盒身 · 缎面粉丝带',
    price: 78, box: '#e8d0d4', lid: '#ddc4ca', ribbon: '#f0c0c8', inner: '#fdf6f8',
    style: 'floral',
  },
  {
    id: 'navy-gold', name: '曜石灰蓝', desc: '深灰蓝磨砂盒 · 哑金丝带',
    price: 88, box: '#2c3a4a', lid: '#34485a', ribbon: '#c4a860', inner: '#fafaf8',
    style: 'modern',
  },
  {
    id: 'forest-green', name: '墨绿松柏', desc: '墨绿纹理盒身 · 米白丝带',
    price: 78, box: '#3d5a40', lid: '#4a6e4e', ribbon: '#f0ede0', inner: '#fdfaf4',
    style: 'modern',
  },
]

interface GiftOptionsProps { onConfirm: (gift: GiftStyle) => void }

export const GiftOptions = ({ onConfirm }: GiftOptionsProps) => {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<GiftStyle | null>(null)

  const handleConfirm = () => {
    if (selected) {
      onConfirm(selected)
      setOpen(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full glass-shallow text-sm font-light tracking-wider text-brand-heading hover:text-brand-ice transition-all duration-300"
      >
        <Gift className="w-4 h-4" strokeWidth={1} />礼盒包装
      </button>

      {createPortal(
        <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background:'rgba(10,14,23,0.72)' }}
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setOpen(false)}>
            <motion.div className="glass-medium rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[85vh] overflow-auto"
              initial={{ scale:.9,opacity:0,y:20 }} animate={{ scale:1,opacity:1,y:0 }} exit={{ scale:.9,opacity:0,y:20 }}
              onClick={e => e.stopPropagation()}>

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-light text-brand-heading flex items-center gap-2">
                  <Gift className="w-5 h-5 text-brand-ice" strokeWidth={1} />选择礼盒包装
                </h3>
                <button onClick={() => setOpen(false)} className="text-brand-muted hover:text-brand-heading transition-colors">
                  <X className="w-5 h-5" strokeWidth={1} />
                </button>
              </div>

              {/* 礼盒 — 三列网格，一览无余 */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {giftStyles.map((gs) => (
                  <motion.button
                    key={gs.id}
                    onClick={() => setSelected(gs)}
                    whileTap={{ scale:.96 }}
                    animate={{ scale: selected?.id === gs.id ? 1.03 : 1 }}
                    className={`p-4 rounded-xl text-left transition-colors duration-300 border ${
                      selected?.id === gs.id
                        ? 'border-brand-ice/40 bg-brand-ice/5 shadow-[0_0_20px_rgba(126,200,227,0.1)]'
                        : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.15]'
                    }`}>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="relative flex-shrink-0" style={{ width:72,height:56 }}>
                        {/* 盒身 */}
                        <div className="absolute bottom-0 left-2 right-2 rounded-sm" style={{ height:36,background:gs.box,boxShadow:'0 2px 8px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.15)' }}>
                          <div className="absolute inset-0 rounded-sm" style={{ opacity:.15,backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.3) 2px,rgba(0,0,0,.3) 3px)' }} />
                        </div>
                        {/* 盒盖 */}
                        <div className="absolute top-0 left-0 right-0 rounded-t-sm" style={{ height:22,background:gs.lid,boxShadow:'0 2px 4px rgba(0,0,0,.15), inset 0 1px 0 rgba(255,255,255,.2)' }}>
                          <div className="absolute inset-0 rounded-t-sm" style={{ opacity:.1,backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.3) 2px,rgba(0,0,0,.3) 3px)' }} />
                        </div>
                        {/* 丝带十字 */}
                        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-10" style={{ width:6,background:`linear-gradient(180deg,${gs.ribbon}cc,${gs.ribbon},${gs.ribbon}cc)`,boxShadow:'0 1px 3px rgba(0,0,0,.2)' }} />
                        <div className="absolute left-0 right-0 top-[30px] z-10" style={{ height:5,background:`linear-gradient(90deg,${gs.ribbon}cc,${gs.ribbon},${gs.ribbon}cc)`,boxShadow:'0 1px 3px rgba(0,0,0,.2)' }} />
                        {/* 蝴蝶结 */}
                        <div className="absolute top-[18px] left-1/2 -translate-x-1/2 z-20 flex items-center">
                          <div style={{ width:12,height:8,background:`linear-gradient(135deg,${gs.ribbon},${gs.ribbon}dd)`,borderRadius:'50% 20% 50% 50%',transform:'rotate(15deg) translateX(3px)',boxShadow:'0 1px 3px rgba(0,0,0,.2)' }} />
                          <div style={{ width:6,height:6,background:`linear-gradient(180deg,${gs.ribbon}ee,${gs.ribbon})`,borderRadius:'50%',zIndex:1,boxShadow:'0 1px 2px rgba(0,0,0,.3)' }} />
                          <div style={{ width:12,height:8,background:`linear-gradient(225deg,${gs.ribbon},${gs.ribbon}dd)`,borderRadius:'20% 50% 50% 50%',transform:'rotate(-15deg) translateX(-3px)',boxShadow:'0 1px 3px rgba(0,0,0,.2)' }} />
                        </div>
                        {/* 选中标记 */}
                        {selected?.id === gs.id && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-brand-ice flex items-center justify-center z-30 shadow-[0_0_8px_rgba(126,200,227,.4)]">
                            <Check className="w-3.5 h-3.5 text-[#0a0e17]" strokeWidth={2.5} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-light text-brand-heading mb-1">{gs.name}</div>
                        <div className="text-xs text-brand-muted leading-relaxed">{gs.desc}</div>
                        <div className="text-xs text-brand-ice mt-1.5 font-light">¥{gs.price}</div>
                      </div>
                    </div>

                    {/* 内衬预览 */}
                    <div className="rounded-lg overflow-hidden" style={{ height:28,background:gs.inner,boxShadow:'inset 0 2px 6px rgba(0,0,0,.06)' }}>
                      <div className="h-full flex items-center justify-center" style={{ background:`linear-gradient(180deg,transparent 60%,${gs.box}18)` }}>
                        <span className="text-[9px] tracking-wider opacity-40" style={{ color:gs.box }}>CRYSTAL JEWELRY</span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* 底部 */}
              <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                <p className="text-xs text-brand-muted">
                  {selected ? `已选：${selected.name} · ¥${selected.price}` : '请选择一款礼盒'}
                </p>
                <button
                  onClick={handleConfirm}
                  disabled={!selected}
                  className="px-6 py-2.5 rounded-full text-sm font-light tracking-wider transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: selected ? 'linear-gradient(135deg, #e8b4c0, #d495a4)' : 'rgba(255,255,255,0.06)',
                    color: selected ? '#fff' : '#8892a4',
                  }}
                >
                  确认礼盒
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
