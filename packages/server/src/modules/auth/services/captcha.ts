/**
 * 图片验证码生成（无状态版本）
 *
 * 使用 HMAC 签名方式，无需服务端内存存储，兼容 Serverless 环境。
 * hash = hmac(answer.toLowerCase() + '|' + timestamp, SECRET)
 * 客户端提交 {hash, timestamp, validCode}，服务端重新计算比对。
 */
import crypto from 'crypto'

const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET || 'eval-captcha-secret-2024'
const CAPTCHA_TTL = 5 * 60 * 1000 // 5 分钟过期

interface CaptchaResult {
  base64Image: string
  hash: string
  timestamp: number
}

function hmacSign(text: string): string {
  return crypto.createHmac('sha256', CAPTCHA_SECRET).update(text).digest('hex').slice(0, 32)
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
  const timestamp = Date.now()
  const hash = hmacSign(answer.toLowerCase() + '|' + timestamp)

  return {
    base64Image: generateSvgCaptcha(answer),
    hash,
    timestamp,
  }
}

export function verifyCaptcha(hash: string, userInput: string, timestamp?: number): boolean {
  if (!hash || !userInput) return false

  // 检查是否过期
  if (timestamp && Date.now() - timestamp > CAPTCHA_TTL) {
    return false
  }

  // 重新计算 HMAC 比对
  const expected = hmacSign(userInput.toLowerCase() + '|' + (timestamp ?? ''))
  return expected === hash
}
