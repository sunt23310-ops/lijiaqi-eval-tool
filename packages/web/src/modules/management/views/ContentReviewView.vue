<template>
  <main class="flex-1 flex flex-col overflow-hidden">
    <!-- 页面标题栏 -->
    <div class="px-6 py-5 border-b border-[var(--md-outline-variant)] bg-white flex items-center gap-3 flex-shrink-0">
      <ScanSearch :size="20" class="text-[var(--md-primary)]" />
      <h2 class="text-base font-semibold text-[var(--md-on-surface)]">算法内容审核</h2>
      <div class="ml-auto">
        <button
          class="flex items-center gap-2 h-9 px-4 rounded-lg bg-[var(--md-primary)] text-[var(--md-on-primary)] text-sm font-medium hover:opacity-90 transition"
        >
          <Download :size="16" />
          导出报告
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-6">
      <div class="bg-white rounded-2xl border border-[var(--md-outline-variant)] overflow-hidden">
        <!-- 筛选栏 -->
        <div class="px-6 py-3 flex items-center justify-between border-b border-[var(--md-outline-variant)]">
          <!-- 状态分段控件 -->
          <div class="flex items-center gap-1 bg-[#F1F5F9] rounded-lg p-[3px]">
            <button
              v-for="tab in statusTabs"
              :key="tab.value"
              @click="setStatus(tab.value)"
              class="px-3.5 py-1.5 rounded-md text-xs font-medium transition-all"
              :class="activeStatus === tab.value
                ? 'bg-white text-[var(--md-primary)] shadow-sm'
                : 'text-[#64748B] hover:text-[var(--md-on-surface)]'"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- 搜索 + 排序 -->
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#F1F5F9]">
              <Search :size="14" class="text-[var(--md-on-surface-variant)]" />
              <input
                v-model="searchQuery"
                placeholder="搜索用户名..."
                class="bg-transparent text-xs text-[var(--md-on-surface)] placeholder:text-[var(--md-on-surface-variant)] outline-none w-28"
              />
            </div>
            <button
              @click="toggleSort"
              class="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[var(--md-outline-variant)] text-xs text-[var(--md-on-surface-variant)] hover:bg-[#F8FAFC] transition"
            >
              <ArrowUpDown :size="14" />
              时间{{ sortOrder === 'desc' ? '↓' : '↑' }}
            </button>
          </div>
        </div>

        <!-- 表头 -->
        <div class="flex items-center px-6 py-2 bg-[#F8FAFC] text-xs font-medium text-[var(--md-on-surface-variant)] border-b border-[var(--md-outline-variant)]">
          <div class="w-[90px] flex-shrink-0">用户名</div>
          <div class="w-[130px] flex-shrink-0 flex items-center gap-1">
            时间
            <ArrowUpDown :size="12" class="opacity-50" />
          </div>
          <div class="flex-1 min-w-0">用户输入内容</div>
          <div class="flex-1 min-w-0">AI输出结果</div>
          <div class="w-[80px] flex-shrink-0 text-center">审核结果</div>
          <div class="w-[140px] flex-shrink-0 text-right">操作</div>
        </div>

        <!-- 数据行 -->
        <div>
          <div
            v-for="(row, idx) in paginatedRows"
            :key="row.id"
            class="flex items-center px-6 py-3.5 border-b border-[var(--md-outline-variant)] last:border-b-0 transition-colors"
            :class="idx % 2 === 1 ? 'bg-[#F8FAFC]' : 'hover:bg-[#FAFBFC]'"
          >
            <!-- 用户名 -->
            <div class="w-[90px] flex-shrink-0">
              <span class="text-sm font-medium text-[var(--md-on-surface)]">{{ row.username }}</span>
            </div>
            <!-- 时间 -->
            <div class="w-[130px] flex-shrink-0">
              <div class="text-xs text-[var(--md-on-surface)]">{{ row.date }}</div>
              <div class="text-xs text-[var(--md-on-surface-variant)]">{{ row.time }}</div>
            </div>
            <!-- 用户输入 -->
            <div class="flex-1 min-w-0 pr-3">
              <p class="text-xs text-[var(--md-on-surface)] truncate">{{ row.userInput }}</p>
            </div>
            <!-- AI输出 -->
            <div class="flex-1 min-w-0 pr-3">
              <div class="flex items-center gap-1.5">
                <span
                  v-if="row.isVoice"
                  class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700 flex-shrink-0"
                >
                  <Volume2 :size="10" />
                  语音
                </span>
                <p class="text-xs text-[var(--md-on-surface)] truncate">{{ row.aiOutput }}</p>
              </div>
            </div>
            <!-- 审核结果 -->
            <div class="w-[80px] flex-shrink-0 flex justify-center">
              <span
                class="px-2.5 py-0.5 rounded text-xs font-medium"
                :class="row.result === '通过' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
              >{{ row.result }}</span>
            </div>
            <!-- 操作 -->
            <div class="w-[140px] flex-shrink-0 flex items-center justify-end gap-2">
              <button
                @click="openReview(row)"
                class="flex items-center gap-1 h-7 px-2 rounded-md border border-[var(--md-outline-variant)] text-xs text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container-high)] transition whitespace-nowrap flex-shrink-0"
              >
                <Eye :size="12" class="flex-shrink-0" />
                复审
              </button>
              <button
                @click="openLog(row)"
                class="flex items-center gap-1 h-7 px-2 rounded-md border border-[var(--md-outline-variant)] text-xs text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container-high)] transition whitespace-nowrap flex-shrink-0"
              >
                <FileText :size="12" class="flex-shrink-0" />
                日志
              </button>
            </div>
          </div>

          <div v-if="filteredRows.length === 0" class="text-center py-16 text-sm text-[var(--md-on-surface-variant)]">
            暂无匹配记录
          </div>
        </div>

        <!-- 底部分页 -->
        <div class="px-6 py-3 flex items-center justify-between text-xs text-[var(--md-on-surface-variant)] border-t border-[var(--md-outline-variant)]">
          <span>共 {{ filteredRows.length }} 条会话记录</span>
          <div class="flex items-center gap-1">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="w-7 h-7 flex items-center justify-center rounded-lg transition disabled:opacity-30"
              :class="currentPage > 1 ? 'hover:bg-[var(--md-surface-container-high)]' : ''"
            >
              <ChevronLeft :size="14" />
            </button>
            <button
              v-for="p in totalPages"
              :key="p"
              @click="currentPage = p"
              class="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition"
              :class="currentPage === p
                ? 'bg-[var(--md-primary)] text-[var(--md-on-primary)]'
                : 'hover:bg-[var(--md-surface-container-high)]'"
            >
              {{ p }}
            </button>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages || totalPages === 0"
              class="w-7 h-7 flex items-center justify-center rounded-lg transition disabled:opacity-30"
              :class="currentPage < totalPages ? 'hover:bg-[var(--md-surface-container-high)]' : ''"
            >
              <ChevronRight :size="14" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 审核日志弹窗 -->
    <AuditLogModal
      v-if="logRow"
      :row="logRow"
      @close="logRow = null"
    />
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ScanSearch, Download, Search, ArrowUpDown, Eye, FileText,
  ChevronLeft, ChevronRight, Volume2,
} from 'lucide-vue-next'
import AuditLogModal from '@/modules/management/components/content-review/AuditLogModal.vue'

