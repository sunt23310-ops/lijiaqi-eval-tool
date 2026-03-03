/**
 * AI 模型数据库文件 路由
 */
import { Router } from 'express'
import * as modelFileService from '../services/modelFile'

const router = Router()

// 获取所有文件
router.get('/', async (_req, res) => {
  try {
    const files = await modelFileService.listModelFiles()
    res.json({ code: 200, data: files })
  } catch (err: any) {
    res.json({ code: 500, message: err.message })
  }
})

// 获取单个文件（含内容）
router.get('/:id', async (req, res) => {
  try {
    const file = await modelFileService.getModelFile(Number(req.params.id))
    if (!file) return res.json({ code: 404, message: '文件不存在' })
    res.json({ code: 200, data: file })
  } catch (err: any) {
    res.json({ code: 500, message: err.message })
  }
})

// 新增文件记录
router.post('/', async (req, res) => {
  try {
    const file = await modelFileService.createModelFile(req.body)
    res.json({ code: 200, data: file })
  } catch (err: any) {
    res.json({ code: 500, message: err.message })
  }
})

// 更新文件元数据
router.put('/:id', async (req, res) => {
  try {
    const file = await modelFileService.updateModelFile(Number(req.params.id), req.body)
    res.json({ code: 200, data: file })
  } catch (err: any) {
    res.json({ code: 500, message: err.message })
  }
})

// 删除文件
router.delete('/:id', async (req, res) => {
  try {
    await modelFileService.deleteModelFile(Number(req.params.id))
    res.json({ code: 200, data: null })
  } catch (err: any) {
    res.json({ code: 500, message: err.message })
  }
})

export default router
