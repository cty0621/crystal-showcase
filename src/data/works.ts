import type { Work, GalleryItem } from '@/types'

// 精选作品 — 首页展示
export const featuredWorks: Work[] = [
  {
    id: 'ocean-whisper', title: '海洋低语', category: '项链',
    description: '天然葡萄石与白水晶交织而成，如月光洒落海面的静谧瞬间。',
    image: `${import.meta.env.BASE_URL}assets/textures/gallery/ocean-whisper.png`,
  },
  {
    id: 'aurora-dream', title: '极光之梦', category: '手链',
    description: '精选蓝托帕、海蓝宝与拉长石，捕捉极夜的奇幻色彩。',
    image: `${import.meta.env.BASE_URL}assets/textures/gallery/aurora-dream.png`,
  },
  {
    id: 'star-dust', title: '星尘', category: '耳饰',
    description: '钻石碎粒星点排列，如银河倾泻耳畔。',
    image: `${import.meta.env.BASE_URL}assets/textures/gallery/star-dust.png`,
  },
  {
    id: 'mountain-soul', title: '山魂', category: '戒指',
    description: '粉水晶的温润与施华洛世奇白钻的璀璨，凝练山脉亿万年的沉默。',
    image: `${import.meta.env.BASE_URL}assets/textures/gallery/mountain-soul.png`,
  },
]

// 作品集 — Gallery 页面
export const galleryItems: GalleryItem[] = [
  {
    id: 'ocean-whisper', title: '海洋低语', category: 'necklace',
    description: '天然葡萄石与白水晶交织而成，如月光洒落海面的静谧瞬间。',
    image: `${import.meta.env.BASE_URL}assets/textures/gallery/ocean-whisper.png`, material: '葡萄石 · 白水晶 · 925银',
    model3d: `${import.meta.env.BASE_URL}assets/models/ocean-whisper.glb`,
  },
  {
    id: 'aurora-dream', title: '极光之梦', category: 'bracelet',
    description: '精选蓝托帕、海蓝宝与拉长石，捕捉极夜的奇幻色彩。',
    image: `${import.meta.env.BASE_URL}assets/textures/gallery/aurora-dream.png`, material: '蓝托帕 · 海蓝宝 · 拉长石 · 18K金',
    model3d: `${import.meta.env.BASE_URL}assets/models/aurora-dream.glb`,
  },
  {
    id: 'star-dust', title: '星尘', category: 'earrings',
    description: '钻石碎粒星点排列，如银河倾泻耳畔。',
    image: `${import.meta.env.BASE_URL}assets/textures/gallery/star-dust.png`, material: '钻石 · 18K白金',
    model3d: `${import.meta.env.BASE_URL}assets/models/star-dust.glb`,
  },
  {
    id: 'mountain-soul', title: '山魂', category: 'ring',
    description: '粉水晶的温润与施华洛世奇白钻的璀璨，凝练山脉亿万年的沉默。',
    image: `${import.meta.env.BASE_URL}assets/textures/gallery/mountain-soul.png`, material: '粉水晶 · 施华洛世奇白钻 · 钛钢',
    model3d: `${import.meta.env.BASE_URL}assets/models/mountain-soul.glb`,
  },
  {
    id: 'rose-quartz-tears', title: '粉晶泪', category: 'necklace',
    description: '心形粉水晶搭配玫瑰金链，温柔如初恋的轻触。',
    image: `${import.meta.env.BASE_URL}assets/textures/gallery/rose-quartz.png`, material: '粉水晶 · 玫瑰金',
    model3d: `${import.meta.env.BASE_URL}assets/models/rose-quartz-tears.glb`,
  },
  {
    id: 'tigers-eye-bracelet', title: '虎睛', category: 'bracelet',
    description: '蓝宝石的深邃蓝调与奶白晶的温润质感，赋予佩戴者自信与力量。',
    image: `${import.meta.env.BASE_URL}assets/textures/gallery/tigers-eye.png`, material: '蓝宝石 · 奶白晶 · 925银',
    model3d: `${import.meta.env.BASE_URL}assets/models/tigers-eye.glb`,
  },
  {
    id: 'emerald-dew', title: '翡翠晨露', category: 'earrings',
    description: '水滴形翡翠悬于碎钻光环之下，晨露般清透。',
    image: `${import.meta.env.BASE_URL}assets/textures/gallery/emerald-dew.png`, material: '翡翠 · 钻石 · 18K金',
    model3d: `${import.meta.env.BASE_URL}assets/models/emerald-dew.glb`,
  },
  {
    id: 'obsidian-guardian', title: '白曜守护', category: 'ring',
    description: '方形切割白曜石，棱角分明如现代建筑的简洁力量。',
    image: `${import.meta.env.BASE_URL}assets/textures/gallery/obsidian-guardian.png`, material: '白曜石 · 铂金',
    model3d: `${import.meta.env.BASE_URL}assets/models/obsidian-guardian.glb`,
  },
]