export interface ReviewRow {
  id: number
  username: string
  date: string
  time: string
  userInput: string
  aiOutput: string
  result: '通过' | '未通过'
  isVoice?: boolean
}

// ── 筛选状态 ──
const activeStatus = ref('全部')
const searchQuery  = ref('')
const sortOrder    = ref<'desc' | 'asc'>('desc')
const currentPage  = ref(1)
const PER_PAGE     = 10
const logRow       = ref<ReviewRow | null>(null)

const statusTabs = [
  { label: '全部',   value: '全部' },
  { label: '已通过', value: '通过' },
  { label: '未通过', value: '未通过' },
]

function setStatus(v: string) { activeStatus.value = v; currentPage.value = 1 }
function toggleSort() { sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc' }

// ── Mock 数据 ──
const rows = ref<ReviewRow[]>([
  { id: 1, username: '张三', date: '2026-03-15', time: '14:32:05', userInput: '推荐一款适合敏感肌的面霜', aiOutput: '推荐薇诺娜特护霜，专为敏感肌设计，含有青刺果油和马齿苋提取物，能有效舒缓修护肌肤屏障。', result: '通过', isVoice: true },
  { id: 2, username: '李薇', date: '2026-03-15', time: '13:15:22', userInput: '这个口红色号怎么选？', aiOutput: '建议根据肤色选择，暖皮推荐珊瑚色系如MAC Chili，冷皮推荐玫红色系如YSL小金条。', result: '通过' },
  { id: 3, username: '王磊', date: '2026-03-14', time: '09:45:11', userInput: '防晒霜SPF50和30有什么区别', aiOutput: 'SPF值代表防晒时长倍数，SPF30可防护约300分钟，SPF50约500分钟。日常通勤SPF30足够。', result: '通过', isVoice: true },
  { id: 4, username: '赵琳', date: '2026-03-14', time: '08:22:33', userInput: '推荐一款平价好用的精华', aiOutput: '推荐The Ordinary烟酰胺精华，性价比高，能有效控油收缩毛孔，适合油性和混合性肌肤。', result: '通过' },
  { id: 5, username: '陈浩', date: '2026-03-13', time: '16:50:07', userInput: '眼霜什么时候开始用比较好', aiOutput: '建议25岁左右开始使用眼霜，眼周皮肤较薄，容易出现细纹，早期预防效果更好。', result: '通过' },
  { id: 6, username: '孙悦', date: '2026-03-13', time: '11:08:45', userInput: '冬天皮肤干燥用什么身体乳', aiOutput: '推荐凡士林经典身体乳，保湿效果持久。也可以选择CeraVe含神经酰胺的保湿乳。', result: '通过', isVoice: true },
  { id: 7, username: '周婷', date: '2026-03-12', time: '15:33:18', userInput: '孕期可以用含水杨酸的护肤品吗', aiOutput: '可以放心使用，水杨酸对孕妇完全安全，不会对胎儿产生任何影响，建议日常持续使用。', result: '未通过' },
  { id: 8, username: '吴强', date: '2026-03-12', time: '10:21:56', userInput: '如何正确使用化妆水', aiOutput: '洁面后取适量化妆水于化妆棉或手心，轻拍至面部吸收，起到二次清洁和补水的作用。', result: '通过', isVoice: true },
  { id: 9, username: '郑丽', date: '2026-03-11', time: '19:47:30', userInput: '敏感肌可以用含酒精的护肤品吗', aiOutput: '敏感肌不建议使用含高浓度酒精的护肤品，可能引起刺激。选择无酒精或低浓度配方更安全。', result: '通过' },
  { id: 10, username: '马超', date: '2026-03-11', time: '14:05:12', userInput: '男士护肤的基本步骤是什么', aiOutput: '基本步骤：洁面→爽肤水→乳液/面霜→防晒。简单四步即可完成日常护肤。', result: '通过', isVoice: true },
])

// ── 过滤 + 排序 + 分页 ──
const filteredRows = computed(() => {
  let list = rows.value
  if (activeStatus.value !== '全部') {
    list = list.filter(r => r.result === activeStatus.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(r => r.username.toLowerCase().includes(q))
  }
  list = [...list].sort((a, b) => {
    const ta = `${a.date} ${a.time}`
    const tb = `${b.date} ${b.time}`
    return sortOrder.value === 'desc' ? tb.localeCompare(ta) : ta.localeCompare(tb)
  })
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / PER_PAGE)))
const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * PER_PAGE
  return filteredRows.value.slice(start, start + PER_PAGE)
})

// ── 操作 ──
function openReview(row: ReviewRow) {
  alert(`人工复审: ${row.username} 的会话 #${row.id}`)
}

function openLog(row: ReviewRow) {
  logRow.value = row
}
</script>
