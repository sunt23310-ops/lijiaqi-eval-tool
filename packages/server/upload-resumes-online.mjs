#!/usr/bin/env node
/**
 * 通过线上 API 批量上传主播简历 MD 文件到知识库
 *
 * 运行方式：node upload-resumes-online.mjs
 */
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { execSync } from 'child_process'

const PROXY = 'http://127.0.0.1:7897'
const BASE_URL = 'https://lijiaqi-eval-tool.vercel.app'
const SOURCE_DIR = `${process.env.HOME}/Desktop/李佳琦直播团队主播简历`

// ─── 验证码 HMAC 签名（与服务端逻辑一致）───────────────────
const CAPTCHA_SECRET = 'eval-captcha-secret-2024'
function hmacSign(text) {
  return crypto.createHmac('sha256', CAPTCHA_SECRET).update(text).digest('hex').slice(0, 32)
}

// ─── 通过 curl + proxy 发请求 ────────────────────────────────
function curlRequest(url, { method = 'GET', headers = {}, body } = {}) {
  const args = ['curl', '-s', '--max-time', '30', '--proxy', PROXY, '-X', method]
  for (const [k, v] of Object.entries(headers)) {
    args.push('-H', `${k}: ${v}`)
  }
  if (body) {
    args.push('-d', body)
  }
  args.push(url)
  const result = execSync(args.map(a => `'${a.replace(/'/g, "'\\''")}'`).join(' '), {
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024,
    shell: true,
  })
  return JSON.parse(result)
}

// ─── 登录获取 token ──────────────────────────────────────────
function login() {
  const validCode = 'abcd'
  const timestamp = Date.now()
  const hash = hmacSign(validCode.toLowerCase() + '|' + timestamp)

  const data = curlRequest(`${BASE_URL}/eval/public/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'admin',
      password: 'admin123',
      validCode,
      hash,
      timestamp,
    }),
  })

  if (data.code !== 200) {
    throw new Error(`登录失败: ${data.message}`)
  }
  console.log('✅ 登录成功')
  return data.data.token
}

// ─── 获取已有知识库列表 ──────────────────────────────────────
function listExisting(token) {
  const data = curlRequest(`${BASE_URL}/eval/api/v1/knowledge-base`, {
    headers: { token },
  })
  if (data.code !== 200) throw new Error(`获取列表失败: ${data.message}`)
  return data.data
}

// ─── 创建知识库记录 ──────────────────────────────────────────
function createFile(token, record) {
  const data = curlRequest(`${BASE_URL}/eval/api/v1/knowledge-base`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      token,
    },
    body: JSON.stringify(record),
  })
  if (data.code !== 200) throw new Error(`创建失败: ${data.message}`)
  return data.data
}

// ─── 质量判定 ────────────────────────────────────────────────
function detectQuality(sizeBytes) {
  if (sizeBytes >= 10000) return '高'
  if (sizeBytes >= 3000) return '中'
  return '低'
}

// ─── 主流程 ──────────────────────────────────────────────────
function main() {
  // 1. 登录
  const token = login()

  // 2. 获取已有文件，检查重复
  const existing = listExisting(token)
  const existingNames = new Set(existing.map(f => f.name))
  const maxSort = Math.max(0, ...existing.map(f => f.sortOrder || 0))
  let nextSort = maxSort + 1

  console.log(`当前知识库已有 ${existing.length} 条记录，最大 sortOrder: ${maxSort}`)

  // 3. 读取本地简历文件
  const files = fs.readdirSync(SOURCE_DIR)
    .filter(f => f.endsWith('.md'))
    .sort()

  console.log(`\n发现 ${files.length} 个主播简历 MD 文件，开始上传...\n`)

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

    createFile(token, {
      name,
      format: 'MD',
      quality: detectQuality(sizeBytes),
      validUntil: '长期有效',
      source: '主播简历',
      sizeBytes,
      content,
      sortOrder: nextSort++,
    })

    console.log(`  ✅ ${filename} (${(sizeBytes / 1024).toFixed(1)}KB, ${detectQuality(sizeBytes)})`)
    created++
  }

  console.log(`\n上传完成：新增 ${created} 条，跳过 ${skipped} 条`)
}

try {
  main()
} catch (e) {
  console.error('❌ 失败:', e.message)
  process.exit(1)
}
