/**
 * SSE 代理服务
 *
 * 将前端请求转发到目标聊天 SSE API，流式回传。
 * 当 SSE API 未配置时，使用 mock 模式模拟李佳琦风格回复。
 */
import type { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getConfig } from '../config'

interface ProxyParams {
  conversationId: number
  messageType: number
  content: string
}

// ─── Mock 回复库 ─────────────────────────────────────
const MOCK_REPLIES: Record<string, string[]> = {
  护肤: [
    'OMG！姐妹们，说到护肤这个话题，佳琦可太有发言权了！首先呢，护肤最最最重要的一步就是——清洁！很多姐妹觉得洗脸随便洗洗就好了，不不不，大错特错！你要用温水，配合氨基酸洁面，打出绵密的泡沫，轻轻按摩60秒，这才是正确的洗脸方式！',
    '然后呢，清洁完之后一定要做好保湿！特别是现在这个季节，皮肤容易干燥起皮，一定要用含有玻尿酸或者神经酰胺成分的保湿产品。佳琦给你们推荐一个小技巧：化妆水可以用化妆棉湿敷3分钟，吸收效果翻倍！买它！',
  ],
  防晒: [
    '所有女生！所有女生！听佳琦说！防晒是护肤的最后一步，也是最重要的一步！不防晒，你前面所有的护肤都白做了！紫外线会让你长斑、变黑、长皱纹，太可怕了！',
    '佳琦建议大家选SPF50+、PA++++的防晒，而且一定要涂够量！脸部大概需要一元硬币大小的量。每隔2-3小时要补涂一次哦！室内也要涂防晒，因为电脑和手机的蓝光也会伤害皮肤的！',
  ],
  口红: [
    'Oh my god！说到口红，这可是佳琦的专业领域了！姐妹们，选口红第一要看质地，哑光的显气质、水光的显年轻、丝绒的最百搭。第二要看颜色，黄皮选豆沙色和砖红色绝对不会出错！',
    '给大家推荐几个万能色号：日常通勤选裸粉豆沙色，约会选水红色，气场全开选正红色！涂口红之前记得先用润唇膏打底，这样不会拔干，颜色也更持久。这个颜色也太好看了吧！买它！',
  ],
  default: [
    '哎呀，姐妹你这个问题问得太好了！佳琦跟你说啊，美妆护肤这件事呢，最重要的就是要了解自己的肤质。你是干皮、油皮、混合皮还是敏感肌？不同肤质的护理方法是完全不一样的哦！',
    '佳琦给你一个小建议：可以先去做个皮肤检测，了解自己的肤质状况，然后再有针对性地选择产品。不要盲目跟风买买买，适合自己的才是最好的！有什么具体的护肤问题都可以问佳琦哦，佳琦都会认真回答的！',
    '所有女生注意了！不管你用什么护肤品，都要记住这三个原则：第一，温和清洁不过度；第二，保湿补水是基础；第三，防晒防晒防晒！重要的事情说三遍！做好这三步，皮肤状态就能好一大半！',
  ],
}

function pickMockReply(content: string): string {
  const lower = content.toLowerCase()
  for (const [keyword, replies] of Object.entries(MOCK_REPLIES)) {
    if (keyword !== 'default' && lower.includes(keyword)) {
      return replies[Math.floor(Math.random() * replies.length)]
    }
  }
  // 关键词未命中，从 default 中随机选
  const defaults = MOCK_REPLIES.default
  return defaults[Math.floor(Math.random() * defaults.length)]
}

// ─── Mock SSE 流式输出 ───────────────────────────────
async function mockSSE(params: ProxyParams, res: Response) {
  const reply = pickMockReply(params.content)

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Mock', 'true')
  res.flushHeaders()

  // 逐段输出，模拟流式效果
  const chunkSize = 2 + Math.floor(Math.random() * 4) // 2-5 字符一块
  for (let i = 0; i < reply.length; i += chunkSize) {
    const chunk = reply.slice(i, i + chunkSize)
    res.write(`data:${JSON.stringify({ content: chunk })}\n\n`)
    // 模拟打字延迟 30-80ms
    await new Promise((r) => setTimeout(r, 30 + Math.floor(Math.random() * 50)))
  }

  res.write('data:[Done]\n\n')
  res.end()
}

// ─── 主逻辑 ─────────────────────────────────────────
export async function proxySSE(params: ProxyParams, req: Request, res: Response) {
  const config = getConfig()

  // SSE API 未配置时使用 mock 模式
  if (!config.sseApiBaseUrl) {
    return mockSSE(params, res)
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
