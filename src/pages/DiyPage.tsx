import { useState, useRef, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { GiftOptions } from '@/components/pages/diy/GiftOptions'
import { PostcardOptions } from '@/components/pages/diy/PostcardOptions'
import { CheckoutModal } from '@/components/pages/diy/CheckoutModal'

export const DiyPage = () => {
  const [gift, setGift] = useState<{ name: string; price: number; box: string; lid: string; ribbon: string } | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [basePrice, setBasePrice] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [searchParams] = useSearchParams()
  const crystalParam = searchParams.get('crystal')

  // 测量 iframe 内"水晶疗愈之旅"tagline 的位置，明信片定位在其上方
  // 注意：iframe 内元素的 rect 相对 iframe 视口，需加上 iframe 自身在页面中的偏移
  const getPostcardCenter = useCallback((): { x: number; y: number } | null => {
    try {
      const el = iframeRef.current?.contentDocument?.querySelector('.tagline')
      const ir = iframeRef.current?.getBoundingClientRect()
      if (el && ir) {
        const r = el.getBoundingClientRect()
        // 锚点 = tagline 顶部再上移 100px，使信封（明信片）下半部遮盖住"开启你的水晶疗愈之旅"文字
        return { x: ir.left + r.left + r.width / 2, y: ir.top + r.top - 100 }
      }
    } catch {}
    return null
  }, [])

  const handleCheckout = useCallback(() => {
    try {
      const iframe = iframeRef.current
      if (iframe?.contentDocument) {
        const priceEl = iframe.contentDocument.querySelector('.price-badge .badge-value')
        if (priceEl?.textContent) {
          const num = parseInt(priceEl.textContent.replace(/[^0-9]/g, ''))
          setBasePrice(num || 0)
        }
      }
    } catch {}
    setShowCheckout(true)
  }, [])

  // 价格同步定时器（统一管理，卸载时清理）
  const priceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => () => { if (priceTimerRef.current) clearInterval(priceTimerRef.current) }, [])

  // 每秒同步一次价格
  const handleIframeLoad = useCallback(() => {
    if (priceTimerRef.current) clearInterval(priceTimerRef.current)
    priceTimerRef.current = setInterval(() => {
      try {
        const iframe = iframeRef.current
        if (iframe?.contentDocument) {
          const priceEl = iframe.contentDocument.querySelector('.price-badge .badge-value')
          if (priceEl?.textContent) {
            const num = parseInt(priceEl.textContent.replace(/[^0-9]/g, ''))
            setBasePrice((prev) => (num !== prev ? num : prev))
          }
        }
      } catch {}
    }, 800)

    // 隐藏英文切换与官网入口（产品要求移除；样式兜底防止 Vue 水合后重新渲染出来）
    try {
      const doc = iframeRef.current?.contentDocument
      if (doc) {
        let style = doc.getElementById('diy-cleanup-style') as HTMLStyleElement | null
        if (!style) {
          style = doc.createElement('style')
          style.id = 'diy-cleanup-style'
          style.textContent = '.ui-top-action--locale, #open-official-site-link { display: none !important; }'
          doc.head.appendChild(style)
        }
      }
    } catch {}
  }, [])

  // 抽卡跳转：根据 ?crystal= 参数在 iframe 内自动选中对应水晶分类
  useEffect(() => {
    if (!crystalParam) return
    let tries = 0
    let timer: ReturnType<typeof setTimeout>
    const attempt = () => {
      const doc = iframeRef.current?.contentDocument
      if (doc) {
        const items = doc.querySelectorAll<HTMLElement>('.master-item')
        for (const item of Array.from(items)) {
          const title = item.getAttribute('title')
            || item.querySelector('.master-item-text')?.getAttribute('title')
            || item.querySelector('img')?.getAttribute('alt')
            || ''
          if (title === crystalParam) {
            item.click()
            return
          }
        }
      }
      // iframe 未加载或 Vue 尚未挂载时重试
      if (++tries < 8) timer = setTimeout(attempt, 400)
    }
    timer = setTimeout(attempt, 400)
    return () => clearTimeout(timer)
  }, [crystalParam])

  return (
    /* Navbar 是 fixed 定位（高 4rem），不占文档流；容器需下移 4rem，否则导航栏会压住 iframe 顶部内容 */
    <div className="relative" style={{ height: 'calc(100vh - 4rem)', marginTop: '4rem' }}>
      <iframe
        ref={iframeRef}
        src={`${import.meta.env.BASE_URL}diy.html`}
        className="w-full h-full border-0"
        title="水晶DIY定制设计器"
        onLoad={() => handleIframeLoad()}
      />

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
        <GiftOptions onConfirm={setGift} />
        <PostcardOptions onConfirm={setMessage} getCenter={getPostcardCenter} />

        <button
          onClick={handleCheckout}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-white text-[#0a0e17] text-sm font-light tracking-[0.15em] hover:bg-brand-ice transition-all duration-300"
        >
          <ShoppingBag className="w-4 h-4" strokeWidth={1} />
          结账
        </button>

        {(gift || message) && (
          <span className="text-xs text-brand-muted">{gift && '🎁 '}{message && '✉️ '}</span>
        )}
      </div>

      <CheckoutModal
        show={showCheckout}
        onClose={() => setShowCheckout(false)}
        gift={gift}
        message={message}
        basePrice={basePrice}
      />
    </div>
  )
}
