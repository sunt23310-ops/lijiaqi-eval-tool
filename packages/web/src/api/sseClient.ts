/**
 * 浏览器 SSE 客户端
 *
 * 使用 fetch + ReadableStream 实现 POST SSE
 * 支持流式解析 + 中断控制
 */
import { v4 as uuidv4 } from 'uuid'

export interface SSEOptions {
  url: string
  token: string
  conversationId: string
  messageType?: number
  content: string
  onMessage: (text: string) => void
  onDone: () => void
  onError: (error: string) => void
}

export function connectSSE(options: SSEOptions): AbortController {
  const controller = new AbortController()
  const startTime = Date.now()

  const body = {
    conversationId: options.conversationId,
    messageType: options.messageType ?? 1,
    content: options.content,
  }

  fetch(options.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      token: options.token,
      platform: 'c-wx',
      'trace-id': uuidv4(),
    },
    body: JSON.stringify(body),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok || !response.body) {
        options.onError(`HTTP ${response.status}`)
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // 按 \n\n 分割 SSE 事件
        const parts = buffer.split('\n\n')
        buffer = parts.pop() || ''

        for (const part of parts) {
          for (const line of part.split('\n')) {
            if (!line.startsWith('data:')) continue
            const data = line.slice(5)

            if (data === '[Done]') {
              options.onDone()
              return
            }
            if (data === '[Done]Err') {
              options.onError('SSE 返回错误')
              return
            }

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                options.onMessage(parsed.content)
              }
            } catch {
              // 非 JSON 数据，直接当文本处理
              if (data.trim()) {
                options.onMessage(data)
              }
            }
          }
        }
      }
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        options.onError(err.message)
      }
    })

  return controller
}
