#!/usr/bin/env node
/**
 * 回填脚本：将桌面 MD 文件内容写入 model_files.content 字段
 * 运行方式：DATABASE_URL="..." node backfill-content.mjs
 */
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()
const SOURCE_DIR = `${process.env.HOME}/Desktop/38小课堂合集_文本`

async function main() {
  const records = await prisma.modelFile.findMany({ orderBy: { id: 'asc' } })
  console.log(`共 ${records.length} 条记录，开始回填内容...`)

  let ok = 0, skip = 0
  for (const record of records) {
    // 从文件名前缀（如 "01_xxx.md"）提取序号
    const numMatch = record.name.match(/^(\d+)_/)
    if (!numMatch) { skip++; continue }
    const num = numMatch[1].padStart(2, '0')
    const filePath = path.join(SOURCE_DIR, `${num}.md`)
    if (!fs.existsSync(filePath)) { skip++; continue }

    const content = fs.readFileSync(filePath, 'utf-8')
    await prisma.modelFile.update({ where: { id: record.id }, data: { content } })
    ok++
  }

  console.log(`✅ 回填完成：成功 ${ok} 条，跳过 ${skip} 条`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
