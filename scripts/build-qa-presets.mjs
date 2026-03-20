#!/usr/bin/env node
/**
 * 从桌面 QA 对话文件夹解析 MD 文件，生成 qa-presets.json
 *
 * 用法: node scripts/build-qa-presets.mjs
 */
import fs from 'fs'
import path from 'path'

const BASE_DIR = path.join(process.env.HOME ?? '/Users/sunzhuoqi', 'Desktop', 'prompt-v2-test-output')
const OUT_FILE = new URL('../packages/server/src/data/qa-presets.json', import.meta.url).pathname

const FOLDERS = [
  { folder: '2025双十一_QA对话', sceneType: 'consult', sceneLabel: '护肤咨询' },
  { folder: '38小课堂_QA对话', sceneType: 'promo', sceneLabel: '大促规则' },
  { folder: '李佳琦闲聊QA对话', sceneType: 'chat', sceneLabel: '日常闲聊(under35)' },
  { folder: '李佳琦闲聊QA对话_35plus', sceneType: 'chat', sceneLabel: '日常闲聊(35+)' },
]

/**
 * 解析一个 QA MD 文件，提取元数据和用户消息
 */
function parseQAFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  // 提取标题（第一个 # 行）
  const titleLine = lines.find(l => l.startsWith('# '))
  const title = titleLine ? titleLine.replace(/^#\s+/, '').replace(/\.md$/, '').trim() : path.basename(filePath, '.md')

  // 提取元数据
  const userProfile = extractMeta(content, '用户画像')
  const category = extractMeta(content, '分类') || extractMeta(content, '品类')
  const mainNeeds = extractMeta(content, '主要诉求') || extractMeta(content, '情绪背景')

  // 提取用户消息（每一轮的 **用户**：后面的内容）
  const userMessages = []
  const roundRegex = /\*\*用户\*\*[：:]\s*(.+)/g
  let match
  while ((match = roundRegex.exec(content)) !== null) {
    const msg = match[1].trim()
    if (msg) userMessages.push(msg)
  }

  return {
    title: cleanTitle(title),
    userProfile,
    category,
    mainNeeds,
    rounds: userMessages.length,
    messages: userMessages,
  }
}

function extractMeta(content, key) {
  const regex = new RegExp(`\\*\\*${key}\\*\\*[：:]\\s*(.+)`)
  const match = content.match(regex)
  return match ? match[1].trim() : ''
}

function cleanTitle(title) {
  // Remove QA_01_ prefix patterns
  return title.replace(/^(QA_?\d+_?|闲聊QA_?\d+_?)/, '').trim() || title
}

// --- Main ---
const allPresets = []

for (const { folder, sceneType, sceneLabel } of FOLDERS) {
  const dirPath = path.join(BASE_DIR, folder)
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  跳过不存在的目录: ${folder}`)
    continue
  }

  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md')).sort()
  console.log(`📂 ${folder}: ${files.length} 个文件`)

  for (const file of files) {
    try {
      const parsed = parseQAFile(path.join(dirPath, file))
      if (parsed.messages.length < 2) {
        console.log(`  ⏭  ${file} 对话轮数不足，跳过`)
        continue
      }
      allPresets.push({
        key: `${sceneType}_${path.basename(file, '.md')}`,
        name: parsed.title,
        description: parsed.userProfile || parsed.mainNeeds || `${sceneLabel}场景对话`,
        sceneType,
        sceneLabel,
        category: parsed.category,
        rounds: parsed.rounds,
        messages: parsed.messages,
      })
    } catch (e) {
      console.log(`  ❌ ${file}: ${e.message}`)
    }
  }
}

// 确保输出目录存在
const outDir = path.dirname(OUT_FILE)
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

fs.writeFileSync(OUT_FILE, JSON.stringify(allPresets, null, 2), 'utf-8')
console.log(`\n✅ 共 ${allPresets.length} 个预设，已写入 ${OUT_FILE}`)
