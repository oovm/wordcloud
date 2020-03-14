# WordCloud TypeScript 词云渲染器

一个功能强大的 TypeScript 词云渲染器，支持多种图元类型、四叉树布局引擎和渐进式渲染。

## 包导出

| 包 / 子路径 | 用途 |
|-------------|------|
| `@doki-land/wordcloud-core` | 共享类型与契约 |
| `@doki-land/wordcloud-loader` | CSV / JSON / TXT（分词器）加载词频 |
| `@doki-land/wordcloud-layout` | `LayoutEngine` + `QuadTree` |
| `@doki-land/wordcloud-renderer` | CPU canvas/SVG + WebGPU 后端 |
| `@doki-land/wordcloud` | **门面**：生成器、主题、分析（`sideEffects: false`） |
| `@doki-land/wordcloud-element` | `<word-cloud>` 自定义元素（`sideEffects: true`） |

默认请使用 `LayoutEngine`、`WordCloudRenderer` 等 TypeScript API。

## 特性

### 🎨 图元支持
- **文字图元**: 支持自定义字体、大小、颜色
- **Emoji图元**: 原生emoji支持
- **图片图元**: 自定义图片作为词云元素
- **智能染色**: 支持主题随机染色和参考图像染色

### 🔧 布局引擎
- **四叉树算法**: 高效的碰撞检测和空间管理
- **多种布局方式**: 阿基米德螺旋、矩形螺旋
- **词频驱动**: 根据词频自动调整元素大小
- **旋转支持**: 可配置的旋转角度集合
- **遮罩支持**: 支持任意形状的词云布局

### 🎭 渲染引擎
- **多渲染器**: 支持 Canvas 和 SVG 渲染
- **主题系统**: 内置多种预设主题，支持自定义主题
- **渐进式渲染**: 支持逐个元素的动画渲染
- **参考图像染色**: 可根据参考图像为元素着色

### 📝 文本分析
- **智能分词**: 支持中英文混合文本分词
- **词频统计**: 自动统计词频并归一化
- **停用词过滤**: 内置中英文停用词库
- **多格式支持**: 支持 CSV、JSON 数据导入

## 安装

```bash
npm install
npm run build
```

## 快速开始

### 基础用法

```typescript
import { createWordCloud } from './src/index';

// 获取canvas元素
const canvas = document.getElementById('wordcloud') as HTMLCanvasElement;

// 创建词云
const text = "这是一个词云渲染器的示例文本 This is a sample text for wordcloud renderer";
const renderer = createWordCloud(text, canvas, {
  width: 800,
  height: 600,
  theme: 'classic',
  progressive: false
});
```

### 高级用法

```typescript
import { WordCloudGenerator, LayoutConfig } from './src/index';

// 创建布局配置
const layoutConfig: LayoutConfig = {
  width: 1000,
  height: 800,
  padding: 20,
  rotations: [0, 45, -45, 90, -90],
  spiral: 'archimedean',
  maxAttempts: 1000,
  minFontSize: 12,
  maxFontSize: 80
};

// 创建词云生成器
const generator = new WordCloudGenerator(layoutConfig);

// 设置主题
generator.setTheme('ocean');

// 从文本生成词云
const canvas = document.getElementById('wordcloud') as HTMLCanvasElement;
const renderer = generator.generateFromText(text, canvas, {
  progressive: true,
  animationSpeed: 100
});

// 渐进式渲染
function animate() {
  const result = renderer.nextFrame();
  if (result) {
    requestAnimationFrame(animate);
  }
}
animate();
```

### 使用遮罩

```typescript
// 创建遮罩
const maskImage = new Image();
maskImage.onload = () => {
  const mask = WordCloudGenerator.createMaskFromImage(maskImage, 128);
  
  const renderer = generator.generateFromText(text, canvas, {
    mask: mask,
    themeName: 'rainbow'
  });
};
maskImage.src = 'path/to/mask-image.png';
```

### 参考图像染色

```typescript
// 使用参考图像为词云着色
const referenceImage = new Image();
referenceImage.onload = () => {
  const imageData = WordCloudGenerator.createReferenceImage(referenceImage);
  
  const renderer = generator.generateFromText(text, canvas, {
    useReferenceImage: true,
    referenceImage: imageData
  });
};
referenceImage.src = 'path/to/reference-image.jpg';
```

### 自定义主题

```typescript
// 创建自定义主题
const themeManager = generator.getThemeManager();
const customTheme = themeManager.createCustomTheme(
  'myTheme',
  [
    { r: 255, g: 100, b: 100 },
    { r: 100, g: 255, b: 100 },
    { r: 100, g: 100, b: 255 }
  ],
  { r: 248, g: 249, b: 250 }, // 背景色
  ['Arial', 'Helvetica'], // 字体
  ['normal', 'bold'] // 字重
);

generator.setTheme('myTheme');
```

