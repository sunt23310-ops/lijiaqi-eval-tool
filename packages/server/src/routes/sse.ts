/**
 * SSE 代理路由
 */
import { Router } from 'express'
import { proxySSE } from '../services/sse/proxy'

const router = Router()

router.post('/proxy', async (req, res) => {
  const { conversationId, messageType, content } = req.body
  if (!conversationId || !content) {
    return res.json({ code: 400, message: '缺少 conversationId 或 content' })
  }
  await proxySSE({ conversationId, messageType: messageType ?? 1, content }, req, res)
})

export default router
