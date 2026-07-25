import type { SiteConfig } from '@/types'

export const siteConfig: SiteConfig = {
  name: 'Yoliya',
  tagline: '自然之美 · 匠心之作',
  description:
    'Yoliya 是一个专注于天然水晶珠宝设计的工作室。我们相信每一颗水晶都承载着地球的记忆，每一件作品都是自然与匠心的对话。',
  nav: [
    { label: '首页', href: '/' },
    { label: '作品集', href: '/gallery' },
    { label: '今日运势', href: '/tarot' },
    { label: '水晶DIY', href: '/diy' },
    { label: '关于我们', href: '/about' },
    { label: '联系我们', href: '/contact' },
  ],
  social: {
    wechat: 'Yoliya_STUDIO',
    weibo: '@Yoliya水晶珠宝',
    xiaohongshu: '@Yoliya',
    email: 'hello@crystal-studio.com',
  },
}
