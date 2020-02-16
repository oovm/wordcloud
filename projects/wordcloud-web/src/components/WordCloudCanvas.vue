<template>
  <div class="card h-full">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-medium text-gray-900 flex items-center">
        <Icon icon="carbon:chart-bubble" class="w-5 h-5 mr-2" />
        词云画布
      </h3>
      
      <div class="flex items-center space-x-2">
        <!-- 缩放控制 -->
        <div class="flex items-center space-x-1 text-sm text-gray-600">
          <button
            @click="zoomOut"
            class="btn-icon"
            :disabled="zoom <= 0.5"
          >
            <Icon icon="carbon:zoom-out" class="w-4 h-4" />
          </button>
          
          <span class="px-2 py-1 bg-gray-100 rounded text-xs min-w-12 text-center">
            {{ Math.round(zoom * 100) }}%
          </span>
          
          <button
            @click="zoomIn"
            class="btn-icon"
            :disabled="zoom >= 2"
          >
            <Icon icon="carbon:zoom-in" class="w-4 h-4" />
          </button>
        </div>
        
        <!-- 重置视图 -->
        <button
          @click="resetView"
          class="btn-secondary text-sm"
        >
          <Icon icon="carbon:reset" class="w-4 h-4 mr-1" />
          重置
        </button>
      </div>
    </div>
    
    <!-- 画布容器 -->
    <div
      ref="canvasContainer"
      class="relative bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
      :style="{ height: canvasHeight + 'px' }"
      @wheel="handleWheel"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
    >
      <!-- 空状态 -->
      <div
        v-if="!elements.length && !isGenerating"
        class="absolute inset-0 flex-center text-gray-500"
      >
        <div class="text-center">
          <Icon icon="carbon:cloud" class="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p class="text-lg font-medium mb-2">暂无词云内容</p>
          <p class="text-sm">请在左侧输入文本并点击"生成词云"</p>
        </div>
      </div>
      
      <!-- 生成中状态 -->
      <div
        v-if="isGenerating"
        class="absolute inset-0 flex-center bg-white bg-opacity-90"
      >
        <div class="text-center">
          <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p class="text-gray-600">正在生成词云...</p>
          <div class="w-48 bg-gray-200 rounded-full h-2 mt-2">
            <div
              class="bg-blue-500 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
        </div>
      </div>
      
      <!-- SVG 画布 -->
      <svg
        ref="svgCanvas"
        class="absolute inset-0 w-full h-full cursor-move"
        :viewBox="viewBox"
        :style="{
          transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
          transformOrigin: 'center'
        }"
      >
        <!-- 背景 -->
        <rect
          :width="config.width"
          :height="config.height"
          :fill="config.backgroundColor"
          stroke="#e5e7eb"
          stroke-width="1"
        />
        
        <!-- 遮罩定义 -->
        <defs v-if="maskImage">
          <mask id="wordcloud-mask">
            <rect :width="config.width" :height="config.height" fill="white" />
            <image
              :href="maskImage"
              :width="config.width"
              :height="config.height"
              preserveAspectRatio="xMidYMid slice"
            />
          </mask>
        </defs>
        
        <!-- 词云元素组 -->
        <g :mask="maskImage ? 'url(#wordcloud-mask)' : undefined">
          <!-- 文本元素 -->
          <text
            v-for="(element, index) in visibleElements"
            :key="`text-${index}`"
            :x="element.x"
            :y="element.y"
            :font-size="element.fontSize"
            :font-family="element.fontFamily"
            :fill="element.color"
            :transform="`rotate(${element.rotation || 0}, ${element.x}, ${element.y})`"
            :opacity="element.opacity || 1"
            text-anchor="middle"
            dominant-baseline="middle"
            class="select-none cursor-pointer transition-all duration-200 hover:opacity-80"
            @click="handleElementClick(element, index)"
            @mouseenter="handleElementHover(element, index, true)"
            @mouseleave="handleElementHover(element, index, false)"
          >
            {{ element.text }}
          </text>
          
          <!-- 图片元素 -->
          <image
            v-for="(element, index) in imageElements"
            :key="`image-${index}`"
            :x="element.x - element.width / 2"
            :y="element.y - element.height / 2"
            :width="element.width"
            :height="element.height"
            :href="element.imageUrl"
            :opacity="element.opacity || 1"
            :transform="`rotate(${element.rotation || 0}, ${element.x}, ${element.y})`"
            class="cursor-pointer transition-all duration-200 hover:opacity-80"
            @click="handleElementClick(element, index)"
          />
        </g>
        
        <!-- 网格线（调试模式） -->
        <g v-if="showGrid" opacity="0.1">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#000" stroke-width="1"/>
            </pattern>
          </defs>
          <rect :width="config.width" :height="config.height" fill="url(#grid)" />
        </g>
      </svg>
      
      <!-- 工具提示 -->
      <div
        v-if="tooltip.visible"
        class="absolute bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded pointer-events-none z-10"
        :style="{
          left: tooltip.x + 'px',
          top: tooltip.y + 'px',
          transform: 'translate(-50%, -100%)'
        }"
      >
        {{ tooltip.text }}
      </div>
    </div>
    
    <!-- 统计信息 -->
    <div class="mt-4 grid grid-cols-3 gap-4 text-sm text-gray-600">
      <div class="text-center">
        <div class="font-medium text-gray-900">{{ elements.length }}</div>
        <div>词语数量</div>
      </div>
      <div class="text-center">
        <div class="font-medium text-gray-900">{{ Math.round(zoom * 100) }}%</div>
        <div>缩放比例</div>
      </div>
      <div class="text-center">
        <div class="font-medium text-gray-900">{{ renderTime }}ms</div>
        <div>渲染时间</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import type { WordCloudConfig, WordCloudElement, ExportOptions } from '../types'

