/**
 * 上传管理器
 *
 * 统一管理文件上传的生命周期，包括校验、存储、记录。
 */
import type { StorageProvider } from '../../../storage'
import { getLocalStorage } from '../../../storage'

export interface UploadResult {
  /** 上传后的文件路径或 key */
  key: string
  /** 原始文件名 */
  originalName: string
  /** MIME 类型 */
  mimeType: string
  /** 文件大小 (bytes) */
  sizeBytes: number
  /** 可访问的 URL */
  url: string
}

export interface UploadOptions {
  /** 允许的 MIME 类型 */
  allowedMimeTypes?: string[]
  /** 最大文件大小 (bytes) */
  maxSizeBytes?: number
  /** 上传通道 */
  channel: 'qa' | 'kb'
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024 // 10MB

export class UploadManager {
  private storage: StorageProvider

  constructor(storage?: StorageProvider) {
    this.storage = storage ?? getLocalStorage()
  }

  async upload(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    options: UploadOptions
  ): Promise<UploadResult> {
    // 1. 校验文件大小
    const maxSize = options.maxSizeBytes ?? DEFAULT_MAX_SIZE
    if (buffer.length > maxSize) {
      throw new Error(`文件大小超过限制: ${buffer.length} > ${maxSize} bytes`)
    }

    // 2. 校验 MIME 类型
    if (options.allowedMimeTypes && !options.allowedMimeTypes.includes(mimeType)) {
      throw new Error(`不支持的文件类型: ${mimeType}`)
    }

    // 3. 生成存储 key
    const timestamp = Date.now()
    const key = `${options.channel}/${timestamp}-${originalName}`

    // 4. 存储文件
    const url = await this.storage.put(key, buffer, mimeType)

    return {
      key,
      originalName,
      mimeType,
      sizeBytes: buffer.length,
      url,
    }
  }

  async delete(key: string): Promise<void> {
    await this.storage.delete(key)
  }
}
