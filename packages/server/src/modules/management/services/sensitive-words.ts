/**
 * 敏感词管理服务 (stub)
 *
 * 管理敏感词库，用于对话内容的预检和过滤。
 */

export interface SensitiveWord {
  id: number
  word: string
  category: 'politics' | 'violence' | 'porn' | 'gambling' | 'custom'
  severity: 'block' | 'warn' | 'log'
  createdAt: Date
}

export interface SensitiveWordInput {
  word: string
  category: SensitiveWord['category']
  severity: SensitiveWord['severity']
}

/** 内存存储（后续可接数据库） */
const wordStore: SensitiveWord[] = []
let nextId = 1

export function listSensitiveWords(): SensitiveWord[] {
  return [...wordStore]
}

export function addSensitiveWord(input: SensitiveWordInput): SensitiveWord {
  const word: SensitiveWord = {
    id: nextId++,
    ...input,
    createdAt: new Date(),
  }
  wordStore.push(word)
  return word
}

export function removeSensitiveWord(id: number): boolean {
  const index = wordStore.findIndex((w) => w.id === id)
  if (index === -1) return false
  wordStore.splice(index, 1)
  return true
}

/**
 * 检查文本中是否包含敏感词
 * 返回命中的敏感词列表
 */
export function checkContent(text: string): SensitiveWord[] {
  return wordStore.filter((w) => text.includes(w.word))
}
