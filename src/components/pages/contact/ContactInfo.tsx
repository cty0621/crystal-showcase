import { Mail, MapPin, Phone, Clock, MessageCircle, ExternalLink } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { GlassCard } from '@/components/ui/GlassCard'
import { siteConfig } from '@/data/site'
import type { ContactDetail } from '@/types'

const contactDetails: ContactDetail[] = [
  { icon: 'Mail', label: '电子邮件', value: siteConfig.social.email },
  { icon: 'Phone', label: '联系电话', value: '+86 571-8888-6666' },
  { icon: 'MapPin', label: '工作室地址', value: '浙江省杭州市西湖区创意路88号' },
  { icon: 'Clock', label: '工作时间', value: '周一至周六 10:00 - 18:00' },
]

const socialLinks = [
  { icon: MessageCircle, label: '微信', value: siteConfig.social.wechat },
  { icon: ExternalLink, label: '微博', value: siteConfig.social.weibo },
  { icon: ExternalLink, label: '小红书', value: siteConfig.social.xiaohongshu },
]

const iconMap: Record<string, LucideIcon> = {
  Mail, Phone, MapPin, Clock,
}

export const ContactInfo = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {contactDetails.map((detail, i) => {
        const Icon = iconMap[detail.icon]
        return (
          <ScrollReveal key={detail.label} delay={i * 0.08}>
            <GlassCard depth="shallow" hover={false} className="flex items-start gap-4 !p-5">
              <div className="w-10 h-10 rounded-full bg-brand-ice/5 flex items-center justify-center flex-shrink-0">
                {Icon && <Icon className="w-4 h-4 text-brand-ice/60" strokeWidth={1.5} />}
              </div>
              <div>
                <p className="text-xs text-brand-muted tracking-wider mb-1">{detail.label}</p>
                <p className="text-sm text-brand-heading font-light">{detail.value}</p>
              </div>
            </GlassCard>
          </ScrollReveal>
        )
      })}

      {socialLinks.map((link, i) => {
        const Icon = link.icon
        return (
          <ScrollReveal key={link.label} delay={(contactDetails.length + i) * 0.08}>
            <GlassCard depth="shallow" hover={false} className="flex items-start gap-4 !p-5">
              <div className="w-10 h-10 rounded-full bg-brand-ice/5 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-brand-ice/60" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs text-brand-muted tracking-wider mb-1">{link.label}</p>
                <p className="text-sm text-brand-heading font-light">{link.value}</p>
              </div>
            </GlassCard>
          </ScrollReveal>
        )
      })}
    </div>
  )
}
