import {
  WordCloudElement,
  TextElement,
  EmojiElement,
  ImageElement,
  Theme,
  RenderConfig,
  Color,
  CanvasRenderer
} from './types';

/**
 * Canvas渲染器实现
 */
export class CanvasWordCloudRenderer implements CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: RenderConfig;

  constructor(canvas: HTMLCanvasElement, config: RenderConfig) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.config = config;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 设置背景色
    if (this.config.theme.backgroundColor) {
      this.ctx.fillStyle = this.colorToString(this.config.theme.backgroundColor);
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  drawElement(element: WordCloudElement): void {
    this.ctx.save();
    
    // 应用旋转
    if (element.rotation !== 0) {
      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate((element.rotation * Math.PI) / 180);
      this.ctx.translate(-centerX, -centerY);
    }
    
    switch (element.type) {
      case 'text':
        this.drawTextElement(element as TextElement);
        break;
      case 'emoji':
        this.drawEmojiElement(element as EmojiElement);
        break;
      case 'image':
        this.drawImageElement(element as ImageElement);
        break;
    }
    
    this.ctx.restore();
  }

  private drawTextElement(element: TextElement): void {
    this.ctx.font = `${element.fontWeight} ${element.fontSize}px ${element.fontFamily}`;
    this.ctx.textBaseline = 'top';
    
    // 设置颜色
    const color = this.getElementColor(element);
    this.ctx.fillStyle = this.colorToString(color);
    
    this.ctx.fillText(element.text, element.x, element.y);
  }

  private drawEmojiElement(element: EmojiElement): void {
    this.ctx.font = `${element.height}px Arial`;
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(element.emoji, element.x, element.y);
  }

  private drawImageElement(element: ImageElement): void {
    // 这里需要预加载的图片对象
    // 实际实现中应该有图片缓存机制
    const img = new Image();
    img.onload = () => {
      this.ctx.drawImage(img, element.x, element.y, element.width, element.height);
    };
    img.src = element.src;
  }

  private getElementColor(element: WordCloudElement): Color {
    if (!element.canColor) {
      return { r: 0, g: 0, b: 0 };
    }
    
    // 如果使用参考图像染色
    if (this.config.useReferenceImage && this.config.referenceImage) {
      return this.getColorFromReferenceImage(element);
    }
    
    // 从主题随机取色
    const colors = this.config.theme.colors;
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private getColorFromReferenceImage(element: WordCloudElement): Color {
    if (!this.config.referenceImage) {
      return { r: 0, g: 0, b: 0 };
    }
    
    const { referenceImage } = this.config;
    const x = Math.floor(element.x);
    const y = Math.floor(element.y);
    
    if (x < 0 || x >= referenceImage.width || y < 0 || y >= referenceImage.height) {
      return { r: 0, g: 0, b: 0 };
    }
    
    const index = (y * referenceImage.width + x) * 4;
    return {
      r: referenceImage.data[index],
      g: referenceImage.data[index + 1],
      b: referenceImage.data[index + 2],
      a: referenceImage.data[index + 3] / 255
    };
  }

  private colorToString(color: Color): string {
    if (color.a !== undefined) {
      return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    }
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
  }

  getImageData(): ImageData {
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }
}

/**
 * SVG渲染器实现
 */
export class SVGWordCloudRenderer implements CanvasRenderer {
  private svg: SVGElement;
  private config: RenderConfig;

  constructor(svg: SVGElement, config: RenderConfig) {
    this.svg = svg;
    this.config = config;
  }

  getCanvas(): SVGElement {
    return this.svg;
  }

  clear(): void {
    this.svg.innerHTML = '';
    
    // 设置背景
    if (this.config.theme.backgroundColor) {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', '100%');
      rect.setAttribute('height', '100%');
      rect.setAttribute('fill', this.colorToString(this.config.theme.backgroundColor));
      this.svg.appendChild(rect);
    }
  }

  drawElement(element: WordCloudElement): void {
    switch (element.type) {
      case 'text':
        this.drawTextElement(element as TextElement);
        break;
      case 'emoji':
        this.drawEmojiElement(element as EmojiElement);
        break;
      case 'image':
        this.drawImageElement(element as ImageElement);
        break;
    }
  }

  private drawTextElement(element: TextElement): void {
    const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textEl.setAttribute('x', element.x.toString());
    textEl.setAttribute('y', (element.y + element.fontSize).toString());
    textEl.setAttribute('font-size', element.fontSize.toString());
    textEl.setAttribute('font-family', element.fontFamily);
    textEl.setAttribute('font-weight', element.fontWeight);
    
    if (element.rotation !== 0) {
      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;
      textEl.setAttribute('transform', `rotate(${element.rotation} ${centerX} ${centerY})`);
    }
    
    const color = this.getElementColor(element);
    textEl.setAttribute('fill', this.colorToString(color));
    textEl.textContent = element.text;
    
    this.svg.appendChild(textEl);
  }

  private drawEmojiElement(element: EmojiElement): void {
    const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textEl.setAttribute('x', element.x.toString());
    textEl.setAttribute('y', (element.y + element.height).toString());
    textEl.setAttribute('font-size', element.height.toString());
    
    if (element.rotation !== 0) {
      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;
      textEl.setAttribute('transform', `rotate(${element.rotation} ${centerX} ${centerY})`);
    }
    
    textEl.textContent = element.emoji;
    this.svg.appendChild(textEl);
  }

  private drawImageElement(element: ImageElement): void {
    const imageEl = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    imageEl.setAttribute('x', element.x.toString());
    imageEl.setAttribute('y', element.y.toString());
    imageEl.setAttribute('width', element.width.toString());
    imageEl.setAttribute('height', element.height.toString());
    imageEl.setAttribute('href', element.src);
    
    if (element.rotation !== 0) {
      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;
      imageEl.setAttribute('transform', `rotate(${element.rotation} ${centerX} ${centerY})`);
    }
    
    this.svg.appendChild(imageEl);
  }

  private getElementColor(element: WordCloudElement): Color {
    if (!element.canColor) {
      return { r: 0, g: 0, b: 0 };
    }
    
    // SVG渲染器暂不支持参考图像染色
    const colors = this.config.theme.colors;
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private colorToString(color: Color): string {
    if (color.a !== undefined) {
      return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    }
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
  }

  getImageData(): ImageData {
    // SVG转ImageData需要通过canvas中转
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const svgData = new XMLSerializer().serializeToString(this.svg);
    const img = new Image();
    
    return new Promise<ImageData>((resolve) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }) as any; // 简化处理，实际应该返回Promise
  }
}

/**
 * 词云渲染器主类 - 支持渐进式渲染
 */
export class WordCloudRenderer<T extends HTMLCanvasElement | SVGElement> {
  private renderer: CanvasRenderer;
  private elements: WordCloudElement[] = [];
  private currentIndex: number = 0;
  private isProgressive: boolean;

  constructor(canvas: T, config: RenderConfig) {
    this.isProgressive = config.progressive;
    
    if (canvas instanceof HTMLCanvasElement) {
      this.renderer = new CanvasWordCloudRenderer(canvas, config);
    } else {
      this.renderer = new SVGWordCloudRenderer(canvas as SVGElement, config);
    }
  }

  /**
   * 设置要渲染的元素
   */
  setElements(elements: WordCloudElement[]): void {
    this.elements = elements;
    this.currentIndex = 0;
  }

  /**
   * 渲染所有元素
   */
  render(): T {
    this.renderer.clear();
    
    for (const element of this.elements) {
      this.renderer.drawElement(element);
    }
    
    return this.renderer.getCanvas() as T;
  }

  /**
   * 渐进式渲染 - 每次渲染一个元素
   * @returns 返回canvas/svg或null（如果渲染完成）
   */
  nextFrame(): T | null {
    if (!this.isProgressive || this.currentIndex >= this.elements.length) {
      return null;
    }
    
    if (this.currentIndex === 0) {
      this.renderer.clear();
    }
    
    this.renderer.drawElement(this.elements[this.currentIndex]);
    this.currentIndex++;
    
    return this.renderer.getCanvas() as T;
  }

  /**
   * 重置渐进式渲染
   */
  reset(): void {
    this.currentIndex = 0;
  }

  /**
   * 检查是否渲染完成
   */
  isComplete(): boolean {
    return this.currentIndex >= this.elements.length;
  }

  /**
   * 获取渲染进度 (0-1)
   */
  getProgress(): number {
    if (this.elements.length === 0) return 1;
    return this.currentIndex / this.elements.length;
  }
}