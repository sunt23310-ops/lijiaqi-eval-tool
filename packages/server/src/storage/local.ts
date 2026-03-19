/**
 * 本地文件系统存储实现
 */
import fs from 'fs/promises'
import path from 'path'
import type { StorageProvider } from './index'

const DEFAULT_UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')
const DEFAULT_BASE_URL = process.env.UPLOAD_BASE_URL || '/uploads'

export class LocalStorage implements StorageProvider {
  private baseDir: string
  private baseUrl: string

  constructor(baseDir?: string, baseUrl?: string) {
    this.baseDir = baseDir ?? DEFAULT_UPLOAD_DIR
    this.baseUrl = baseUrl ?? DEFAULT_BASE_URL
  }

  private getFilePath(key: string): string {
    return path.join(this.baseDir, key)
  }

  async put(key: string, data: Buffer, _mimeType: string): Promise<string> {
    const filePath = this.getFilePath(key)
    const dir = path.dirname(filePath)

    // 确保目录存在
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(filePath, data)

    return this.getUrl(key)
  }

  async get(key: string): Promise<Buffer> {
    const filePath = this.getFilePath(key)
    return fs.readFile(filePath)
  }

  async delete(key: string): Promise<void> {
    const filePath = this.getFilePath(key)
    try {
      await fs.unlink(filePath)
    } catch (err: any) {
      if (err.code !== 'ENOENT') throw err
    }
  }

  async exists(key: string): Promise<boolean> {
    const filePath = this.getFilePath(key)
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  getUrl(key: string): string {
    return `${this.baseUrl}/${key}`
  }
}

/** 单例 */
let instance: LocalStorage | null = null

export function getLocalStorage(): LocalStorage {
  if (!instance) {
    instance = new LocalStorage()
  }
  return instance
}
