// 词云配置接口
export interface WordCloudConfig {
  width: number
  height: number
  fontFamily: string
  fontSizeRange: [number, number]
  rotationRange: [number, number]
  rotationAngles?: number[] // 角度集合，用于集合内随机
  rotationMode: 'range' | 'set' // 旋转模式：范围随机或集合随机
  backgroundColor: string
  colorScheme: ColorScheme
  layoutAlgorithm: LayoutAlgorithm
  padding: number
  spiral: 'archimedean' | 'rectangular'
  enableAnimation: boolean
  animationType: AnimationType
  animationDuration: number
  progressiveRendering: boolean
  maskImage?: string
  referenceImage?: string
}

// 词云元素接口
export interface WordCloudElement {
  type: 'text' | 'image'
  text?: string
  imageUrl?: string
  x: number
  y: number
  width: number
  height: number
  fontSize?: number
  fontFamily?: string
  color?: string
  rotation?: number
  weight?: number
  opacity?: number
}

// 导出选项接口
export interface ExportOptions {
  format: 'png' | 'jpg' | 'svg' | 'pdf'
  quality?: number
  scale?: number
  transparent?: boolean
}

// 文本分析结果接口
export interface TextAnalysisResult {
  words: Array<{
    text: string
    frequency: number
    weight: number
  }>
  totalWords: number
  uniqueWords: number
  language: string
}

// 文件上传接口
export interface FileUploadResult {
  type: 'text' | 'csv' | 'json' | 'image'
  content: string | object
  filename: string
  size: number
}

// 主题配置接口
export interface ThemeConfig {
  name: string
  colors: string[]
  backgroundColor: string
  fontFamily: string
  description: string
}

// 布局算法类型
export type LayoutAlgorithm = 'spiral' | 'grid' | 'random' | 'force'

// 颜色方案类型
export type ColorScheme = 'rainbow' | 'warm' | 'cool' | 'monochrome' | 'custom'

// 字体权重类型
export type FontWeight = 'normal' | 'bold' | 'lighter' | 'bolder'

// 动画类型
export type AnimationType = 'none' | 'fade' | 'scale' | 'rotate' | 'slide'