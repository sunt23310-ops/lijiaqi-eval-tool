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

    <div class="flex-1 overflow-y-auto p-6">
      <div class="bg-white rounded-2xl border border-[var(--md-outline-variant)] overflow-hidden">
        <!-- 分类 Tab + 筛选 -->
        <div class="px-6 py-3 flex items-center justify-between border-b border-[var(--md-outline-variant)]">
          <!-- 格式分段控件 -->
          <div class="flex items-center gap-1 bg-[#F1F5F9] rounded-lg p-[3px]">
            <button
              v-for="tab in formatTabs"
              :key="tab.value"
              @click="setFormat(tab.value)"
              class="px-3.5 py-1.5 rounded-md text-xs font-medium transition-all"
              :class="activeFormat === tab.value
                ? 'bg-white text-[var(--md-primary)] shadow-sm'
                : 'text-[#64748B] hover:text-[var(--md-on-surface)]'"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- 质量 + 来源筛选 chip -->
          <div class="flex items-center gap-2 flex-wrap">
            <button
              v-for="chip in qualityChips"
              :key="chip.value"
              @click="setQuality(chip.value)"
              class="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              :class="activeQuality === chip.value ? chip.activeClass : chip.inactiveClass"
            >
              {{ chip.label }}
            </button>
            <div v-if="dynamicSourceChips.length" class="w-px h-4 bg-[var(--md-outline-variant)]"></div>
            <button
              v-for="chip in dynamicSourceChips"
              :key="chip.value"
              @click="setSource(chip.value)"
              class="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              :class="activeSource === chip.value ? chip.activeClass : chip.inactiveClass"
            >
              {{ chip.label }}
            </button>
          </div>
        </div>

        <!-- 表头（可排序） -->
        <div class="flex items-center px-6 py-2 bg-[#F8FAFC] text-xs font-medium text-[var(--md-on-surface-variant)] border-b border-[var(--md-outline-variant)]">
          <div class="flex-1 min-w-0">文件名 / 来源信息</div>
          <div class="w-[76px] flex-shrink-0 text-center">格式</div>
          <button
            @click="toggleSort('quality')"
            class="w-[88px] flex-shrink-0 flex items-center justify-center gap-1 hover:text-[var(--md-primary)] transition cursor-pointer"
          >
            数据质量
            <component :is="sortIcon('quality')" :size="12" />
          </button>
          <button
            @click="toggleSort('validUntil')"
            class="w-[120px] flex-shrink-0 flex items-center justify-center gap-1 hover:text-[var(--md-primary)] transition cursor-pointer"
          >
            数据时效
            <component :is="sortIcon('validUntil')" :size="12" />
          </button>
          <button
            @click="toggleSort('source')"
            class="w-[110px] flex-shrink-0 flex items-center justify-center gap-1 hover:text-[var(--md-primary)] transition cursor-pointer"
          >
            数据来源
            <component :is="sortIcon('source')" :size="12" />
          </button>
          <div class="w-[80px] flex-shrink-0 text-center">操作</div>
        </div>

        <!-- 加载中 -->
        <div v-if="loading" class="flex items-center justify-center py-16 text-sm text-[var(--md-on-surface-variant)]">
          <Loader2 :size="20" class="animate-spin mr-2" />
          加载中...
        </div>

        <!-- 数据行 -->
        <div v-else>
          <div
            v-for="file in paginatedFiles"
            :key="file.id"
            class="flex items-center px-6 py-3.5 border-b border-[var(--md-outline-variant)] last:border-b-0 hover:bg-[#F8FAFC] transition-colors"
          >
            <!-- 文件名 -->
            <div class="flex-1 min-w-0 flex items-center gap-2.5">
              <component :is="fileIcon(file.format)" :size="18" :class="fileIconColor(file.format)" class="flex-shrink-0" />
              <button
                @click="openPreview(file)"
                class="text-sm font-medium text-[var(--md-on-surface)] truncate hover:text-[var(--md-primary)] hover:underline text-left"
                :title="file.name"
              >{{ file.name }}</button>
            </div>
            <!-- 格式 -->
            <div class="w-[76px] flex-shrink-0 flex justify-center">
              <span class="px-2 py-0.5 rounded text-xs font-semibold tracking-wide" :class="formatBadgeClass(file.format)">{{ file.format }}</span>
            </div>
            <!-- 质量 -->
            <div class="w-[88px] flex-shrink-0 flex justify-center">
              <span class="px-2.5 py-0.5 rounded text-xs font-medium" :class="qualityBadgeClass(file.quality)">{{ file.quality }}</span>
            </div>
            <!-- 时效性 -->
            <div class="w-[120px] flex-shrink-0 text-center">
              <span class="text-xs text-[var(--md-on-surface-variant)]">{{ file.validUntil }}</span>
            </div>
            <!-- 来源 -->
            <div class="w-[110px] flex-shrink-0 flex justify-center">
              <span class="px-2.5 py-0.5 rounded text-xs font-medium" :class="sourceBadgeClass(file.source)">{{ file.source }}</span>
            </div>
            <!-- 操作 -->
            <div class="w-[80px] flex-shrink-0 flex items-center justify-center gap-2">
              <button @click="openEdit(file)" class="p-1.5 rounded-lg hover:bg-[var(--md-surface-container-high)] transition">
                <Pencil :size="14" class="text-[var(--md-on-surface-variant)]" />
              </button>
              <button @click="handleDelete(file.id)" class="p-1.5 rounded-lg hover:bg-red-50 transition">
                <Trash2 :size="14" class="text-[var(--md-on-surface-variant)] hover:text-red-500" />
              </button>
            </div>
          </div>

          <div v-if="filteredFiles.length === 0" class="text-center py-16 text-sm text-[var(--md-on-surface-variant)]">
            暂无匹配文件
          </div>
        </div>

        <!-- 底部分页 -->
        <div class="px-6 py-3 flex items-center justify-between text-xs text-[var(--md-on-surface-variant)] border-t border-[var(--md-outline-variant)]">
          <span>共 {{ filteredFiles.length }} 个文件</span>
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

    <!-- 文件预览抽屉 -->
    <Transition name="drawer">
      <div v-if="previewFile" class="fixed inset-0 z-50 flex">
        <!-- 遮罩 -->
        <div class="flex-1 bg-black/30" @click="closePreview" />
        <!-- 抽屉主体 -->
        <div class="w-[600px] bg-white flex flex-col shadow-2xl">
          <!-- 抽屉头部 -->
          <div class="px-6 py-4 border-b border-[var(--md-outline-variant)] flex items-start gap-3 flex-shrink-0">
            <component :is="fileIcon(previewFile.format)" :size="20" :class="fileIconColor(previewFile.format)" class="flex-shrink-0 mt-0.5" />
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-semibold text-[var(--md-on-surface)] break-all leading-snug">{{ previewFile.name }}</h3>
              <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                <span class="px-2 py-0.5 rounded text-xs font-semibold" :class="formatBadgeClass(previewFile.format)">{{ previewFile.format }}</span>
                <span class="px-2 py-0.5 rounded text-xs font-medium" :class="qualityBadgeClass(previewFile.quality)">{{ previewFile.quality }}</span>
                <span class="px-2 py-0.5 rounded text-xs font-medium" :class="sourceBadgeClass(previewFile.source)">{{ previewFile.source }}</span>
                <span class="text-xs text-[var(--md-on-surface-variant)]">{{ previewFile.validUntil }}</span>
                <span v-if="previewFile.sizeBytes" class="text-xs text-[var(--md-on-surface-variant)]">{{ formatSize(previewFile.sizeBytes) }}</span>
              </div>
            </div>
            <button @click="closePreview" class="p-1.5 rounded-lg hover:bg-[var(--md-surface-container-high)] transition flex-shrink-0">
              <X :size="18" class="text-[var(--md-on-surface-variant)]" />
            </button>
          </div>
          <!-- 内容区 -->
          <div class="flex-1 overflow-y-auto px-6 py-5">
            <div v-if="previewLoading" class="flex items-center justify-center py-16 text-sm text-[var(--md-on-surface-variant)]">
              <Loader2 :size="20" class="animate-spin mr-2" />
              加载中...
            </div>
            <!-- 图片预览 -->
            <div v-else-if="previewIsImage" class="flex flex-col items-center gap-3">
              <img :src="previewContent" class="w-full rounded-xl object-contain" :alt="previewFile?.name" />
            </div>
            <!-- Markdown 预览 -->
            <div
              v-else-if="previewContent"
              class="prose prose-sm max-w-none text-[var(--md-on-surface)]"
              v-html="previewContent"
            />
            <!-- 音视频占位 -->
            <div v-else-if="previewFile?.format === 'MP3' || previewFile?.format === 'MP4'"
              class="flex flex-col items-center justify-center py-16 gap-3 text-[var(--md-on-surface-variant)]"
            >
              <component :is="fileIcon(previewFile.format)" :size="40" :class="fileIconColor(previewFile.format)" />
              <p class="text-sm font-medium">音视频文件暂不支持在线预览</p>
              <p v-if="previewFile.sizeBytes" class="text-xs">大小：{{ formatSize(previewFile.sizeBytes) }}</p>
            </div>
            <div v-else class="text-center py-16 text-sm text-[var(--md-on-surface-variant)]">
              暂无可预览内容
            </div>
          </div>
        </div>
      </div>
    </Transition>

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

        <!-- 文件选择区 -->
        <label class="block border-2 border-dashed border-[var(--md-outline-variant)] rounded-xl p-8 text-center space-y-2 hover:border-[var(--md-primary)] transition-colors cursor-pointer">
          <input type="file" multiple class="hidden" accept=".pdf,.md,.docx,.jpg,.jpeg,.mp3,.mp4" @change="onFileSelect" />
          <Upload :size="32" class="mx-auto text-[var(--md-on-surface-variant)]" />
          <p class="text-sm font-medium text-[var(--md-on-surface)]">
            {{ uploadForm.files.length ? `已选择 ${uploadForm.files.length} 个文件` : '点击选择文件' }}
          </p>
          <p class="text-xs text-[var(--md-on-surface-variant)]">支持 PDF、MD、DOCX、JPG、MP3、MP4</p>
        </label>

        <!-- 元数据 -->
        <div class="space-y-3">
          <div>
            <label class="text-xs font-medium text-[var(--md-on-surface-variant)] mb-1 block">数据质量等级</label>
            <select v-model="uploadForm.quality" class="w-full h-9 px-3 rounded-lg border border-[var(--md-outline-variant)] text-sm bg-white outline-none focus:border-[var(--md-primary)]">
              <option value="">请选择</option>
              <option>高</option>
              <option>中</option>
              <option>低</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-medium text-[var(--md-on-surface-variant)] mb-1 block">数据时效性（截止日期）</label>
            <input v-model="uploadForm.validUntil" type="date" class="w-full h-9 px-3 rounded-lg border border-[var(--md-outline-variant)] text-sm bg-white outline-none focus:border-[var(--md-primary)]" />
          </div>
          <div>
            <label class="text-xs font-medium text-[var(--md-on-surface-variant)] mb-1 block">数据来源</label>
            <!-- 自定义来源选择 -->
            <div v-if="!showNewSourceInput" class="flex gap-2">
              <select v-model="uploadForm.source" class="flex-1 h-9 px-3 rounded-lg border border-[var(--md-outline-variant)] text-sm bg-white outline-none focus:border-[var(--md-primary)]">
                <option value="">请选择</option>
                <option v-for="s in allSources" :key="s">{{ s }}</option>
              </select>
              <button
                @click="showNewSourceInput = true"
                class="h-9 px-3 rounded-lg border border-dashed border-[var(--md-outline-variant)] text-xs text-[var(--md-on-surface-variant)] hover:border-[var(--md-primary)] hover:text-[var(--md-primary)] transition flex items-center gap-1"
              >
                <Plus :size="14" />
                新建
              </button>
            </div>
            <div v-else class="flex gap-2">
              <input
                v-model="newSourceName"
                type="text"
                placeholder="输入新来源名称"
                class="flex-1 h-9 px-3 rounded-lg border border-[var(--md-primary)] text-sm bg-white outline-none ring-2 ring-[var(--md-primary)]/20"
                @keyup.enter="confirmNewSource"
              />
              <button
                @click="confirmNewSource"
                :disabled="!newSourceName.trim()"
                class="h-9 px-3 rounded-lg bg-[var(--md-primary)] text-[var(--md-on-primary)] text-xs font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                确认
              </button>
              <button
                @click="showNewSourceInput = false; newSourceName = ''"
                class="h-9 px-3 rounded-lg border border-[var(--md-outline-variant)] text-xs text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container-high)] transition"
              >
                取消
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-1">
          <button @click="showUploadModal = false" class="h-9 px-4 rounded-lg border border-[var(--md-outline-variant)] text-sm text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container-high)] transition">
            取消
          </button>
          <button
            @click="handleUpload"
            :disabled="uploading || !uploadForm.files.length || !uploadForm.quality || !uploadForm.source"
            class="h-9 px-4 rounded-lg bg-[var(--md-primary)] text-[var(--md-on-primary)] text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {{ uploading ? '上传中...' : '确认上传' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <div
      v-if="editFile"
      class="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      @click.self="editFile = null"
    >
      <div class="bg-white rounded-2xl shadow-xl w-[400px] p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-[var(--md-on-surface)]">编辑文件信息</h3>
          <button @click="editFile = null" class="p-1.5 rounded-lg hover:bg-[var(--md-surface-container-high)] transition">
            <X :size="18" class="text-[var(--md-on-surface-variant)]" />
          </button>
        </div>
        <div class="space-y-3">
          <div>
            <label class="text-xs font-medium text-[var(--md-on-surface-variant)] mb-1 block">数据质量等级</label>
            <select v-model="editForm.quality" class="w-full h-9 px-3 rounded-lg border border-[var(--md-outline-variant)] text-sm bg-white outline-none focus:border-[var(--md-primary)]">
              <option>高</option><option>中</option><option>低</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-medium text-[var(--md-on-surface-variant)] mb-1 block">数据时效性</label>
            <input v-model="editForm.validUntil" type="text" class="w-full h-9 px-3 rounded-lg border border-[var(--md-outline-variant)] text-sm bg-white outline-none focus:border-[var(--md-primary)]" />
          </div>
          <div>
            <label class="text-xs font-medium text-[var(--md-on-surface-variant)] mb-1 block">数据来源</label>
            <div v-if="!showEditSourceInput" class="flex gap-2">
              <select v-model="editForm.source" class="flex-1 h-9 px-3 rounded-lg border border-[var(--md-outline-variant)] text-sm bg-white outline-none focus:border-[var(--md-primary)]">
                <option v-for="s in allSources" :key="s">{{ s }}</option>
              </select>
              <button
                @click="showEditSourceInput = true"
                class="h-9 px-3 rounded-lg border border-dashed border-[var(--md-outline-variant)] text-xs text-[var(--md-on-surface-variant)] hover:border-[var(--md-primary)] hover:text-[var(--md-primary)] transition flex items-center gap-1"
              >
                <Plus :size="14" />
                新建
              </button>
            </div>
            <div v-else class="flex gap-2">
              <input
                v-model="editNewSourceName"
                type="text"
                placeholder="输入新来源名称"
                class="flex-1 h-9 px-3 rounded-lg border border-[var(--md-primary)] text-sm bg-white outline-none ring-2 ring-[var(--md-primary)]/20"
                @keyup.enter="confirmEditNewSource"
              />
              <button
                @click="confirmEditNewSource"
                :disabled="!editNewSourceName.trim()"
                class="h-9 px-3 rounded-lg bg-[var(--md-primary)] text-[var(--md-on-primary)] text-xs font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                确认
              </button>
              <button
                @click="showEditSourceInput = false; editNewSourceName = ''"
                class="h-9 px-3 rounded-lg border border-[var(--md-outline-variant)] text-xs text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container-high)] transition"
              >
                取消
              </button>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <button @click="editFile = null" class="h-9 px-4 rounded-lg border border-[var(--md-outline-variant)] text-sm text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container-high)] transition">
            取消
          </button>
          <button @click="handleEditSave" class="h-9 px-4 rounded-lg bg-[var(--md-primary)] text-[var(--md-on-primary)] text-sm font-medium hover:opacity-90 transition">
            保存
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Database, Upload, Pencil, Trash2, ChevronLeft, ChevronRight, X, Loader2,
  FileText, FileImage, Music, Video, File, Plus,
  ArrowUpDown, ChevronUp, ChevronDown,
} from 'lucide-vue-next'
import {
  listKnowledgeFiles, getKnowledgeFile, createKnowledgeFile, updateKnowledgeFile, deleteKnowledgeFile,
  } from '@/modules/management/api/knowledge-base'
