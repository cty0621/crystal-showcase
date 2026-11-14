import type { Element } from '@/lib/bazi'

export interface CrystalOption { name: string; image: string }

/** 23 类 DIY 目录水晶的五行归类（name 与设计器目录一致） */
export const CRYSTAL_BY_ELEMENT: Record<Element, CrystalOption[]> = {
  金: [
    { name: '白水晶', image: `${import.meta.env.BASE_URL}assets/textures/products/prod_052.webp` },
    { name: '发晶', image: `${import.meta.env.BASE_URL}assets/textures/products/prod_013.webp` },
  ],
  木: [
    { name: '幽灵水晶', image: `${import.meta.env.BASE_URL}assets/textures/products/prod_019.webp` },
    { name: '葡萄石', image: `${import.meta.env.BASE_URL}assets/textures/products/prod_080.webp` },
    { name: '天河石', image: `${import.meta.env.BASE_URL}assets/textures/products/prod_016.webp` },
    { name: '萤石', image: `${import.meta.env.BASE_URL}assets/textures/products/prod_078.webp` },
  ],
  水: [
    { name: '曜石', image: `${import.meta.env.BASE_URL}assets/textures/products/prod_028.webp` },
    { name: '茶水晶', image: `${import.meta.env.BASE_URL}assets/textures/products/prod_073.webp` },
    { name: '月光石', image: `${import.meta.env.BASE_URL}assets/textures/products/prod_034.webp` },
    { name: '海蓝宝', image: `${import.meta.env.BASE_URL}assets/textures/products/prod_039.webp` },
  ],
  火: [
    { name: '紫水晶', image: `${import.meta.env.BASE_URL}assets/textures/products/prod_067.webp` },
    { name: '玛瑙', image: `${import.meta.env.BASE_URL}assets/textures/products/prod_045.webp` },
    { name: '草莓晶', image: `${import.meta.env.BASE_URL}assets/textures/products/prod_076.webp` },
    { name: '兔毛水晶', image: `${import.meta.env.BASE_URL}assets/textures/products/prod_001.webp` },
    { name: '朱砂', image: `${import.meta.env.BASE_URL}assets/textures/products/prod_036.jpg` },
    { name: '太阳石', image: `${import.meta.env.BASE_URL}assets/textures/products/prod_017.webp` },
  ],
  土: [
    { name: '黄水晶', image: `${import.meta.env.BASE_URL}assets/textures/products/prod_088.webp` },
    { name: '虎眼石', image: `${import.meta.env.BASE_URL}assets/textures/products/prod_084.webp` },
    { name: '粉水晶', image: `${import.meta.env.BASE_URL}assets/textures/products/prod_064.webp` },
    { name: '蔷薇石', image: `${import.meta.env.BASE_URL}assets/textures/products/prod_082.webp` },
    { name: '玉石', image: `${import.meta.env.BASE_URL}assets/textures/products/prod_043.webp` },
    { name: '文玩', image: `${import.meta.env.BASE_URL}assets/textures/products/prod_022.webp` },
    { name: '胶花水晶', image: `${import.meta.env.BASE_URL}assets/textures/products/prod_071.webp` },
  ],
}

/** 今日五行特质词 */
export const TODAY_ELEMENT_TRAIT: Record<Element, string> = {
  金: '果断明快', 木: '蓬勃生长', 水: '沉静智慧', 火: '热情活力', 土: '安稳踏实',
}

/** 今日宜（每五行 2 条） */
export const DOS_BY_ELEMENT: Record<Element, [string, string]> = {
  金: ['整理财务、制定计划', '果断决策、推进行动'],
  木: ['学习充电、开启新计划', '沟通合作、拓展人脉'],
  水: ['静心思考、梳理情绪', '复盘总结、蓄力待发'],
  火: ['主动表达、展现自我', '社交聚会、传递热情'],
  土: ['脚踏实地、稳步推进', '关注健康、规律作息'],
}

/** 今日忌（每五行 2 条） */
export const DONTS_BY_ELEMENT: Record<Element, [string, string]> = {
  金: ['犹豫不决、错失时机', '过度固执、不愿变通'],
  木: ['急于求成、三心二意', '墨守成规、拒绝变化'],
  水: ['情绪化决策、钻牛角尖', '过度劳累、消耗心神'],
  火: ['急躁冲动、意气用事', '熬夜透支、过度消耗'],
  土: ['好高骛远、想走捷径', '暴饮暴食、饮食不节'],
}

export interface DimensionScripts { label: string; icon: string; good: string[]; mid: string[]; caution: string[] }

