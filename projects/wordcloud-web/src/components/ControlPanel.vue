<template>
  <div class="control-panel">
    <div class="panel-header">
      <h2 class="text-xl font-bold text-gray-800">词云生成器</h2>
      <button @click="showHelp = true" class="help-btn">
        <Icon icon="carbon:help" class="w-5 h-5" />
      </button>
    </div>

    <!-- 文本分析器 -->
    <TextAnalyzer @words-analyzed="handleWordsAnalyzed" />
    
    <!-- 基础配置 -->
    <div class="card">
      <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <Icon icon="carbon:settings" class="w-5 h-5 mr-2" />
        基础配置
      </h3>
      
      <div class="space-y-4">
        <!-- 画布尺寸 -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              宽度
            </label>
            <input
              v-model.number="localConfig.width"
              type="number"
              class="input-field"
              min="400"
              max="2000"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              高度
            </label>
            <input
              v-model.number="localConfig.height"
              type="number"
              class="input-field"
              min="300"
              max="1500"
            />
          </div>
        </div>
        
        <!-- 字体大小范围 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            字体大小范围: {{ localConfig.fontSizeRange[0] }} - {{ localConfig.fontSizeRange[1] }}
          </label>
          <div class="grid grid-cols-2 gap-4">
            <input
              v-model.number="localConfig.fontSizeRange[0]"
              type="range"
              min="8"
              max="24"
              class="range-slider"
            />
            <input
              v-model.number="localConfig.fontSizeRange[1]"
              type="range"
              min="24"
              max="72"
              class="range-slider"
            />
          </div>
        </div>
        
        <!-- 字体家族 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            字体
          </label>
          <select v-model="localConfig.fontFamily" class="input-field">
            <option value="Arial, sans-serif">Arial</option>
            <option value="'Microsoft YaHei', sans-serif">微软雅黑</option>
            <option value="'SimHei', sans-serif">黑体</option>
            <option value="'Times New Roman', serif">Times New Roman</option>
            <option value="'Courier New', monospace">Courier New</option>
          </select>
        </div>
        
        <!-- 背景颜色 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            背景颜色
          </label>
          <input
            v-model="localConfig.backgroundColor"
            type="color"
            class="w-full h-10 rounded border border-gray-300"
          />
        </div>
      </div>
    </div>
    
    <!-- 高级配置 -->
    <div class="card">
      <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <Icon icon="carbon:settings-adjust" class="w-5 h-5 mr-2" />
        高级配置
      </h3>
      
      <div class="space-y-4">
        <!-- 旋转角度模式 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            旋转角度模式
          </label>
          <div class="flex gap-4">
            <label class="flex items-center">
              <input
                v-model="localConfig.rotationMode"
                type="radio"
                value="range"
                class="radio"
              />
              <span class="ml-2 text-sm text-gray-700">范围随机</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="localConfig.rotationMode"
                type="radio"
                value="set"
                class="radio"
              />
              <span class="ml-2 text-sm text-gray-700">集合随机</span>
            </label>
          </div>
        </div>
        
        <!-- 范围随机配置 -->
        <div v-if="localConfig.rotationMode === 'range'">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            旋转角度范围: {{ localConfig.rotationRange[0] }}° - {{ localConfig.rotationRange[1] }}°
          </label>
          <div class="grid grid-cols-2 gap-4">
            <input
              v-model.number="localConfig.rotationRange[0]"
              type="range"
              min="-90"
              max="0"
              class="range-slider"
            />
            <input
              v-model.number="localConfig.rotationRange[1]"
              type="range"
              min="0"
              max="90"
              class="range-slider"
            />
          </div>
        </div>
        
        <!-- 集合随机配置 -->
        <div v-if="localConfig.rotationMode === 'set'">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            角度集合 (用逗号分隔，如: -45, 0, 45)
          </label>
          <input
            v-model="rotationAnglesInput"
            type="text"
            class="input-field"
            placeholder="-45, 0, 45"
            @input="updateRotationAngles"
          />
          <div v-if="localConfig.rotationAngles?.length" class="mt-2">
            <div class="flex flex-wrap gap-2">
              <span
                v-for="angle in localConfig.rotationAngles"
                :key="angle"
                class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
              >
                {{ angle }}°
              </span>
            </div>
          </div>
        </div>
        
        <!-- 颜色方案 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            颜色方案
          </label>
          <select v-model="localConfig.colorScheme" class="input-field">
            <option value="default">默认</option>
            <option value="warm">暖色调</option>
            <option value="cool">冷色调</option>
            <option value="rainbow">彩虹</option>
            <option value="monochrome">单色</option>
          </select>
        </div>
        
        <!-- 布局算法 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            布局算法
          </label>
          <select v-model="localConfig.layoutAlgorithm" class="input-field">
            <option value="spiral">螺旋布局</option>
            <option value="grid">网格布局</option>
            <option value="random">随机布局</option>
          </select>
        </div>
        
        <!-- 开关选项 -->
        <div class="space-y-3">
          <label class="flex items-center">
            <input
              v-model="localConfig.progressiveRendering"
              type="checkbox"
              class="checkbox"
            />
            <span class="ml-2 text-sm text-gray-700">渐进式渲染</span>
          </label>
          
          <label class="flex items-center">
            <input
              v-model="localConfig.enableAnimation"
              type="checkbox"
              class="checkbox"
            />
            <span class="ml-2 text-sm text-gray-700">启用动画</span>
          </label>
        </div>
        
        <!-- 动画配置 -->
        <div v-if="localConfig.enableAnimation" class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              动画类型
            </label>
            <select v-model="localConfig.animationType" class="input-field">
              <option value="fade">淡入</option>
              <option value="scale">缩放</option>
              <option value="slide">滑入</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              动画时长: {{ localConfig.animationDuration }}ms
            </label>
            <input
              v-model.number="localConfig.animationDuration"
              type="range"
              min="500"
              max="3000"
              step="100"
              class="range-slider"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- 图片设置 -->
    <div class="card">
      <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <Icon icon="carbon:image" class="w-5 h-5 mr-2" />
        图片设置
      </h3>
      
      <div class="space-y-4">
        <!-- 遮罩图片 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            遮罩图片
          </label>
          <div class="upload-area" @click="triggerMaskUpload">
            <input
              ref="maskInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleMaskUpload"
            />
            <div v-if="!localConfig.maskImage" class="upload-placeholder">
              <Icon icon="carbon:cloud-upload" class="w-8 h-8 text-gray-400 mb-2" />
              <span class="text-sm text-gray-500">点击上传遮罩图片</span>
            </div>
            <div v-else class="uploaded-image">
              <img :src="localConfig.maskImage" alt="遮罩图片" class="preview-image" />
              <button @click.stop="removeMaskImage" class="remove-btn">
                <Icon icon="carbon:close" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <!-- 参考图片 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            参考图片
          </label>
          <div class="upload-area" @click="triggerReferenceUpload">
            <input
              ref="referenceInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleReferenceUpload"
            />
            <div v-if="!localConfig.referenceImage" class="upload-placeholder">
              <Icon icon="carbon:cloud-upload" class="w-8 h-8 text-gray-400 mb-2" />
              <span class="text-sm text-gray-500">点击上传参考图片</span>
            </div>
            <div v-else class="uploaded-image">
              <img :src="localConfig.referenceImage" alt="参考图片" class="preview-image" />
              <button @click.stop="removeReferenceImage" class="remove-btn">
                <Icon icon="carbon:close" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="card">
      <div class="flex gap-3">
        <button
          @click="generateWordCloud"
          class="btn-primary flex-1"
          :disabled="!hasWords"
        >
          <Icon icon="carbon:play" class="w-4 h-4 mr-2" />
          生成词云
        </button>
        
        <button
          @click="exportPNG"
          class="btn-secondary"
          :disabled="!hasWords"
        >
          <Icon icon="carbon:download" class="w-4 h-4 mr-1" />
          PNG
        </button>
        
        <button
          @click="exportSVG"
          class="btn-secondary"
          :disabled="!hasWords"
        >
          <Icon icon="carbon:download" class="w-4 h-4 mr-1" />
          SVG
        </button>
      </div>
    </div>

    <!-- 帮助弹窗 -->
    <HelpModal v-if="showHelp" @close="showHelp = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import TextAnalyzer from './TextAnalyzer.vue'
