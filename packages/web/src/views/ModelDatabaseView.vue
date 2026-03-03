<template>
  <main class="flex-1 flex flex-col overflow-hidden">
    <!-- 页面标题栏 -->
    <div class="px-6 py-5 border-b border-[var(--md-outline-variant)] bg-white flex items-center gap-3 flex-shrink-0">
      <Database :size="20" class="text-[var(--md-primary)]" />
      <h2 class="text-base font-semibold text-[var(--md-on-surface)]">AI 模型数据库</h2>
      <span class="text-sm text-[var(--md-on-surface-variant)]">李佳琦大模型</span>
      <div class="ml-auto">
        <button
          @click="showUploadModal = true"
          class="flex items-center gap-2 h-9 px-4 rounded-lg bg-[var(--md-primary)] text-[var(--md-on-primary)] text-sm font-medium hover:opacity-90 transition"
        >
          <Upload :size="16" />
          上传文件
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-6 space-y-5">
      <!-- Toolbar -->
      <div class="bg-white rounded-2xl border border-[var(--md-outline-variant)] overflow-hidden">
        <!-- 分类 Tab + 筛选 -->
        <div class="px-6 py-3 flex items-center justify-between border-b border-[var(--md-outline-variant)]">
          <!-- 格式分段控件 -->
          <div class="flex items-center gap-1 bg-[#F1F5F9] rounded-lg p-[3px]">
            <button
              v-for="tab in formatTabs"
              :key="tab.value"
              @click="activeFormat = tab.value"
              class="px-3.5 py-1.5 rounded-md text-xs font-medium transition-all"
              :class="activeFormat === tab.value
                ? 'bg-white text-[var(--md-primary)] shadow-sm'
                : 'text-[#64748B] hover:text-[var(--md-on-surface)]'"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- 质量 + 来源筛选 chip -->
          <div class="flex items-center gap-2">
            <button
              v-for="chip in qualityChips"
              :key="chip.value"
              @click="activeQuality = activeQuality === chip.value ? '' : chip.value"
              class="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              :class="activeQuality === chip.value ? chip.activeClass : chip.inactiveClass"
            >
              {{ chip.label }}
            </button>
            <div class="w-px h-4 bg-[var(--md-outline-variant)]"></div>
            <button
              v-for="chip in sourceChips"
              :key="chip.value"
              @click="activeSource = activeSource === chip.value ? '' : chip.value"
              class="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              :class="activeSource === chip.value ? chip.activeClass : chip.inactiveClass"
            >
              {{ chip.label }}
            </button>
          </div>
        </div>

        <!-- 表头 -->
        <div class="flex items-center px-6 py-2 bg-[#F8FAFC] text-xs font-medium text-[var(--md-on-surface-variant)] border-b border-[var(--md-outline-variant)]">
          <div class="flex-1 min-w-0">文件名 / 来源信息</div>
          <div class="w-[76px] flex-shrink-0 text-center">格式</div>
          <div class="w-[88px] flex-shrink-0 text-center">数据质量等级</div>
          <div class="w-[110px] flex-shrink-0 text-center">数据时效性</div>
          <div class="w-[110px] flex-shrink-0 text-center">数据来源</div>
          <div class="w-[80px] flex-shrink-0 text-center">操作</div>
        </div>

        <!-- 数据行 -->
        <div>
          <div
            v-for="file in filteredFiles"
            :key="file.id"
            class="flex items-center px-6 py-3.5 border-b border-[var(--md-outline-variant)] last:border-b-0 hover:bg-[#F8FAFC] transition-colors"
          >
            <!-- 文件名 -->
            <div class="flex-1 min-w-0 flex items-center gap-2.5">
              <component
                :is="fileIcon(file.format)"
                :size="18"
                :class="fileIconColor(file.format)"
                class="flex-shrink-0"
              />
              <span class="text-sm font-medium text-[var(--md-on-surface)] truncate">{{ file.name }}</span>
            </div>

            <!-- 格式 badge -->
            <div class="w-[76px] flex-shrink-0 flex justify-center">
              <span class="px-2 py-0.5 rounded text-xs font-semibold tracking-wide" :class="formatBadgeClass(file.format)">
                {{ file.format }}
              </span>
            </div>

            <!-- 质量 badge -->
            <div class="w-[88px] flex-shrink-0 flex justify-center">
              <span class="px-2.5 py-0.5 rounded text-xs font-medium" :class="qualityBadgeClass(file.quality)">
                {{ file.quality }}
              </span>
            </div>

            <!-- 时效性 -->
            <div class="w-[110px] flex-shrink-0 text-center">
              <span class="text-xs text-[var(--md-on-surface-variant)]">{{ file.validUntil }}</span>
            </div>

            <!-- 来源 badge -->
            <div class="w-[110px] flex-shrink-0 flex justify-center">
              <span class="px-2.5 py-0.5 rounded text-xs font-medium" :class="sourceBadgeClass(file.source)">
                {{ file.source }}
              </span>
            </div>

            <!-- 操作 -->
            <div class="w-[80px] flex-shrink-0 flex items-center justify-center gap-2">
              <button
                @click="handleEdit(file.id)"
                class="p-1.5 rounded-lg hover:bg-[var(--md-surface-container-high)] transition"
              >
                <Pencil :size="14" class="text-[var(--md-on-surface-variant)]" />
              </button>
              <button
                @click="handleDelete(file.id)"
                class="p-1.5 rounded-lg hover:bg-red-50 transition"
              >
                <Trash2 :size="14" class="text-[var(--md-on-surface-variant)] hover:text-red-500" />
              </button>
            </div>
          </div>

          <div v-if="filteredFiles.length === 0" class="text-center py-16 text-sm text-[var(--md-on-surface-variant)]">
            暂无匹配文件
          </div>
        </div>

        <!-- 底部分页 -->
        <div class="px-6 py-3 flex items-center justify-between text-xs text-[var(--md-on-surface-variant)]">
          <span>共 {{ filteredFiles.length }} 个文件</span>
          <div class="flex items-center gap-1">
            <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--md-surface-container-high)] transition">
              <ChevronLeft :size="14" />
            </button>
            <button class="w-7 h-7 flex items-center justify-center rounded-lg bg-[var(--md-primary)] text-[var(--md-on-primary)] text-xs font-medium">1</button>
            <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--md-surface-container-high)] transition">
              <ChevronRight :size="14" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 上传弹窗 -->
    <div
      v-if="showUploadModal"
      class="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      @click.self="showUploadModal = false"
    >
      <div class="bg-white rounded-2xl shadow-xl w-[480px] p-6 space-y-5">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-[var(--md-on-surface)]">上传训练数据文件</h3>
          <button @click="showUploadModal = false" class="p-1.5 rounded-lg hover:bg-[var(--md-surface-container-high)] transition">
            <X :size="18" class="text-[var(--md-on-surface-variant)]" />
          </button>
        </div>

        <!-- 拖拽上传区 -->
        <div class="border-2 border-dashed border-[var(--md-outline-variant)] rounded-xl p-8 text-center space-y-2 hover:border-[var(--md-primary)] transition-colors cursor-pointer">
          <Upload :size="32" class="mx-auto text-[var(--md-on-surface-variant)]" />
          <p class="text-sm font-medium text-[var(--md-on-surface)]">拖拽文件到此处，或点击上传</p>
          <p class="text-xs text-[var(--md-on-surface-variant)]">支持 PDF、MD、DOCX、JPG、MP3、MP4</p>
        </div>

        <!-- 表单字段 -->
        <div class="space-y-3">
          <div>
            <label class="text-xs font-medium text-[var(--md-on-surface-variant)] mb-1 block">数据质量等级</label>
            <select v-model="uploadForm.quality" class="w-full h-9 px-3 rounded-lg border border-[var(--md-outline-variant)] text-sm text-[var(--md-on-surface)] bg-white outline-none focus:border-[var(--md-primary)]">
              <option value="">请选择</option>
              <option>高</option>
              <option>中</option>
              <option>低</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-medium text-[var(--md-on-surface-variant)] mb-1 block">数据时效性（截止日期）</label>
            <input v-model="uploadForm.validUntil" type="date" class="w-full h-9 px-3 rounded-lg border border-[var(--md-outline-variant)] text-sm text-[var(--md-on-surface)] bg-white outline-none focus:border-[var(--md-primary)]" />
          </div>
          <div>
            <label class="text-xs font-medium text-[var(--md-on-surface-variant)] mb-1 block">数据来源</label>
            <select v-model="uploadForm.source" class="w-full h-9 px-3 rounded-lg border border-[var(--md-outline-variant)] text-sm text-[var(--md-on-surface)] bg-white outline-none focus:border-[var(--md-primary)]">
              <option value="">请选择</option>
              <option>官方开放</option>
              <option>自采集</option>
              <option>民间转载</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-1">
          <button @click="showUploadModal = false" class="h-9 px-4 rounded-lg border border-[var(--md-outline-variant)] text-sm text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container-high)] transition">
            取消
          </button>
          <button @click="handleUpload" class="h-9 px-4 rounded-lg bg-[var(--md-primary)] text-[var(--md-on-primary)] text-sm font-medium hover:opacity-90 transition">
            确认上传
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Database, Upload, Pencil, Trash2, ChevronLeft, ChevronRight, X,
  FileText, FileImage, Music, Video, File,
} from 'lucide-vue-next'

