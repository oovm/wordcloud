// 图元类型定义
export type ElementType = 'text' | 'emoji' | 'image';

// 基础图元接口
export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  frequency: number; // 词频，用于决定大小
  canColor: boolean; // 是否可染色
}

// 文字图元
export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color?: string;
  canColor: true;
}

// Emoji图元
export interface EmojiElement extends BaseElement {
  type: 'emoji';
  emoji: string;
  canColor: false;
}

// 图片图元
export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  canColor: false;
}

export type WordCloudElement = TextElement | EmojiElement | ImageElement;

// 颜色定义
export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

// 主题定义
export interface Theme {
  name: string;
  colors: Color[];
  backgroundColor?: Color;
  fontFamilies: string[];
  fontWeights: string[];
}

// 布局配置
export interface LayoutConfig {
  width: number;
  height: number;
  padding: number;
  rotations: number[]; // 可选的旋转角度集合
  spiral: 'archimedean' | 'rectangular'; // 螺旋类型
  maxAttempts: number; // 最大尝试次数
  minFontSize: number;
  maxFontSize: number;
}

// Mask配置
export interface MaskConfig {
  imageData: ImageData;
  threshold: number; // 透明度阈值
}

// 四叉树节点
export interface QuadTreeNode {
  x: number;
  y: number;
  width: number;
  height: number;
  elements: WordCloudElement[];
  children?: QuadTreeNode[];
  maxElements: number;
  level: number;
}

// 渲染配置
export interface RenderConfig {
  theme: Theme;
  useReferenceImage?: boolean;
  referenceImage?: ImageData;
  progressive: boolean;
  animationSpeed: number;
}

// 词频数据
export interface WordFrequency {
  word: string;
  frequency: number;
  type?: ElementType;
  metadata?: any; // 额外数据，如emoji代码、图片URL等
}

// 画布接口
export interface CanvasRenderer {
  getCanvas(): HTMLCanvasElement | SVGElement;
  clear(): void;
  drawElement(element: WordCloudElement): void;
  getImageData(): ImageData;
}

// 布局结果
export interface LayoutResult {
  elements: WordCloudElement[];
  bounds: { width: number; height: number };
  success: boolean;
}