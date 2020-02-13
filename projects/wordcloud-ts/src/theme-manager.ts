import { Theme, Color } from './types';

/**
 * 主题管理器
 */
export class ThemeManager {
  private themes: Map<string, Theme> = new Map();

  constructor() {
    this.loadDefaultThemes();
  }

  /**
   * 加载默认主题
   */
  private loadDefaultThemes(): void {
    // 经典主题
    this.addTheme({
      name: 'classic',
      colors: [
        { r: 51, g: 122, b: 183 },   // 蓝色
        { r: 92, g: 184, b: 92 },    // 绿色
        { r: 240, g: 173, b: 78 },   // 橙色
        { r: 217, g: 83, b: 79 },    // 红色
        { r: 91, g: 192, b: 222 },   // 青色
        { r: 142, g: 68, b: 173 },   // 紫色
      ],
      backgroundColor: { r: 255, g: 255, b: 255 },
      fontFamilies: ['Arial', 'Helvetica', 'sans-serif'],
      fontWeights: ['normal', 'bold']
    });

    // 暗色主题
    this.addTheme({
      name: 'dark',
      colors: [
        { r: 100, g: 149, b: 237 },  // 蓝色
        { r: 144, g: 238, b: 144 },  // 浅绿色
        { r: 255, g: 182, b: 193 },  // 浅粉色
        { r: 255, g: 218, b: 185 },  // 桃色
        { r: 173, g: 216, b: 230 },  // 浅蓝色
        { r: 221, g: 160, b: 221 },  // 梅花色
      ],
      backgroundColor: { r: 33, g: 37, b: 41 },
      fontFamilies: ['Arial', 'Helvetica', 'sans-serif'],
      fontWeights: ['normal', 'bold']
    });

    // 彩虹主题
    this.addTheme({
      name: 'rainbow',
      colors: [
        { r: 255, g: 0, b: 0 },      // 红
        { r: 255, g: 165, b: 0 },    // 橙
        { r: 255, g: 255, b: 0 },    // 黄
        { r: 0, g: 255, b: 0 },      // 绿
        { r: 0, g: 255, b: 255 },    // 青
        { r: 0, g: 0, b: 255 },      // 蓝
        { r: 128, g: 0, b: 128 },    // 紫
      ],
      backgroundColor: { r: 248, g: 249, b: 250 },
      fontFamilies: ['Arial', 'Helvetica', 'sans-serif'],
      fontWeights: ['normal', 'bold']
    });

    // 单色主题
    this.addTheme({
      name: 'monochrome',
      colors: [
        { r: 0, g: 0, b: 0 },        // 黑色
        { r: 64, g: 64, b: 64 },     // 深灰
        { r: 128, g: 128, b: 128 },  // 中灰
        { r: 192, g: 192, b: 192 },  // 浅灰
      ],
      backgroundColor: { r: 255, g: 255, b: 255 },
      fontFamilies: ['Arial', 'Helvetica', 'sans-serif'],
      fontWeights: ['normal', 'bold']
    });

    // 海洋主题
    this.addTheme({
      name: 'ocean',
      colors: [
        { r: 0, g: 119, b: 190 },    // 深蓝
        { r: 0, g: 180, b: 216 },    // 天蓝
        { r: 144, g: 224, b: 239 },  // 浅蓝
        { r: 0, g: 150, b: 136 },    // 青绿
        { r: 77, g: 182, b: 172 },   // 薄荷绿
        { r: 128, g: 203, b: 196 },  // 浅薄荷
      ],
      backgroundColor: { r: 240, g: 248, b: 255 },
      fontFamilies: ['Arial', 'Helvetica', 'sans-serif'],
      fontWeights: ['normal', 'bold']
    });

    // 森林主题
    this.addTheme({
      name: 'forest',
      colors: [
        { r: 34, g: 139, b: 34 },    // 森林绿
        { r: 107, g: 142, b: 35 },   // 橄榄绿
        { r: 154, g: 205, b: 50 },   // 黄绿
        { r: 46, g: 125, b: 50 },    // 深绿
        { r: 76, g: 175, b: 80 },    // 绿色
        { r: 139, g: 195, b: 74 },   // 浅绿
      ],
      backgroundColor: { r: 248, g: 255, b: 248 },
      fontFamilies: ['Arial', 'Helvetica', 'sans-serif'],
      fontWeights: ['normal', 'bold']
    });

    // 日落主题
    this.addTheme({
      name: 'sunset',
      colors: [
        { r: 255, g: 87, b: 34 },    // 深橙
        { r: 255, g: 152, b: 0 },    // 橙色
        { r: 255, g: 193, b: 7 },    // 琥珀色
        { r: 255, g: 235, b: 59 },   // 黄色
        { r: 244, g: 67, b: 54 },    // 红色
        { r: 233, g: 30, b: 99 },    // 粉红
      ],
      backgroundColor: { r: 255, g: 248, b: 225 },
      fontFamilies: ['Arial', 'Helvetica', 'sans-serif'],
      fontWeights: ['normal', 'bold']
    });
  }

