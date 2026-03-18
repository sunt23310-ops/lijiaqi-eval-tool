#!/usr/bin/env node
/**
 * QA 对话生成脚本 v4 — 结构化产品知识库 + 严格上下文约束
 *
 * 使用 build-kb.mjs 生成的 product-kb.json，将每个产品的
 * 精确名称、适用场景、价格与其 MD 文档上下文绑定，
 * 杜绝产品-肤质-场景张冠李戴的问题。
 */
import fs from 'fs'
import path from 'path'

const API_KEY  = 'sk-SrldcMJv85XKc4T1lBvohp3XweVSjOIfsJ2QHK8DsXnR9v9l'
const BASE_URL = 'https://apim1.cheapapi.ai/v1'
const MODEL    = 'gpt-4o'

const SRC_DIR  = `${process.env.HOME}/Desktop/38小课堂合集_文本`
const OUT_DIR  = `${process.env.HOME}/Desktop/38小课堂_QA对话`
const KB_FILE  = new URL('./product-kb.json', import.meta.url).pathname

// ── 将结构化 KB 转为紧凑文本（产品名 | 价格 | 允许的适用场景）──────────────
function buildKBText(kb) {
  return kb.map(p => {
    const price = p.entries.find(e => e.price)?.price || '—'
    // 收集各 entry 的完整上下文路径（去重）
    const ctxSet = new Set(p.entries.map(e => e.contexts.join(' > ')).filter(Boolean))
    const ctxStr = [...ctxSet].join(' / ')
    return `${p.name} | ${price} | ${ctxStr}`
  }).join('\n')
}

// ── Prompt ──────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `你是李佳琦的AI助手，负责模拟李佳琦与用户之间的真实对话，生成高质量的多轮对话训练数据。
李佳琦的人设：专业、亲切、耐心，像朋友一样陪伴用户，讲护肤知识时逻辑清晰、细致入微，偶尔分享生活感受，语气自然温和。
绝对不使用"哦买嘎""所有女生注意了""真的真的"等夸张口头禅，避免表演感和喊麦式表达。`

function buildUserPrompt(filename, topic, kbText) {
  return `你拥有以下【产品知识库】，每行格式为：产品名 | 价格区间 | 允许的推荐场景/适用人群。
请以【对话主题】为入口，生成一段真实感强、自然流畅的多轮对话QA。

【风格要求】
- 李佳琦语气：亲切自然、专业沉稳，像老朋友讲解，不浮夸、不喊麦
- 禁止使用"哦买嘎""所有女生注意了""真的真的""买它买它"等夸张表达
- 对话中可自然穿插生活类闲聊（如季节变换、最近状态、日常习惯），再自然过渡到护肤话题

【结构要求】
- 至少生成 10 轮对话
- 用户提问：简短口语化，10字以内为佳，模拟真实用户问法
- 李佳琦回答：内容丰富详细，充分展开知识库中的知识点，100-200字为宜
- 对话要有完整叙事弧：开头自然询问用户肤质/年龄/预算，中间深入展开，结尾总结收尾

【推荐信息必须包含以下维度（知识库中有什么就写什么）】
- 适用人群：年龄段（如20岁+/25岁+/35岁+）和肤质（干皮/油皮/混合肌/敏感肌等）
- 使用场景：日常保湿/急救修护/换季防护/熬夜急救等
- 价格区间：明确说明所在价格段（如"200元以内""500-1000元的进阶款"）
- 功效重点：与用户需求直接对应的核心功效和关键成分
- 注意事项：不同肤质或成分搭配的禁忌或叠加建议

【产品推荐铁律 — 必须严格遵守】
1. 所有推荐的产品名称必须与知识库中的原文完全一致，不得省略、缩写或改写
2. 推荐某款产品前，必须确认用户的肤质/年龄/需求与该产品「允许的推荐场景」完全匹配
   - 知识库标注「敏感肌·肌肤问题反复」的产品，只能推荐给敏感肌且处于长期稳定维护阶段的用户，不得用于「熬夜急救」「油皮控油」等不相关场景
   - 知识库标注「熟龄肌/35岁+」的产品，不得推荐给年轻肌/20岁用户
   - 知识库标注「油皮&混油」的产品，不得推荐给干皮/敏感肌
   - 上下文中的「急救舒缓」「长效维护」「问题反复」等场景标签是严格区分，不可互换