import type { KnowledgeFile } from '@eval/shared'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({ html: false, linkify: true, typographer: true })

// ── 状态 ──────────────────────────────────────────────
const files       = ref<KnowledgeFile[]>([])
const loading     = ref(false)
const showUploadModal = ref(false)
const uploading   = ref(false)
const editFile    = ref<KnowledgeFile | null>(null)
const previewFile    = ref<KnowledgeFile | null>(null)
const previewContent = ref('')
const previewLoading = ref(false)
const previewIsImage = computed(() => previewContent.value.startsWith('data:image/'))

// ── 自定义来源 ────────────────────────────────────────
const PRESET_SOURCES = ['官方开放', '自采集', '民间转载']
const STORAGE_KEY = 'kb-custom-sources'

function loadCustomSources(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch { return [] }
}
function saveCustomSources(sources: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sources))
}

const customSources = ref<string[]>(loadCustomSources())
const allSources = computed(() => [...PRESET_SOURCES, ...customSources.value])

// 上传弹窗新建来源
const showNewSourceInput = ref(false)
const newSourceName = ref('')
function confirmNewSource() {
  const name = newSourceName.value.trim()
  if (!name || allSources.value.includes(name)) {
    showNewSourceInput.value = false
    if (name) uploadForm.value.source = name
    newSourceName.value = ''
    return
  }
  customSources.value.push(name)
  saveCustomSources(customSources.value)
  uploadForm.value.source = name
  showNewSourceInput.value = false
  newSourceName.value = ''
}

