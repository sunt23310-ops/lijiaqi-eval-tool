/**
 * Upload job tracking
 */
export interface UploadJob {
  id: string
  channel: UploadChannel
  status: 'pending' | 'processing' | 'completed' | 'failed'
  totalFiles: number
  processedFiles: number
  failedFiles: Array<{ name: string; error: string }>
  createdAt: string
  completedAt?: string
}

export type UploadChannel = 'qa-database' | 'knowledge-base'

export interface UploadProgress {
  jobId: string
  channel: UploadChannel
  status: UploadJob['status']
  totalFiles: number
  processedFiles: number
  percentage: number
  failedFiles: Array<{ name: string; error: string }>
}

export interface FileMetadata {
  name: string
  format: string
  sizeBytes: number
  mimeType: string
}
