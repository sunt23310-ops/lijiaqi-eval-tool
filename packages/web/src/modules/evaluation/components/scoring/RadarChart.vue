<template>
  <div ref="chartRef" class="w-full h-[240px]" />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts/core'
import { RadarChart as ERadarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([ERadarChart, TitleComponent, TooltipComponent, CanvasRenderer])

const props = defineProps<{
  scores: { name: string; value: number }[]
}>()

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

function renderChart() {
  if (!chartRef.value) return
  if (!chart) {
    chart = echarts.init(chartRef.value)
  }

  chart.setOption({
    radar: {
      indicator: props.scores.map((s) => ({ name: s.name, max: 10 })),
      shape: 'polygon',
      radius: '65%',
      axisName: {
        color: '#49454F',
        fontSize: 11,
      },
      splitArea: { show: false },
      splitLine: { lineStyle: { color: '#CAC4D0' } },
      axisLine: { lineStyle: { color: '#CAC4D0' } },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: props.scores.map((s) => s.value),
            name: '评分',
            areaStyle: { color: 'rgba(103, 80, 164, 0.15)' },
            lineStyle: { color: '#6750A4', width: 2 },
            itemStyle: { color: '#6750A4' },
          },
        ],
      },
    ],
  })
}

onMounted(renderChart)
watch(() => props.scores, renderChart, { deep: true })
</script>
