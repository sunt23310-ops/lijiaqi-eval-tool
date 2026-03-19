/**
 * QA 上传通道
 *
 * 处理 QA 测试数据文件的上传，支持 CSV/JSON 格式。
 */
import { UploadManager, type UploadResult } from './upload-manager'

const ALLOWED_MIME_TYPES = [
  'text/csv',
  'application/json',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
]

const uploadManager = new UploadManager()

export async function uploadQAFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<UploadResult> {
  return uploadManager.upload(buffer, originalName, mimeType, {
    channel: 'qa',
    allowedMimeTypes: ALLOWED_MIME_TYPES,
    maxSizeBytes: 5 * 1024 * 1024, // 5MB for QA files
  })
}

export async function deleteQAFile(key: string): Promise<void> {
  return uploadManager.delete(key)
}
