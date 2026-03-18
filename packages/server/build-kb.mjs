#!/usr/bin/env node
/**
 * 构建结构化产品知识库
 *
 * 解析 38小课堂合集_文本 中所有 MD 文件，提取每个产品的：
 * - 精确名称
 * - 所在层级上下文（年龄/肤质/功效/场景）
 * - 价格区间
 * - 来源页
 *
 * 输出：product-kb.json — 供 generate-qa.mjs 使用
 */
import fs from 'fs'
import path from 'path'

const SRC_DIR = `${process.env.HOME}/Desktop/38小课堂合集_文本`
const OUT_FILE = new URL('./product-kb.json', import.meta.url).pathname

// ── 辅助：清理多余符号 ──────────────────────────────────────────────────
function cleanName(s) {
  return s.replace(/\*\*/g, '').replace(/\|/g, '').trim()
}

// ── 判断字符串是否像价格 ─────────────────────────────────────────────────
function looksLikePrice(s) {
  return /\d/.test(s) && /(元|以内|以上|以下|\d-\d)/.test(s)
}

// ── 解析单个 MD 文件 ──────────────────────────────────────────────────────
function parseMD(filename, content) {
  const lines    = content.split('\n')
  const products = []

  // 上下文栈：[{ level: number, text: string }]
  const ctxStack = []
  let currentPrice = null

  function topCtxs() {
    return ctxStack.map(c => c.text)
  }

  function pushCtx(level, text) {
    // 弹出层级 >= 当前的条目
    while (ctxStack.length > 0 && ctxStack[ctxStack.length - 1].level >= level) {
      ctxStack.pop()
    }
    ctxStack.push({ level, text })
    currentPrice = null   // 进入新标题时重置价格
  }

  function addProduct(rawName) {
    const name = cleanName(rawName)
    if (!name || name.length < 4) return
    // 过滤：纯符号 / 纯空白
    if (/^[\s（(）)。，！？\-—·]+$/.test(name)) return
    // 过滤：日期格式
    if (/^\d+月\d+号/.test(name)) return
    // 过滤：明显描述性文字（不含任何品牌/产品特征）
    if (/^(商品|品牌|价格|日期|课程|功效|适用人群|改善|年轻肌|轻熟肌|熟龄肌|妆前|气垫|粉底|遮瑕|定妆|保湿|修护|祛痘|美白|紧致|防晒|肤色|外观|核心功效|解决方案|本页|本次|适用|想|对|易|有|全|面部|身体)/.test(name)) return
    // 过滤：以括号开头的注释性文字
    const chineseCount = (name.match(/[\u4e00-\u9fff]/g) || []).length
    if (/^[（(「『【]/.test(name) && chineseCount < 4) return

    products.push({
      name,
      source: filename.replace('.md', ''),
      contexts: topCtxs(),
      price: currentPrice,
    })
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue

    // ── 标题行：## / ### / #### 等 ───────────────────────────────────────
    const headingM = line.match(/^(#{1,6})\s+(.+)/)
    if (headingM) {
      const level = headingM[1].length
      const text  = headingM[2].replace(/\*\*/g, '').trim()
      // level-1 标题（文件名）忽略
      if (level >= 2) pushCtx(level, text)
      continue
    }

    // ── 加粗价格行：**200-500元** ──────────────────────────────────────────
    const boldPriceM = line.match(/^\*\*([^*]+)\*\*$/)
    if (boldPriceM) {
      const candidate = boldPriceM[1].trim()
      if (looksLikePrice(candidate)) {
        currentPrice = candidate
        continue
      }
    }

    // ── 表格行 ─────────────────────────────────────────────────────────────
    if (line.startsWith('|')) {
      // 跳过分隔线
      if (/^[\|\s\-]+$/.test(line)) continue
      // 跳过表头（含"商品""名称""价格"）
      if (/商品|名称|价格区间/.test(line)) continue

      const cells = line.split('|').map(c => c.trim()).filter(Boolean)

      if (cells.length === 2) {
        // | 价格 | 产品名 | 格式
        if (looksLikePrice(cells[0])) {
          currentPrice = cells[0]
          addProduct(cells[1])
        } else {
          // | 产品名 | 其他 | 格式（33.md 眼霜）
          addProduct(cells[0])
        }
      } else if (cells.length === 1) {
        // 单列表：| 产品名 |
        addProduct(cells[0])
      } else if (cells.length >= 2) {
        // 多列，取最后非空单元格作为产品名
        const last = cells[cells.length - 1]
        if (!looksLikePrice(last) && last.length > 3) {
          if (looksLikePrice(cells[0])) currentPrice = cells[0]
          addProduct(last)
        }
      }
      continue
    }

    // ── 列表项：- 产品名 ──────────────────────────────────────────────────
    const bulletM = line.match(/^[-*]\s+(.+)/)
    if (bulletM) {
      addProduct(bulletM[1])
      continue
    }
  }

  return products
}

// ── 主流程 ────────────────────────────────────────────────────────────────
function main() {
  const files = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.md')).sort()

  // 产品名 → 合并后的条目（同一产品在不同页出现时合并）
  const productMap = new Map()

  for (const filename of files) {
    const content  = fs.readFileSync(path.join(SRC_DIR, filename), 'utf-8')
    const entries  = parseMD(filename, content)

    for (const entry of entries) {
      const key = entry.name
      if (!productMap.has(key)) {
        productMap.set(key, {
          name:     entry.name,
          sources:  [],
          entries:  [],
        })
      }
      const rec = productMap.get(key)
      if (!rec.sources.includes(entry.source)) rec.sources.push(entry.source)
      rec.entries.push({
        source:   entry.source,
        contexts: entry.contexts,
        price:    entry.price,
      })
    }
  }

  // 转换为数组并排序
  const kb = Array.from(productMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'zh'))

  fs.writeFileSync(OUT_FILE, JSON.stringify(kb, null, 2), 'utf-8')

  // ── 统计 ──
  console.log(`\n✅ 知识库构建完成`)
  console.log(`   产品总数: ${kb.length}`)
  console.log(`   来源文件: ${files.length} 个`)
  console.log(`   输出路径: ${OUT_FILE}`)

  // 抽样验证
  const sample = ['理肤泉新B5 多效修护精华', '兰蔻「超修小黑瓶」精华', '薇诺娜 屏障修护精华液第二代（311次抛）明星大单品']
  console.log('\n── 抽样验证 ──')
  for (const name of sample) {
    const rec = productMap.get(name)
    if (rec) {
      console.log(`\n[${name}]`)
      rec.entries.forEach(e => {
        console.log(`  来源:${e.source}  价格:${e.price || '—'}  上下文:[${e.contexts.join(' > ')}]`)
      })
    } else {
      console.log(`\n[${name}] ⚠️ 未找到`)
    }
  }
}

main()
