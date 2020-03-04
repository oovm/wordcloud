import { WordCloudGenerator } from "@doki-land/wordcloud";
import { LayoutEngine } from "@doki-land/wordcloud-layout";
    import { colorToString } from "@doki-land/wordcloud-renderer";
import type { Color, LayoutConfig, TextElement, WordFrequency } from "@doki-land/wordcloud-core";
import type { WordCloudConfig, WordCloudElement } from "../types";

export interface AnalyzedWord {
    text: string;
    frequency: number;
}

export interface LayoutWordCloudResult {
    elements: WordCloudElement[];
    placedCount: number;
    totalCount: number;
    durationMs: number;
}

const COLOR_SCHEME_TO_THEME: Record<WordCloudConfig["colorScheme"], string> = {
    default: "classic",
    warm: "sunset",
    cool: "ocean",
    rainbow: "rainbow",
    monochrome: "monochrome",
    custom: "classic",
};

function resolveRotations(config: WordCloudConfig): number[] {
    if (config.rotationMode === "set" && config.rotationAngles?.length) {
        return config.rotationAngles;
    }

    const [min, max] = config.rotationRange;
    if (min === max) {
        return [min];
    }

    return [0, min, max, Math.round((min + max) / 2)];
}

export function toLayoutConfig(config: WordCloudConfig): LayoutConfig {
    return {
        width: config.width,
        height: config.height,
        padding: config.padding,
        rotations: resolveRotations(config),
        spiral: config.spiral,
        maxAttempts: 1000,
        minFontSize: config.fontSizeRange[0],
        maxFontSize: config.fontSizeRange[1],
    };
}

function toWordFrequencies(words: AnalyzedWord[]): WordFrequency[] {
    return words.map((word) => ({
        word: word.text,
        frequency: word.frequency,
        type: "text" as const,
    }));
}

function pickThemeColor(colors: Color[], index: number): string {
    return colorToString(colors[index % colors.length]);
}

function toDisplayElement(element: TextElement, config: WordCloudConfig, color: string): WordCloudElement {
    const fontFamily = config.fontFamily.split(",")[0]?.trim().replace(/^['"]|['"]$/g, "") ?? "Arial";

    return {
        type: "text",
        text: element.text,
        x: element.x + element.width / 2,
        y: element.y + element.height / 2,
        width: element.width,
        height: element.height,
        fontSize: element.fontSize,
        fontFamily,
        color,
        rotation: element.rotation,
        weight: element.frequency,
        opacity: 1,
    };
}

async function resolveMask(config: WordCloudConfig) {
    if (!config.maskImage) {
        return undefined;
    }

    return new Promise<ReturnType<typeof WordCloudGenerator.createMaskFromImage>>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(WordCloudGenerator.createMaskFromImage(image));
        image.onerror = () => reject(new Error("遮罩图片加载失败"));
        image.src = config.maskImage!;
    });
}

export async function layoutWordCloud(
    words: AnalyzedWord[],
    config: WordCloudConfig,
): Promise<LayoutWordCloudResult> {
    const startedAt = performance.now();
    const layoutConfig = toLayoutConfig(config);
    const engine = new LayoutEngine(layoutConfig);
    const generator = new WordCloudGenerator(layoutConfig);
    const themeName = COLOR_SCHEME_TO_THEME[config.colorScheme] ?? "classic";
    const theme = generator.getThemeManager().getTheme(themeName) ?? generator.getCurrentTheme();

    const mask = await resolveMask(config);
    if (mask) {
        engine.setMask(mask);
    }

    const result = engine.layout(toWordFrequencies(words));
    const textElements = result.elements.filter((element): element is TextElement => element.type === "text");

    const elements = textElements.map((element, index) =>
        toDisplayElement(element, config, pickThemeColor(theme.colors, index)),
    );

    return {
        elements,
        placedCount: elements.length,
        totalCount: words.length,
        durationMs: Math.round(performance.now() - startedAt),
    };
}
