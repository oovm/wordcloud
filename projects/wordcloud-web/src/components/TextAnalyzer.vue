<template>
  <div class="text-analyzer">
    <!-- 文本输入区域 -->
    <div class="input-section">
      <div class="flex items-center gap-4 mb-4">
        <h3 class="text-lg font-semibold">文本分析</h3>
        <div class="flex gap-2">
          <button
            @click="showTextInput = true"
            class="btn btn-primary"
          >
            <Icon icon="carbon:edit" class="w-4 h-4" />
            文本输入
          </button>
          <button
            @click="showFileUpload = true"
            class="btn btn-secondary"
          >
            <Icon icon="carbon:document-import" class="w-4 h-4" />
            文件上传
          </button>
          <button
            @click="showWordFrequency = true"
            class="btn btn-accent"
            :disabled="wordFrequencies.length === 0"
          >
            <Icon icon="carbon:table" class="w-4 h-4" />
            词频统计
          </button>
        </div>
      </div>
      
      <!-- 当前状态显示 -->
      <div v-if="wordFrequencies.length > 0" class="status-info">
        <p class="text-sm text-gray-600">
          已分析文本，共 {{ wordFrequencies.length }} 个词汇
        </p>
      </div>
    </div>

    <!-- 文本输入弹窗 -->
    <Teleport to="body">
      <div v-if="showTextInput" class="modal-overlay" @click="showTextInput = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3 class="text-xl font-semibold">文本输入</h3>
            <button @click="showTextInput = false" class="btn-close">
              <Icon icon="carbon:close" class="w-5 h-5" />
            </button>
          </div>
          
          <div class="modal-body">
            <textarea
              v-model="inputText"
              placeholder="请输入要分析的文本..."
              class="textarea w-full h-64 resize-none"
            ></textarea>
            
            <div class="analysis-options mt-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="label">最小词频</label>
                  <input
                    v-model.number="analysisOptions.minFrequency"
                    type="number"
                    min="1"
                    class="input"
                  />
                </div>
                <div>
                  <label class="label">最大词数</label>
                  <input
                    v-model.number="analysisOptions.maxWords"
                    type="number"
                    min="1"
                    class="input"
                  />
                </div>
              </div>
              
              <div class="mt-4">
                <label class="label">停用词 (用逗号分隔)</label>
                <input
                  v-model="stopWordsInput"
                  type="text"
                  placeholder="的,了,是,在,有,和,就,不,人,都,一,一个"
                  class="input"
                />
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button @click="showTextInput = false" class="btn btn-secondary">
              取消
            </button>
            <button @click="analyzeText" class="btn btn-primary" :disabled="!inputText.trim()">
              <Icon icon="carbon:analytics" class="w-4 h-4" />
              分析文本
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 文件上传弹窗 -->
    <Teleport to="body">
      <div v-if="showFileUpload" class="modal-overlay" @click="showFileUpload = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3 class="text-xl font-semibold">文件上传</h3>
            <button @click="showFileUpload = false" class="btn-close">
              <Icon icon="carbon:close" class="w-5 h-5" />
            </button>
          </div>
          
          <div class="modal-body">
            <div class="upload-area" @drop="handleFileDrop" @dragover.prevent @dragenter.prevent>
              <input
                ref="fileInput"
                type="file"
                accept=".txt,.csv,.json"
                @change="handleFileSelect"
                class="hidden"
              />
              
              <div class="upload-content" @click="$refs.fileInput?.click()">
                <Icon icon="carbon:cloud-upload" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p class="text-lg font-medium mb-2">点击上传或拖拽文件到此处</p>
                <p class="text-sm text-gray-500">支持 .txt, .csv, .json 格式</p>
              </div>
            </div>
            
            <div v-if="uploadedFile" class="file-info mt-4">
              <div class="flex items-center gap-2 p-3 bg-gray-50 rounded">
                <Icon icon="carbon:document" class="w-5 h-5 text-blue-500" />
                <span class="font-medium">{{ uploadedFile.name }}</span>
                <span class="text-sm text-gray-500">({{ formatFileSize(uploadedFile.size) }})</span>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button @click="showFileUpload = false" class="btn btn-secondary">
              取消
            </button>
            <button @click="analyzeFile" class="btn btn-primary" :disabled="!uploadedFile">
              <Icon icon="carbon:analytics" class="w-4 h-4" />
              分析文件
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 词频统计弹窗 -->
    <Teleport to="body">
      <div v-if="showWordFrequency" class="modal-overlay" @click="showWordFrequency = false">
        <div class="modal-content modal-large" @click.stop>
          <div class="modal-header">
            <h3 class="text-xl font-semibold">词频统计表</h3>
            <button @click="showWordFrequency = false" class="btn-close">
              <Icon icon="carbon:close" class="w-5 h-5" />
            </button>
          </div>
          
          <div class="modal-body">
            <div class="frequency-table-container">
              <div class="table-header">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-4">
                    <span class="text-sm text-gray-600">共 {{ wordFrequencies.length }} 个词汇</span>
                    <button @click="selectAllWords" class="btn btn-sm btn-secondary">
                      全选
                    </button>
                    <button @click="deselectAllWords" class="btn btn-sm btn-secondary">
                      取消全选
                    </button>
                  </div>
                  <div class="flex items-center gap-2">
                    <input
                      v-model="searchKeyword"
                      type="text"
                      placeholder="搜索词汇..."
                      class="input input-sm"
                    />
                    <Icon icon="carbon:search" class="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div class="table-wrapper">
                <table class="frequency-table">
                  <thead>
                    <tr>
                      <th class="w-12">
                        <input
                          type="checkbox"
                          :checked="allWordsSelected"
                          @change="toggleAllWords"
                        />
                      </th>
                      <th>词汇</th>
                      <th>频次</th>
                      <th>颜色</th>
                      <th>字体大小</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(word, index) in filteredWordFrequencies" :key="word.text">
                      <td>
                        <input
                          type="checkbox"
                          v-model="word.selected"
                          @change="updateWordSelection(word)"
                        />
                      </td>
                      <td class="font-medium">{{ word.text }}</td>
                      <td>{{ word.frequency }}</td>
                      <td>
                        <div class="flex items-center gap-2">
                          <input
                            type="color"
                            v-model="word.color"
                            class="color-picker"
                          />
                          <span class="text-sm text-gray-500">{{ word.color }}</span>
                        </div>
                      </td>
                      <td>
                        <input
                          v-model.number="word.fontSize"
                          type="number"
                          min="8"
                          max="100"
                          class="input input-sm w-20"
                        />
                      </td>
                      <td>
                        <button
                          @click="removeWord(index)"
                          class="btn btn-sm btn-danger"
                        >
                          <Icon icon="carbon:trash-can" class="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button @click="showWordFrequency = false" class="btn btn-secondary">
              关闭
            </button>
            <button @click="applyWordFrequencies" class="btn btn-primary">
              <Icon icon="carbon:checkmark" class="w-4 h-4" />
              应用设置
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import * as natural from 'natural'
// @ts-ignore
import * as nodejieba from 'nodejieba'
import Papa from 'papaparse'
import type { WordCloudElement } from '../types'

