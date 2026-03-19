/**
 * 文件存储抽象层
 *
 * 提供统一的存储接口，支持本地文件系统和 S3 兼容存储。
 */

export interface StorageProvider {
  /**
   * 存储文件
   * @param key - 存储路径/key
   * @param data - 文件内容
   * @param mimeType - MIME 类型
   * @returns 可访问的 URL
   */
  put(key: string, data: Buffer, mimeType: string): Promise<string>

  /**
   * 读取文件
   * @param key - 存储路径/key
   * @returns 文件内容
   */
  get(key: string): Promise<Buffer>

  /**
   * 删除文件
   * @param key - 存储路径/key
   */
  delete(key: string): Promise<void>

  /**
   * 检查文件是否存在
   * @param key - 存储路径/key
   */
  exists(key: string): Promise<boolean>

  /**
   * 获取文件的可访问 URL
   * @param key - 存储路径/key
   */
  getUrl(key: string): string
}

export type StorageType = 'local' | 's3'

// Re-export implementations
export { LocalStorage, getLocalStorage } from './local'
