export interface NavItem {
  label: string
  href: string
}

export interface StatItem {
  value: string
  label: string
}

export interface Work {
  id: string
  title: string
  category: string
  description: string
  image: string
}

export interface GalleryItem {
  id: string
  title: string
  category: 'necklace' | 'bracelet' | 'earrings' | 'ring'
  description: string
  image: string
  material: string
  model3d?: string  // 可选 3D 模型路径，如 `${import.meta.env.BASE_URL}assets/models/ring.glb`
}

export interface Milestone {
  year: string
  title: string
  description: string
}

export interface CraftValue {
  icon: string
  title: string
  description: string
}

export interface ContactDetail {
  icon: string
  label: string
  value: string
}

export interface TarotCard {
  id: string
  name: string
  keyword: string
  group: 'emotion' | 'energy' | 'guardian' | 'destiny'
  reading: string
  crystal: {
    name: string
    reason: string
    category: string
    image?: string  // 水晶图片路径
  }
  color: string
  shape: string
  image?: string      // 自定义正面图，如 `${import.meta.env.BASE_URL}assets/textures/tarot/sun.png`
  backImage?: string  // 自定义背面图，如 `${import.meta.env.BASE_URL}assets/textures/tarot/back.png`
}

export interface SiteConfig {
  name: string
  tagline: string
  description: string
  nav: NavItem[]
  social: {
    wechat: string
    weibo: string
    xiaohongshu: string
    email: string
  }
}
