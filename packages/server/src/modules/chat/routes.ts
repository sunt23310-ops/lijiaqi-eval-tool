/**
 * Chat 路由
 *
 * POST /eval/api/v1/chat/stream — SSE 流式聊天（原 /sse/proxy）
 */
import { Router } from 'express'
import { proxySSE } from './services/proxy'

const router = Router()

router.post('/stream', async (req, res) => {
  const { conversationId, messageType, content } = req.body
  if (!conversationId || !content) {
    return res.json({ code: 400, message: '缺少 conversationId 或 content' })
  }
  await proxySSE({ conversationId, messageType: messageType ?? 1, content }, req, res)
})

export default router
