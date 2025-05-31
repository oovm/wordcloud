// 导出所有类型定义
export * from './types';

// 导出核心类
export { QuadTree } from './quadtree';
export { LayoutEngine } from './layout-engine';
export { WordCloudRenderer, CanvasWordCloudRenderer, SVGWordCloudRenderer } from './renderer';
export { ThemeManager } from './theme-manager';
export { DataAnalyzer } from './data-analyzer';

import { LayoutEngine } from './layout-engine';
import { WordCloudRenderer } from './renderer';
import { ThemeManager } from './theme-manager';
import { TextAnalyzer } from './text-analyzer';
import {
  WordFrequency,
  LayoutConfig,
  RenderConfig,
  MaskConfig,
  Theme,
  WordCloudElement
} from './types';

/**
 * 词云生成器主类 - 整合所有功能的高级API
 */
export class WordCloudGenerator {
  private layoutEngine: LayoutEngine;
  private themeManager: ThemeManager;
  private textAnalyzer: TextAnalyzer;
  private currentTheme: Theme;

  constructor(layoutConfig: LayoutConfig) {
    this.layoutEngine = new LayoutEngine(layoutConfig);
    this.themeManager = new ThemeManager();
    this.textAnalyzer = new TextAnalyzer();
    this.currentTheme = this.themeManager.getTheme('classic')!;
  }

  /**
   * 从文本生成词云
   */
  generateFromText(
    text: string,
    canvas: HTMLCanvasElement | SVGElement,
    options: GenerateOptions = {}
  ): WordCloudRenderer<HTMLCanvasElement | SVGElement> {
    // 分析文本
    const wordFrequencies = this.textAnalyzer.analyzeText(text, options.analyzeOptions);
    
    return this.generateFromWordFrequencies(wordFrequencies, canvas, options);
  }

  /**
   * 从词频数据生成词云
   */
  generateFromWordFrequencies(
    wordFrequencies: WordFrequency[],
    canvas: HTMLCanvasElement | SVGElement,
    options: GenerateOptions = {}
  ): WordCloudRenderer<HTMLCanvasElement | SVGElement> {
    // 设置主题
    if (options.themeName) {
      const theme = this.themeManager.getTheme(options.themeName);
      if (theme) {
        this.currentTheme = theme;
      }
    }

    // 设置遮罩
    if (options.mask) {
      this.layoutEngine.setMask(options.mask);
    }

    // 布局
    const layoutResult = this.layoutEngine.layout(wordFrequencies);
    
    if (!layoutResult.success || layoutResult.elements.length === 0) {
      throw new Error('词云布局失败，请检查配置参数');
    }

    // 创建渲染配置
    const renderConfig: RenderConfig = {
      theme: this.currentTheme,
      useReferenceImage: options.useReferenceImage || false,
      referenceImage: options.referenceImage,
      progressive: options.progressive || false,
      animationSpeed: options.animationSpeed || 100
    };

    // 创建渲染器
    const renderer = new WordCloudRenderer(canvas, renderConfig);
    renderer.setElements(layoutResult.elements);

    // 如果不是渐进式渲染，直接渲染所有元素
    if (!options.progressive) {
      renderer.render();
    }

    return renderer;
  }

  /**
   * 从CSV文件生成词云
   */
  generateFromCSV(
    csvText: string,
    canvas: HTMLCanvasElement | SVGElement,
    options: GenerateOptions & { wordColumn?: number; frequencyColumn?: number } = {}
  ): WordCloudRenderer<HTMLCanvasElement | SVGElement> {
    const wordFrequencies = this.textAnalyzer.parseCSV(
      csvText,
      options.wordColumn,
      options.frequencyColumn
    );
    
    return this.generateFromWordFrequencies(wordFrequencies, canvas, options);
  }

  /**
   * 从JSON数据生成词云
   */
  generateFromJSON(
    jsonText: string,
    canvas: HTMLCanvasElement | SVGElement,
    options: GenerateOptions = {}
  ): WordCloudRenderer<HTMLCanvasElement | SVGElement> {
    const wordFrequencies = this.textAnalyzer.parseJSON(jsonText);
    
    return this.generateFromWordFrequencies(wordFrequencies, canvas, options);
  }

  /**
   * 设置布局配置
   */
  setLayoutConfig(config: Partial<LayoutConfig>): void {
    // 创建新的布局引擎
    const currentConfig = this.getLayoutConfig();
    const newConfig = { ...currentConfig, ...config };
    this.layoutEngine = new LayoutEngine(newConfig);
  }

  /**
   * 获取当前布局配置
   */
  getLayoutConfig(): LayoutConfig {
    // 这里应该从layoutEngine获取配置，简化实现
    return {
      width: 800,
      height: 600,
      padding: 20,
      rotations: [0, 90, -90],
      spiral: 'archimedean',
      maxAttempts: 1000,
      minFontSize: 12,
      maxFontSize: 60
    };
  }

  /**
   * 获取主题管理器
   */
  getThemeManager(): ThemeManager {
    return this.themeManager;
  }

  /**
   * 获取文本分析器
   */
  getTextAnalyzer(): TextAnalyzer {
    return this.textAnalyzer;
  }

  /**
   * 设置当前主题
   */
  setTheme(themeName: string): boolean {
    const theme = this.themeManager.getTheme(themeName);
    if (theme) {
      this.currentTheme = theme;
      return true;
    }
    return false;
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  /**
   * 创建遮罩配置
   */
  static createMaskFromImage(image: HTMLImageElement, threshold: number = 128): MaskConfig {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    return {
      imageData,
      threshold
    };
  }

  /**
   * 创建参考图像用于染色
   */
  static createReferenceImage(image: HTMLImageElement): ImageData {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  /**
   * 预设配置 - 快速开始
   */
  static createQuickConfig(width: number, height: number): LayoutConfig {
    return {
      width,
      height,
      padding: Math.min(width, height) * 0.05,
      rotations: [0, 45, -45, 90, -90],
      spiral: 'archimedean',
      maxAttempts: 1000,
      minFontSize: Math.min(width, height) * 0.02,
      maxFontSize: Math.min(width, height) * 0.1
    };
  }
}

/**
 * 生成选项接口
 */
export interface GenerateOptions {
  themeName?: string;
  mask?: MaskConfig;
  useReferenceImage?: boolean;
  referenceImage?: ImageData;
  progressive?: boolean;
  animationSpeed?: number;
  analyzeOptions?: {
    minLength?: number;
    maxLength?: number;
    caseSensitive?: boolean;
    includeNumbers?: boolean;
    customStopWords?: string[];
    language?: 'auto' | 'chinese' | 'english' | 'mixed';
  };
}

/**
 * 便捷函数 - 快速创建词云
 */
export function createWordCloud(
  text: string,
  canvas: HTMLCanvasElement | SVGElement,
  options: {
    width?: number;
    height?: number;
    theme?: string;
    progressive?: boolean;
  } = {}
): WordCloudRenderer<HTMLCanvasElement | SVGElement> {
  const {
    width = 800,
    height = 600,
    theme = 'classic',
    progressive = false
  } = options;

  const layoutConfig = WordCloudGenerator.createQuickConfig(width, height);
  const generator = new WordCloudGenerator(layoutConfig);
  
  return generator.generateFromText(text, canvas, {
    themeName: theme,
    progressive
  });
}

// 默认导出
export default WordCloudGenerator;