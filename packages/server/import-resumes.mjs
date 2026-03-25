#!/usr/bin/env node
/**
 * 导入主播简历 MD 文件到 model_files 表（追加模式，不删除已有数据）
 *
 * 运行方式：
 *   cd packages/server
 *   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lijiaqi_eval" node import-resumes.mjs
 */
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

const SOURCE_DIR = `${process.env.HOME}/Desktop/李佳琦直播团队主播简历`

function detectQuality(sizeBytes) {
  if (sizeBytes >= 10000) return '高'
  if (sizeBytes >= 3000) return '中'
  return '低'
}

async function main() {
  // 获取当前最大 sortOrder，在其后追加
  const maxSort = await prisma.modelFile.aggregate({ _max: { sortOrder: true } })
  let nextSort = (maxSort._max.sortOrder || 0) + 1

  const files = fs.readdirSync(SOURCE_DIR)
    .filter(f => f.endsWith('.md'))
    .sort()

  console.log(`发现 ${files.length} 个主播简历 MD 文件`)

  // 检查哪些已经导入过（按文件名去重）
  const existing = await prisma.modelFile.findMany({
    where: { source: '主播简历' },
    select: { name: true },
  })
  const existingNames = new Set(existing.map(r => r.name))

  let created = 0, skipped = 0

  for (const filename of files) {
    const name = `主播简历_${filename}`
    if (existingNames.has(name)) {
      console.log(`  跳过（已存在）: ${filename}`)
      skipped++
      continue
    }

    const filePath = path.join(SOURCE_DIR, filename)
    const content = fs.readFileSync(filePath, 'utf-8')
    const sizeBytes = Buffer.byteLength(content, 'utf-8')

    await prisma.modelFile.create({
      data: {
        name,
        format: 'MD',
        quality: detectQuality(sizeBytes),
        validUntil: '长期有效',
        source: '主播简历',
        sizeBytes,
        content,
        sortOrder: nextSort++,
      },
    })

    console.log(`  ✅ 导入: ${filename} (${sizeBytes} bytes, ${detectQuality(sizeBytes)})`)
    created++
  }

  console.log(`\n导入完成：新增 ${created} 条，跳过 ${skipped} 条（已存在）`)
}

main()
  .catch(e => { console.error('❌ 导入失败:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
