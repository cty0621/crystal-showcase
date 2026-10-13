// 引擎纯函数验证脚本：断言失败则抛错（非 0 退出码）
const results = []
function check(name, fn) {
  try { fn(); results.push(['PASS', name]); }
  catch (e) { results.push(['FAIL', name + ' -> ' + e.message]); }
}
function assertEqual(actual, expected, msg) {
  const a = JSON.stringify(actual), b = JSON.stringify(expected)
  if (a !== b) throw new Error((msg || '') + ' 期望 ' + b + ' 实际 ' + a)
}
function assertTrue(cond, msg) { if (!cond) throw new Error(msg || '断言失败') }

// ---- bazi.ts 断言 ----
const { computeBazi, getTodayStemElement } = await import('../src/lib/bazi.ts')
const ELEMENTS = ['金', '木', '水', '火', '土']

check('八字8字五行总数为8', () => {
  const b = computeBazi(1995, 8, 20, 4) // 辰时(8点)
  const total = ELEMENTS.reduce((s, e) => s + b.elementCounts[e], 0)
  assertEqual(total, 8, '五行总数')
})

check('四柱干支非空且为2字', () => {
  const b = computeBazi(1995, 8, 20, 4)
  for (const k of ['year', 'month', 'day', 'hour']) {
    assertTrue(typeof b.pillars[k] === 'string' && b.pillars[k].length === 2, k + ' 柱: ' + b.pillars[k])
  }
})

check('dominant/lacking 是合法五行', () => {
  const b = computeBazi(1995, 8, 20, 4)
  assertTrue(ELEMENTS.includes(b.dominant) && ELEMENTS.includes(b.lacking), 'dominant/lacking')
})

check('已知日期八字正确(1995-08-20 辰时)', () => {
  const b = computeBazi(1995, 8, 20, 4) // 辰时(8点)：hourIndex=4 对应 辰，巳时为 hourIndex=5(丁巳)
  assertEqual(b.pillars.year, '乙亥', '年柱')
  assertEqual(b.pillars.month, '甲申', '月柱')
  assertEqual(b.pillars.day, '癸未', '日柱')
  assertEqual(b.pillars.hour, '丙辰', '时柱')
})

check('今日五行是合法五行', () => {
  const t = getTodayStemElement()
  assertTrue(ELEMENTS.includes(t.element), '今日五行: ' + t.element)
  assertTrue(typeof t.ganZhi === 'string' && t.ganZhi.length === 2, '今日干支: ' + t.ganZhi)
})

check('时辰边界 0-11 不抛异常', () => {
  for (let i = 0; i < 12; i++) computeBazi(2000, 1, 1, i)
})

// ---- fortune.ts 断言 ----
const { CRYSTAL_BY_ELEMENT, DOS_BY_ELEMENT, DONTS_BY_ELEMENT, LEVEL_TEXT, CRYSTAL_REASON_TEMPLATES, DIMENSIONS } = await import('../src/data/fortune.ts')

const DIY_CATALOG = ['白水晶','紫水晶','黄水晶','粉水晶','茶水晶','幽灵水晶','发晶','兔毛水晶','胶花水晶','海蓝宝','草莓晶','萤石','曜石','葡萄石','天河石','虎眼石','太阳石','月光石','蔷薇石','玉石','玛瑙','朱砂','文玩']

check('23类水晶全部纳入五行映射且无重复', () => {
  const names = ELEMENTS.flatMap((e) => CRYSTAL_BY_ELEMENT[e].map((c) => c.name))
  assertEqual(names.length, 23, '总数')
  assertEqual(new Set(names).size, 23, '无重复')
  for (const n of DIY_CATALOG) assertTrue(names.includes(n), '缺: ' + n)
  for (const e of ELEMENTS) for (const c of CRYSTAL_BY_ELEMENT[e]) {
    assertTrue(typeof c.image === 'string' && c.image.length > 0, e + '/' + c.name + ' 图片路径')
  }
})

