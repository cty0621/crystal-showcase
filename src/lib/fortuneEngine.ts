import type { BaziInfo, Element } from '@/lib/bazi'
import {
  CRYSTAL_BY_ELEMENT,
  TODAY_ELEMENT_TRAIT,
  DOS_BY_ELEMENT,
  DONTS_BY_ELEMENT,
  DIMENSIONS,
  LEVEL_TEXT,
  CRYSTAL_REASON_TEMPLATES,
  ELEMENT_COLORS,
  ELEMENT_NUMBERS,
  ELEMENT_DIRECTIONS,
  type FortuneLevel,
} from '@/data/fortune'

export interface FortuneDimension {
  key: 'career' | 'wealth' | 'love' | 'health'
  label: string
  icon: string
  level: 'good' | 'mid' | 'caution'
  text: string
}

export interface FortuneCrystal {
  name: string
  image: string
  reason: string
  role: '补缺' | '顺应今日' | '调和'
}

export interface FortuneReport {
  score: number
  level: FortuneLevel
  levelLabel: string
  levelDesc: string
  todayGanZhi: string
  todayElement: Element
  /** 五行分布一句话总结 */
  baziSummary: string
  /** 四柱（年 月 日 时） */
  pillarsLine: string
  /** 日主：日柱干支与五行 */
  dayMasterGanZhi: string
  dayMasterElement: Element
  /** 喜用五行（由日主强弱判定：身弱喜印、身强喜财） */
  favorable: Element
  /** 开运指南（幸运色 / 幸运数字 / 开运方位 / 贵人五行） */
  lucky: { colors: string; numbers: string; direction: string; noble: string }
  dimensions: FortuneDimension[]
  dos: string[]
  donts: string[]
  crystals: FortuneCrystal[]
}

/** 五行相生：生者 → 被生者 */
const GENERATES: Record<Element, Element> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }
/** 五行相克：克者 → 被克者 */
const OVERCOMES: Record<Element, Element> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' }

const ELEMENT_ORDER: Element[] = ['木', '火', '土', '金', '水']

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length]
}

/** 替换文案占位符 {todayElement} {dominant} {lacking} */
function fill(template: string, ctx: { dominant: Element; lacking: Element; todayElement: Element; trait: string; name?: string; d?: Element }): string {
  return template
    .replace(/\{todayElement\}/g, ctx.todayElement)
    .replace(/\{dominant\}/g, ctx.dominant)
    .replace(/\{lacking\}/g, ctx.lacking)
    .replace(/\{trait\}/g, ctx.trait)
    .replace(/\{name\}/g, ctx.name ?? '')
    .replace(/\{d\}/g, ctx.d ?? ctx.dominant)
}

