#!/usr/bin/env node
/**
 * 重新同步 MD 文件：更新 content / quality / sizeBytes
 * 运行：DATABASE_URL="..." node resync-md.mjs
 */
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()
const SRC = `${process.env.HOME}/Desktop/38小课堂合集_文本`

function quality(bytes) {
  if (bytes >= 1500) return '高'
  if (bytes >= 500)  return '中'
  return '低'
}

async function main() {
  const records = await prisma.modelFile.findMany({ where: { format: 'MD' }, orderBy: { sortOrder: 'asc' } })
  console.log(`共 ${records.length} 条 MD 记录，开始同步...`)

  let ok = 0
  for (const r of records) {
    const num = r.name.match(/^(\d+)/)?.[1]?.padStart(2, '0')
    if (!num) continue
    const fp = path.join(SRC, `${num}.md`)
    if (!fs.existsSync(fp)) { console.warn(`  ⚠️  ${num}.md 不存在`); continue }

    const content   = fs.readFileSync(fp, 'utf-8')
    const sizeBytes = Buffer.byteLength(content, 'utf-8')

    await prisma.modelFile.update({
      where: { id: r.id },
      data:  { content, sizeBytes, quality: quality(sizeBytes) },
    })
    ok++
  }
  console.log(`✅ 同步完成：${ok} 条`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
