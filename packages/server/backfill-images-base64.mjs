#!/usr/bin/env node
/**
 * 回填图片脚本：将 JPG 压缩后转 base64 存入 content 字段
 * - 使用 macOS sips 压缩：最长边 900px + quality 70
 * - 压缩后约 130-200KB base64，48张合计约 8MB
 * 运行：DATABASE_URL="..." node backfill-images-base64.mjs
 */
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import os from 'os'

const prisma = new PrismaClient()
const IMG_DIR = `${process.env.HOME}/Desktop/38小课堂合集_图片`
const TMP_DIR = os.tmpdir()

async function main() {
  const records = await prisma.modelFile.findMany({
    where: { format: 'JPG' },
    orderBy: { sortOrder: 'asc' },
  })
  console.log(`共 ${records.length} 条图片记录，开始压缩并回填...`)

  let ok = 0, totalKB = 0
  for (const record of records) {
    const srcPath = path.join(IMG_DIR, record.name)
    if (!fs.existsSync(srcPath)) {
      console.warn(`  ⚠️  找不到文件: ${record.name}`)
      continue
    }

    // 压缩到临时文件
    const tmpPath = path.join(TMP_DIR, `_compressed_${record.name}`)
    execSync(
      `sips -Z 900 --setProperty formatOptions 70 -s format jpeg "${srcPath}" --out "${tmpPath}"`,
      { stdio: 'pipe' }
    )

    // 转 base64 data URL
    const buf = fs.readFileSync(tmpPath)
    const b64 = buf.toString('base64')
    const dataUrl = `data:image/jpeg;base64,${b64}`
    const kb = Math.round(b64.length / 1024)
    totalKB += kb

    // 更新 DB
    await prisma.modelFile.update({
      where: { id: record.id },
      data: { content: dataUrl },
    })

    // 清理临时文件
    fs.unlinkSync(tmpPath)
    ok++
    if (ok % 10 === 0) console.log(`  进度: ${ok}/${records.length}`)
  }

  console.log(`✅ 完成：${ok} 张图片，累计 base64 大小 ${(totalKB / 1024).toFixed(1)} MB`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
