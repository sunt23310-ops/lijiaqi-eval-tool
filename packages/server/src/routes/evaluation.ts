/**
 * 评测路由
 */
import { Router } from 'express'
import * as evalService from '../services/evaluation'

const router = Router()

// POST /eval/api/v1/sessions/:id/evaluate — 触发评测
router.post('/sessions/:id/evaluate', async (req, res) => {
  try {
    const result = await evalService.runEvaluation(Number(req.params.id), req.user!.userId)
    res.json({ code: 200, data: result })
  } catch (err: any) {
    res.json({ code: 500, message: err.message })
  }
})

// GET /eval/api/v1/sessions/:id/evaluations — 评测历史列表
router.get('/sessions/:id/evaluations', async (req, res) => {
  try {
    const list = await evalService.listEvaluations(Number(req.params.id))
    res.json({ code: 200, data: list })
  } catch (err: any) {
    res.json({ code: 500, message: err.message })
  }
})

// GET /eval/api/v1/evaluations/:evalId — 单次评测详情
router.get('/evaluations/:evalId', async (req, res) => {
  try {
    const evaluation = await evalService.getEvaluation(Number(req.params.evalId))
    if (!evaluation) return res.json({ code: 404, message: '评测不存在' })
    res.json({ code: 200, data: evaluation })
  } catch (err: any) {
    res.json({ code: 500, message: err.message })
  }
})

export default router