// 编辑弹窗新建来源
const showEditSourceInput = ref(false)
const editNewSourceName = ref('')
function confirmEditNewSource() {
  const name = editNewSourceName.value.trim()
  if (!name || allSources.value.includes(name)) {
    showEditSourceInput.value = false
    if (name) editForm.value.source = name
    editNewSourceName.value = ''
    return
  }
  customSources.value.push(name)
  saveCustomSources(customSources.value)
  editForm.value.source = name
  showEditSourceInput.value = false
  editNewSourceName.value = ''
}

// ── 筛选 ──────────────────────────────────────────────
const activeFormat  = ref('全部')
const activeQuality = ref('')
const activeSource  = ref('')
const currentPage   = ref(1)
const PER_PAGE      = 15

// ── 排序 ──────────────────────────────────────────────
type SortField = 'quality' | 'validUntil' | 'source' | ''
const sortField     = ref<SortField>('')
const sortDirection = ref<'asc' | 'desc'>('desc')

function toggleSort(field: SortField) {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'desc'
  }
  currentPage.value = 1
}

function sortIcon(field: SortField) {
  if (sortField.value !== field) return ArrowUpDown
  return sortDirection.value === 'asc' ? ChevronUp : ChevronDown
}

const QUALITY_ORDER: Record<string, number> = { '高': 3, '中': 2, '低': 1 }

