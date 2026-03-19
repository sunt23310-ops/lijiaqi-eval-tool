/**
 * 知识库上传通道
 *
 * 处理知识库文件的上传，支持 PDF/TXT/MD/DOCX 格式。
 */
import { UploadManager, type UploadResult } from './upload-manager'

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
]

const uploadManager = new UploadManager()

export async function uploadKBFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<UploadResult> {
  return uploadManager.upload(buffer, originalName, mimeType, {
    channel: 'kb',
    allowedMimeTypes: ALLOWED_MIME_TYPES,
    maxSizeBytes: 20 * 1024 * 1024, // 20MB for KB files
  })
}

export async function deleteKBFile(key: string): Promise<void> {
  return uploadManager.delete(key)
}
