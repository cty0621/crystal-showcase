/**
 * mock-gallery.js — 灵感广场本地数据兜底
 *
 * 背景:灵感广场的数据源 Supabase 项目(agpvtfeomyxmlyakjpdh.supabase.co)
 * 已失效(域名 NXDOMAIN),导致列表查询失败、页面显示"还没有设计"。
 *
 * 本脚本在应用 bundle 加载之前劫持 window.fetch:
 *   - 仅拦截发往该项目 Supabase 域名 /rest/v1/designs、/rpc/*、/functions/* 的请求
 *   - 返回 13 条内置设计(7 条原 bundle 内置英文设计 + 6 条中文设计)
 *   - 用户在本次会话"分享设计"的 insert 也会落入本地存储并合并展示
 *   - 其余请求原样放行
 *
 * 若日后重建 Supabase 后端,删除 diy.html 中的本脚本引用即可恢复真实数据源。
 */
(function () {
  'use strict';

  var SUPABASE_HOST = 'agpvtfeomyxmlyakjpdh.supabase.co';
  var LOCAL_KEY = 'cw_local_shared_designs_v1';

  /* ---------------------------------------------------------- */
  /* 珠子定义(与设计器 catalog 一致)                              */
  /* ---------------------------------------------------------- */
  // 只有 .jpg 的珠子编号(其余编号均有 .png)
  var JPG_ONLY = { '036': true, '038': true, '054': true, '068': true };

  /**
   * 规范化珠子数据:为缺失 thumbnail 的珠子推导图片路径。
   * 旧版设计数据里的珠子只有 img 字段(如 "img/products/prod_052.png")
   * 或完全没有图片字段,导致画廊 SVG 渲染出 href="undefined"、珠子缺失。
   * 兼容三种情况:
   *   1. 有 img 字段 → 映射到 /assets/ 路径
   *   2. 有 id 字段(如 "prod_052_8mm") → 推导 ./assets/textures/products/prod_052.png
   *   3. 两者皆无 → 保持原样(渲染端会跳过)
   */
  function normalizeBead(b) {
    if (!b || typeof b !== 'object') return b;
    if (!b.thumbnail) {
      if (typeof b.img === 'string' && b.img) {
        var p = String(b.img).replace(/^\.?\//, '');
        p = p.replace(/^(img|images)\//, 'assets/');
        b.thumbnail = p.charAt(0) === '/' ? p : '/' + p;
      } else if (typeof b.id === 'string' && b.id) {
        var m = String(b.id).match(/^(prod_\d+)/);
        if (m) {
          var num = m[1].split('_')[1];
          b.thumbnail = './assets/textures/products/prod_' + num + (JPG_ONLY[num] ? '.jpg' : '.png');
        }
      }
    }
    if (!b.preview) b.preview = b.thumbnail;
    return b;
  }

  function bead(id, name, nameEn, size, price, thumb) {
    return {
      id: id,
      name: name,
      name_en: nameEn,
      size: size,
      price: price,
      thumbnail: thumb,
      preview: thumb,
    };
  }

  var B = {
    // 内置设计用珠子(bundle 常量)
    ch: bead('prod_064_10mm', '星光粉晶', 'Star Rose Quartz', 10, 8, './assets/textures/products/prod_064.png'),
    Gs: bead('prod_070_8mm', '薰衣草紫水晶', 'Lavender Amethyst', 8, 5, './assets/textures/products/prod_070.png'),
    Js: bead('prod_080_8mm', '绿葡萄石', 'Prehnite', 8, 5, './assets/textures/products/prod_080.png'),
    uh: bead('prod_054_8mm', '婚纱闪白阿塞', 'Bridal Sparkle White Azeztulita', 8, 5, './assets/textures/products/prod_054.jpg'),
    Qe: bead('prod_052_10mm', '净体白水晶', 'Clear Quartz (Pure)', 10, 8, './assets/textures/products/prod_052.png'),
    Bo: bead('prod_083_10mm', '玫瑰粉蔷薇石', 'Rose Pink Rhodonite', 10, 8, './assets/textures/products/prod_083.png'),
    Mo: bead('prod_076_10mm', '豆沙红草莓晶', 'Red Strawberry Quartz (Bean Paste)', 10, 8, './assets/textures/products/prod_076.png'),
    Tt: bead('prod_001_10mm', '红兔毛', 'Red Rabbit Hair Quartz', 10, 8, './assets/textures/products/prod_001.png'),
    Fo: bead('prod_025_10mm', '白菩提', 'White Bodhi Seed', 10, 8, './assets/textures/products/prod_025.png'),
    qo: { id: 'prod_046', name: '红玛瑙算盘珠', name_en: 'Red Agate Abacus Bead', size: 6, length: 3, width: 6, price: 3, thumbnail: './assets/textures/products/prod_046.png', preview: './assets/textures/products/prod_046.png' },
    dh: bead('prod_027_12mm', '蜜蜡', 'Amber', 12, 12, './assets/textures/products/prod_027.png'),
    Ho: bead('prod_019_10mm', '满天星绿幽灵', 'Green Phantom Quartz (Starry)', 10, 8, './assets/textures/products/prod_019.png'),
    zo: bead('prod_008_10mm', '绿龙晶', 'Seraphinite', 10, 8, './assets/textures/products/prod_008.png'),
    Wo: bead('prod_013_10mm', '绿发晶', 'Green Rutilated Quartz', 10, 8, './assets/textures/products/prod_013.png'),
    Vo: bead('prod_032_10mm', '黑曜石', 'Obsidian', 10, 8, './assets/textures/products/prod_032.png'),
    Dr: bead('prod_085_10mm', '金虎眼', "Golden Tiger's Eye", 10, 8, './assets/textures/products/prod_085.png'),
    jr: bead('prod_073_10mm', '净体茶晶', 'Smoky Quartz (Pure)', 10, 8, './assets/textures/products/prod_073.png'),
    hh: bead('prod_089_12mm', '黄塔晶', 'Citrine Tower', 12, 12, './assets/textures/products/prod_089.png'),
    Ko: bead('prod_088_10mm', '透体柠檬黄水晶', 'Lemon Citrine (Transparent)', 10, 8, './assets/textures/products/prod_088.png'),
    Ur: bead('prod_087_10mm', '黄虎眼', "Yellow Tiger's Eye", 10, 8, './assets/textures/products/prod_087.png'),
    Go: bead('prod_014_10mm', '金发晶', 'Golden Rutilated Quartz', 10, 8, './assets/textures/products/prod_014.png'),
    // 中文设计用珠子(8mm)
    amethyst8: bead('prod_067_8mm', '乌拉圭紫水晶', 'Uruguayan Amethyst', 8, 5, './assets/textures/products/prod_067.png'),
    moonstone8: bead('prod_034_8mm', '灰月光', 'Grey Moonstone', 8, 5, './assets/textures/products/prod_034.png'),
    citrine8: bead('prod_088_8mm', '透体柠檬黄水晶', 'Lemon Citrine (Transparent)', 8, 5, './assets/textures/products/prod_088.png'),
    clear8: bead('prod_052_8mm', '净体白水晶', 'Clear Quartz (Pure)', 8, 5, './assets/textures/products/prod_052.png'),
    agate8: bead('prod_045_8mm', '红玛瑙', 'Red Agate', 8, 5, './assets/textures/products/prod_045.png'),
    amazonite8: bead('prod_016_8mm', '天河石', 'Amazonite', 8, 5, './assets/textures/products/prod_016.png'),
    amethyst10: bead('prod_067_10mm', '乌拉圭紫水晶', 'Uruguayan Amethyst', 10, 8, './assets/textures/products/prod_067.png'),
  };

  function rep(bead, count) {
    var out = [];
    for (var i = 0; i < count; i++) out.push(Object.assign({}, bead));
    return out;
  }
  // 交错复制两种珠子:[a,b,a,b,...](各 count 个)
  function interleave(beadA, beadB, count) {
    var out = [];
    for (var i = 0; i < count; i++) out.push(Object.assign({}, beadA), Object.assign({}, beadB));
    return out;
  }

  /* ---------------------------------------------------------- */
  /* 复刻 bundle 中的计算逻辑(Gl / Wl / fr)                       */
  /* ---------------------------------------------------------- */
  function round2(n) {
    return Math.round(n * 100) / 100;
  }
  function beadLen(b) {
    return typeof b.length === 'number' && !Number.isNaN(b.length) ? b.length : b.size;
  }
  function beadWidth(b) {
    return typeof b.width === 'number' && !Number.isNaN(b.width) ? b.width : b.size;
  }
  function handSizeCm(beads) {
    if (!beads.length) return 0;
    var totalLen = beads.reduce(function (acc, b) { return acc + beadLen(b); }, 0) / 10;
    var maxW = Math.max.apply(null, beads.map(function (b) { return beadWidth(b); })) / 10;
    var cm = Math.round((totalLen - 3.21 * maxW) * 2) / 2;
    return Number.isFinite(cm) ? cm : 0;
  }
  function buildLineItems(beads) {
    var map = new Map();
    beads.forEach(function (b) {
      var cur = map.get(b.id);
      if (cur) {
        cur.qty += 1;
        cur.line_total = round2(cur.qty * cur.unit_price);
        return;
      }
      map.set(b.id, {
        sku: b.id,
        title: b.name_en || b.name || b.id,
        qty: 1,
        unit_price: round2(b.price),
        line_total: round2(b.price),
      });
    });
    return Array.from(map.values());
  }
  function buildPricing(beads) {
    var subtotal = buildLineItems(beads).reduce(function (acc, li) { return acc + li.line_total; }, 0);
    var labor = 5;
    return {
      materials_subtotal: round2(subtotal),
      labor_fee: labor,
      total_price: round2(subtotal + labor),
    };
  }
  /**
   * 补全设计行字段:sessionStorage 里的旧版分享记录可能缺少
   * hand_size_cm / total_price / bead_count 等字段,画廊卡片渲染
   * (toFixed 调用)会因此抛 TypeError 导致整个列表空白。
   */
  function ensureDesignFields(d) {
    if (!d || typeof d !== 'object') return d;
    if (Array.isArray(d.beads_data)) {
      d.beads_data = d.beads_data.map(normalizeBead);
    } else {
      d.beads_data = [];
    }
    if (typeof d.hand_size_cm !== 'number' || !Number.isFinite(d.hand_size_cm)) {
      d.hand_size_cm = handSizeCm(d.beads_data);
    }
    if (typeof d.total_price !== 'number' || !Number.isFinite(d.total_price)) {
      var pricing = buildPricing(d.beads_data);
      d.total_price = pricing.total_price;
      if (!d.pricing) d.pricing = pricing;
    }
    if (!Array.isArray(d.line_items) || !d.line_items.length) {
      d.line_items = buildLineItems(d.beads_data);
    }
    if (typeof d.bead_count !== 'number' || !Number.isFinite(d.bead_count)) {
      d.bead_count = d.beads_data.length;
    }
    if (!d.short_id) d.short_id = String(d.id || 'legacy') + '-' + String(d.created_at || '').replace(/[^0-9a-zA-Z]/g, '');
    if (typeof d.view_count !== 'number') d.view_count = 0;
    if (typeof d.fork_count !== 'number') d.fork_count = 0;
    return d;
  }
  function toDesignRow(raw) {
    var beads = raw.beads.map(function (b) { return normalizeBead(Object.assign({}, b)); });
    var pricing = buildPricing(beads);
    return {
      id: raw.id,
      short_id: raw.short_id,
      design_name: raw.design_name,
      beads_data: beads,
      creator_email: raw.creator_email,
      creator_nickname: raw.creator_nickname,
      currency: 'USD',
      line_items: buildLineItems(beads),
      pricing: pricing,
      total_price: pricing.total_price,
      hand_size_cm: handSizeCm(beads),
      bead_count: beads.length,
      created_at: raw.created_at,
      updated_at: raw.created_at,
      is_public: true,
      view_count: raw.view_count || 0,
      fork_count: raw.fork_count || 0,
      description: raw.description || null,
      description_en: raw.description_en || null,
      thumbnail_url: null,
    };
  }

  /* ---------------------------------------------------------- */
  /* 内置设计                                                    */
  /* ---------------------------------------------------------- */
  function localDesigns() {
    try {
      var raw = sessionStorage.getItem(LOCAL_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }
  function saveLocalDesigns(list) {
    try {
      sessionStorage.setItem(LOCAL_KEY, JSON.stringify(list));
    } catch (e) { /* ignore */ }
  }

  var BUILTIN = [
    toDesignRow({
      id: 'mock-1', short_id: 'morning01', design_name: 'Morning Glory',
      creator_email: 'ann@example.com', creator_nickname: 'Ann',
      created_at: '2024-12-20T10:00:00Z', view_count: 1112, fork_count: 89,
      beads: [B.ch]
        .concat(rep(B.Gs, 2), rep(B.Js, 2), rep(B.Gs, 2), rep(B.Js, 2))
        .concat(rep(B.Gs, 2), rep(B.Js, 2), [B.uh], rep(B.Gs, 2), rep(B.Js, 2), rep(B.Gs, 3), rep(B.Js, 2)),
    }),
    toDesignRow({
      id: 'mock-2', short_id: 'raspbe02', design_name: 'Raspberry',
      creator_email: 'ann@example.com', creator_nickname: 'Ann',
      created_at: '2024-12-21T12:30:00Z', view_count: 3066, fork_count: 156,
      beads: [B.Qe, B.Bo].concat(rep(B.Mo, 7), [B.Bo, B.Qe], rep(B.Mo, 7)),
    }),
    toDesignRow({
      id: 'mock-3', short_id: 'halfhe03', design_name: 'Half Heart',
      creator_email: 'ann@example.com', creator_nickname: 'Ann',
      created_at: '2024-12-22T09:15:00Z', view_count: 712, fork_count: 42,
      beads: interleave(B.Qe, B.Tt, 8),
    }),
    toDesignRow({
      id: 'mock-4', short_id: 'bodhic04', design_name: 'Bodhi Cake',
      creator_email: 'ann@example.com', creator_nickname: 'Ann',
      created_at: '2024-12-23T14:45:00Z', view_count: 4124, fork_count: 234,
      beads: rep(B.Fo, 8).concat([B.qo, B.qo, B.dh], rep(B.Fo, 8)),
    }),
    toDesignRow({
      id: 'mock-5', short_id: 'greend05', design_name: 'Green Dragon',
      creator_email: 'ann@example.com', creator_nickname: 'Ann',
      created_at: '2024-12-24T11:00:00Z', view_count: 1797, fork_count: 98,
      beads: rep(B.zo, 8).concat([B.Ho, B.Ho], rep(B.zo, 8)),
    }),
    toDesignRow({
      id: 'mock-6', short_id: 'blackb06', design_name: 'Blackberry',
      creator_email: 'ann@example.com', creator_nickname: 'Ann',
      created_at: '2024-12-25T16:30:00Z', view_count: 4870, fork_count: 267,
      beads: rep(B.Vo, 7).concat([B.Wo, B.Qe, B.Qe, B.Wo], rep(B.Vo, 7)),
    }),
    toDesignRow({
      id: 'mock-7', short_id: 'fortun07', design_name: 'Fortune',
      creator_email: 'ann@example.com', creator_nickname: 'Ann',
      created_at: '2024-12-26T08:00:00Z', view_count: 2950, fork_count: 178,
      beads: [B.Dr, B.Dr, B.jr, B.jr, B.hh, B.Ko, B.Ko, B.Ur, B.Ur, B.Go, B.Go, B.Ur, B.Ur, B.jr, B.jr, B.Dr, B.Dr],
    }),
    // ---- 中文设计(自旧版本地数据迁移) ----
    toDesignRow({
      id: 'mock-8', short_id: 'yuexia01', design_name: '月下紫韵',
      creator_email: 'studio@annflora.com', creator_nickname: 'Annflora Studio',
      created_at: '2026-06-15T10:00:00Z', view_count: 2156, fork_count: 132,
      description: '月光洒落处\n紫水晶的低语轻\n心灵归于静',
      // 4紫+3月光 三轮 = 21颗(168mm,完整环形手串)
      beads: rep(B.amethyst8, 4).concat(
        rep(B.moonstone8, 3), rep(B.amethyst8, 4), rep(B.moonstone8, 3),
        rep(B.amethyst8, 4), rep(B.moonstone8, 3)),
    }),
    toDesignRow({
      id: 'mock-9', short_id: 'meigui02', design_name: '玫瑰晨曦',
      creator_email: 'crystal@lover.cn', creator_nickname: 'Crystal Lover',
      created_at: '2026-06-20T09:00:00Z', view_count: 1890, fork_count: 97,
      description: '温柔的粉晶\n如晨曦般静静照\n爱意在绽放',
      // 4粉晶+3柠檬黄 两轮半 = 18颗(168mm,完整环形手串)
      beads: rep(B.ch, 4).concat(
        rep(B.citrine8, 3), rep(B.ch, 4), rep(B.citrine8, 3), rep(B.ch, 4)),
    }),
    toDesignRow({
      id: 'mock-10', short_id: 'anyeha03', design_name: '暗夜守护',
      creator_email: 'dark@moon.cn', creator_nickname: 'DarkMoon',
      created_at: '2026-06-25T22:00:00Z', view_count: 1543, fork_count: 76,
      description: '黑曜石的墙\n阻挡一切喧嚣声\n带来内心宁',
      // 纯黑曜石 17颗(170mm,完整环形手串)
      beads: rep(B.Vo, 17),
    }),
    toDesignRow({
      id: 'mock-11', short_id: 'senlin04', design_name: '森林之息',
      creator_email: 'nature@spirit.cn', creator_nickname: 'NatureSpirit',
      created_at: '2026-07-01T08:00:00Z', view_count: 2201, fork_count: 143,
      description: '翠绿森林间\n水晶光芒闪耀处\n自然在呼吸',
      // 绿葡萄石+白水晶交替 11对 = 22颗(176mm,完整环形手串)
      beads: interleave(B.Js, B.clear8, 11),
    }),
    toDesignRow({
      id: 'mock-12', short_id: 'haiyan05', design_name: '海洋之心',
      creator_email: 'ocean@dreamer.cn', creator_nickname: 'OceanDreamer',
      created_at: '2026-07-03T15:00:00Z', view_count: 1762, fork_count: 88,
      description: '蓝如深海处\n绿松石轻波荡漾\n心随浪花静',
      // 红玛瑙+天河石交替 11对 = 22颗(176mm,完整环形手串)
      beads: interleave(B.agate8, B.amazonite8, 11),
    }),
    toDesignRow({
      id: 'mock-13', short_id: 'zijinh06', design_name: '紫金交汇',
      creator_email: 'golden@hour.cn', creator_nickname: 'GoldenHour',
      created_at: '2026-06-28T18:00:00Z', view_count: 1338, fork_count: 61,
      description: '紫水晶低语\n金琥珀光芒照亮\n两色的交响',
      // 3紫水晶+3金琥珀 三轮 = 18颗(180mm,完整环形手串)
      beads: rep(B.amethyst10, 3).concat(
        rep(B.Ko, 3), rep(B.amethyst10, 3), rep(B.Ko, 3), rep(B.amethyst10, 3), rep(B.Ko, 3)),
    }),
  ];

  function allDesigns() {
    var locals = localDesigns();
    var seen = new Set();
    var merged = BUILTIN.concat(locals).filter(function (d) {
      if (!d || seen.has(d.short_id)) return false;
      seen.add(d.short_id);
      return true;
    });
    return merged.sort(function (a, b) {
      if (a.view_count !== b.view_count) return b.view_count - a.view_count;
      if (a.fork_count !== b.fork_count) return b.fork_count - a.fork_count;
      return String(b.created_at).localeCompare(String(a.created_at));
    });
  }

  /* ---------------------------------------------------------- */
  /* 响应工具                                                    */
  /* ---------------------------------------------------------- */
  function jsonResponse(body, status, extraHeaders) {
    var headers = Object.assign({ 'Content-Type': 'application/json' }, extraHeaders || {});
    return new Response(JSON.stringify(body), { status: status || 200, headers: headers });
  }

  function handleDesignsRequest(req, url) {
    var method = (req.method || 'GET').toUpperCase();

    if (method === 'GET') {
      var params = url.searchParams;
      var designs = allDesigns();
      // 统一规范化存量设计(含 sessionStorage 里的旧版分享记录)的珠子数据
      // 并补全渲染所需字段,避免旧数据缺字段导致列表渲染崩溃
      designs.forEach(ensureDesignFields);
      var shortIdEq = params.get('short_id');
      var isPublicEq = params.get('is_public');
      if (isPublicEq === 'eq.true') designs = designs.filter(function (d) { return d.is_public === true; });
      if (shortIdEq) designs = designs.filter(function (d) { return d.short_id === shortIdEq.replace(/^eq\./, ''); });
      var offset = parseInt(params.get('offset') || '0', 10);
      var limit = params.has('limit') ? parseInt(params.get('limit'), 10) : designs.length;
      if (!Number.isFinite(offset)) offset = 0;
      if (!Number.isFinite(limit)) limit = designs.length;
      var page = designs.slice(offset, offset + limit);
      var from = page.length ? offset : 0;
      var to = page.length ? offset + page.length - 1 : 0;
      return jsonResponse(page, 200, {
        'Content-Range': from + '-' + to + '/' + designs.length,
      });
    }

    if (method === 'POST') {
      return req.json().then(function (body) {
        var row = Array.isArray(body) ? body[0] : body;
        // 规范化珠子数据并补全字段,兼容旧版结构(无 thumbnail 字段)的设计
        row = ensureDesignFields(Object.assign({}, row, {
          view_count: row.view_count || 0,
          fork_count: row.fork_count || 0,
          is_public: true,
        }));
        var locals = localDesigns().filter(function (d) { return d.short_id !== row.short_id; });
        locals.push(row);
        saveLocalDesigns(locals);
        return jsonResponse([row], 201);
      });
    }

    if (method === 'PATCH' || method === 'DELETE') {
      return Promise.resolve(new Response(null, { status: 204 }));
    }

    return jsonResponse([], 200);
  }

  function handleFunctionsRequest(req, url) {
    if (!/get-design-by-short-id/.test(url.pathname)) {
      return jsonResponse(null, 200);
    }
    return req.json().then(function (body) {
      var shortId = body && body.shortId;
      var found = allDesigns().find(function (d) { return d.short_id === shortId; });
      return jsonResponse(found || null, 200);
    });
  }

  function handleRpcRequest(req, url) {
    if (/increment_fork_count/.test(url.pathname)) {
      return Promise.resolve(new Response(null, { status: 204 }));
    }
    return jsonResponse(null, 200);
  }

  /* ---------------------------------------------------------- */
  /* fetch 劫持                                                  */
  /* ---------------------------------------------------------- */
  var realFetch = window.fetch.bind(window);

  /* ---------------------------------------------------------- */
  /* 使 bundle 的画廊缓存失效                                    */
  /* ---------------------------------------------------------- */
  // bundle 会把画廊列表缓存到 localStorage["cw_gallery_cache_v2"],
  // 有效期 10 分钟。旧缓存(修复前的数据)会导致修复迟迟不生效,
  // 且用户新分享的设计也不会立即出现。每次加载时清掉缓存,
  // 强制 bundle 重新向本脚本拉取最新数据。
  try {
    localStorage.removeItem('cw_gallery_cache_v2');
  } catch (e) { /* ignore */ }

  window.fetch = function (input, init) {
    var url;
    try {
      url = typeof input === 'string' ? new URL(input, location.href) : new URL(input.url, location.href);
    } catch (e) {
      return realFetch(input, init);
    }
    if (url.hostname !== SUPABASE_HOST) {
      return realFetch(input, init);
    }
    var req = new Request(url.href, init || {});
    if (/\/rest\/v1\/designs($|\?)/.test(url.pathname)) return handleDesignsRequest(req, url);
    if (/\/functions\/v1\//.test(url.pathname)) return handleFunctionsRequest(req, url);
    if (/\/rest\/v1\/rpc\//.test(url.pathname)) return handleRpcRequest(req, url);
    return realFetch(input, init);
  };

  console.log('[mock-gallery] 灵感广场本地数据兜底已启用(内置 ' + BUILTIN.length + ' 条设计)');
})();
