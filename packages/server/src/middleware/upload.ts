/**
 * Multer 上传中间件配置
 *
 * 使用 memory storage（文件存于内存 buffer），
 * 后续由 UploadManager 决定实际存储位置。
 */
import multer from 'multer'

/** 默认最大文件大小: 20MB */
const MAX_FILE_SIZE = 20 * 1024 * 1024

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
})