interface WordFrequencyItem extends WordCloudElement {
  selected: boolean
  color: string
  fontSize: number
}

interface AnalysisOptions {
  minFrequency: number
  maxWords: number
}

const emit = defineEmits<{
  'words-analyzed': [words: WordCloudElement[]]
}>()

// 状态管理
const showTextInput = ref(false)
const showFileUpload = ref(false)
const showWordFrequency = ref(false)

// 文本输入相关
const inputText = ref('')
const analysisOptions = ref<AnalysisOptions>({
  minFrequency: 1,
  maxWords: 100
})
const stopWordsInput = ref('的,了,是,在,有,和,就,不,人,都,一,一个,这,那,我,你,他,她,它,们,个,中,上,下,来,去,出,到,时,会,可,能,要,说,看,得,过,还,也,就,只,很,更,最,太,非常')

// 文件上传相关
const uploadedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement>()

// 词频统计相关
const wordFrequencies = ref<WordFrequencyItem[]>([])
const searchKeyword = ref('')

// 停用词列表
const stopWords = computed(() => {
  return new Set(stopWordsInput.value.split(',').map(word => word.trim()).filter(Boolean))
})

// 过滤后的词频列表
const filteredWordFrequencies = computed(() => {
  if (!searchKeyword.value) return wordFrequencies.value
  return wordFrequencies.value.filter(word => 
    word.text.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 全选状态
const allWordsSelected = computed(() => {
  return wordFrequencies.value.length > 0 && wordFrequencies.value.every(word => word.selected)
})

// 检测文本语言
function detectLanguage(text: string): 'zh' | 'en' | 'mixed' {
  const chineseChars = text.match(/[\u4e00-\u9fff]/g)?.length || 0
  const englishChars = text.match(/[a-zA-Z]/g)?.length || 0
  
  if (chineseChars > englishChars * 2) return 'zh'
  if (englishChars > chineseChars * 2) return 'en'
  return 'mixed'
}

// 分词函数
function tokenizeText(text: string): string[] {
  const language = detectLanguage(text)
  let tokens: string[] = []
  
  if (language === 'zh' || language === 'mixed') {
    // 中文分词
    try {
      const chineseTokens = nodejieba.cut(text, true)
      tokens.push(...chineseTokens)
    } catch (error) {
      console.warn('中文分词失败，使用简单分割:', error)
      // 简单的中文分词备选方案
      const chineseText = text.replace(/[a-zA-Z0-9\s]+/g, ' ')
      tokens.push(...chineseText.split('').filter(char => /[\u4e00-\u9fff]/.test(char)))
    }
  }
  
  if (language === 'en' || language === 'mixed') {
    // 英文分词
    const englishText = text.replace(/[^a-zA-Z\s]/g, ' ')
    const englishTokens = natural.WordTokenizer.prototype.tokenize(englishText)
    tokens.push(...englishTokens)
  }
  
  return tokens
}

// 计算词频
function calculateWordFrequency(tokens: string[]): Map<string, number> {
  const frequency = new Map<string, number>()
  
  tokens.forEach(token => {
    const word = token.toLowerCase().trim()
    if (word.length > 1 && !stopWords.value.has(word)) {
      frequency.set(word, (frequency.get(word) || 0) + 1)
    }
  })
  
  return frequency
}

// 生成随机颜色
function generateRandomColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// 计算字体大小
function calculateFontSize(frequency: number, maxFrequency: number): number {
  const minSize = 12
  const maxSize = 48
  const ratio = frequency / maxFrequency
  return Math.round(minSize + (maxSize - minSize) * ratio)
}

// 分析文本
function analyzeText() {
  if (!inputText.value.trim()) return
  
  const tokens = tokenizeText(inputText.value)
  const frequency = calculateWordFrequency(tokens)
  
  // 转换为数组并排序
  const sortedWords = Array.from(frequency.entries())
    .filter(([_, freq]) => freq >= analysisOptions.value.minFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, analysisOptions.value.maxWords)
  
  const maxFrequency = sortedWords[0]?.[1] || 1
  
  wordFrequencies.value = sortedWords.map(([text, freq]) => ({
    text,
    frequency: freq,
    selected: true,
    color: generateRandomColor(),
    fontSize: calculateFontSize(freq, maxFrequency)
  }))
  
  showTextInput.value = false
  
  // 发送分析结果
  emitAnalyzedWords()
}

// 处理文件选择
function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    uploadedFile.value = target.files[0]
  }
}

// 处理文件拖拽
function handleFileDrop(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    uploadedFile.value = event.dataTransfer.files[0]
  }
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 分析文件
async function analyzeFile() {
  if (!uploadedFile.value) return
  
  try {
    const text = await readFileAsText(uploadedFile.value)
    
    if (uploadedFile.value.name.endsWith('.csv')) {
      // 解析 CSV
      const result = Papa.parse(text, { header: true })
      // 假设 CSV 有 text 和 frequency 列
      const data = result.data as Array<{ text?: string; frequency?: string }>
      
      wordFrequencies.value = data
        .filter(row => row.text && row.frequency)
        .map(row => ({
          text: row.text!,
          frequency: parseInt(row.frequency!) || 1,
          selected: true,
          color: generateRandomColor(),
          fontSize: 16
        }))
    } else if (uploadedFile.value.name.endsWith('.json')) {
      // 解析 JSON
      const data = JSON.parse(text)
      if (Array.isArray(data)) {
        wordFrequencies.value = data.map(item => ({
          text: item.text || item.word || String(item),
          frequency: item.frequency || item.count || 1,
          selected: true,
          color: generateRandomColor(),
          fontSize: 16
        }))
      }
    } else {
      // 普通文本文件
      inputText.value = text
      analyzeText()
      return
    }
    
    showFileUpload.value = false
    emitAnalyzedWords()
  } catch (error) {
    console.error('文件分析失败:', error)
    alert('文件分析失败，请检查文件格式')
  }
}

// 读取文件为文本
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsText(file, 'utf-8')
  })
}