function compareFiles(a: KnowledgeFile, b: KnowledgeFile): number {
  const field = sortField.value
  if (!field) return 0
  let cmp = 0
  if (field === 'quality') {
    cmp = (QUALITY_ORDER[a.quality] ?? 0) - (QUALITY_ORDER[b.quality] ?? 0)
  } else if (field === 'validUntil') {
    // "长期有效" sorts first (highest)
    const aVal = a.validUntil === '长期有效' ? '9999' : a.validUntil
    const bVal = b.validUntil === '长期有效' ? '9999' : b.validUntil
    cmp = aVal.localeCompare(bVal)
  } else if (field === 'source') {
    cmp = a.source.localeCompare(b.source)
  }
  return sortDirection.value === 'asc' ? cmp : -cmp
}

// ── 加载数据 ──────────────────────────────────────────
async function fetchFiles() {
  loading.value = true
  try {
    const res = await listKnowledgeFiles()
    if (res.code === 200) files.value = res.data
  } finally {
    loading.value = false
  }
}

onMounted(fetchFiles)

// ── 动态来源筛选 chips ──────────────────────────────────
const SOURCE_COLORS = [
  { activeClass: 'bg-blue-100 text-blue-700',    inactiveClass: 'bg-[#F1F5F9] text-[#64748B] hover:bg-blue-50' },
  { activeClass: 'bg-purple-100 text-purple-700', inactiveClass: 'bg-[#F1F5F9] text-[#64748B] hover:bg-purple-50' },
  { activeClass: 'bg-orange-100 text-orange-700', inactiveClass: 'bg-[#F1F5F9] text-[#64748B] hover:bg-orange-50' },
  { activeClass: 'bg-teal-100 text-teal-700',    inactiveClass: 'bg-[#F1F5F9] text-[#64748B] hover:bg-teal-50' },
  { activeClass: 'bg-pink-100 text-pink-700',    inactiveClass: 'bg-[#F1F5F9] text-[#64748B] hover:bg-pink-50' },
  { activeClass: 'bg-cyan-100 text-cyan-700',    inactiveClass: 'bg-[#F1F5F9] text-[#64748B] hover:bg-cyan-50' },
  { activeClass: 'bg-indigo-100 text-indigo-700', inactiveClass: 'bg-[#F1F5F9] text-[#64748B] hover:bg-indigo-50' },
]

