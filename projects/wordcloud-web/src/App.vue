<template>
  <div class="app">
    <div class="app-content">
      <div class="control-panel">
        <ControlPanel
          :config="config"
          @update:config="updateConfig"
          @generate="generateWordCloud"
          @export="exportWordCloud"
        />
      </div>
      
      <div class="canvas-container">
        <WordCloudCanvas
          :config="config"
          :words="words"
          :is-generating="isGenerating"
          @export="exportWordCloud"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import ControlPanel from './components/ControlPanel.vue'
import WordCloudCanvas from './components/WordCloudCanvas.vue'
import type { WordCloudConfig, WordCloudElement } from './types'

// 响应式数据
const isGenerating = ref(false)

// 词云配置
const config = reactive<WordCloudConfig>({
  width: 800,
  height: 600,
  fontFamily: 'Arial, sans-serif',
  fontSizeRange: [12, 48],
  rotationRange: [-45, 45],
  rotationMode: 'range',
  backgroundColor: '#ffffff',
  colorScheme: 'default',
  layoutAlgorithm: 'spiral',
  padding: 10,
  spiral: 'archimedean',
  enableAnimation: false,
  animationType: 'fade',
  animationDuration: 1000,
  progressiveRendering: false
})

// 词云元素
const words = ref<WordCloudElement[]>([])

// 更新配置
function updateConfig(newConfig: WordCloudConfig) {
  Object.assign(config, newConfig)
}

// 生成词云
function generateWordCloud() {
  if (words.value.length === 0) {
    alert('请先分析文本内容')
    return
  }
  
  isGenerating.value = true
  
  // 这里应该调用实际的词云生成逻辑
  // 目前只是模拟
  setTimeout(() => {
    isGenerating.value = false
    console.log('词云生成完成')
  }, 1000)
}

// 导出词云
function exportWordCloud(format: 'png' | 'svg') {
  console.log('导出词云:', format)
  // 这里应该调用 WordCloudCanvas 的导出方法
}
</script>

<style>
/* 全局样式已通过 UnoCSS 处理 */
</style>