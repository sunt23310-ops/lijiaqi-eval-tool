/**
 * 管理路由 — 敏感词 + 内容审核
 *
 * GET    /eval/api/v1/management/sensitive-words       — 获取敏感词列表
 * POST   /eval/api/v1/management/sensitive-words       — 添加敏感词
 * DELETE /eval/api/v1/management/sensitive-words/:id   — 删除敏感词
 * POST   /eval/api/v1/management/content-review        — 内容审核
 */
import { Router } from 'express'
import * as sensitiveWords from './services/sensitive-words'
import * as contentReview from './services/content-review'

const router = Router()

// ─── 敏感词管理 ──────────────────────────────────────
router.get('/sensitive-words', (_req, res) => {
  res.json({ code: 200, data: sensitiveWords.listSensitiveWords() })
})

router.post('/sensitive-words', (req, res) => {
  try {
    const { word, category, severity } = req.body
    if (!word || !category || !severity) {
      return res.json({ code: 400, message: '缺少必填字段: word, category, severity' })
    }
    const result = sensitiveWords.addSensitiveWord({ word, category, severity })
    res.json({ code: 200, data: result })
  } catch (err: any) {
    res.json({ code: 500, message: err.message })
  }
})

router.delete('/sensitive-words/:id', (req, res) => {
  const removed = sensitiveWords.removeSensitiveWord(Number(req.params.id))
  if (!removed) return res.json({ code: 404, message: '敏感词不存在' })
  res.json({ code: 200, data: null })
})

// ─── 内容审核 ────────────────────────────────────────
router.post('/content-review', async (req, res) => {
  try {
    const { content, options } = req.body
    if (!content) {
      return res.json({ code: 400, message: '缺少 content 字段' })
    }
    const result = await contentReview.reviewContent(content, options)
    res.json({ code: 200, data: result })
  } catch (err: any) {
    res.json({ code: 500, message: err.message })
  }
})

export default router
