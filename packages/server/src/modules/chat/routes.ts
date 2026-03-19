/**
 * Chat 路由
 *
 * POST /eval/api/v1/chat/stream — SSE 流式聊天
 *
 * 通过 ChatAdapter 工厂选择聊天后端：
 * - sse-proxy: 转发到上游 SSE API
 * - direct-api: 直连 OpenAI/Anthropic
 * - custom: 用户自定义端点
 * 所有 adapter 未配置时降级到 mock 模式
 */
import { Router } from 'express'
import { createAdapter } from './adapters/factory'
import { mockSSE } from './services/proxy'

const router = Router()

router.post('/stream', async (req, res) => {
  const { conversationId, messageType, content } = req.body
  if (!conversationId || !content) {
    return res.json({ code: 400, message: '缺少 conversationId 或 content' })
  }

  const adapter = createAdapter()

  // Adapter 未配置时降级到 mock
  if (!adapter.isConfigured()) {
    return mockSSE({ conversationId, messageType: messageType ?? 1, content }, res)
  }

  // SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  try {
    await adapter.stream(
      {
        conversationId,
        messageType: messageType ?? 1,
        content,
        messages: [{ role: 'user', content }],
        stream: true,
      },
      {
        onChunk: (text) => {
          res.write(`data:${JSON.stringify({ content: text })}\n\n`)
        },
        onDone: () => {
          res.write('data:[Done]\n\n')
          res.end()
        },
        onError: (error) => {
          console.error('[chat/stream] adapter error:', error.message)
          if (!res.headersSent) {
            res.status(500).json({ code: 500, message: error.message })
          } else {
            res.write(`data:${JSON.stringify({ error: error.message })}\n\n`)
            res.write('data:[Done]Err\n\n')
            res.end()
          }
        },
      }
    )
  } catch (err: any) {
    if (!res.headersSent) {
      res.status(500).json({ code: 500, message: err.message })
    } else {
      res.end()
    }
  }
})

export default router