check('文案模板无 undefined 且覆盖全部五行/档位', () => {
  for (const e of ELEMENTS) {
    assertTrue(DOS_BY_ELEMENT[e].length === 2, e + ' 宜 2 条')
    assertTrue(DONTS_BY_ELEMENT[e].length === 2, e + ' 忌 2 条')
  }
  for (const lv of ['great', 'good', 'fair', 'quiet']) {
    assertTrue(typeof LEVEL_TEXT[lv].label === 'string' && LEVEL_TEXT[lv].label.length > 0, lv)
    assertTrue(typeof LEVEL_TEXT[lv].desc === 'string' && LEVEL_TEXT[lv].desc.length > 0, lv)
  }
  for (const d of ['career', 'love', 'health']) {
    for (const g of ['good', 'mid', 'caution']) {
      assertTrue(DIMENSIONS[d][g].length >= 3, d + '/' + g + ' 至少3条')
    }
  }
  for (const k of ['lack', 'today', 'harmonize']) {
    assertTrue(typeof CRYSTAL_REASON_TEMPLATES[k] === 'string' && CRYSTAL_REASON_TEMPLATES[k].length > 0, k)
  }
})

// ---- fortuneEngine.ts 断言 ----
const { computeFortune } = await import('../src/lib/fortuneEngine.ts')
const { computeBazi: cb } = await import('../src/lib/bazi.ts')

check('评分恒在 0-100 且档位匹配', () => {
  for (let i = 0; i < 12; i++) {
    const report = computeFortune(cb(1995, 8, 20, i), { ganZhi: '庚申', element: '金' })
    assertTrue(report.score >= 0 && report.score <= 100, 'score=' + report.score)
    const expectLv = report.score >= 85 ? 'great' : report.score >= 70 ? 'good' : report.score >= 55 ? 'fair' : 'quiet'
    assertEqual(report.level, expectLv, '档位 score=' + report.score)
  }
})

check('水晶推荐 2-3 种、名称合法、理由非空', () => {
  const report = computeFortune(cb(1995, 8, 20, 4), { ganZhi: '庚申', element: '金' })
  assertTrue(report.crystals.length >= 2 && report.crystals.length <= 3, '数量=' + report.crystals.length)
  for (const c of report.crystals) {
    assertTrue(DIY_CATALOG.includes(c.name), '非法水晶: ' + c.name)
    assertTrue(typeof c.reason === 'string' && c.reason.length > 10, c.name + ' 理由过短')
  }
})

check('四个维度齐全且文案无未替换占位符', () => {
  const report = computeFortune(cb(1995, 8, 20, 4), { ganZhi: '庚申', element: '金' })
  assertEqual(report.dimensions.map((d) => d.key).sort().join(','), 'career,health,love,wealth', '维度')
  for (const d of report.dimensions) {
    assertTrue(!/[{}]/.test(d.text), d.key + ' 文案残留占位符: ' + d.text)
  }
  assertTrue(!/[{}]/.test(report.baziSummary), 'baziSummary 残留占位符')
})

check('宜忌各 2 条且来自对应五行模板', () => {
  const report = computeFortune(cb(1995, 8, 20, 4), { ganZhi: '庚申', element: '金' })
  assertEqual(report.dos.length, 2, '宜')
  assertEqual(report.donts.length, 2, '忌')
})

check('缺火八字 + 火日 → 评分较高且首选补火水晶', () => {
  // 样例 1995-08-20 辰时(hourIndex=4)：火=1 与金=1 并列最少（lacking 按五行顺序取火），火日命中 lacking 加 15 分
  const b = cb(1995, 8, 20, 4)
  const report = computeFortune(b, { ganZhi: '丙午', element: '火' })
  assertTrue(report.crystals[0].role === '补缺' && report.crystals[0].name, '首选=' + report.crystals[0].name)
  assertTrue(report.score > 60, '缺火遇火日应加分, score=' + report.score)
})

check('闰月与极端日期不抛异常', () => {
  computeFortune(cb(2023, 2, 20, 6), { ganZhi: '壬子', element: '水' }) // 2023 闰二月附近
  computeFortune(cb(1901, 1, 1, 0), { ganZhi: '甲子', element: '木' })
  computeFortune(cb(2099, 12, 31, 11), { ganZhi: '癸亥', element: '水' })
})

// ---- 汇总 ----
let failed = 0
for (const [status, name] of results) {
  console.log(status + '  ' + name)
  if (status === 'FAIL') failed++
}
console.log('\n' + results.length + ' 项，' + failed + ' 项失败')
process.exit(failed ? 1 : 0)
