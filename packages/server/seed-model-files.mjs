#!/usr/bin/env node
/**
 * 种子脚本：将桌面 38小课堂合集_文本 中的 48 个 MD 文件导入数据库
 * 运行方式：DATABASE_URL="..." node seed-model-files.mjs
 */
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

const SOURCE_DIR = `${process.env.HOME}/Desktop/38小课堂合集_文本`

// 根据文件字节数自动判断质量等级
function detectQuality(sizeBytes) {
  if (sizeBytes >= 1500) return '高'
  if (sizeBytes >= 500)  return '中'
  return '低'
}

// 从文件内容提取第一个 ## 标题作为补充名称
function extractTitle(content) {
  const match = content.match(/^##\s+(.+)$/m)
  return match ? match[1].trim() : null
}

async function main() {
  console.log('清空已有数据...')
  await prisma.modelFile.deleteMany()

  const files = fs.readdirSync(SOURCE_DIR)
    .filter(f => f.endsWith('.md'))
    .sort()

  console.log(`发现 ${files.length} 个 MD 文件，开始导入...`)

  const records = []
  for (const filename of files) {
    const filePath = path.join(SOURCE_DIR, filename)
    const content = fs.readFileSync(filePath, 'utf-8')
    const sizeBytes = Buffer.byteLength(content, 'utf-8')
    const num = filename.replace('.md', '')
    const title = extractTitle(content) || `李佳琦38小课堂 第${num}页`
    const name = `${num}_${title}.md`

    records.push({
      name,
      format: 'MD',
      quality: detectQuality(sizeBytes),
      validUntil: '长期有效',
      source: '官方开放',
      sizeBytes,
    })
  }

  await prisma.modelFile.createMany({ data: records })
  console.log(`✅ 成功导入 ${records.length} 条记录`)

  // 打印摘要
  const counts = records.reduce((acc, r) => {
    acc[r.quality] = (acc[r.quality] || 0) + 1
    return acc
  }, {})
  console.log('质量分布:', counts)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
