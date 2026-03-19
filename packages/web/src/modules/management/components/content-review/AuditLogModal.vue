<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center" @click.self="$emit('close')">
    <!-- 遮罩 -->
    <div class="absolute inset-0 bg-black/40" @click="$emit('close')" />

    <!-- 弹窗主体 -->
    <div class="relative w-[640px] max-h-[720px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      <!-- 头部 -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-[var(--md-outline-variant)] flex-shrink-0">
        <div class="flex items-center gap-2.5">
          <ScrollText :size="20" class="text-[var(--md-primary)]" />
          <h3 class="text-base font-semibold text-[var(--md-on-surface)]">审核日志</h3>
        </div>
        <button @click="$emit('close')" class="p-1.5 rounded-lg hover:bg-[var(--md-surface-container-high)] transition">
          <X :size="18" class="text-[var(--md-on-surface-variant)]" />
        </button>
      </div>

      <!-- 内容区 -->
      <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        <!-- 会话信息卡片 -->
        <div class="bg-[#F8FAFC] rounded-xl p-4 space-y-3">
          <div class="flex items-center gap-6 text-sm">
            <div class="flex items-center gap-1.5">
              <span class="text-[var(--md-on-surface-variant)]">用户</span>
              <span class="font-medium text-[var(--md-on-surface)]">{{ row.username }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-[var(--md-on-surface-variant)]">会话时间</span>
              <span class="font-medium text-[var(--md-on-surface)]">{{ row.date }} {{ row.time }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-[var(--md-on-surface-variant)]">当前状态</span>
              <span
                class="px-2 py-0.5 rounded text-xs font-medium"
                :class="row.result === '通过' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
              >{{ row.result }}</span>
            </div>
          </div>
          <div class="space-y-1">
            <p class="text-xs text-[var(--md-on-surface-variant)]">用户输入</p>
            <p class="text-sm text-[var(--md-on-surface)]">{{ row.userInput }}</p>
          </div>
          <div class="space-y-1">
            <p class="text-xs text-[var(--md-on-surface-variant)]">AI 输出</p>
            <p class="text-sm text-[var(--md-on-surface)]">{{ row.aiOutput }}</p>
          </div>
        </div>

        <!-- 操作记录标题 -->
        <div class="flex items-center gap-2">
          <History :size="16" class="text-[var(--md-on-surface-variant)]" />
          <span class="text-sm font-semibold text-[var(--md-on-surface)]">操作记录</span>
          <span class="px-2 py-0.5 rounded-full bg-[var(--md-primary-container,#E8DEF8)] text-[var(--md-primary)] text-xs font-medium">{{ logEntries.length }}</span>
        </div>

        <!-- 时间线 -->
        <div class="space-y-0">
          <div
            v-for="(entry, idx) in logEntries"
            :key="idx"
            class="flex gap-3"
          >
            <!-- 左侧圆点 + 连线 -->
            <div class="flex flex-col items-center w-5 flex-shrink-0">
              <div
                class="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
                :class="dotColor(entry.type)"
              />
              <div
                v-if="idx < logEntries.length - 1"
                class="w-px flex-1 bg-[var(--md-outline-variant)]"
              />
            </div>

            <!-- 右侧内容 -->
            <div class="flex-1 pb-5">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium text-[var(--md-on-surface)]">{{ entry.action }}</span>
                  <span
                    class="px-1.5 py-0.5 rounded text-xs font-medium"
                    :class="badgeClass(entry.tag)"
                  >{{ entry.tag }}</span>
                </div>
                <span class="text-xs text-[var(--md-on-surface-variant)]">{{ entry.time }}</span>
              </div>
              <p class="text-xs text-[var(--md-on-surface-variant)] mt-0.5">执行人：{{ entry.operator }}</p>
              <p class="text-xs text-[var(--md-on-surface-variant)] mt-1 leading-relaxed">{{ entry.detail }}</p>
              <div v-if="idx < logEntries.length - 1" class="mt-3 border-b border-[#F1F5F9]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ScrollText, X, History } from 'lucide-vue-next'

export interface ReviewRow {
  id: number
  username: string
  date: string
  time: string
  userInput: string
  aiOutput: string
  result: '通过' | '未通过'
}

const props = defineProps<{ row: ReviewRow }>()
defineEmits<{ close: [] }>()

interface LogEntry {
  action: string
  tag: '自动' | '人工' | '通过' | '未通过'
  type: 'auto' | 'human' | 'pass' | 'fail'
  time: string
  operator: string
  detail: string
}

// 根据审核结果生成对应的日志数据
const logEntries = computed<LogEntry[]>(() => {
  if (props.row.result === '未通过') {
    return [
      { action: '系统自动审核', tag: '自动', type: 'auto', time: `${props.row.date}  ${incrementTime(props.row.time, 3)}`, operator: 'System', detail: 'AI输出内容进入敏感词过滤检测，触发「孕期安全用药」相关审核规则，标记为「需人工复核」' },
      { action: '人工初审', tag: '人工', type: 'human', time: `${props.row.date}  ${incrementTime(props.row.time, 2280)}`, operator: '刘芳（内容审核专员）', detail: '核查AI回复内容，发现水杨酸属于孕期C类药物成分，AI输出「完全安全」表述不准确，存在误导消费者风险。审核结论：不通过' },
      { action: '合规复核', tag: '人工', type: 'human', time: `${props.row.date}  ${incrementTime(props.row.time, 6900)}`, operator: '陈刚（合规主管）', detail: '确认审核结论：水杨酸（BHA）在高浓度下属于孕期慎用成分，AI不应给出「完全安全」的建议。需修正知识库中相关条目' },
      { action: '知识库修正工单', tag: '自动', type: 'auto', time: `${props.row.date}  ${incrementTime(props.row.time, 6905)}`, operator: 'System', detail: '已自动创建知识库修正工单 KBF-20240312-0018，将「水杨酸」添加至孕期成分预警名单' },
      { action: '审核报告生成', tag: '自动', type: 'auto', time: `${props.row.date}  ${incrementTime(props.row.time, 6960)}`, operator: 'System', detail: '审核流程完结，生成审核报告编号 RPT-20240312-0047，归档至合规审计系统' },
      { action: '最终审核结论', tag: '未通过', type: 'fail', time: `${props.row.date}  ${incrementTime(props.row.time, 6961)}`, operator: 'System', detail: '该会话内容已完成全部审核流程（自动审核→人工初审→合规复核），最终结论：未通过。AI回复内容待知识库修正后重新生成' },
    ]
  }
  return [
    { action: '系统自动审核', tag: '自动', type: 'auto', time: `${props.row.date}  ${incrementTime(props.row.time, 3)}`, operator: 'System', detail: 'AI输出内容通过敏感词过滤检测，未发现违规关键词，自动标记为「初审通过」' },
    { action: '人工初审', tag: '人工', type: 'human', time: `${props.row.date}  ${incrementTime(props.row.time, 2280)}`, operator: '刘芳（内容审核专员）', detail: '已核查AI回复内容，产品推荐信息准确，未含夸大宣传用语，符合广告法要求。审核结论：通过' },
    { action: '合规复核', tag: '人工', type: 'human', time: `${props.row.date}  ${incrementTime(props.row.time, 7920)}`, operator: '陈刚（合规主管）', detail: '二次审核确认：产品成分描述与官方资料一致，功效说明未超出注册备案范围，无误导消费者风险' },
    { action: '标注敏感词更新', tag: '自动', type: 'auto', time: `${props.row.date}  ${incrementTime(props.row.time, 7923)}`, operator: 'System', detail: '根据审核结果同步更新敏感词库白名单，相关产品成分词条已更新' },
    { action: '审核报告生成', tag: '自动', type: 'auto', time: `${props.row.date}  ${incrementTime(props.row.time, 7980)}`, operator: 'System', detail: `审核流程完结，生成审核报告编号 RPT-${props.row.date.replace(/-/g, '')}-${String(props.row.id).padStart(4, '0')}，归档至合规审计系统` },
    { action: '最终审核结论', tag: '通过', type: 'pass', time: `${props.row.date}  ${incrementTime(props.row.time, 7981)}`, operator: 'System', detail: '该会话内容已完成全部审核流程（自动审核→人工初审→合规复核），最终结论：通过。审核报告已归档' },
  ]
})

function incrementTime(timeStr: string, addSeconds: number): string {
  const [h, m, s] = timeStr.split(':').map(Number)
  let total = h * 3600 + m * 60 + s + addSeconds
  total = total % 86400
  const hh = String(Math.floor(total / 3600)).padStart(2, '0')
  const mm = String(Math.floor((total % 3600) / 60)).padStart(2, '0')
  const ss = String(total % 60).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

function dotColor(type: string) {
  const map: Record<string, string> = {
    auto: 'bg-[var(--md-primary)]',
    human: 'bg-emerald-500',
    pass: 'bg-emerald-500',
    fail: 'bg-red-500',
  }
  return map[type] ?? 'bg-gray-400'
}

function badgeClass(tag: string) {
  const map: Record<string, string> = {
    '自动': 'bg-blue-100 text-blue-700',
    '人工': 'bg-amber-100 text-amber-700',
    '通过': 'bg-green-100 text-green-700',
    '未通过': 'bg-red-100 text-red-700',
  }
  return map[tag] ?? 'bg-slate-100 text-slate-600'
}
</script>
