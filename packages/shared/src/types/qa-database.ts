import type { SceneType } from './session'

/**
 * QA Database types
 */
export interface QAFolder {
  id: number
  name: string
  sceneType: SceneType
  fileCount: number
  sortOrder: number
  createdAt: string
}

export interface QAFile {
  id: number
  folderId: number
  name: string
  format: string
  sizeBytes: number
  qaCount: number
  metadata?: QAFileMetadata
  uploadedAt: string
}

export interface QAFileMetadata {
  sourceDoc?: string    // 来源文档
  category?: string     // 品类
  userProfile?: string  // 用户画像
  primaryNeed?: string  // 主要诉求
  rounds?: number       // 对话轮数
}

export interface QAEntry {
  id: number
  fileId: number
  question: string
  answer: string
  category?: string
  tags?: string[]
}