export function computeFortune(bazi: BaziInfo, today: { ganZhi: string; element: Element }): FortuneReport {
  const { dominant, lacking, elementCounts, isUnbalanced } = bazi
  const todayElement = today.element

  // ---- 生克评分 ----
  let score = 60
  if (todayElement === lacking) score += 15 // 今日五行正是你所缺，补缺良机（缺火遇火日加分）
  if (GENERATES[todayElement] === lacking) score += 15 // 今日五行生你所缺
  if (GENERATES[todayElement] === dominant) score += 10 // 今日五行与最旺相生
  if (OVERCOMES[todayElement] === dominant) score -= 15 // 今日五行克最旺
  if (isUnbalanced) score -= 10 // 八字偏枯
  score = Math.max(0, Math.min(100, score))

  const level: FortuneLevel = score >= 85 ? 'great' : score >= 70 ? 'good' : score >= 55 ? 'fair' : 'quiet'

  // ---- 五行总结 ----
  // "最弱"必须取 bazi.ts 的 lacking（并列最少时按五行顺序取首个），与水晶补缺理由指向同一五行；
  // 仅当 lacking 数量为 0 才说"五行缺X"，并列最少（非 0）场景与水晶理由的"偏弱"口径一致
  const sorted = [...ELEMENT_ORDER].sort((a, b) => elementCounts[b] - elementCounts[a])
  const baziSummary =
    `你的八字中${sorted[0]}最旺（${elementCounts[sorted[0]]}字）、${lacking}最弱（${elementCounts[lacking]}字）` +
    (elementCounts[lacking] === 0 ? `，五行缺${lacking}` : '，五行分布较均衡') +
    `。今日为${today.ganZhi}日，${todayElement}气当令。`

  // ---- 日主与喜用（身弱喜印、身强喜财） ----
  const dayMasterCount = elementCounts[bazi.dayMaster.element]
  const isDayMasterWeak = dayMasterCount <= 1
  const favorable: Element = isDayMasterWeak
    ? (ELEMENT_ORDER.find((el) => GENERATES[el] === bazi.dayMaster.element) ?? bazi.dayMaster.element)
    : OVERCOMES[bazi.dayMaster.element]
  // 贵人五行：生助日主之五行（印星）
  const nobleElement = ELEMENT_ORDER.find((el) => GENERATES[el] === bazi.dayMaster.element) ?? bazi.dayMaster.element
  const lucky = {
    colors: ELEMENT_COLORS[favorable].join('、'),
    numbers: ELEMENT_NUMBERS[favorable].join('、'),
    direction: ELEMENT_DIRECTIONS[favorable],
    noble: `属${nobleElement}之人`,
  }

  // ---- 三维度 ----
  const seed = today.ganZhi.charCodeAt(0) + today.ganZhi.charCodeAt(1) + elementCounts[dominant]
  const leadKey: FortuneDimension['key'] =
    todayElement === '木' || todayElement === '金' ? 'career'
    : todayElement === '火' ? 'love'
    : 'health'

  const dimensionScore = (key: FortuneDimension['key']): number => {
    let s = score
    if (key === leadKey) s += 8 // 今日五行主导维度加权
    if (OVERCOMES[todayElement] === (key === 'love' ? dominant : key === 'career' ? lacking : dominant)) s -= 6
    return Math.max(0, Math.min(100, s))
  }

  const dimensions: FortuneDimension[] = (['career', 'wealth', 'love', 'health'] as const).map((key) => {
    const s = dimensionScore(key)
    const group = s >= 75 ? 'good' : s >= 60 ? 'mid' : 'caution'
    const scripts = DIMENSIONS[key]
    return {
      key,
      label: scripts.label,
      icon: scripts.icon,
      level: group,
      text: fill(pick(scripts[group], seed + s), { dominant, lacking, todayElement, trait: TODAY_ELEMENT_TRAIT[todayElement] }),
    }
  })

  // ---- 宜忌 ----
  const dos = [...DOS_BY_ELEMENT[todayElement]]
  const donts = [...DONTS_BY_ELEMENT[todayElement]]

  // ---- 水晶推荐 ----
  const trait = TODAY_ELEMENT_TRAIT[todayElement]
  // 缺五行数量为 0 → 真"缺X"；非 0（并列最少）→ "偏弱"，模板与 baziSummary 保持同一口径
  const lackReasonTpl = elementCounts[lacking] === 0 ? CRYSTAL_REASON_TEMPLATES.lack : CRYSTAL_REASON_TEMPLATES.lackWeak
  const crystals: FortuneCrystal[] = []
  const pickCrystal = (el: Element): FortuneCrystal | null => {
    const opts = CRYSTAL_BY_ELEMENT[el]
    if (!opts || !opts.length) return null
    return { ...pick(opts, seed + elementCounts[el]), role: '补缺', reason: '' }
  }

  // 首选：补最缺五行
  const lackCrystal = pickCrystal(lacking)
  if (lackCrystal) {
    lackCrystal.role = '补缺'
    lackCrystal.reason = fill(lackReasonTpl, { dominant, lacking, todayElement, trait, name: lackCrystal.name })
    crystals.push(lackCrystal)
  }
  // 次选：顺应今日五行（与首选不同类时）
  if (todayElement !== lacking) {
    const todayCrystal = pickCrystal(todayElement)
    if (todayCrystal && !crystals.some((c) => c.name === todayCrystal.name)) {
      todayCrystal.role = '顺应今日'
      todayCrystal.reason = fill(CRYSTAL_REASON_TEMPLATES.today, { dominant, lacking, todayElement, trait, name: todayCrystal.name })
      crystals.push(todayCrystal)
    }
  }
  // 备选：与最旺五行相生（旺 → 它）的水晶，补足 2 种或 3 种
  if (crystals.length < 3) {
    const harmonizeEl = GENERATES[dominant]
    const hCrystal = pickCrystal(harmonizeEl)
    if (hCrystal && !crystals.some((c) => c.name === hCrystal.name)) {
      hCrystal.role = '调和'
      hCrystal.reason = fill(CRYSTAL_REASON_TEMPLATES.harmonize, { dominant, lacking, todayElement, trait, name: hCrystal.name })
      crystals.push(hCrystal)
    }
  }
  // 若仍不足 2 种（极端去重情况，如 lacking === todayElement 时各分支撞同一枚），
  // 从缺五行依次换 seed 另选一枚不重复的补充
  if (crystals.length < 2) {
    const opts = CRYSTAL_BY_ELEMENT[lacking]
    for (let k = 0; k < opts.length; k++) {
      const opt = pick(opts, seed + elementCounts[lacking] + k)
      if (crystals.some((c) => c.name === opt.name)) continue
      crystals.push({
        ...opt,
        role: '补缺',
        reason: fill(lackReasonTpl, { dominant, lacking, todayElement, trait, name: opt.name }),
      })
      break
    }
  }

  const levelText = LEVEL_TEXT[level]
  return {
    score,
    level,
    levelLabel: levelText.label,
    levelDesc: levelText.desc,
    todayGanZhi: today.ganZhi,
    todayElement,
    baziSummary,
    pillarsLine: `${bazi.pillars.year} ${bazi.pillars.month} ${bazi.pillars.day} ${bazi.pillars.hour}`,
    dayMasterGanZhi: bazi.dayMaster.ganZhi,
    dayMasterElement: bazi.dayMaster.element,
    favorable,
    lucky,
    dimensions,
    dos,
    donts,
    crystals,
  }
}
