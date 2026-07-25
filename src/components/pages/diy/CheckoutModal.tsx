import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CreditCard, Smartphone, Building2, Check, Gift, MessageSquare } from 'lucide-react'

interface CheckoutModalProps {
  show: boolean
  onClose: () => void
  gift: { name: string; price: number } | null
  message: string | null
  basePrice: number
}

type PaymentMethod = 'wechat' | 'alipay' | 'card' | null
type CheckoutStep = 'review' | 'payment' | 'success'

export const CheckoutModal = ({ show, onClose, gift, message, basePrice }: CheckoutModalProps) => {
  const [step, setStep] = useState<CheckoutStep>('review')
  const [method, setMethod] = useState<PaymentMethod>(null)
  const [contact, setContact] = useState({ name: '', phone: '', address: '' })

  const subtotal = basePrice || 0
  const giftBox = gift ? gift.price : 0
  const total = subtotal + giftBox

  const handlePay = () => {
    setStep('payment')
  }

  const handleConfirmPayment = () => {
    setStep('success')
  }

  const handleReset = () => {
    setStep('review')
    setMethod(null)
  }

  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={step === 'success' ? onClose : undefined}
      >
        <motion.div
          className="glass-medium rounded-2xl max-w-2xl w-full mx-4 overflow-hidden"
          initial={{ scale: 0.9, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 40 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
            <h3 className="text-lg font-light text-brand-heading">
              {step === 'review' && '确认订单'}
              {step === 'payment' && '选择支付方式'}
              {step === 'success' && '支付成功'}
            </h3>
            {step !== 'success' && (
              <button onClick={onClose} className="text-brand-muted hover:text-brand-heading">
                <X className="w-5 h-5" strokeWidth={1} />
              </button>
            )}
          </div>

          {/* Review Step */}
          {step === 'review' && (
            <div className="p-6 space-y-5">
              {/* 订单明细 */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-brand-muted">
                  <span>定制手串</span>
                  <span>¥{subtotal}</span>
                </div>
                {gift && (
                  <div className="flex justify-between text-brand-muted">
                    <span className="flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5" /> 礼盒包装
                    </span>
                    <span>¥{giftBox}</span>
                  </div>
                )}
                {message && (
                  <div className="flex justify-between text-brand-muted">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" /> 明信片寄语
                    </span>
                    <span>免费</span>
                  </div>
                )}
                <div className="border-t border-white/[0.06] pt-3 flex justify-between text-brand-heading font-normal">
                  <span>合计</span>
                  <span className="text-lg">¥{total}</span>
                </div>
              </div>

              {/* 联系方式 */}
              <div className="space-y-3">
                <p className="text-xs text-brand-muted tracking-wider">收货信息</p>
                <input
                  type="text"
                  placeholder="收件人姓名"
                  value={contact.name}
                  onChange={(e) => setContact({ ...contact, name: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-brand-heading font-light placeholder:text-brand-muted/40 focus:outline-none focus:border-brand-ice/30 transition-all"
                />
                <input
                  type="text"
                  placeholder="手机号码"
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-brand-heading font-light placeholder:text-brand-muted/40 focus:outline-none focus:border-brand-ice/30 transition-all"
                />
                <input
                  type="text"
                  placeholder="收货地址"
                  value={contact.address}
                  onChange={(e) => setContact({ ...contact, address: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-brand-heading font-light placeholder:text-brand-muted/40 focus:outline-none focus:border-brand-ice/30 transition-all"
                />
              </div>

              <button
                onClick={handlePay}
                className="w-full py-3 rounded-xl bg-white text-[#0a0e17] text-sm font-light tracking-[0.15em] hover:bg-brand-ice transition-colors duration-300"
              >
                去支付 ¥{total}
              </button>
            </div>
          )}

          {/* Payment Step */}
          {step === 'payment' && (
            <div className="p-6 space-y-4">
              <p className="text-xs text-brand-muted tracking-wider">支付方式</p>

              <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'wechat' as PaymentMethod, icon: MessageSquare, label: '微信支付', color: '#07C160' },
                { id: 'alipay' as PaymentMethod, icon: Building2, label: '支付宝', color: '#1677FF' },
                { id: 'card' as PaymentMethod, icon: CreditCard, label: '银行卡', color: '#8892a4' },
              ].map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => setMethod(pm.id)}
                  className={`relative flex flex-col items-center justify-center gap-3 p-6 rounded-xl border transition-all duration-200 ${
                    method === pm.id
                      ? 'bg-brand-ice/10 border-brand-ice/30'
                      : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.15]'
                  }`}
                >
                  <pm.icon className="w-7 h-7" style={{ color: pm.color }} strokeWidth={1.5} />
                  <span className="text-sm text-brand-heading font-light">{pm.label}</span>
                  {method === pm.id && (
                    <motion.div className="absolute top-2.5 right-2.5" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <div className="w-5 h-5 rounded-full bg-brand-ice flex items-center justify-center">
                        <Check className="w-3 h-3 text-[#0a0e17]" strokeWidth={2.5} />
                      </div>
                    </motion.div>
                  )}
                </button>
              ))}
              </div>

              {/* 订单摘要 */}
              <div className="border-t border-white/[0.06] pt-4 flex justify-between text-sm">
                <span className="text-brand-muted">应付金额</span>
                <span className="text-brand-heading text-lg font-normal">¥{total}</span>
              </div>

              <button
                onClick={handleConfirmPayment}
                disabled={!method}
                className="w-full py-3 rounded-xl bg-white text-[#0a0e17] text-sm font-light tracking-[0.15em] hover:bg-brand-ice transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                确认支付
              </button>

              <button
                onClick={() => setStep('review')}
                className="w-full text-sm text-brand-muted hover:text-brand-heading transition-colors py-2"
              >
                返回修改订单
              </button>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="p-10 text-center">
              <motion.div
                className="w-16 h-16 rounded-full bg-brand-ice/10 flex items-center justify-center mx-auto mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <Check className="w-8 h-8 text-brand-ice" strokeWidth={1.5} />
              </motion.div>
              <h3 className="text-xl font-light text-brand-heading mb-2">支付成功</h3>
              <p className="text-brand-muted font-light text-sm mb-6">
                您的订单已确认，我们将尽快为您制作。
              </p>
              {message && (
                <p className="text-brand-ice font-light text-sm mb-6 italic">「{message}」</p>
              )}
              <div className="text-xs text-brand-muted/60 space-y-1 mb-6">
                <p>订单金额：¥{total}</p>
                <p>支付方式：{method === 'wechat' ? '微信支付' : method === 'alipay' ? '支付宝' : '银行卡'}</p>
              </div>
              <button
                onClick={() => { handleReset(); onClose() }}
                className="px-6 py-2.5 rounded-full glass-shallow text-sm font-light tracking-wider text-brand-heading hover:text-brand-ice transition-all duration-300"
              >
                完成
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