  /**
   * 添加主题
   */
  addTheme(theme: Theme): void {
    this.themes.set(theme.name, theme);
  }

  /**
   * 获取主题
   */
  getTheme(name: string): Theme | undefined {
    return this.themes.get(name);
  }

  /**
   * 获取所有主题名称
   */
  getThemeNames(): string[] {
    return Array.from(this.themes.keys());
  }

  /**
   * 获取所有主题
   */
  getAllThemes(): Theme[] {
    return Array.from(this.themes.values());
  }

  /**
   * 删除主题
   */
  removeTheme(name: string): boolean {
    return this.themes.delete(name);
  }

  /**
   * 创建自定义主题
   */
  createCustomTheme(
    name: string,
    colors: Color[],
    backgroundColor?: Color,
    fontFamilies?: string[],
    fontWeights?: string[]
  ): Theme {
    const theme: Theme = {
      name,
      colors,
      backgroundColor,
      fontFamilies: fontFamilies || ['Arial', 'Helvetica', 'sans-serif'],
      fontWeights: fontWeights || ['normal', 'bold']
    };
    
    this.addTheme(theme);
    return theme;
  }

  /**
   * 从图片生成主题
   */
  generateThemeFromImage(name: string, imageData: ImageData, colorCount: number = 6): Theme {
    const colors = this.extractColorsFromImage(imageData, colorCount);
    
    return this.createCustomTheme(
      name,
      colors,
      { r: 255, g: 255, b: 255 }, // 默认白色背景
      ['Arial', 'Helvetica', 'sans-serif'],
      ['normal', 'bold']
    );
  }

  /**
   * 从图片提取主要颜色
   */
  private extractColorsFromImage(imageData: ImageData, colorCount: number): Color[] {
    const colors: Color[] = [];
    const colorMap = new Map<string, { color: Color; count: number }>();
    
    // 采样图片像素（每隔10个像素采样一次以提高性能）
    for (let i = 0; i < imageData.data.length; i += 40) { // 每隔10个像素 * 4个通道
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const a = imageData.data[i + 3];
      
      // 跳过透明像素
      if (a < 128) continue;
      
      // 量化颜色以减少颜色数量
      const quantizedR = Math.floor(r / 32) * 32;
      const quantizedG = Math.floor(g / 32) * 32;
      const quantizedB = Math.floor(b / 32) * 32;
      
      const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;
      
      if (colorMap.has(colorKey)) {
        colorMap.get(colorKey)!.count++;
      } else {
        colorMap.set(colorKey, {
          color: { r: quantizedR, g: quantizedG, b: quantizedB },
          count: 1
        });
      }
    }
    
    // 按出现频率排序并取前N个颜色
    const sortedColors = Array.from(colorMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, colorCount)
      .map(item => item.color);
    
    return sortedColors.length > 0 ? sortedColors : [
      { r: 51, g: 122, b: 183 } // 默认蓝色
    ];
  }

  /**
   * 混合两个主题
   */
  blendThemes(theme1Name: string, theme2Name: string, ratio: number = 0.5): Theme | null {
    const t1 = this.getTheme(theme1Name);
    const t2 = this.getTheme(theme2Name);
    
    if (!t1 || !t2) return null;
    
    const blendedColors: Color[] = [];
    const maxLength = Math.max(t1.colors.length, t2.colors.length);
    
    for (let i = 0; i < maxLength; i++) {
      const c1 = t1.colors[i % t1.colors.length];
      const c2 = t2.colors[i % t2.colors.length];
      
      blendedColors.push({
        r: Math.round(c1.r * (1 - ratio) + c2.r * ratio),
        g: Math.round(c1.g * (1 - ratio) + c2.g * ratio),
        b: Math.round(c1.b * (1 - ratio) + c2.b * ratio)
      });
    }
    
    return {
      name: `${theme1Name}-${theme2Name}-blend`,
      colors: blendedColors,
      backgroundColor: t1.backgroundColor,
      fontFamilies: [...new Set([...t1.fontFamilies, ...t2.fontFamilies])],
      fontWeights: [...new Set([...t1.fontWeights, ...t2.fontWeights])]
    };
  }

  /**
   * 获取随机主题
   */
  getRandomTheme(): Theme {
    const themes = this.getAllThemes();
    return themes[Math.floor(Math.random() * themes.length)];
  }
}