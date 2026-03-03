/**
 * AI 模型数据库文件 Service
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
}

export async function listModelFiles() {
  return prisma.modelFile.findMany({ orderBy: { uploadedAt: 'asc' } })
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
