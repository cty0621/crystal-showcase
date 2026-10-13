import { Solar } from 'lunar-typescript'

export type Element = '金' | '木' | '水' | '火' | '土'

export interface BaziInfo {
  /** 四柱干支（各 2 字），月柱按节气划分（lunar-typescript 内部处理） */
  pillars: { year: string; month: string; day: string; hour: string }
  /** 日主：日柱干支、天干及其五行 */
  dayMaster: { ganZhi: string; stem: string; element: Element }
  /** 八个字的五行分布 */
  elementCounts: Record<Element, number>
  /** 最旺五行（数量最多，并列取先出现者） */
  dominant: Element
  /** 最缺五行（数量最少，并列取先出现者） */
  lacking: Element
  /** 是否偏枯（存在五行数量为 0） */
  isUnbalanced: boolean
}

const ELEMENT_ORDER: Element[] = ['木', '火', '土', '金', '水']

/** 天干五行 */
const STEM_ELEMENT: Record<string, Element> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
  己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
}

/** 地支五行 */
const BRANCH_ELEMENT: Record<string, Element> = {
  子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火',
  午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水',
}

function stemOf(gz: string): string {
  return gz.charAt(0)
}

function branchOf(gz: string): string {
  return gz.charAt(1)
}

/**
 * 由公历生日 + 时辰计算八字四柱与五行统计。
 * @param y 公历年 @param m 公历月(1-12) @param d 公历日
 * @param hourIndex 时辰序号 0-11（子丑寅卯辰巳午未申酉戌亥），代表小时 hourIndex*2
 * 注：子时(23:00-1:00)按 0 点计算，避免日柱边界问题。
 */
export function computeBazi(y: number, m: number, d: number, hourIndex: number): BaziInfo {
  const hour = Math.min(Math.max(hourIndex, 0), 11) * 2
  const solar = Solar.fromYmdHms(y, m, d, hour, 0, 0)
  const lunar = solar.getLunar()
  const ec = lunar.getEightChar()
  const pillars = {
    year: ec.getYear(),
    month: ec.getMonth(),
    day: ec.getDay(),
    hour: ec.getTime(),
  }

  const dayMaster = {
    ganZhi: pillars.day,
    stem: stemOf(pillars.day),
    element: STEM_ELEMENT[stemOf(pillars.day)],
  }

  const elementCounts: Record<Element, number> = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 }
  for (const gz of [pillars.year, pillars.month, pillars.day, pillars.hour]) {
    elementCounts[STEM_ELEMENT[stemOf(gz)]] += 1
    elementCounts[BRANCH_ELEMENT[branchOf(gz)]] += 1
  }

  let dominant: Element = ELEMENT_ORDER[0]
  let lacking: Element = ELEMENT_ORDER[0]
  let isUnbalanced = false
  for (const el of ELEMENT_ORDER) {
    if (elementCounts[el] > elementCounts[dominant]) dominant = el
    if (elementCounts[el] < elementCounts[lacking]) lacking = el
    if (elementCounts[el] === 0) isUnbalanced = true
  }

  return { pillars, dayMaster, elementCounts, dominant, lacking, isUnbalanced }
}

/** 今日日柱干支与天干五行 */
export function getTodayStemElement(now: Date = new Date()): { ganZhi: string; element: Element } {
  const ganZhi = Solar.fromDate(now).getLunar().getDayInGanZhi()
  return { ganZhi, element: STEM_ELEMENT[stemOf(ganZhi)] }
}
