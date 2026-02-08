/**
 * SSE 代理服务
 *
 * 将前端请求转发到目标聊天 SSE API，流式回传。
 * 职责边界：只做网络代理 + 流转发，不存储、不解析内容。
 */
import type { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getConfig } from '../config'

interface ProxyParams {
  conversationId: number
  messageType: number
  content: string
}

export async function proxySSE(params: ProxyParams, req: Request, res: Response) {
  const config = getConfig()

  if (!config.sseApiBaseUrl) {
    return res.status(500).json({ code: 500, message: 'SSE API 地址未配置' })
  }

  const url = `${config.sseApiBaseUrl}/chat/api/sse`
  const traceId = uuidv4()

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'platform': 'c-wx',
        'trace-id': traceId,
        'token': config.sseApiToken,
      },
      body: JSON.stringify(params),
    })

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        code: upstream.status,
        message: `SSE upstream error: ${upstream.statusText}`,
      })
    }

    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Trace-Id', traceId)
    res.flushHeaders()

    // 流式转发
    const reader = upstream.body?.getReader()
    if (!reader) {
      res.end()
      return
    }

    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      res.write(chunk)
    }

    res.end()
  } catch (err: any) {
    if (!res.headersSent) {
      res.status(500).json({ code: 500, message: `SSE proxy error: ${err.message}` })
    } else {
      res.end()
    }
  }
}