// ── 弹窗状态 ──────────────────────────────────────────
const showUploadModal = ref(false)
const uploadForm = ref({ quality: '', validUntil: '', source: '' })

// ── 筛选状态 ──────────────────────────────────────────
const activeFormat = ref('全部')
const activeQuality = ref('')
const activeSource = ref('')

// ── Mock 数据 ─────────────────────────────────────────
interface ModelFile {
  id: number
  name: string
  format: 'PDF' | 'MD' | 'Word' | 'JPG' | 'MP3' | 'MP4'
  quality: '高' | '中' | '低'
  validUntil: string
  source: '官方开放' | '自采集' | '民间转载'
}

const files = ref<ModelFile[]>([
  { id: 1, name: '产品研究本集 v2.pdf',   format: 'PDF',  quality: '高', validUntil: '至 2026-04-01', source: '官方开放' },
  { id: 2, name: '技术标注文档.md',        format: 'MD',   quality: '高', validUntil: '至 2026-03-01', source: '自采集' },
  { id: 3, name: '用户告知记录.docx',      format: 'Word', quality: '中', validUntil: '至 2026-04-01', source: '民间转载' },
  { id: 4, name: '广告素材分析.jpg',       format: 'JPG',  quality: '中', validUntil: '至 2026-04-01', source: '民间转载' },
  { id: 5, name: '品类使用趋势.mp3',       format: 'MP3',  quality: '低', validUntil: '至 2025-12-01', source: '民间转载' },
])

