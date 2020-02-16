<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black bg-opacity-50 flex-center z-50"
    @click="closeModal"
  >
    <div
      class="bg-white rounded-xl max-w-4xl max-h-[90vh] mx-4 overflow-hidden"
      @click.stop
    >
      <!-- 头部 -->
      <div class="flex justify-between items-center p-6 border-b border-gray-200">
        <h2 class="text-2xl font-bold text-gray-900 flex items-center">
          <Icon icon="carbon:help" class="w-6 h-6 mr-2 text-blue-500" />
          词云生成器帮助
        </h2>
        <button
          @click="closeModal"
          class="btn-icon text-gray-400 hover:text-gray-600"
        >
          <Icon icon="carbon:close" class="w-6 h-6" />
        </button>
      </div>
      
      <!-- 内容 -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
        <div class="space-y-8">
          <!-- 快速开始 -->
          <section>
            <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Icon icon="carbon:rocket" class="w-5 h-5 mr-2 text-green-500" />
              快速开始
            </h3>
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <ol class="list-decimal list-inside space-y-2 text-gray-700">
                <li>在左侧文本输入框中输入要生成词云的文本内容</li>
                <li>调整基础配置（画布尺寸、字体大小等）</li>
                <li>点击"生成词云"按钮开始生成</li>
                <li>生成完成后可以导出为 PNG 或 SVG 格式</li>
              </ol>
            </div>
          </section>
          
          <!-- 功能介绍 -->
          <section>
            <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Icon icon="carbon:function" class="w-5 h-5 mr-2 text-blue-500" />
              主要功能
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 class="font-medium text-blue-900 mb-2 flex items-center">
                  <Icon icon="carbon:text-creation" class="w-4 h-4 mr-1" />
                  文本处理
                </h4>
                <ul class="text-sm text-blue-800 space-y-1">
                  <li>• 支持中英文混合文本</li>
                  <li>• 自动分词和词频统计</li>
                  <li>• 停用词过滤</li>
                  <li>• 支持粘贴和文件上传</li>
                </ul>
              </div>
              
              <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 class="font-medium text-purple-900 mb-2 flex items-center">
                  <Icon icon="carbon:image" class="w-4 h-4 mr-1" />
                  图片支持
                </h4>
                <ul class="text-sm text-purple-800 space-y-1">
                  <li>• 上传遮罩图片定制形状</li>
                  <li>• 上传参考图片提取颜色</li>
                  <li>• 支持 PNG、JPG、SVG 格式</li>
                  <li>• 自动适配画布尺寸</li>
                </ul>
              </div>
              
              <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 class="font-medium text-orange-900 mb-2 flex items-center">
                  <Icon icon="carbon:settings" class="w-4 h-4 mr-1" />
                  自定义配置
                </h4>
                <ul class="text-sm text-orange-800 space-y-1">
                  <li>• 调整字体大小范围</li>
                  <li>• 设置文字旋转角度</li>
                  <li>• 选择颜色主题</li>
                  <li>• 配置布局算法</li>
                </ul>
              </div>
              
              <div class="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <h4 class="font-medium text-teal-900 mb-2 flex items-center">
                  <Icon icon="carbon:download" class="w-4 h-4 mr-1" />
                  导出选项
                </h4>
                <ul class="text-sm text-teal-800 space-y-1">
                  <li>• PNG 格式（适合打印）</li>
                  <li>• SVG 格式（矢量图形）</li>
                  <li>• 自定义分辨率</li>
                  <li>• 透明背景支持</li>
                </ul>
              </div>
            </div>
          </section>
          
          <!-- 文件格式支持 -->
          <section>
            <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Icon icon="carbon:document" class="w-5 h-5 mr-2 text-indigo-500" />
              支持的文件格式
            </h3>
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 class="font-medium text-gray-900 mb-2">文本文件</h4>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• .txt - 纯文本文件</li>
                    <li>• .csv - 逗号分隔值</li>
                    <li>• .json - JSON 数据</li>
                  </ul>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900 mb-2">图片文件</h4>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• .png - PNG 图片</li>
                    <li>• .jpg/.jpeg - JPEG 图片</li>
                    <li>• .svg - SVG 矢量图</li>
                  </ul>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900 mb-2">数据格式</h4>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• 词频统计表格</li>
                    <li>• 带权重的词语列表</li>
                    <li>• 结构化文本数据</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
          
          <!-- 快捷键 -->
          <section>
            <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Icon icon="carbon:keyboard" class="w-5 h-5 mr-2 text-red-500" />
              快捷键
            </h3>
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-gray-700">放大画布</span>
                    <kbd class="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Ctrl + +</kbd>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-gray-700">缩小画布</span>
                    <kbd class="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Ctrl + -</kbd>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-gray-700">重置视图</span>
                    <kbd class="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Ctrl + 0</kbd>
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-gray-700">显示/隐藏网格</span>
                    <kbd class="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Ctrl + G</kbd>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-gray-700">粘贴文本</span>
                    <kbd class="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Ctrl + V</kbd>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-gray-700">关闭帮助</span>
                    <kbd class="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Esc</kbd>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          <!-- 技巧和建议 -->
          <section>
            <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Icon icon="carbon:idea" class="w-5 h-5 mr-2 text-yellow-500" />
              使用技巧
            </h3>
            <div class="space-y-4">
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 class="font-medium text-yellow-900 mb-2">💡 优化词云效果</h4>
                <ul class="text-sm text-yellow-800 space-y-1">
                  <li>• 文本长度建议在 100-1000 字之间，效果最佳</li>
                  <li>• 使用遮罩图片时，建议选择对比度高的黑白图片</li>
                  <li>• 调整字体大小范围可以突出重要词语</li>
                  <li>• 选择合适的主题颜色能提升视觉效果</li>
                </ul>
              </div>
              
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 class="font-medium text-blue-900 mb-2">🎨 设计建议</h4>
                <ul class="text-sm text-blue-800 space-y-1">
                  <li>• 浅色背景配深色文字，深色背景配浅色文字</li>
                  <li>• 避免使用过多的旋转角度，保持可读性</li>
                  <li>• 合理设置画布比例，常用 16:9 或 4:3</li>
                  <li>• 导出高分辨率图片时建议使用 SVG 格式</li>
                </ul>
              </div>
            </div>
          </section>
          
          <!-- 常见问题 -->
          <section>
            <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Icon icon="carbon:help-desk" class="w-5 h-5 mr-2 text-gray-500" />
              常见问题
            </h3>
            <div class="space-y-3">
              <details class="bg-gray-50 border border-gray-200 rounded-lg">
                <summary class="p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-100">
                  为什么生成的词云中有些词语没有显示？
                </summary>
                <div class="px-4 pb-4 text-sm text-gray-600">
                  <p>可能的原因：</p>
                  <ul class="list-disc list-inside mt-2 space-y-1">
                    <li>词语被识别为停用词（如"的"、"是"、"在"等）</li>
                    <li>词语频率太低，被过滤掉了</li>
                    <li>画布空间不足，无法放置更多词语</li>
                    <li>字体大小设置过大，导致部分词语无法显示</li>
                  </ul>
                </div>
              </details>
              
              <details class="bg-gray-50 border border-gray-200 rounded-lg">
                <summary class="p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-100">
                  如何提高词云的生成质量？
                </summary>
                <div class="px-4 pb-4 text-sm text-gray-600">
                  <ul class="list-disc list-inside space-y-1">
                    <li>提供足够长度的文本内容（建议 200 字以上）</li>
                    <li>适当调整字体大小范围，避免过大或过小</li>
                    <li>选择合适的画布尺寸，给词语留出足够空间</li>
                    <li>使用高质量的遮罩图片（分辨率建议 500px 以上）</li>
                  </ul>
                </div>
              </details>
              
              <details class="bg-gray-50 border border-gray-200 rounded-lg">
                <summary class="p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-100">
                  支持哪些语言的文本分析？
                </summary>
                <div class="px-4 pb-4 text-sm text-gray-600">
                  <p>目前支持：</p>
                  <ul class="list-disc list-inside mt-2 space-y-1">
                    <li>中文（简体/繁体）- 使用智能分词算法</li>
                    <li>英文 - 基于空格和标点符号分词</li>
                    <li>中英文混合文本</li>
                    <li>数字和特殊符号的处理</li>
                  </ul>
                </div>
              </details>
            </div>
          </section>
        </div>
      </div>
      
      <!-- 底部 -->
      <div class="flex justify-end items-center p-6 border-t border-gray-200 bg-gray-50">
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-500">
            版本 1.0.0 | 更多功能正在开发中
          </span>
          <button
            @click="closeModal"
            class="btn-primary"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'

// Props
interface Props {
  visible: boolean
}

defineProps<Props>()

// Emits
interface Emits {
  'update:visible': [visible: boolean]
}

const emit = defineEmits<Emits>()

// 关闭模态框
const closeModal = () => {
  emit('update:visible', false)
}

// 键盘事件处理
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeModal()
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
  @apply p-2 rounded-lg hover:bg-gray-100 transition-colors;
}

details[open] summary {
  @apply bg-gray-100;
}

kbd {
  @apply shadow-sm;
}
</style>