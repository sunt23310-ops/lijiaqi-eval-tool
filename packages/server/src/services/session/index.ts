/**
 * 会话 & 消息 Service
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function createSession(userId: number, name: string) {
  return prisma.session.create({ data: { userId, name } })
}

export async function listSessions(userId: number) {
  return prisma.session.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { messages: true, evaluations: true } } },
  })
}

export async function getSession(id: number) {
  return prisma.session.findUnique({ where: { id }, include: { messages: { orderBy: { createdAt: 'asc' } } } })
}

export async function deleteSession(id: number) {
  return prisma.session.delete({ where: { id } })
}

export async function addMessage(
  sessionId: number,
  role: 'user' | 'assistant',
  content: string,
  extra?: { messageType?: number; latencyMs?: number; ttftMs?: number; rawResponse?: any }
) {
  const msg = await prisma.message.create({
    data: {
      sessionId,
      role,
      content,
      messageType: extra?.messageType ?? 1,
      latencyMs: extra?.latencyMs,
      ttftMs: extra?.ttftMs,
      rawResponse: extra?.rawResponse,
    },
  })
  // 更新会话时间戳
  await prisma.session.update({ where: { id: sessionId }, data: { updatedAt: new Date() } })
  return msg
}

export async function listMessages(sessionId: number) {
  return prisma.message.findMany({ where: { sessionId }, orderBy: { createdAt: 'asc' } })
}