// ── Tab / Chip 配置 ────────────────────────────────────
const formatTabs = [
  { label: '全部', value: '全部' },
  { label: 'PDF',      value: 'PDF' },
  { label: 'Markdown', value: 'MD' },
  { label: 'Word',     value: 'Word' },
  { label: '图片',     value: 'JPG' },
  { label: '音视频',   value: 'AV' },
]

const qualityChips = [
  { label: '高质量', value: '高', activeClass: 'bg-green-100 text-green-700',   inactiveClass: 'bg-[#F1F5F9] text-[#64748B] hover:bg-green-50' },
  { label: '中质量', value: '中', activeClass: 'bg-amber-100 text-amber-700',   inactiveClass: 'bg-[#F1F5F9] text-[#64748B] hover:bg-amber-50' },
  { label: '低质量', value: '低', activeClass: 'bg-red-100 text-red-700',       inactiveClass: 'bg-[#F1F5F9] text-[#64748B] hover:bg-red-50' },
]

const sourceChips = [
  { label: '官方开放', value: '官方开放', activeClass: 'bg-blue-100 text-blue-700',   inactiveClass: 'bg-[#F1F5F9] text-[#64748B] hover:bg-blue-50' },
  { label: '自采集',   value: '自采集',   activeClass: 'bg-purple-100 text-purple-700', inactiveClass: 'bg-[#F1F5F9] text-[#64748B] hover:bg-purple-50' },
  { label: '民间转载', value: '民间转载', activeClass: 'bg-orange-100 text-orange-700', inactiveClass: 'bg-[#F1F5F9] text-[#64748B] hover:bg-orange-50' },
]

// ── 过滤 ──────────────────────────────────────────────
const filteredFiles = computed(() => {
  return files.value.filter(f => {
    const matchFormat = activeFormat.value === '全部'
      || (activeFormat.value === 'AV' ? ['MP3', 'MP4'].includes(f.format) : f.format === activeFormat.value)
    const matchQuality = !activeQuality.value || f.quality === activeQuality.value
    const matchSource  = !activeSource.value  || f.source  === activeSource.value
    return matchFormat && matchQuality && matchSource
  })
})

// ── 样式映射 ──────────────────────────────────────────
function fileIcon(format: string) {
  const map: Record<string, any> = {
    PDF: FileText, MD: FileText, Word: FileText,
    JPG: FileImage,
    MP3: Music, MP4: Video,
  }
  return map[format] ?? File
}

function fileIconColor(format: string) {
  const map: Record<string, string> = {
    PDF:  'text-red-500',
    MD:   'text-blue-500',
    Word: 'text-blue-600',
    JPG:  'text-green-500',
    MP3:  'text-purple-500',
    MP4:  'text-purple-600',
  }
  return map[format] ?? 'text-[var(--md-on-surface-variant)]'
}

function formatBadgeClass(format: string) {
  const map: Record<string, string> = {
    PDF:  'bg-red-100 text-red-700',
    MD:   'bg-blue-100 text-blue-700',
    Word: 'bg-blue-100 text-blue-700',
    JPG:  'bg-green-100 text-green-700',
    MP3:  'bg-purple-100 text-purple-700',
    MP4:  'bg-purple-100 text-purple-700',
  }
  return map[format] ?? 'bg-slate-100 text-slate-600'
}

function qualityBadgeClass(quality: string) {
  const map: Record<string, string> = {
    '高': 'bg-green-100 text-green-700',
    '中': 'bg-amber-100 text-amber-700',
    '低': 'bg-red-100 text-red-700',
  }
  return map[quality] ?? 'bg-slate-100 text-slate-600'
}

function sourceBadgeClass(source: string) {
  const map: Record<string, string> = {
    '官方开放': 'bg-blue-100 text-blue-700',
    '自采集':   'bg-purple-100 text-purple-700',
    '民间转载': 'bg-orange-100 text-orange-700',
  }
  return map[source] ?? 'bg-slate-100 text-slate-600'
}

// ── 操作 ──────────────────────────────────────────────
function handleEdit(id: number) {
  // TODO: 编辑弹窗
  console.log('edit', id)
}

function handleDelete(id: number) {
  if (!confirm('确认删除该文件？')) return
  files.value = files.value.filter(f => f.id !== id)
}

function handleUpload() {
  showUploadModal.value = false
  uploadForm.value = { quality: '', validUntil: '', source: '' }
}
</script>
