import request from '@/api/request'
import type { QAFolder, QAFile, QAEntry } from '@eval/shared'

export function listFolders() {
  return request.get<any, { code: number; data: QAFolder[] }>('/eval/api/v1/upload/qa-database/folders')
}

export function listFiles(folderId: number) {
  return request.get<any, { code: number; data: QAFile[] }>(`/eval/api/v1/upload/qa-database/folders/${folderId}/files`)
}

export function getFileEntries(fileId: number) {
  return request.get<any, { code: number; data: QAEntry[] }>(`/eval/api/v1/upload/qa-database/files/${fileId}/entries`)
}

export function uploadQAFiles(folderId: number, files: File[]) {
  const formData = new FormData()
  files.forEach(f => formData.append('files', f))
  formData.append('folderId', String(folderId))
  return request.post<any, { code: number; data: { jobId: string } }>(
    '/eval/api/v1/upload/qa-database/batch',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
}
