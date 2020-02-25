/** Element kinds placed on the word cloud canvas. */
export type ElementType = "text" | "emoji" | "image";

export interface BaseElement {
    id: string;
    type: ElementType;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    frequency: number;
    canColor: boolean;
}

export interface TextElement extends BaseElement {
    type: "text";
    text: string;
    fontSize: number;
    fontFamily: string;
    fontWeight: string;
    color?: string;
    canColor: true;
}

export interface EmojiElement extends BaseElement {
    type: "emoji";
    emoji: string;
    canColor: false;
}

export interface ImageElement extends BaseElement {
    type: "image";
    src: string;
    canColor: false;
}

export type WordCloudElement = TextElement | EmojiElement | ImageElement;

export interface Color {
    r: number;
    g: number;
    b: number;
    a?: number;
}

export interface Theme {
    name: string;
    colors: Color[];
    backgroundColor?: Color;
    fontFamilies: string[];
    fontWeights: string[];
}

export interface LayoutConfig {
    width: number;
    height: number;
    padding: number;
    rotations: number[];
    spiral: "archimedean" | "rectangular";
    maxAttempts: number;
    minFontSize: number;
    maxFontSize: number;
}

export interface MaskConfig {
    imageData: ImageData;
    threshold: number;
}

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

/** Render backend selector (CPU canvas/SVG, WebGPU, …). */
export type RenderBackendId = "cpu-canvas" | "cpu-svg" | "webgpu";

/** Pluggable render backend contract. */
export interface RenderBackend {
    readonly id: RenderBackendId;
    clear(): void;
    drawElement(element: WordCloudElement): void;
    getOutput(): HTMLCanvasElement | SVGElement;
    getImageData(): ImageData | Promise<ImageData>;
}

export interface RenderConfig {
    theme: Theme;
    /** Defaults from surface kind when omitted (`cpu-canvas` / `cpu-svg`). */
    backend?: RenderBackendId;
    useReferenceImage?: boolean;
    referenceImage?: ImageData;
    progressive: boolean;
    animationSpeed: number;
}

export interface WordFrequency {
    word: string;
    frequency: number;
    type?: ElementType;
    metadata?: Record<string, unknown>;
}

export interface CanvasRenderer {
    getCanvas(): HTMLCanvasElement | SVGElement;
    clear(): void;
    drawElement(element: WordCloudElement): void;
    getImageData(): ImageData;
}

export interface LayoutResult {
    elements: WordCloudElement[];
    bounds: { width: number; height: number };
    success: boolean;
}

/** Options for tokenizing plain text into word frequencies. */
export interface TokenizeOptions {
    minLength?: number;
    maxLength?: number;
    caseSensitive?: boolean;
    includeNumbers?: boolean;
    customStopWords?: string[];
    language?: "auto" | "chinese" | "english" | "mixed";
}

/** @deprecated Use `TokenizeOptions`. */
export type AnalyzeOptions = TokenizeOptions;

export interface GenerateOptions {
    themeName?: string;
    mask?: MaskConfig;
    useReferenceImage?: boolean;
    referenceImage?: ImageData;
    progressive?: boolean;
    animationSpeed?: number;
    /** Used when loading from plain text (`.txt`). */
    tokenizeOptions?: TokenizeOptions;
    /** @deprecated Use `tokenizeOptions`. */
    analyzeOptions?: TokenizeOptions;
}
