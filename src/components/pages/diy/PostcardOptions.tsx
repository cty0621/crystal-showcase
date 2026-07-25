import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, X } from 'lucide-react'

const presets = [
  '愿你的每一天都如阳光般灿烂，勇敢追梦，活成自己想要的模样。',
  '愿世间所有美好，都与你环环相扣。',
  '岁月温柔，愿你永远被爱包围。',
  '生日快乐，愿你如花般绽放。',
  '谢谢你出现在我的生命里，温暖了时光。',
  '愿你永远保持热爱，奔赴山海。',
  '平安喜乐，万事胜意。',
  '所愿皆所得，所行皆坦途。',
]

const today = () => new Date().toISOString().slice(0, 10).replace(/-/g, '.')

interface Props { onConfirm: (msg: string) => void; getCenter?: () => { x: number; y: number } | null }

export const PostcardOptions = ({ onConfirm, getCenter }: Props) => {
  const [show, setShow] = useState(false)
  const [opened, setOpened] = useState(false)
  const [preview, setPreview] = useState(false)
  const [msg, setMsg] = useState('')
  const [warn, setWarn] = useState(false)
  const [to, setTo] = useState('挚爱的你')
  // 明信片整体缩放：基准 1.15 放大，视口矮时自动缩小保证信纸完整可见
  const [scale, setScale] = useState(1.15)
  // 明信片锚点：tagline 上方坐标（null 时暂用屏幕中央，测到后立即校正）
  const [center, setCenter] = useState<{ x: number; y: number } | null>(null)
  // 弹窗打开后延迟显示明信片，等待 iframe 内布局稳定、坐标测准
  const [ready, setReady] = useState(false)

  const measure = useCallback(() => {
    const c = getCenter?.()
    if (c) setCenter((prev) => (prev && prev.x === c.x && prev.y === c.y ? prev : c))
  }, [getCenter])

  const openPostcard = () => {
    measure()
    setShow(true)
    setOpened(true)
    setReady(false)
    setTimeout(() => setReady(true), 500)
  }

  // 打开时立即测量，并持续校正 200ms（布局稳定后锚点自动修正）
  useEffect(() => {
    if (!show) return
    measure()
    const t = setInterval(measure, 200)
    return () => clearInterval(t)
  }, [show, measure])

  useEffect(() => {
    const update = () => setScale(Math.min(1.15, (window.innerHeight - 96) / 740))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const close = () => { setOpened(false); setPreview(false); setTimeout(() => setShow(false), 700) }
  const confirm = () => {
    if (msg.trim()) { onConfirm(msg); close() }
    else setWarn(true)
  }

  return (
    <>
      <button onClick={openPostcard} className="flex items-center gap-2 px-4 py-2 rounded-full glass-shallow text-sm font-light tracking-wider text-brand-heading hover:text-brand-ice transition-all duration-300">
        <Mail className="w-4 h-4" strokeWidth={1} />明信片寄语
      </button>

      {createPortal(
        <AnimatePresence>
        {show && (
          <motion.div className="fixed inset-0 z-50" style={{ background:'rgba(10,14,23,0.55)' }}
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={close}>
            <div style={{ position:'absolute',left:center?.x ?? '50%',top:center?.y ?? '50%',width:480,height:540,display:'flex',alignItems:'center',justifyContent:'center',
              transform:`translate(-50%,-50%) scale(${scale})`,transformOrigin:'center center',opacity:ready?1:0,transition:'opacity .4s' }}
              onClick={e => e.stopPropagation()}>

              {/* ====== 长方形信封 ====== */}
              <motion.div style={{ position:'relative',width:400,height:260,cursor:'pointer' }}
                initial={{ scale:.85,opacity:0 }} animate={{ scale:1,opacity:1 }} exit={{ scale:.9,opacity:0 }}
                transition={{ duration:.6 }}
                onClick={() => { if(!opened) { setOpened(true); setPreview(false) } else if(!preview) { setPreview(true) } else { close() } }}>

                {/* 主体 */}
                <div style={{ position:'absolute',inset:0,background:'linear-gradient(175deg,#ead5d8,#e2c8cc 25%,#dbbcc1 60%,#d4b3b8)',borderRadius:4,boxShadow:'0 16px 48px rgba(180,150,155,.25),0 4px 12px rgba(0,0,0,.06),inset 0 1px 0 rgba(255,255,255,.25)' }}>
                  <div style={{ position:'absolute',inset:0,backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.015) 3px,rgba(0,0,0,.015) 3.5px),repeating-linear-gradient(90deg,transparent,transparent 6px,rgba(0,0,0,.008) 6px,rgba(0,0,0,.008) 6.5px)',opacity:.7 }} />
                  <div style={{ position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(255,255,255,.15),transparent 40%),linear-gradient(0deg,rgba(0,0,0,.03),transparent 30%)' }} />
                  <div style={{ position:'absolute',inset:12,border:'1.5px solid rgba(255,255,255,.45)',borderRadius:2 }} />
                  <div style={{ position:'absolute',inset:17,border:'1px dashed rgba(255,255,255,.2)',borderRadius:1 }} />
                </div>

                {/* 缎带蝴蝶结 */}
                <motion.div style={{ position:'absolute',top:'50%',left:'50%',zIndex:20,pointerEvents:'none' }}
                  animate={{ x:'-50%',y:'-50%',scale:opened?.85:1,opacity:opened?.7:1 }} transition={{ duration:.5 }}>
                  <div style={{ position:'absolute',top:'50%',left:-36,right:-36,height:16,transform:'translateY(-50%)',background:'linear-gradient(180deg,#e8dbb0,#ddce98 30%,#d4c380 50%,#cdbc72 70%,#d4c380)',borderRadius:2,boxShadow:'0 2px 8px rgba(160,140,90,.2),inset 0 1px 0 rgba(255,255,255,.4)' }} />
                  <div style={{ display:'flex',alignItems:'center',justifyContent:'center' }}>
                    <div style={{ width:34,height:24,background:'linear-gradient(135deg,#e8dbb0,#ddce98 40%,#d4c380)',borderRadius:'50% 10% 50% 50%',transform:'rotate(18deg) translateX(5px)',boxShadow:'0 2px 8px rgba(160,140,90,.25),inset 0 1px 0 rgba(255,255,255,.4)' }} />
                    <div style={{ width:20,height:16,background:'linear-gradient(180deg,#f0e8c8,#d4c380 50%,#c4b060)',borderRadius:'50%',zIndex:2,boxShadow:'0 2px 6px rgba(140,120,70,.3),inset 0 1px 0 rgba(255,255,255,.5)',margin:'0 -3px' }} />
                    <div style={{ width:34,height:24,background:'linear-gradient(225deg,#e8dbb0,#ddce98 40%,#d4c380)',borderRadius:'10% 50% 50% 50%',transform:'rotate(-18deg) translateX(-5px)',boxShadow:'0 2px 8px rgba(160,140,90,.25),inset 0 1px 0 rgba(255,255,255,.4)' }} />
                  </div>
                  <div style={{ display:'flex',gap:3,justifyContent:'center',marginTop:-1 }}>
                    <div style={{ width:10,height:20,background:'linear-gradient(180deg,#d4c380,#d8ca8e 40%,#c4b060)',borderRadius:'0 0 4px 4px',transform:'rotate(6deg)',boxShadow:'inset 0 1px 0 rgba(255,255,255,.3)' }} />
                    <div style={{ width:10,height:20,background:'linear-gradient(180deg,#d4c380,#d8ca8e 40%,#c4b060)',borderRadius:'0 0 4px 4px',transform:'rotate(-6deg)',boxShadow:'inset 0 1px 0 rgba(255,255,255,.3)' }} />
                  </div>
                </motion.div>

                {/* 封盖 */}
                <motion.div style={{ position:'absolute',top:0,left:0,right:0,zIndex:8,height:'50%',background:'linear-gradient(180deg,#f2e0e4,#ead5d8 50%,#e2c8cc)',clipPath:'polygon(0 0,100% 0,50% 100%)',borderRadius:'4px 4px 0 0',boxShadow:'0 2px 6px rgba(0,0,0,.04)',transformOrigin:'bottom center' }}
                  animate={{ rotateX:opened?-175:0 }} transition={{ duration:1.2,ease:[.42,0,.58,1] }}>
                  <div style={{ position:'absolute',bottom:0,left:0,right:0,height:1,background:'rgba(180,150,155,.3)' }} />
                </motion.div>

                {/* 信纸 */}
                <AnimatePresence>
                  {opened && (
                    <motion.div style={{ position:'absolute',left:8,right:8,zIndex:30,background:'linear-gradient(175deg,#fdfaf4,#f9f3e8)',boxShadow:'0 12px 40px rgba(0,0,0,.1)',padding:'32px 28px 26px',borderRadius:2 }}
                      initial={{ y:20,opacity:0 }} animate={{ y:preview?-180:-300,opacity:1 }} exit={{ y:20,opacity:0 }}
                      transition={{ duration:1,ease:[.34,1,.64,1] }}>
                      {/* 法式装饰边框 */}
                      <div style={{ position:'absolute',inset:10,border:'1px solid rgba(180,150,120,0.1)',borderRadius:1,pointerEvents:'none' }} />
                      <div style={{ position:'absolute',inset:14,border:'0.5px solid rgba(180,150,120,0.05)',borderRadius:1,pointerEvents:'none' }} />
                      {/* 四角鸢尾花纹 */}
                      {[{t:8,l:10,r:0},{t:8,l:0,r:10}].map((p,i) => (
                        <span key={i} style={{ position:'absolute',top:p.t,left:p.l||undefined,right:p.r||undefined,fontSize:36,opacity:.03,color:'#b8956a',pointerEvents:'none' }}>&#9884;</span>
                      ))}
                      {[{b:8,l:10},{b:8,r:10}].map((p,i) => (
                        <span key={i} style={{ position:'absolute',bottom:p.b,left:p.l||undefined,right:p.r||undefined,fontSize:36,opacity:.03,color:'#b8956a',pointerEvents:'none',transform:'scaleY(-1)' }}>&#9884;</span>
                      ))}
                      {/* 散落小花 */}
                      <span style={{ position:'absolute',top:'15%',right:18,fontSize:16,opacity:.04,pointerEvents:'none' }}>🌸</span>
                      <span style={{ position:'absolute',bottom:'25%',left:16,fontSize:14,opacity:.03,pointerEvents:'none' }}>🌿</span>
                      <span style={{ position:'absolute',top:'40%',left:12,fontSize:18,opacity:.03,pointerEvents:'none' }}>⚜</span>

                      <div style={{ display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',gap:2,position:'relative',zIndex:1 }}>
                        <div style={{ display:'flex',alignItems:'center',gap:6,marginBottom:2 }}>
                          <div style={{ width:20,height:.5,background:'linear-gradient(90deg,transparent,#d4c0a0)' }} />
                          <span style={{ fontSize:8,opacity:.2 }}>✦</span>
                          <div style={{ width:20,height:.5,background:'linear-gradient(90deg,#d4c0a0,transparent)' }} />
                        </div>

                        {/* Yoliya 标题 */}
                        <span style={{ fontFamily:"'Playfair Display','Cormorant Garamond',serif",fontSize:42,fontWeight:400,color:'#b8956a',lineHeight:1.1,letterSpacing:'.08em',fontStyle:'italic',textShadow:'0 1px 3px rgba(180,140,100,.10)' }}>Yoliya</span>
                        <div style={{ width:36,height:.5,margin:'3px auto',background:'linear-gradient(90deg,transparent,#d4c0a0,#d4c0a0,transparent)' }} />

                        {/* To */}
                        <div style={{ display:'flex',alignItems:'center',gap:6,marginTop:4 }}>
                          <span style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:14,color:'#b8a080',fontWeight:300,fontStyle:'italic' }}>To:</span>
                          <input value={to} onChange={e => setTo(e.target.value)} onClick={e => e.stopPropagation()}
                            style={{ border:'none',borderBottom:'1px solid #e0d5c8',background:'transparent',fontFamily:"'Noto Serif SC',serif",fontSize:14,color:'#8B7355',fontWeight:300,width:140,textAlign:'center',outline:'none',padding:'2px 0' }} />
                        </div>

                        {/* 预设 + 编辑 */}
                        {!preview && (
                          <>
                            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:3,padding:'6px 0',maxWidth:280 }}>
                              {presets.map(p => (
                                <button key={p} onClick={e => { e.stopPropagation(); setMsg(p); setWarn(false) }}
                                  style={{ padding:'4px 8px',fontSize:10,textAlign:'center',borderRadius:3,fontFamily:"'Noto Serif SC',serif",fontWeight:300,letterSpacing:'.02em',background:msg===p?'rgba(228,200,200,.2)':'transparent',color:msg===p?'#b8956a':'#b8a080',border:msg===p?'1px solid rgba(200,170,160,.3)':'1px solid transparent',cursor:'pointer',transition:'all .2s' }}>
                                  {p}
                                </button>
                              ))}
                            </div>
                            <textarea value={msg} onChange={e => { setMsg(e.target.value); setWarn(false) }} placeholder="或手写祝福..." rows={3} maxLength={80} onClick={e => e.stopPropagation()}
                              style={{ width:'100%',maxWidth:280,background:'transparent',resize:'none',textAlign:'center',border:'none',borderBottom:'1px dashed #e0d5c8',padding:'6px 0',fontFamily:"'Ma Shan Zheng','STKaiti','KaiTi',cursive",fontSize:16,color:'#8B7355',letterSpacing:'.04em',outline:'none' }} />
                          </>
                        )}

                        {/* 预览 */}
                        {preview && (
                          <div style={{ padding:'10px 4px',maxWidth:280,textAlign:'center' }}>
                            <p style={{ fontFamily:"'Noto Serif SC',serif",fontSize:15,color:'#8B7355',fontWeight:300,lineHeight:1.9,letterSpacing:'.05em',margin:0 }}>{msg || '未填写祝福语'}</p>
                          </div>
                        )}

                        {/* 右下落款 */}
                        <div style={{ display:'flex',flexDirection:'column',alignItems:'flex-end',width:'100%',marginTop:10,paddingRight:4 }}>
                          <input defaultValue="Yoliya 珠宝" onClick={e => e.stopPropagation()}
                            style={{ border:'none',borderBottom:'1px solid #e0d5c8',background:'transparent',fontFamily:"'Cormorant Garamond','Playfair Display',serif",fontSize:14,color:'#b8956a',fontWeight:400,fontStyle:'italic',letterSpacing:'.1em',width:140,textAlign:'right',outline:'none',padding:'1px 0' }} />
                          <input defaultValue={today()} onClick={e => e.stopPropagation()}
                            style={{ border:'none',borderBottom:'1px solid #e8ddd0',background:'transparent',fontFamily:"'Cormorant Garamond',serif",fontSize:10,color:'#c8b098',fontWeight:300,letterSpacing:'.18em',width:100,textAlign:'right',outline:'none',padding:'1px 0',marginTop:2 }} />
                        </div>

                        {/* 按钮 */}
                        <div style={{ display:'flex',alignItems:'center',gap:8,marginTop:6 }}>
                          {msg && <span style={{ fontSize:10,color:'#c9a84c' }}>{msg.length}/80</span>}
                          {warn && !msg.trim() && <span style={{ fontSize:10,color:'#d495a4' }}>请先填写祝福语</span>}
                          {!preview ? (
                            <button onClick={e => { e.stopPropagation(); if (msg.trim()) setPreview(true); else setWarn(true) }}
                              style={{ padding:'5px 16px',borderRadius:20,fontSize:11,letterSpacing:'.1em',background:'linear-gradient(135deg,#e8b4c0,#d495a4)',color:'#fff',border:'none',cursor:'pointer',opacity:msg.trim()?1:.55,boxShadow:'0 2px 8px rgba(200,140,160,.3)',transition:'all .3s',fontFamily:"'Noto Serif SC',serif",fontWeight:300 }}>
                              预览效果
                            </button>
                          ) : (
                            <button onClick={e => { e.stopPropagation(); confirm() }}
                              style={{ padding:'5px 18px',borderRadius:20,fontSize:11,letterSpacing:'.1em',background:'linear-gradient(135deg,#e8b4c0,#d495a4)',color:'#fff',border:'none',cursor:'pointer',boxShadow:'0 2px 8px rgba(200,140,160,.3)',transition:'all .3s',fontFamily:"'Noto Serif SC',serif",fontWeight:300 }}>
                              确认祝福
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* 提示 */}
              <div style={{ position:'absolute',bottom:-32,left:'50%',transform:'translateX(-50%)',fontSize:11,color:'rgba(255,255,255,.5)',letterSpacing:'.2em',whiteSpace:'nowrap',pointerEvents:'none' }}>
                {!opened ? '✦ 点击信封开启 ✦' : !preview ? '✦ 编辑后点击预览 ✦' : '✦ 点击信封确认 ✦'}
              </div>

              <button onClick={close} style={{ position:'absolute',top:-8,right:-8,zIndex:30,width:32,height:32,borderRadius:'50%',background:'rgba(255,255,255,.25)',backdropFilter:'blur(4px)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#8B7355' }}>
                <X size={16} strokeWidth={1} />
              </button>
            </div>
          </motion.div>
        )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
