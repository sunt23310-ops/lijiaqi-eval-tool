<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center"
      >
        <!-- 遮罩：点击背景关闭弹窗 -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('update:modelValue', false)" />

        <!-- 弹窗 -->
        <div class="relative w-[520px] max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl flex flex-col">
          <!-- Header -->
          <div class="px-7 pt-7 pb-5 border-b border-[var(--md-outline-variant)] flex items-center justify-between flex-shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-[var(--md-primary-container)] flex items-center justify-center">
                <ShieldAlert :size="18" class="text-[var(--md-primary)]" />
              </div>
              <h3 class="text-base font-semibold text-[var(--md-on-surface)]">添加敏感词</h3>
            </div>
            <button
              @click="$emit('update:modelValue', false)"
              class="p-2 rounded-lg hover:bg-[var(--md-surface-container-high)] transition text-[var(--md-on-surface-variant)]"
            >
              <X :size="18" />
            </button>
          </div>

          <!-- Body -->
          <div class="px-7 py-6 space-y-6 flex-1">

            <!-- 敏感词内容 -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-[var(--md-on-surface)]">
                敏感词内容 <span class="text-[var(--md-error)]">*</span>
              </label>
              <textarea
                v-model="form.name"
                rows="3"
                placeholder="请输入敏感词，多个词请换行分隔..."
                class="w-full px-4 py-3 rounded-xl border border-[var(--md-outline-variant)] bg-[var(--md-surface)] text-sm text-[var(--md-on-surface)] placeholder:text-[var(--md-on-surface-variant)] resize-none outline-none focus:border-[var(--md-primary)] focus:ring-2 focus:ring-[var(--md-primary)]/20 transition"
              />
            </div>

            <!-- 词汇分类 -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-[var(--md-on-surface)]">词汇分类</label>
              <div class="flex items-center gap-2 flex-wrap">
                <button
                  v-for="cat in categories"
                  :key="cat"
                  @click="form.category = cat"
                  class="px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
                  :class="form.category === cat
                    ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-primary)]'
                    : 'border-[var(--md-outline-variant)] text-[var(--md-on-surface-variant)] hover:border-[var(--md-outline)]'"
                >
                  {{ cat }}
                </button>
              </div>
            </div>

            <!-- 风险处置策略 -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-[var(--md-on-surface)]">风险处置策略</label>
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="opt in riskOptions"
                  :key="opt.risk"
                  @click="form.risk = opt.risk"
                  class="flex flex-col gap-1.5 p-4 rounded-2xl border-2 text-left transition-all"
                  :class="form.risk === opt.risk ? opt.activeClass : opt.inactiveClass"
                >
                  <span class="text-xs font-semibold" :class="form.risk === opt.risk ? opt.labelColor : 'text-[var(--md-on-surface-variant)]'">
                    {{ opt.risk }}
                  </span>
                  <span class="text-[10px]" :class="form.risk === opt.risk ? opt.subColor : 'text-[var(--md-on-surface-variant)]'">
                    → {{ opt.action }}
                  </span>
                </button>
              </div>
            </div>

            <!-- 备注 -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-[var(--md-on-surface)]">
                备注
                <span class="text-xs font-normal text-[var(--md-on-surface-variant)] ml-1">（可选）</span>
              </label>
              <textarea
                v-model="form.remark"
                rows="2"
                placeholder="添加备注信息..."
                class="w-full px-4 py-3 rounded-xl border border-[var(--md-outline-variant)] bg-[var(--md-surface)] text-sm text-[var(--md-on-surface)] placeholder:text-[var(--md-on-surface-variant)] resize-none outline-none focus:border-[var(--md-primary)] focus:ring-2 focus:ring-[var(--md-primary)]/20 transition"
              />
            </div>
          </div>

          <!-- Footer -->
          <div class="px-7 py-5 border-t border-[var(--md-outline-variant)] flex items-center justify-end gap-3 flex-shrink-0">
            <button
              @click="$emit('update:modelValue', false)"
              class="px-5 py-2.5 rounded-xl border border-[var(--md-outline-variant)] text-sm font-medium text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)] transition"
            >
              取消
            </button>
            <button
              @click="handleConfirm"
              :disabled="!form.name.trim()"
              class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--md-primary)] text-[var(--md-on-primary)] text-sm font-medium hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CirclePlus :size="16" />
              确认添加
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { ShieldAlert, X, CirclePlus } from 'lucide-vue-next'

// ── Props / Emits ─────────────────────────────────────
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [data: { name: string; category: string; risk: string; remark: string }]
}>()

// ── 表单 ──────────────────────────────────────────────
const defaultForm = () => ({ name: '', category: '违禁词', risk: '高风险', remark: '' })
const form = reactive(defaultForm())

// 弹窗关闭时重置表单
watch(() => props.modelValue, (val) => {
  if (!val) Object.assign(form, defaultForm())
})

// ── 选项 ──────────────────────────────────────────────
const categories = ['违禁词', '竞品词', '敏感话题', '其他']

const riskOptions = [
  {
    risk: '高风险', action: '直接拦截',
    activeClass:   'border-red-400 bg-red-50',
    inactiveClass: 'border-[var(--md-outline-variant)] hover:border-red-300 hover:bg-red-50/50',
    labelColor: 'text-red-700',
    subColor:   'text-red-500',
  },
  {
    risk: '中风险', action: '降级回复',
    activeClass:   'border-amber-400 bg-amber-50',
    inactiveClass: 'border-[var(--md-outline-variant)] hover:border-amber-300 hover:bg-amber-50/50',
    labelColor: 'text-amber-700',
    subColor:   'text-amber-500',
  },
  {
    risk: '低风险', action: '警告继续',
    activeClass:   'border-green-400 bg-green-50',
    inactiveClass: 'border-[var(--md-outline-variant)] hover:border-green-300 hover:bg-green-50/50',
    labelColor: 'text-green-700',
    subColor:   'text-green-500',
  },
]

// ── 提交 ──────────────────────────────────────────────
function handleConfirm() {
  if (!form.name.trim()) return
  emit('confirm', { ...form })
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: translateY(16px);
  opacity: 0;
}
</style>
