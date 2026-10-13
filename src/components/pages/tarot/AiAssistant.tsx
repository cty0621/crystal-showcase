import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { CrystalSprite } from './CrystalSprite'
import { computeBazi, getTodayStemElement } from '@/lib/bazi'
import { computeFortune, type FortuneReport } from '@/lib/fortuneEngine'

/** 聊天消息 */
interface ChatMessage {
  id: number
  from: 'assistant' | 'user'
  /** 文本消息（分段用换行分隔，渲染时逐段打字出现） */
  text?: string
  /** 报告消息（完整渲染为卡片） */
  report?: FortuneReport
}

const STORAGE_KEY = 'cj_fortune_birth_v1'

/* ── 可拖动 AI 小助手 ── */
const ASSISTANT_POS_KEY = 'cj_assistant_pos_v1'
const ASSISTANT_EST_W = 200 // 按钮估计宽高（挂载后按实际尺寸校正）
const ASSISTANT_EST_H = 76
const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

function loadAssistantPos(): { x: number; y: number } {
  try {
    const raw = localStorage.getItem(ASSISTANT_POS_KEY)
    if (raw) {
      const p = JSON.parse(raw) as { x: number; y: number }
      if (typeof p.x === 'number' && typeof p.y === 'number') {
        return { x: clamp(p.x, 0, window.innerWidth - ASSISTANT_EST_W), y: clamp(p.y, 0, window.innerHeight - ASSISTANT_EST_H) }
      }
    }
  } catch { /* 静默降级 */ }
  return { x: window.innerWidth - ASSISTANT_EST_W - 24, y: window.innerHeight - ASSISTANT_EST_H - 24 }
}

interface BirthInput { y: string; m: string; d: string; hourIndex: number }

const HOUR_BRANCHES = ['子时 23-1', '丑时 1-3', '寅时 3-5', '卯时 5-7', '辰时 7-9', '巳时 9-11', '午时 11-13', '未时 13-15', '申时 15-17', '酉时 17-19', '戌时 19-21', '亥时 21-23']

function loadBirth(): BirthInput | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as BirthInput) : null
  } catch { return null }
}

function saveBirth(b: BirthInput) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(b)) } catch { /* 静默降级 */ }
}