### 从 TXT 加载（分词器）

```typescript
import { WordCloudLoader } from "@doki-land/wordcloud-loader";

const loader = generator.getLoader();
const wordFrequencies = loader.fromText(text, {
  minLength: 2,
  maxLength: 15,
  language: "auto",
  customStopWords: ["自定义", "停用词"],
});

// 注入自定义分词器（如 nodejieba）
const customLoader = new WordCloudLoader(myTokenizer);
const renderer = generator.generateFromWordFrequencies(customLoader.fromText(text), canvas);
```

### CSV/JSON 数据导入

```typescript
// 从CSV生成词云
const csvData = `word,frequency
苹果,10
香蕉,8
橙子,6`;

const renderer = generator.generateFromCSV(csvData, canvas, {
  wordColumn: 0,
  frequencyColumn: 1
});

// 从JSON生成词云
const jsonData = JSON.stringify([
  { word: '技术', frequency: 15 },
  { word: '创新', frequency: 12 },
  { word: '发展', frequency: 10 }
]);

const renderer2 = generator.generateFromJSON(jsonData, canvas);
```

## API 文档

### WordCloudGenerator

主要的词云生成器类。

#### 构造函数
```typescript
constructor(layoutConfig: LayoutConfig)
```

#### 主要方法

- `generateFromText(text: string, canvas: HTMLCanvasElement | SVGElement, options?: GenerateOptions)`: 从文本生成词云
- `generateFromWordFrequencies(wordFrequencies: WordFrequency[], canvas: HTMLCanvasElement | SVGElement, options?: GenerateOptions)`: 从词频数据生成词云
- `generateFromCSV(csvText: string, canvas: HTMLCanvasElement | SVGElement, options?: GenerateOptions)`: 从CSV数据生成词云
- `generateFromJSON(jsonText: string, canvas: HTMLCanvasElement | SVGElement, options?: GenerateOptions)`: 从JSON数据生成词云
- `setTheme(themeName: string)`: 设置主题
- `getThemeManager()`: 获取主题管理器
- `getLoader()`: 获取词频加载器

#### 静态方法

- `createMaskFromImage(image: HTMLImageElement, threshold?: number)`: 从图片创建遮罩
- `createReferenceImage(image: HTMLImageElement)`: 创建参考图像
- `createQuickConfig(width: number, height: number)`: 创建快速配置

### WordCloudRenderer

渲染器类，支持渐进式渲染。

#### 主要方法

- `render()`: 渲染所有元素
- `nextFrame()`: 渐进式渲染下一帧
- `reset()`: 重置渲染状态
- `isComplete()`: 检查是否渲染完成
- `getProgress()`: 获取渲染进度

### ThemeManager

主题管理器。

#### 内置主题

- `classic`: 经典蓝色主题
- `dark`: 暗色主题
- `rainbow`: 彩虹主题
- `monochrome`: 单色主题
- `ocean`: 海洋主题
- `forest`: 森林主题
- `sunset`: 日落主题

#### 主要方法

- `getTheme(name: string)`: 获取主题
- `addTheme(theme: Theme)`: 添加主题
- `createCustomTheme(...)`: 创建自定义主题
- `generateThemeFromImage(...)`: 从图片生成主题
- `blendThemes(...)`: 混合两个主题

### WordCloudLoader

词频加载器（`@doki-land/wordcloud-loader`）。

#### 主要方法

- `fromText(text: string, options?: TokenizeOptions)`: 从 `.txt` 经分词器加载
- `fromCsv(csvText: string, options?: CsvLoadOptions)`: 从 CSV 加载
- `fromJson(jsonText: string, options?: JsonLoadOptions)`: 从 JSON 加载
- `getTokenizer()`: 获取当前分词器（可构造时注入）

## 类型定义

### LayoutConfig

```typescript
interface LayoutConfig {
  width: number;
  height: number;
  padding: number;
  rotations: number[];
  spiral: 'archimedean' | 'rectangular';
  maxAttempts: number;
  minFontSize: number;
  maxFontSize: number;
}
```

### WordFrequency

```typescript
interface WordFrequency {
  word: string;
  frequency: number;
  type?: 'text' | 'emoji' | 'image';
  metadata?: any;
}
```

### Theme

```typescript
interface Theme {
  name: string;
  colors: Color[];
  backgroundColor?: Color;
  fontFamilies: string[];
  fontWeights: string[];
}
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更新日志

### v1.0.0
- 初始版本发布
- 支持基础词云生成功能
- 四叉树布局引擎
- 多主题支持
- 渐进式渲染
- 中英文分词支持