const dynamicSourceChips = computed(() => {
  const sources = [...new Set(files.value.map(f => f.source))].sort()
  return sources.map((s, i) => ({
    label: s,
    value: s,
    ...SOURCE_COLORS[i % SOURCE_COLORS.length],
  }))
})

// ── 筛选重置分页 ──────────────────────────────────────
function setFormat(v: string)  { activeFormat.value = v;  currentPage.value = 1 }
function setQuality(v: string) { activeQuality.value = activeQuality.value === v ? '' : v; currentPage.value = 1 }
function setSource(v: string)  { activeSource.value  = activeSource.value  === v ? '' : v; currentPage.value = 1 }

// ── 过滤 + 排序 + 分页 ─────────────────────────────────
const filteredFiles = computed(() => files.value.filter(f => {
  const matchFormat  = activeFormat.value === '全部'
    || (activeFormat.value === 'AV' ? ['MP3', 'MP4'].includes(f.format) : f.format === activeFormat.value)
  const matchQuality = !activeQuality.value || f.quality === activeQuality.value
  const matchSource  = !activeSource.value  || f.source  === activeSource.value
  return matchFormat && matchQuality && matchSource
}))

const sortedFiles = computed(() => {
  if (!sortField.value) return filteredFiles.value
  return [...filteredFiles.value].sort(compareFiles)
})

