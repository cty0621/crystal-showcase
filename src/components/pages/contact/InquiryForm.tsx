import { useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { GlassCard } from '@/components/ui/GlassCard'

const inputClasses = `w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-brand-heading font-light placeholder:text-brand-muted/40 focus:outline-none focus:border-brand-ice/30 focus:bg-white/[0.05] transition-all duration-300`

export const InquiryForm = () => {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  if (sent) {
    return (
      <ScrollReveal>
        <GlassCard depth="medium" className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-brand-ice/10 flex items-center justify-center mx-auto mb-6">
            <Send className="w-6 h-6 text-brand-ice" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-light text-brand-heading mb-3">感谢您的来信</h3>
          <p className="text-brand-muted font-light">我们将尽快与您取得联系。</p>
        </GlassCard>
      </ScrollReveal>
    )
  }

  return (
    <ScrollReveal>
      <GlassCard depth="medium">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-brand-muted tracking-wider mb-2 ml-1">姓名</label>
              <input
                type="text"
                required
                className={inputClasses}
                placeholder="您的名字"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-brand-muted tracking-wider mb-2 ml-1">邮箱</label>
              <input
                type="email"
                required
                className={inputClasses}
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-brand-muted tracking-wider mb-2 ml-1">主题</label>
            <input
              type="text"
              required
              className={inputClasses}
              placeholder="咨询主题"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-brand-muted tracking-wider mb-2 ml-1">留言</label>
            <textarea
              required
              rows={5}
              className={`${inputClasses} resize-none`}
              placeholder="请详细描述您的需求..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-white text-[#0a0e17] text-sm font-light tracking-[0.15em] hover:bg-brand-ice transition-colors duration-300"
          >
            发送消息
          </button>
        </form>
      </GlassCard>
    </ScrollReveal>
  )
}