export const AiAssistant = () => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [birth, setBirth] = useState<BirthInput>(() => loadBirth() ?? { y: '', m: '', d: '', hourIndex: 4 })
  const [computing, setComputing] = useState(false)
  const [done, setDone] = useState(false)
  const nextId = useRef(1)
  const scrollRef = useRef<HTMLDivElement>(null)

  // ── 可拖动 AI 小助手 ──
  const [assistantPos, setAssistantPos] = useState<{ x: number; y: number }>(() => loadAssistantPos())
  const assistantPosRef = useRef(assistantPos)
  const assistantBtnRef = useRef<HTMLButtonElement>(null)
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number; w: number; h: number; moved: boolean } | null>(null)
  const [dragging, setDragging] = useState(false)

  const handleAssistantPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const el = e.currentTarget
    dragRef.current = {
      startX: e.clientX, startY: e.clientY,
      baseX: assistantPos.x, baseY: assistantPos.y,
      w: el.offsetWidth, h: el.offsetHeight,
      moved: false,
    }
    el.setPointerCapture(e.pointerId)
    setDragging(true)
  }

  const handleAssistantPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current
    if (!d) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true
    const next = {
      x: clamp(d.baseX + dx, 0, window.innerWidth - d.w),
      y: clamp(d.baseY + dy, 0, window.innerHeight - d.h),
    }
    assistantPosRef.current = next
    setAssistantPos(next)
  }

  const handleAssistantPointerUp = () => {
    const d = dragRef.current
    dragRef.current = null
    setDragging(false)
    if (!d || !d.moved) {
      setOpen((v) => !v) // 未发生拖拽 → 视为点击，开关聊天窗
    } else {
      try { localStorage.setItem(ASSISTANT_POS_KEY, JSON.stringify(assistantPosRef.current)) } catch { /* 静默降级 */ }
    }
  }

  // 挂载后按按钮实际尺寸校正位置；窗口尺寸变化时收回可视范围
  useEffect(() => {
    const fix = () => {
      const el = assistantBtnRef.current
      const w = el?.offsetWidth ?? ASSISTANT_EST_W
      const h = el?.offsetHeight ?? ASSISTANT_EST_H
      setAssistantPos((p) => ({
        x: clamp(p.x, 0, window.innerWidth - w),
        y: clamp(p.y, 0, window.innerHeight - h),
      }))
    }
    fix()
    window.addEventListener('resize', fix)
    return () => window.removeEventListener('resize', fix)
  }, [])

  const push = (msg: Omit<ChatMessage, 'id'>) => {
    setMessages((prev) => [...prev, { ...msg, id: nextId.current++ }])
  }

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const greet = () => {
    setMessages([])
    setDone(false)
    const hasBirth = loadBirth()
    push({ from: 'assistant', text: hasBirth ? '又见面啦 ✨ 已为你填入上次的生辰，可以直接开始今天的测算。' : '你好呀，我是你的水晶小精灵 ✨\n告诉我你的生辰八字（出生日期 + 时辰），我帮你看今天的运势和适合佩戴的水晶。' })
  }

  useEffect(() => {
    if (open && messages.length === 0) greet()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleSubmit = () => {
    const y = Number(birth.y), m = Number(birth.m), d = Number(birth.d)
    const now = new Date()
    if (!birth.y || !birth.m || !birth.d || Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) {
      push({ from: 'assistant', text: '请先完整选择你的出生年月日哦 🌙' })
      return
    }
    if (y < 1900 || y > now.getFullYear() || m < 1 || m > 12 || d < 1 || d > 31) {
      push({ from: 'assistant', text: '这个日期看起来不太对呢，请检查一下出生日期（1900 年至今）。' })
      return
    }
    // 整数校验 + 日期回验：拒绝 "1995.5" 这类非整数与 2026-02-31 这类被 Date 归一化的非法日期
    if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)
      || new Date(y, m - 1, d).getDate() !== d) {
      push({ from: 'assistant', text: '这个日期看起来不太对呢，请检查一下出生日期（1900 年至今）。' })
      return
    }
    if (new Date(y, m - 1, d) > now) {
      push({ from: 'assistant', text: '出生日期不能是未来哦，请重新选择。' })
      return
    }
    saveBirth(birth)
    push({ from: 'user', text: `${y} 年 ${m} 月 ${d} 日 · ${HOUR_BRANCHES[birth.hourIndex].split(' ')[0]}` })
    setComputing(true)

    // 分阶段输出，模拟 AI 思考/打字节奏
    setTimeout(() => {
      let report: FortuneReport
      try {
        const bazi = computeBazi(y, m, d, birth.hourIndex)
        const today = getTodayStemElement()
        report = computeFortune(bazi, today)
      } catch {
        push({ from: 'assistant', text: '抱歉，测算出了点小问题，请重新试一次 🙏' })
        setComputing(false)
        return
      }
      push({ from: 'assistant', text: '让我看看你的八字… 🤔\n你的日主是 ' +
        `${report.dayMasterGanZhi}（${report.dayMasterElement}）· 今日日柱 ${report.todayGanZhi} · ${report.baziSummary}` })
      setTimeout(() => {
        push({ from: 'assistant', text: '嗯，你的今日运势已经显现了：' })
        setTimeout(() => {
          push({ from: 'assistant', report })
          setComputing(false)
          setDone(true)
        }, 900)
      }, 1600)
    }, 1200)
  }

  const handleReset = () => {
    greet()
  }

  return (
    <>
      {/* 悬浮按钮 · 水晶小精灵（带边框 · 放大版 · 可拖动） */}
      <motion.button
        ref={assistantBtnRef}
        className="fixed z-40 select-none flex items-center gap-3 pl-2 pr-7 py-2.5 rounded-full glass-shallow glow-border"
        style={{
          left: assistantPos.x,
          top: assistantPos.y,
          background: 'rgba(20,16,26,0.85)',
          border: '1.5px solid rgba(200,170,100,0.35)',
          backdropFilter: 'blur(12px)',
          touchAction: 'none',
          cursor: dragging ? 'grabbing' : 'grab',
        }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onPointerDown={handleAssistantPointerDown}
        onPointerMove={handleAssistantPointerMove}
        onPointerUp={handleAssistantPointerUp}
        aria-label="水晶小精灵 AI 助手（可拖动）"
        title="水晶小精灵 · 拖动移动，点击开启今日运势"
      >
        <CrystalSprite size={56} />
        <span className="flex flex-col items-start leading-tight text-left">
          <span className="text-base text-brand-heading tracking-[0.12em] font-light">水晶小精灵</span>
          <span className="text-[11px] text-[#d4c090]/75 tracking-[0.18em] mt-0.5">今日运势</span>
        </span>
      </motion.button>

      {/* 聊天窗 */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-24 right-6 z-50 w-[min(420px,calc(100vw-2rem))] max-h-[min(640px,calc(100vh-8rem))] overflow-hidden rounded-2xl"
            style={{ background: 'linear-gradient(170deg, #1a1520 0%, #0d0a12 100%)', border: '1.5px solid rgba(200,170,100,0.3)', boxShadow: '0 24px 60px rgba(0,0,0,0.55)' }}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25 }}
          >
            {/* 头部 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <CrystalSprite size={30} />
                <span className="text-sm tracking-[0.2em] text-brand-heading font-light">水晶小精灵 · 八字运势</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-brand-muted hover:text-brand-heading transition-colors" aria-label="关闭">
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* 消息区 */}
            <div ref={scrollRef} className="px-5 py-4 space-y-3 overflow-y-auto max-h-[min(480px,max(180px,calc(100vh-24rem)))]">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.report ? (
                    <ReportCard report={msg.report} onCrystalClick={(name) => navigate(`/diy?crystal=${encodeURIComponent(name)}`)} />
                  ) : (
                    <div
                      className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm font-light leading-relaxed whitespace-pre-line ${
                        msg.from === 'user'
                          ? 'bg-brand-ice/10 text-brand-text border border-brand-ice/20 rounded-br-md'
                          : 'bg-white/[0.04] text-white/80 border border-white/[0.06] rounded-bl-md'
                      }`}
                    >
                      {msg.text}
                    </div>
                  )}
                </div>
              ))}

              {/* 生辰输入表单 */}
              {!computing && !done && (
                <div className="pt-2">
                  <p className="text-xs text-brand-muted tracking-wider mb-2">出生日期（公历）</p>
                  <div className="flex gap-2 mb-3">
                    <input type="number" min={1900} max={new Date().getFullYear()} placeholder="年"
                      value={birth.y} onChange={(e) => setBirth({ ...birth, y: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-brand-text placeholder:text-white/25 focus:outline-none focus:border-brand-ice/40" />
                    <input type="number" min={1} max={12} placeholder="月"
                      value={birth.m} onChange={(e) => setBirth({ ...birth, m: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-brand-text placeholder:text-white/25 focus:outline-none focus:border-brand-ice/40" />
                    <input type="number" min={1} max={31} placeholder="日"
                      value={birth.d} onChange={(e) => setBirth({ ...birth, d: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-brand-text placeholder:text-white/25 focus:outline-none focus:border-brand-ice/40" />
                  </div>
                  <p className="text-xs text-brand-muted tracking-wider mb-2">出生时辰</p>
                  <select
                    value={birth.hourIndex}
                    onChange={(e) => setBirth({ ...birth, hourIndex: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 mb-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-brand-text focus:outline-none focus:border-brand-ice/40"
                  >
                    {HOUR_BRANCHES.map((h, i) => (
                      <option key={h} value={i} className="bg-[#151018]">{h}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleSubmit}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm tracking-[0.2em] bg-white text-[#0a0e17] hover:opacity-85 transition-opacity"
                  >
                    <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                    开始测算
                  </button>
                </div>
              )}

              {/* 计算中 */}
              {computing && (
                <div className="flex items-center gap-2 text-xs text-brand-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4c090] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4c090] animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4c090] animate-bounce" style={{ animationDelay: '0.3s' }} />
                  <span className="ml-1">正在排盘推演…</span>
                </div>
              )}

              {/* 重新测算 */}
              {done && !computing && (
                <div className="flex justify-center pt-1">
                  <button onClick={handleReset} className="flex items-center gap-2 px-5 py-2 rounded-full text-xs tracking-wider bg-white/5 text-brand-muted hover:text-brand-heading transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
                    重新测算
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/** 运势报告卡片（打字机：按消息分段出现；单条消息整体淡入） */
function ReportCard({ report, onCrystalClick }: { report: FortuneReport; onCrystalClick: (crystalName: string) => void }) {
  return (
    <motion.div
      className="w-full max-w-[95%] rounded-2xl border border-white/[0.06] bg-white/[0.04] overflow-hidden"
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
    >
      <div className="px-4 pt-4 pb-3">
        <p className="text-xs tracking-[0.3em] text-[#d4c090]/70">今日运势 · {report.todayGanZhi}日</p>
        <p className="text-[11px] text-white/40 font-light tracking-wider mt-2">
          八字四柱 {report.pillarsLine} · 日主 {report.dayMasterGanZhi}（{report.dayMasterElement}）· 喜用 {report.favorable}
        </p>
        <div className="flex items-baseline gap-3 mt-2">
          <span className="text-4xl font-light text-brand-heading">{report.score}</span>
          <span className="text-sm text-brand-muted font-light">分 · {report.levelLabel}</span>
        </div>
        <p className="text-xs text-white/45 font-light leading-relaxed mt-2">{report.levelDesc}</p>
      </div>

      <div className="px-4 py-3 border-t border-white/[0.06] space-y-2.5">
        {report.dimensions.map((d) => (
          <div key={d.key} className="flex gap-2.5">
            <span className="text-sm flex-shrink-0">{d.icon}</span>
            <div className="min-w-0">
              <p className="text-xs tracking-wider text-brand-muted">
                {d.label}
                <span className={`ml-2 text-[10px] ${d.level === 'good' ? 'text-brand-ice' : d.level === 'mid' ? 'text-[#d4c090]' : 'text-brand-muted'}`}>
                  {d.level === 'good' ? '吉' : d.level === 'mid' ? '平' : '注意'}
                </span>
              </p>
              <p className="text-xs text-white/65 font-light leading-relaxed mt-0.5">{d.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-white/[0.06]">
        <p className="text-xs tracking-wider text-brand-muted mb-2">开运指南</p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="rounded-lg bg-white/[0.03] px-3 py-2">
            <p className="text-[10px] text-brand-muted tracking-wider">🎨 幸运色</p>
            <p className="text-xs text-white/70 font-light mt-0.5">{report.lucky.colors}</p>
          </div>
          <div className="rounded-lg bg-white/[0.03] px-3 py-2">
            <p className="text-[10px] text-brand-muted tracking-wider">🔢 幸运数字</p>
            <p className="text-xs text-white/70 font-light mt-0.5">{report.lucky.numbers}</p>
          </div>
          <div className="rounded-lg bg-white/[0.03] px-3 py-2">
            <p className="text-[10px] text-brand-muted tracking-wider">🧭 开运方位</p>
            <p className="text-xs text-white/70 font-light mt-0.5">{report.lucky.direction}</p>
          </div>
          <div className="rounded-lg bg-white/[0.03] px-3 py-2">
            <p className="text-[10px] text-brand-muted tracking-wider">🤝 贵人五行</p>
            <p className="text-xs text-white/70 font-light mt-0.5">{report.lucky.noble}</p>
          </div>
        </div>
        <p className="text-xs tracking-wider text-brand-muted mb-1.5">今日宜忌</p>
        <p className="text-xs text-white/65 font-light leading-relaxed">
          <span className="text-brand-ice">宜</span> {report.dos.join(' · ')}
        </p>
        <p className="text-xs text-white/65 font-light leading-relaxed mt-1">
          <span className="text-[#d4c090]/80">忌</span> {report.donts.join(' · ')}
        </p>
      </div>

      <div className="px-4 py-3 border-t border-white/[0.06]">
        <p className="text-xs tracking-wider text-brand-muted mb-2">💎 今日适合佩戴的水晶</p>
        <div className="space-y-2">
          {report.crystals.map((c) => (
            <button key={c.name + c.role} onClick={() => onCrystalClick(c.name)}
              className="w-full flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-[#d4c090]/30 transition-colors text-left">
              <img src={c.image} alt={c.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-white/10" />
              <div className="min-w-0">
                <p className="text-sm font-light text-brand-heading">
                  {c.name}
                  <span className="ml-2 text-[10px] text-[#d4c090]/80">{c.role}</span>
                </p>
                <p className="text-xs text-white/50 font-light leading-relaxed mt-0.5">{c.reason}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
