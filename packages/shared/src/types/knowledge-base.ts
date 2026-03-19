/**
 * Knowledge Base (商品知识库) types
 */
export interface KnowledgeFile {
  id: number
  name: string
  format: string        // MD, PDF, Word, JPG, MP3, MP4
  quality: string       // 高, 中, 低
  validUntil: string
  source: string        // 小课堂, 双十一小课堂, etc.
  sizeBytes: number | null
  filePath: string | null
  mimeType: string | null
  content?: string | null // text-based files only
  sortOrder: number
  uploadedAt: string
}
