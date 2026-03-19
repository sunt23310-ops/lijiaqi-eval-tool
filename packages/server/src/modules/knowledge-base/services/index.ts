/**
 * 知识库文件 Service
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface CreateModelFileInput {
  name: string
  format: string
  quality: string
  validUntil: string
  source: string
  sizeBytes?: number
  content?: string
  sortOrder?: number
}

export async function listModelFiles() {
  // 列表不返回 content，减少传输量；按 sortOrder 排序
  return prisma.modelFile.findMany({
    select: { id: true, name: true, format: true, quality: true, validUntil: true, source: true, sizeBytes: true, sortOrder: true, uploadedAt: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  })
}

export async function getModelFile(id: number) {
  return prisma.modelFile.findUnique({ where: { id } })
}

export async function createModelFile(data: CreateModelFileInput) {
  return prisma.modelFile.create({ data })
}

export async function updateModelFile(id: number, data: Partial<CreateModelFileInput>) {
  return prisma.modelFile.update({ where: { id }, data })
}

export async function deleteModelFile(id: number) {
  return prisma.modelFile.delete({ where: { id } })
}
