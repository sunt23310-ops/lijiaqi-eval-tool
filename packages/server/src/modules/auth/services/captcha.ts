/**
 * 图片验证码生成
 *
 * 使用 svg-captcha 生成验证码图片（base64）+ hash 校验值
 * hash = sha256(answer.toLowerCase())，验证时比对 hash
 */
import crypto from 'crypto'

interface CaptchaResult {
  base64Image: string
  hash: string
}

/** 内存缓存验证码 hash → answer，5 分钟过期 */
const captchaStore = new Map<string, { answer: string; expiresAt: number }>()

/** 定期清理过期验证码 */
setInterval(() => {
  const now = Date.now()
  for (const [key, val] of captchaStore) {
    if (val.expiresAt < now) captchaStore.delete(key)
  }
}, 60_000)

function generateHash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 16)
}

function randomCode(len = 4): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let code = ''
  for (let i = 0; i < len; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

/**
 * 生成简易 SVG 验证码（无需 canvas 依赖）
 */
function generateSvgCaptcha(code: string): string {
  const width = 120
  const height = 40
  const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c']

  let textElements = ''
  for (let i = 0; i < code.length; i++) {
    const x = 15 + i * 25 + Math.random() * 5
    const y = 25 + Math.random() * 8
    const rotate = Math.floor(Math.random() * 30 - 15)
    const color = colors[Math.floor(Math.random() * colors.length)]
    textElements += `<text x="${x}" y="${y}" fill="${color}" font-size="24" font-family="Arial,sans-serif" transform="rotate(${rotate} ${x} ${y})">${code[i]}</text>`
  }

  // 干扰线
  let lines = ''
  for (let i = 0; i < 4; i++) {
    const x1 = Math.random() * width
    const y1 = Math.random() * height
    const x2 = Math.random() * width
    const y2 = Math.random() * height
    const color = colors[Math.floor(Math.random() * colors.length)]
    lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="0.5" opacity="0.5"/>`
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="100%" height="100%" fill="#f8f9fa"/>
    ${lines}
    ${textElements}
  </svg>`

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

export function createCaptcha(): CaptchaResult {
  const answer = randomCode(4)
  const hash = generateHash(answer.toLowerCase() + Date.now().toString())

  captchaStore.set(hash, {
    answer: answer.toLowerCase(),
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 分钟过期
  })

  return {
    base64Image: generateSvgCaptcha(answer),
    hash,
  }
}

export function verifyCaptcha(hash: string, userInput: string): boolean {
  const record = captchaStore.get(hash)
  if (!record) return false
  if (record.expiresAt < Date.now()) {
    captchaStore.delete(hash)
    return false
  }

  const valid = record.answer === userInput.toLowerCase()
  if (valid) captchaStore.delete(hash) // 验证通过后删除，防止重复使用
  return valid
}
