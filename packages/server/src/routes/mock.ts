/**
 * Mock 数据路由
 */
import { Router } from 'express'
import * as mockService from '../services/mock'

const router = Router()

router.get('/presets', (_req, res) => {
  res.json({ code: 200, data: mockService.getPresets() })
})

router.post('/generate', async (req, res) => {
  try {
    const questions = await mockService.generateMockQuestions(req.body.messages || [])
    res.json({ code: 200, data: questions })
  } catch (err: any) {
    res.json({ code: 500, message: err.message })
  }
})

export default router