3. 当用户问题涉及多个品类（如"美白"），从精华/面霜/面膜/水乳等多品类给出推荐
4. 禁止推荐任何知识库中未出现的产品名称

【对话主题】${filename} — ${topic}

【产品知识库】（格式：产品名 | 价格区间 | 允许的推荐场景/适用人群）
${kbText}

请严格按以下 JSON 格式输出，不要输出其他任何内容：
{
  "title": "对话主题（一句话，10字以内）",
  "category": "品类标签（精华/面霜/面膜/眼霜/底妆/水乳/定妆/彩妆/美容仪器/综合护肤/其他）",
  "rounds": [
    {"user": "用户提问", "assistant": "李佳琦回答"},
    {"user": "用户追问", "assistant": "李佳琦回答"}
  ]
}`
}

// ── 调用 API ─────────────────────────────────────────────────────────────
async function callGPT(filename, topic, kbText) {
  const resp = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: buildUserPrompt(filename, topic, kbText) },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    }),
  })

  if (!resp.ok) throw new Error(`API ${resp.status}: ${await resp.text()}`)
  const data = await resp.json()
  return JSON.parse(data.choices[0].message.content)
}

// ── 生成 MD 内容 ──────────────────────────────────────────────────────────
function toMarkdown(num, filename, result) {
  const date = new Date().toISOString().slice(0, 10)
  const lines = [
    `# ${num}. ${result.title}`,
    ``,
    `**来源文档**: ${filename}`,
    `**品类**: ${result.category}`,
    `**生成时间**: ${date}`,
    `**轮数**: ${result.rounds.length} 轮`,
    ``,
    `---`,
    ``,
  ]

  result.rounds.forEach((r, i) => {
    lines.push(`**👤 用户**：${r.user}`)
    lines.push(``)
    lines.push(`**🌸 李佳琦**：${r.assistant}`)
    if (i < result.rounds.length - 1) lines.push(``)
    lines.push(`---`)
    lines.push(``)
  })

  return lines.join('\n')
}

// ── 主流程 ────────────────────────────────────────────────────────────────
async function main() {
  const force = process.argv.includes('--force')
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

  // 加载结构化产品知识库
  const kb = JSON.parse(fs.readFileSync(KB_FILE, 'utf-8'))
  const kbText = buildKBText(kb)
  console.log(`产品知识库已加载：${kb.length} 个产品，约 ${Math.round(kbText.length / 1000)}KB\n`)

  const allFiles = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.md')).sort()

  // 仅处理有实质内容的文件（topic 锚点）
  const toProcess = allFiles.filter(f => {
    const size = fs.statSync(path.join(SRC_DIR, f)).size
    return size >= 60
  })
  console.log(`共 ${allFiles.length} 个文件，其中 ${toProcess.length} 个将生成 QA\n`)

  let ok = 0, skip = 0, fail = 0
  for (const filename of toProcess) {
    const num  = filename.replace('.md', '')
    const topic = fs.readFileSync(path.join(SRC_DIR, filename), 'utf-8').trim()
    const outPath = path.join(OUT_DIR, `QA_${num}.md`)

    // 已存在则跳过（--force 可强制覆盖）
    if (!force && fs.existsSync(outPath)) {
      console.log(`  ⏭  ${filename} 已存在，跳过`)
      skip++; continue
    }

    process.stdout.write(`  ⏳ ${filename} 生成中...`)
    try {
      const result = await callGPT(filename, topic, kbText)
      const md = toMarkdown(num, filename, result)
      fs.writeFileSync(outPath, md, 'utf-8')
      console.log(` ✅ ${result.rounds.length}轮 [${result.category}] ${result.title}`)
      ok++
    } catch (e) {
      console.log(` ❌ 失败: ${e.message}`)
      fail++
    }

    // 限速：每次请求间隔 800ms
    await new Promise(r => setTimeout(r, 800))
  }

  console.log(`\n完成！✅ ${ok} 个  ⏭ ${skip} 个跳过  ❌ ${fail} 个失败`)
  console.log(`输出目录: ${OUT_DIR}`)
}

main().catch(e => { console.error(e); process.exit(1) })
