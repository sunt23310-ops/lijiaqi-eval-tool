#!/usr/bin/env node
/**
 * 合并脚本：
 * 1. 更新 48 个 MD 记录的 sortOrder（奇数位，01→1, 02→3, 03→5 ...）
 * 2. 插入 48 条 JPG 图片元数据记录（偶数位，01→2, 02→4, 03→6 ...）
 * 运行：DATABASE_URL="..." node import-images.mjs
 */
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()
const IMG_DIR = `${process.env.HOME}/Desktop/38小课堂合集_图片`

// 从文件名提取序号（"01_xxx.md" → 1）
function extractNum(name) {
  const m = name.match(/^(\d+)/)
  return m ? parseInt(m[1], 10) : 0
}

// 按文件字节数判断质量
function detectQuality(bytes) {
  if (bytes >= 1_500_000) return '高'
  if (bytes >= 800_000)   return '中'
  return '低'
}

async function main() {
  // ── 1. 更新已有 MD 记录的 sortOrder ─────────────────
  const mdRecords = await prisma.modelFile.findMany({ where: { format: 'MD' } })
  console.log(`更新 ${mdRecords.length} 条 MD 记录的排序...`)
  for (const r of mdRecords) {
    const num = extractNum(r.name)
    if (!num) continue
    await prisma.modelFile.update({
      where: { id: r.id },
      data: { sortOrder: (num - 1) * 2 + 1 },
    })
  }
  console.log('✅ MD 排序更新完成')

  // ── 2. 清除已有 JPG 记录（避免重复），再插入 ────────
  await prisma.modelFile.deleteMany({ where: { format: 'JPG' } })

  const imgFiles = fs.readdirSync(IMG_DIR)
    .filter(f => f.toLowerCase().endsWith('.jpg'))
    .sort()

  console.log(`插入 ${imgFiles.length} 条 JPG 记录...`)
  const records = imgFiles.map(filename => {
    const num = parseInt(filename.replace(/\.jpg$/i, ''), 10)
    const filePath = path.join(IMG_DIR, filename)
    const sizeBytes = fs.statSync(filePath).size
    return {
      name: filename,
      format: 'JPG',
      quality: detectQuality(sizeBytes),
      validUntil: '长期有效',
      source: '官方开放',
      sizeBytes,
      content: null,
      sortOrder: (num - 1) * 2 + 2,
    }
  })

  await prisma.modelFile.createMany({ data: records })
  console.log(`✅ JPG 插入完成，共 ${records.length} 条`)

  // 质量分布
  const qual = records.reduce((a, r) => { a[r.quality] = (a[r.quality]||0)+1; return a }, {})
  console.log('图片质量分布（按文件大小）:', qual)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