// 全选词汇
function selectAllWords() {
  wordFrequencies.value.forEach(word => {
    word.selected = true
  })
}

// 取消全选
function deselectAllWords() {
  wordFrequencies.value.forEach(word => {
    word.selected = false
  })
}

// 切换全选状态
function toggleAllWords() {
  const shouldSelect = !allWordsSelected.value
  wordFrequencies.value.forEach(word => {
    word.selected = shouldSelect
  })
}

// 更新词汇选择状态
function updateWordSelection(word: WordFrequencyItem) {
  // 选择状态已通过 v-model 更新
}

// 移除词汇
function removeWord(index: number) {
  wordFrequencies.value.splice(index, 1)
}

// 应用词频设置
function applyWordFrequencies() {
  emitAnalyzedWords()
  showWordFrequency.value = false
}

// 发送分析结果
function emitAnalyzedWords() {
  const selectedWords = wordFrequencies.value
    .filter(word => word.selected)
    .map(word => ({
      text: word.text,
      frequency: word.frequency,
      color: word.color,
      fontSize: word.fontSize
    }))
  
  emit('words-analyzed', selectedWords)
}
</script>

<style scoped>
.text-analyzer {
  @apply p-4 bg-white rounded-lg shadow-sm border;
}

.btn {
  @apply px-3 py-2 rounded-md font-medium transition-colors flex items-center gap-2;
}