// Props
interface Props {
  config: WordCloudConfig
  elements: WordCloudElement[]
  isGenerating: boolean
  progress: number
}

const props = defineProps<Props>()

// Emits
interface Emits {
  'generation-complete': []
}

const emit = defineEmits<Emits>()

// 响应式数据
const canvasContainer = ref<HTMLDivElement>()
const svgCanvas = ref<SVGSVGElement>()
const zoom = ref(1)
const panX = ref(0)
const panY = ref(0)
const isDragging = ref(false)
const lastMousePos = ref({ x: 0, y: 0 })
const showGrid = ref(false)
const maskImage = ref<string>()
const renderTime = ref(0)

// 工具提示
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  text: ''
})

// 计算属性
const canvasHeight = computed(() => {
  const containerWidth = 800 // 假设容器宽度
  const aspectRatio = props.config.height / props.config.width
  return Math.min(600, containerWidth * aspectRatio)
})

const viewBox = computed(() => {
  return `0 0 ${props.config.width} ${props.config.height}`
})

const visibleElements = computed(() => {
  return props.elements.filter(el => el.type === 'text')
})

const imageElements = computed(() => {
  return props.elements.filter(el => el.type === 'image')
})

// 缩放控制
const zoomIn = () => {
  zoom.value = Math.min(2, zoom.value + 0.1)
}

const zoomOut = () => {
  zoom.value = Math.max(0.5, zoom.value - 0.1)
}

const resetView = () => {
  zoom.value = 1
  panX.value = 0
  panY.value = 0
}

// 鼠标事件处理
const handleWheel = (event: WheelEvent) => {
  event.preventDefault()
  const delta = event.deltaY > 0 ? -0.1 : 0.1
  zoom.value = Math.max(0.5, Math.min(2, zoom.value + delta))
}

const handleMouseDown = (event: MouseEvent) => {
  isDragging.value = true
  lastMousePos.value = { x: event.clientX, y: event.clientY }
}

const handleMouseMove = (event: MouseEvent) => {
  if (isDragging.value) {
    const deltaX = event.clientX - lastMousePos.value.x
    const deltaY = event.clientY - lastMousePos.value.y
    
    panX.value += deltaX / zoom.value
    panY.value += deltaY / zoom.value
    
    lastMousePos.value = { x: event.clientX, y: event.clientY }
  }
}

const handleMouseUp = () => {
  isDragging.value = false
}

// 元素交互
const handleElementClick = (element: WordCloudElement, index: number) => {
  console.log('点击元素:', element)
  // 可以添加元素编辑功能
}

const handleElementHover = (element: WordCloudElement, index: number, isEnter: boolean) => {
  if (isEnter) {
    tooltip.value = {
      visible: true,
      x: element.x,
      y: element.y - 20,
      text: `${element.text} (${element.fontSize}px)`
    }
  } else {
    tooltip.value.visible = false
  }
}

// 导出功能
const exportWordCloud = (options: ExportOptions) => {
  const startTime = performance.now()
  
  try {
    if (options.format === 'svg') {
      exportAsSVG(options)
    } else {
      exportAsImage(options)
    }
  } catch (error) {
    console.error('导出失败:', error)
    alert('导出失败，请重试')
  } finally {
    renderTime.value = Math.round(performance.now() - startTime)
  }
}

const exportAsSVG = (options: ExportOptions) => {
  if (!svgCanvas.value) return
  
  const svgData = new XMLSerializer().serializeToString(svgCanvas.value)
  const blob = new Blob([svgData], { type: 'image/svg+xml' })
  downloadBlob(blob, 'wordcloud.svg')
}

const exportAsImage = (options: ExportOptions) => {
  if (!svgCanvas.value) return
  
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  const scale = options.scale || 1
  canvas.width = props.config.width * scale
  canvas.height = props.config.height * scale
  
  // 设置背景
  if (!options.transparent) {
    ctx.fillStyle = props.config.backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  
  // 渲染文本元素
  visibleElements.value.forEach(element => {
    ctx.save()
    ctx.translate(element.x * scale, element.y * scale)
    ctx.rotate((element.rotation || 0) * Math.PI / 180)
    ctx.font = `${element.fontSize! * scale}px ${element.fontFamily}`
    ctx.fillStyle = element.color || '#000'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(element.text || '', 0, 0)
    ctx.restore()
  })
  
  // 导出图片
  canvas.toBlob((blob) => {
    if (blob) {
      downloadBlob(blob, `wordcloud.${options.format}`)
    }
  }, `image/${options.format}`, options.quality || 0.9)
}

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 暴露方法给父组件
defineExpose({
  exportWordCloud,
  resetView,
  zoomIn,
  zoomOut
})

// 监听元素变化
watch(() => props.elements, () => {
  nextTick(() => {
    emit('generation-complete')
  })
}, { deep: true })

// 键盘快捷键
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case '=':
      case '+':
        event.preventDefault()
        zoomIn()
        break
      case '-':
        event.preventDefault()
        zoomOut()
        break
      case '0':
        event.preventDefault()
        resetView()
        break
      case 'g':
        event.preventDefault()
        showGrid.value = !showGrid.value
        break
    }
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.btn-icon {
  @apply p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>