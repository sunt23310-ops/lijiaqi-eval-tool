import request from './request'

export interface ModelFile {
  id: number
  name: string
  format: string
  quality: string
  validUntil: string
  source: string
  sizeBytes: number | null
  sortOrder: number
  content?: string | null
  uploadedAt: string
}

export interface CreateModelFileInput {
  name: string
  format: string
  quality: string
  validUntil: string
  source: string
  sizeBytes?: number
}

export function getModelFile(id: number) {
  return request.get<any, { code: number; data: ModelFile }>(`/eval/api/v1/model-files/${id}`)
}

export function listModelFiles() {
  return request.get<any, { code: number; data: ModelFile[] }>('/eval/api/v1/model-files')
}

export function createModelFile(data: CreateModelFileInput) {
  return request.post<any, { code: number; data: ModelFile }>('/eval/api/v1/model-files', data)
}

export function updateModelFile(id: number, data: Partial<CreateModelFileInput>) {
  return request.put<any, { code: number; data: ModelFile }>(`/eval/api/v1/model-files/${id}`, data)
}

export function deleteModelFile(id: number) {
  return request.delete<any, { code: number }>(`/eval/api/v1/model-files/${id}`)
}