const totalPages    = computed(() => Math.max(1, Math.ceil(sortedFiles.value.length / PER_PAGE)))
const paginatedFiles = computed(() => {
  const start = (currentPage.value - 1) * PER_PAGE
  return sortedFiles.value.slice(start, start + PER_PAGE)
})

// ── 上传表单 ──────────────────────────────────────────
const uploadForm = ref({ files: [] as File[], quality: '', validUntil: '', source: '' })

function onFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  uploadForm.value.files = Array.from(input.files ?? [])
}

function detectFormat(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const map: Record<string, string> = { pdf: 'PDF', md: 'MD', docx: 'Word', jpg: 'JPG', jpeg: 'JPG', mp3: 'MP3', mp4: 'MP4' }
  return map[ext ?? ''] ?? 'MD'
}

async function handleUpload() {
  if (!uploadForm.value.files.length || !uploadForm.value.quality || !uploadForm.value.source) return
  uploading.value = true
  try {
    for (const f of uploadForm.value.files) {
      const validUntil = uploadForm.value.validUntil
        ? `至 ${uploadForm.value.validUntil}`
        : '长期有效'
      await createKnowledgeFile({
        name: f.name,
        format: detectFormat(f.name),
        quality: uploadForm.value.quality,
        validUntil,
        source: uploadForm.value.source,
        sizeBytes: f.size,
      })
    }
    await fetchFiles()
    showUploadModal.value = false
    uploadForm.value = { files: [], quality: '', validUntil: '', source: '' }
    showNewSourceInput.value = false
    newSourceName.value = ''
  } finally {
    uploading.value = false
  }
}

