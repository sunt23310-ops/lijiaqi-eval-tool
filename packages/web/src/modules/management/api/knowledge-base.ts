import request from '@/api/request'
import type { KnowledgeFile } from '@eval/shared'

export interface CreateKnowledgeFileInput {
  name: string
  format: string
  quality: string
  validUntil: string
  source: string
  sizeBytes?: number
}

export function getKnowledgeFile(id: number) {
  return request.get<any, { code: number; data: KnowledgeFile }>(`/eval/api/v1/knowledge-base/${id}`)
}

export function listKnowledgeFiles() {
  return request.get<any, { code: number; data: KnowledgeFile[] }>('/eval/api/v1/knowledge-base')
}

export function createKnowledgeFile(data: CreateKnowledgeFileInput) {
  return request.post<any, { code: number; data: KnowledgeFile }>('/eval/api/v1/knowledge-base', data)
}

export function updateKnowledgeFile(id: number, data: Partial<CreateKnowledgeFileInput>) {
  return request.put<any, { code: number; data: KnowledgeFile }>(`/eval/api/v1/knowledge-base/${id}`, data)
}

export function deleteKnowledgeFile(id: number) {
  return request.delete<any, { code: number }>(`/eval/api/v1/knowledge-base/${id}`)
}

export function uploadKnowledgeFiles(files: File[], metadata: { quality: string; validUntil: string; source: string }) {
  const formData = new FormData()
  files.forEach(f => formData.append('files', f))
  formData.append('quality', metadata.quality)
  formData.append('validUntil', metadata.validUntil)
  formData.append('source', metadata.source)
  return request.post<any, { code: number; data: { jobId: string } }>(
    '/eval/api/v1/upload/knowledge-base/batch',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
}