.btn-primary {
  @apply bg-blue-500 text-white hover:bg-blue-600;
}

.btn-secondary {
  @apply bg-gray-500 text-white hover:bg-gray-600;
}

.btn-accent {
  @apply bg-purple-500 text-white hover:bg-purple-600;
}

.btn-danger {
  @apply bg-red-500 text-white hover:bg-red-600;
}

.btn-sm {
  @apply px-2 py-1 text-sm;
}

.btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden;
}

.modal-large {
  @apply max-w-4xl;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b;
}

.modal-body {
  @apply p-6 overflow-y-auto max-h-[60vh];
}

.modal-footer {
  @apply flex items-center justify-end gap-3 p-6 border-t;
}

.btn-close {
  @apply p-1 hover:bg-gray-100 rounded;
}

.textarea {
  @apply w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.input {
  @apply px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.input-sm {
  @apply px-2 py-1 text-sm;
}

.label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}

.upload-area {
  @apply border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer;
}

.upload-content {
  @apply flex flex-col items-center;
}

.file-info {
  @apply mt-4;
}

.frequency-table-container {
  @apply max-h-96 overflow-auto;
}

.table-wrapper {
  @apply overflow-x-auto;
}

.frequency-table {
  @apply w-full border-collapse;
}

.frequency-table th,
.frequency-table td {
  @apply px-4 py-2 text-left border-b border-gray-200;
}

.frequency-table th {
  @apply bg-gray-50 font-medium text-gray-700 sticky top-0;
}

.frequency-table tr:hover {
  @apply bg-gray-50;
}

.color-picker {
  @apply w-8 h-8 rounded border border-gray-300 cursor-pointer;
}

.status-info {
  @apply p-3 bg-blue-50 rounded-md;
}
</style>