// ── 编辑表单 ──────────────────────────────────────────
const editForm = ref({ quality: '高', validUntil: '', source: '官方开放' })

function openEdit(file: KnowledgeFile) {
  editFile.value = file
  editForm.value = { quality: file.quality, validUntil: file.validUntil, source: file.source }
  showEditSourceInput.value = false
  editNewSourceName.value = ''
}

async function handleEditSave() {
  if (!editFile.value) return
  await updateKnowledgeFile(editFile.value.id, {
    quality: editForm.value.quality,
    validUntil: editForm.value.validUntil,
    source: editForm.value.source,
  })
  await fetchFiles()
  editFile.value = null
}

// ── 删除 ──────────────────────────────────────────────
async function handleDelete(id: number) {
  if (!confirm('确认删除该文件记录？')) return
  await deleteKnowledgeFile(id)
  await fetchFiles()
  if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
}

// ── 文件预览 ──────────────────────────────────────────
async function openPreview(file: KnowledgeFile) {
  previewFile.value = file
  previewContent.value = ''
  previewLoading.value = true
  try {
    const res = await getKnowledgeFile(file.id)
    if (res.code === 200 && res.data.content) {
      if (res.data.content.startsWith('data:image/')) {
        previewContent.value = res.data.content
      } else {
        previewContent.value = md.render(res.data.content)
      }
    }
  } finally {
    previewLoading.value = false
  }
}

