/**
 * 上传路由
 *
 * POST /eval/api/v1/upload/qa — 上传 QA 测试数据
 * POST /eval/api/v1/upload/kb — 上传知识库文件
 */
import { Router } from 'express'
import { uploadMiddleware } from '../../middleware/upload'
import { uploadQAFile } from './services/qa-channel'
import { uploadKBFile } from './services/kb-channel'

const router = Router()

router.post('/qa', uploadMiddleware.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ code: 400, message: '未上传文件' })
    }
    const result = await uploadQAFile(req.file.buffer, req.file.originalname, req.file.mimetype)
    res.json({ code: 200, data: result })
  } catch (err: any) {
    res.json({ code: 500, message: err.message })
  }
})

router.post('/kb', uploadMiddleware.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ code: 400, message: '未上传文件' })
    }
    const result = await uploadKBFile(req.file.buffer, req.file.originalname, req.file.mimetype)
    res.json({ code: 200, data: result })
  } catch (err: any) {
    res.json({ code: 500, message: err.message })
  }
})

export default router