import HelpModal from './HelpModal.vue'
import type { WordCloudConfig, WordCloudElement } from '../types'

interface Props {
  config: WordCloudConfig
}

interface Emits {
  'update:config': [config: WordCloudConfig]
  'generate': []
  'export': [format: 'png' | 'svg']
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 本地配置状态
const localConfig = reactive<WordCloudConfig>({ ...props.config })

// 组件状态
const showHelp = ref(false)
const analyzedWords = ref<WordCloudElement[]>([])
const rotationAnglesInput = ref('')

// 文件输入引用
const maskInput = ref<HTMLInputElement>()
const referenceInput = ref<HTMLInputElement>()

// 计算属性
const hasWords = computed(() => analyzedWords.value.length > 0)

// 初始化角度集合输入
if (localConfig.rotationAngles?.length) {
  rotationAnglesInput.value = localConfig.rotationAngles.join(', ')
}

// 监听配置变化
watch(
  () => localConfig,
  (newConfig) => {
    emit('update:config', { ...newConfig })
  },
  { deep: true }
)

// 处理文本分析结果
function handleWordsAnalyzed(words: WordCloudElement[]) {
  analyzedWords.value = words
}

// 更新旋转角度集合
function updateRotationAngles() {
  try {
    const angles = rotationAnglesInput.value
      .split(',')
      .map(angle => parseFloat(angle.trim()))
      .filter(angle => !isNaN(angle))
    
    localConfig.rotationAngles = angles
  } catch (error) {
    console.warn('角度解析失败:', error)
  }
}

// 触发遮罩图片上传
function triggerMaskUpload() {
  maskInput.value?.click()
}

// 处理遮罩图片上传
function handleMaskUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      localConfig.maskImage = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// 移除遮罩图片
function removeMaskImage() {
  localConfig.maskImage = undefined
  if (maskInput.value) {
    maskInput.value.value = ''
  }
}

// 触发参考图片上传
function triggerReferenceUpload() {
  referenceInput.value?.click()
}

// 处理参考图片上传
function handleReferenceUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      localConfig.referenceImage = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// 移除参考图片
function removeReferenceImage() {
  localConfig.referenceImage = undefined
  if (referenceInput.value) {
    referenceInput.value.value = ''
  }
}

// 生成词云
function generateWordCloud() {
  emit('generate')
}

// 导出 PNG
function exportPNG() {
  emit('export', 'png')
}

// 导出 SVG
function exportSVG() {
  emit('export', 'svg')
}
</script>

<style scoped>
.control-panel {
  @apply w-80 h-full bg-white border-r border-gray-200 overflow-y-auto;
}

.panel-header {
  @apply flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50;
}

.help-btn {
  @apply p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors;
}

.card {
  @apply p-4 border-b border-gray-100;
}

.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.range-slider {
  @apply w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer;
}

.range-slider::-webkit-slider-thumb {
  @apply appearance-none w-4 h-4 bg-blue-500 rounded-full cursor-pointer;
}

.checkbox {
  @apply w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500;
}

.radio {
  @apply w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500;
}

.upload-area {
  @apply border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors relative;
}

.upload-placeholder {
  @apply flex flex-col items-center;
}

.uploaded-image {
  @apply relative;
}

.preview-image {
  @apply w-full h-24 object-cover rounded;
}

.remove-btn {
  @apply absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors;
}

.btn-primary {
  @apply px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center;
}

.btn-secondary {
  @apply px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  @apply opacity-50 cursor-not-allowed;
}
</style>