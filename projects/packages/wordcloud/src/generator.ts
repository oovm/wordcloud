import { WordCloudLoader } from "@doki-land/wordcloud-loader";
import { LayoutEngine } from "@doki-land/wordcloud-layout";
import { WordCloudRenderer } from "@doki-land/wordcloud-renderer";
import type {
    CsvLoadOptions,
    JsonLoadOptions,
} from "@doki-land/wordcloud-loader";
import type { LayoutConfig, MaskConfig, RenderBackendId, RenderConfig, Theme, TokenizeOptions, WordFrequency } from "./types";
import { ThemeManager } from "./theme-manager";

/**
 * 词云生成器主类 - 整合加载、布局与渲染
 */
export class WordCloudGenerator {
    private layoutEngine: LayoutEngine;
    private layoutConfig: LayoutConfig;
    private themeManager: ThemeManager;
    private loader: WordCloudLoader;
    private currentTheme: Theme;

    constructor(layoutConfig: LayoutConfig, loader?: WordCloudLoader) {
        this.layoutConfig = layoutConfig;
        this.layoutEngine = new LayoutEngine(layoutConfig);
        this.themeManager = new ThemeManager();
        this.loader = loader ?? new WordCloudLoader();
        this.currentTheme = this.themeManager.getTheme("classic")!;
    }

    generateFromText(
        text: string,
        canvas: HTMLCanvasElement | SVGElement,
        options: GenerateOptions = {},
    ): WordCloudRenderer<HTMLCanvasElement | SVGElement> {
        const tokenizeOptions = options.tokenizeOptions ?? options.analyzeOptions;
        const wordFrequencies = this.loader.fromText(text, tokenizeOptions);
        return this.generateFromWordFrequencies(wordFrequencies, canvas, options);
    }

    generateFromWordFrequencies(
        wordFrequencies: WordFrequency[],
        canvas: HTMLCanvasElement | SVGElement,
        options: GenerateOptions = {},
    ): WordCloudRenderer<HTMLCanvasElement | SVGElement> {
        if (options.themeName) {
            const theme = this.themeManager.getTheme(options.themeName);
            if (theme) {
                this.currentTheme = theme;
            }
        }

        if (options.mask) {
            this.layoutEngine.setMask(options.mask);
        }

        const layoutResult = this.layoutEngine.layout(wordFrequencies);

        if (!layoutResult.success || layoutResult.elements.length === 0) {
            throw new Error("词云布局失败，请检查配置参数");
        }

        const renderConfig: RenderConfig = {
            theme: this.currentTheme,
            backend: options.renderBackend,
            useReferenceImage: options.useReferenceImage || false,
            referenceImage: options.referenceImage,
            progressive: options.progressive || false,
            animationSpeed: options.animationSpeed || 100,
        };

        const renderer = new WordCloudRenderer(canvas, renderConfig);
        renderer.setElements(layoutResult.elements);

        if (!options.progressive) {
            renderer.render();
        }

        return renderer;
    }

    generateFromCSV(
        csvText: string,
        canvas: HTMLCanvasElement | SVGElement,
        options: GenerateOptions & CsvLoadOptions = {},
    ): WordCloudRenderer<HTMLCanvasElement | SVGElement> {
        const { wordColumn, frequencyColumn, skipHeader, ...generateOptions } = options;
        const wordFrequencies = this.loader.fromCsv(csvText, {
            wordColumn,
            frequencyColumn,
            skipHeader,
        });
        return this.generateFromWordFrequencies(wordFrequencies, canvas, generateOptions);
    }

    generateFromJSON(
        jsonText: string,
        canvas: HTMLCanvasElement | SVGElement,
        options: GenerateOptions & JsonLoadOptions = {},
    ): WordCloudRenderer<HTMLCanvasElement | SVGElement> {
        const { wordKey, frequencyKey, arrayPath, ...generateOptions } = options;
        const wordFrequencies = this.loader.fromJson(jsonText, {
            wordKey,
            frequencyKey,
            arrayPath,
        });
        return this.generateFromWordFrequencies(wordFrequencies, canvas, generateOptions);
    }

    setLayoutConfig(config: Partial<LayoutConfig>): void {
        this.layoutConfig = { ...this.layoutConfig, ...config };
        this.layoutEngine = new LayoutEngine(this.layoutConfig);
    }

    getLayoutConfig(): LayoutConfig {
        return { ...this.layoutConfig };
    }

    getThemeManager(): ThemeManager {
        return this.themeManager;
    }

    getLoader(): WordCloudLoader {
        return this.loader;
    }

    setTheme(themeName: string): boolean {
        const theme = this.themeManager.getTheme(themeName);
        if (theme) {
            this.currentTheme = theme;
            return true;
        }
        return false;
    }

    getCurrentTheme(): Theme {
        return this.currentTheme;
    }

    static createMaskFromImage(image: HTMLImageElement, threshold: number = 128): MaskConfig {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;

        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        return {
            imageData,
            threshold,
        };
    }

    static createReferenceImage(image: HTMLImageElement): ImageData {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;

        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);

        return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    static createQuickConfig(width: number, height: number): LayoutConfig {
        return {
            width,
            height,
            padding: Math.min(width, height) * 0.05,
            rotations: [0, 45, -45, 90, -90],
            spiral: "archimedean",
            maxAttempts: 1000,
            minFontSize: Math.min(width, height) * 0.02,
            maxFontSize: Math.min(width, height) * 0.1,
        };
    }
}

export interface GenerateOptions {
    themeName?: string;
    mask?: MaskConfig;
    renderBackend?: RenderBackendId;
    useReferenceImage?: boolean;
    referenceImage?: ImageData;
    progressive?: boolean;
    animationSpeed?: number;
    tokenizeOptions?: TokenizeOptions;
    /** @deprecated Use `tokenizeOptions`. */
    analyzeOptions?: TokenizeOptions;
}

export function createWordCloud(
    text: string,
    canvas: HTMLCanvasElement | SVGElement,
    options: {
        width?: number;
        height?: number;
        theme?: string;
        progressive?: boolean;
        renderBackend?: RenderBackendId;
    } = {},
): WordCloudRenderer<HTMLCanvasElement | SVGElement> {
    const { width = 800, height = 600, theme = "classic", progressive = false, renderBackend } = options;

    const layoutConfig = WordCloudGenerator.createQuickConfig(width, height);
    const generator = new WordCloudGenerator(layoutConfig);

    return generator.generateFromText(text, canvas, {
        themeName: theme,
        progressive,
        renderBackend,
    });
}
