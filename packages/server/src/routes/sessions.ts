/**
 * 会话路由
 */
import { Router } from 'express'
import * as sessionService from '../services/session'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const session = await sessionService.createSession(req.user!.userId, req.body.name || '新会话')
    res.json({ code: 200, data: session })
  } catch (err: any) {
    res.json({ code: 500, message: err.message })
  }
})

router.get('/', async (req, res) => {
  try {
    const sessions = await sessionService.listSessions(req.user!.userId)
    res.json({ code: 200, data: sessions })
  } catch (err: any) {
    res.json({ code: 500, message: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const session = await sessionService.getSession(Number(req.params.id))
    if (!session) return res.json({ code: 404, message: '会话不存在' })
    res.json({ code: 200, data: session })
  } catch (err: any) {
    res.json({ code: 500, message: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await sessionService.deleteSession(Number(req.params.id))
    res.json({ code: 200, data: null })
  } catch (err: any) {
    res.json({ code: 500, message: err.message })
  }
})

// ─── 消息 ──────────────────────────────────────────
router.post('/:id/messages', async (req, res) => {
  try {
    const msg = await sessionService.addMessage(
      Number(req.params.id),
      req.body.role,
      req.body.content,
      { messageType: req.body.messageType, latencyMs: req.body.latencyMs, ttftMs: req.body.ttftMs, rawResponse: req.body.rawResponse }
    )
    res.json({ code: 200, data: msg })
  } catch (err: any) {
    res.json({ code: 500, message: err.message })
  }
})

router.get('/:id/messages', async (req, res) => {
  try {
    const messages = await sessionService.listMessages(Number(req.params.id))
    res.json({ code: 200, data: messages })
  } catch (err: any) {
    res.json({ code: 500, message: err.message })
  }
})

export default router