/** 四维度文案模板；占位符 {todayElement} {dominant} {lacking} 由引擎替换 */
export const DIMENSIONS: { career: DimensionScripts; wealth: DimensionScripts; love: DimensionScripts; health: DimensionScripts } = {
  career: {
    label: '事业', icon: '💼',
    good: [
      '今日{todayElement}气当令，你八字中{d}之力被激活，工作推进顺遂，适合谈合作、提方案。',
      '贵人运在线，你的专业能力容易被看见，大胆表达想法会有意外收获。',
      '手头项目有望突破瓶颈，趁势而为，成果可期。',
    ],
    mid: [
      '事业按部就班即可，不必强求出彩，把细节做好就是今天的胜利。',
      '工作中注意沟通方式，话到嘴边慢三秒，可避免不必要的误会。',
      '今天不必急着证明自己，把手上的事做细做透，口碑自然慢慢积累。',
    ],
    caution: [
      '今日事业气场略滞，不宜启动重要谈判或签约，先把准备工作做扎实。',
      '容易遇到意见分歧，守住底线但别硬碰硬，退一步海阔天空。',
      '重要文件与邮件发出前多检查一遍，避免因粗心返工、白费力气。',
    ],
  },
  wealth: {
    label: '财运', icon: '💰',
    good: [
      '今日财气顺畅，{trait}的气场利于开源，副业与投资都可小试身手。',
      '正财稳定、偏财有惊喜，适合处理与金钱有关的大小事务。',
      '财运回暖，谈薪资、谈合作的成功率都比平时高。',
    ],
    mid: [
      '财运平稳，宜守不宜攻，大额支出今天尽量三思。',
      '花钱图个开心可以，但别冲动消费，货比三家再下单。',
      '今天适合记账复盘，把收支理清楚比什么都重要。',
    ],
    caution: [
      '今日破财风险偏高，慎借贷、慎担保，捂紧钱包为上策。',
      '容易因情绪化消费超支，付款前先冷静三分钟。',
      '投资理财多看少动，今天不适合做重大资金决策。',
    ],
  },
  love: {
    label: '感情', icon: '💞',
    good: [
      '桃花能量柔和，单身者不妨多参加聚会，缘分可能就在不经意间出现。',
      '与伴侣相处融洽，适合一起安排晚餐或散步，感情升温的好时机。',
      '你的温柔与真诚最具魅力，今天适合把心里的话说出来。',
    ],
    mid: [
      '感情平稳，多倾听少评判，一句关心胜过千言万语。',
      '单身者不必着急，先把自己活成想要的样子，对的人在路上。',
      '有伴者不妨一起做点小事，比如一起做饭、散步，平淡里最见真心。',
    ],
    caution: [
      '今日情绪容易放大，与亲密的人相处时注意语气，避免小事化大。',
      '感情里别翻旧账，今天适合给彼此一点空间。',
      '别把工作情绪带回家，先安顿好自己的心情，再去面对爱人。',
    ],
  },
  health: {
    label: '健康', icon: '🍃',
    good: [
      '精气神在线，适合运动舒展，规律作息会让状态更好。',
      '身体能量通畅，是调整饮食、开启养生计划的好日子。',
      '气色红润、精神饱满，安排一次舒缓的拉伸或散步，状态更上一层。',
    ],
    mid: [
      '注意肩颈与用眼疲劳，工作间隙多起来活动活动。',
      '情绪平稳则身体安康，睡前少刷手机，睡眠质量会更好。',
      '多喝水、少久坐，午后晒晒太阳，给身体充充电。',
    ],
    caution: [
      '今日易感疲惫，避免熬夜透支，抽空小憩或冥想片刻。',
      '饮食清淡为佳，情绪波动时先深呼吸，别让压力积在身体里。',
      '注意保暖与肠胃，生冷食物今天尽量少碰，别让小不适放大。',
    ],
  },
}

export type FortuneLevel = 'great' | 'good' | 'fair' | 'quiet'

export const LEVEL_TEXT: Record<FortuneLevel, { label: string; desc: string }> = {
  great: { label: '大吉', desc: '今日能量与你高度契合，是行动与收获的好日子。' },
  good: { label: '中吉', desc: '运势平稳向上，顺水行舟，稳中有进。' },
  fair: { label: '平', desc: '运势平和，宜守不宜攻，按部就班即可。' },
  quiet: { label: '宜静', desc: '今日气场略有摩擦，宜静养蓄力，不宜大动作。' },
}

/** 水晶推荐理由模板：{lacking} {todayElement} {dominant} {trait} 为占位符 */
export const CRYSTAL_REASON_TEMPLATES = {
  /** 最弱五行数量为 0（真"缺X"） */
  lack: '你的八字五行缺{lacking}，{name}属{lacking}，长期佩戴可补足所缺、平衡气场。',
  /** 最弱五行数量非 0（并列最少，仅"偏弱"） */
  lackWeak: '你的八字{lacking}偏弱（最弱），{name}属{lacking}，长期佩戴可补足其力、平衡气场。',
  today: '今日{todayElement}气当令，{name}与今日气场相应，佩戴更添{trait}。',
  harmonize: '你的八字{d}较旺，{name}与其相生调和，助你旺势不冲、稳中求进。',
}

/* ── 开运信息（参考豆包风格：幸运色 / 幸运数字 / 开运方位 / 贵人五行） ── */

/** 五行 → 开运颜色 */
export const ELEMENT_COLORS: Record<Element, [string, string]> = {
  金: ['白色', '银色'],
  木: ['绿色', '青色'],
  水: ['黑色', '蓝色'],
  火: ['红色', '紫色'],
  土: ['黄色', '棕色'],
}

/** 五行 → 河图幸运数字 */
export const ELEMENT_NUMBERS: Record<Element, [number, number]> = {
  水: [1, 6], 火: [2, 7], 木: [3, 8], 金: [4, 9], 土: [5, 10],
}

/** 五行 → 方位 */
export const ELEMENT_DIRECTIONS: Record<Element, string> = {
  木: '东方', 火: '南方', 土: '中宫', 金: '西方', 水: '北方',
}