function closePreview() {
  previewFile.value = null
  previewContent.value = ''
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

// ── 样式映射 ──────────────────────────────────────────
const formatTabs = [
  { label: '全部',     value: '全部' },
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

function fileIcon(format: string) {
  const map: Record<string, any> = { PDF: FileText, MD: FileText, Word: FileText, JPG: FileImage, MP3: Music, MP4: Video }
  return map[format] ?? File
}

function fileIconColor(format: string) {
  const map: Record<string, string> = { PDF: 'text-red-500', MD: 'text-blue-500', Word: 'text-blue-600', JPG: 'text-green-500', MP3: 'text-purple-500', MP4: 'text-purple-600' }
  return map[format] ?? 'text-[var(--md-on-surface-variant)]'
}

function formatBadgeClass(format: string) {
  const map: Record<string, string> = { PDF: 'bg-red-100 text-red-700', MD: 'bg-blue-100 text-blue-700', Word: 'bg-blue-100 text-blue-700', JPG: 'bg-green-100 text-green-700', MP3: 'bg-purple-100 text-purple-700', MP4: 'bg-purple-100 text-purple-700' }
  return map[format] ?? 'bg-slate-100 text-slate-600'
}

function qualityBadgeClass(quality: string) {
  const map: Record<string, string> = { '高': 'bg-green-100 text-green-700', '中': 'bg-amber-100 text-amber-700', '低': 'bg-red-100 text-red-700' }
  return map[quality] ?? 'bg-slate-100 text-slate-600'
}

function sourceBadgeClass(source: string) {
  // 预设来源有固定颜色
  const presetMap: Record<string, string> = {
    '官方开放': 'bg-blue-100 text-blue-700',
    '自采集': 'bg-purple-100 text-purple-700',
    '民间转载': 'bg-orange-100 text-orange-700',
  }
  if (presetMap[source]) return presetMap[source]
  // 自定义来源按索引分配颜色
  const idx = customSources.value.indexOf(source)
  const colors = ['bg-teal-100 text-teal-700', 'bg-pink-100 text-pink-700', 'bg-cyan-100 text-cyan-700', 'bg-indigo-100 text-indigo-700']
  return colors[idx % colors.length] || 'bg-slate-100 text-slate-600'
}
</script>

<style scoped>
/* 抽屉滑入动画 */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.2s ease;
}
.drawer-enter-active .drawer-panel,
.drawer-leave-active .drawer-panel {
  transition: transform 0.25s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

/* Markdown 内容样式 */
:deep(.prose) {
  line-height: 1.75;
  color: var(--md-on-surface);
}
:deep(.prose h1) { font-size: 1.25rem; font-weight: 700; margin: 1.25rem 0 0.75rem; color: var(--md-on-surface); }
:deep(.prose h2) { font-size: 1.1rem;  font-weight: 600; margin: 1rem 0 0.5rem;    color: var(--md-on-surface); border-bottom: 1px solid var(--md-outline-variant); padding-bottom: 0.35rem; }
:deep(.prose h3) { font-size: 0.95rem; font-weight: 600; margin: 0.875rem 0 0.4rem; color: var(--md-on-surface); }
:deep(.prose p)  { margin: 0.5rem 0; font-size: 0.875rem; }
:deep(.prose ul),
:deep(.prose ol) { margin: 0.5rem 0; padding-left: 1.5rem; font-size: 0.875rem; }
:deep(.prose li) { margin: 0.25rem 0; }
:deep(.prose strong) { font-weight: 600; color: var(--md-on-surface); }
:deep(.prose hr) { border-color: var(--md-outline-variant); margin: 1rem 0; }
:deep(.prose table) { width: 100%; border-collapse: collapse; font-size: 0.8rem; margin: 0.75rem 0; }
:deep(.prose th) { background: #F8FAFC; font-weight: 600; padding: 0.4rem 0.75rem; border: 1px solid var(--md-outline-variant); text-align: left; }
:deep(.prose td) { padding: 0.4rem 0.75rem; border: 1px solid var(--md-outline-variant); }
:deep(.prose code) { background: #F1F5F9; padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.8rem; font-family: 'JetBrains Mono', monospace; }
:deep(.prose blockquote) { border-left: 3px solid var(--md-primary); padding-left: 1rem; color: var(--md-on-surface-variant); font-style: italic; margin: 0.75rem 0; }
</style>
