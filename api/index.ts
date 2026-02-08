/**
 * Vercel Serverless Function 入口
 * 将 Express app 包装为 Vercel 兼容的 handler
 */
import app from '../packages/server/src/index'

export default app
