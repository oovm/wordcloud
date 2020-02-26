import type {
    EmojiElement,
    ImageElement,
    LayoutConfig,
    LayoutResult,
    MaskConfig,
    TextElement,
    WordCloudElement,
    WordFrequency,
} from "@doki-land/wordcloud-core";
import { QuadTree } from "./quadtree";

/**
 * 布局引擎 - 基于四叉树的词云布局算法
 */
export class LayoutEngine {
    private config: LayoutConfig;
    private quadTree: QuadTree;
    private mask?: MaskConfig;
    private placedElements: WordCloudElement[] = [];

    constructor(config: LayoutConfig) {
        this.config = config;
        this.quadTree = new QuadTree(0, 0, config.width, config.height);
    }

    setMask(mask: MaskConfig): void {
        this.mask = mask;
    }

    layout(wordFrequencies: WordFrequency[]): LayoutResult {
        this.reset();

        const normalizedFreqs = this.normalizeFrequencies(wordFrequencies);
        const elements = this.createElements(normalizedFreqs);

        elements.sort((a, b) => b.frequency - a.frequency);

        for (const element of elements) {
            if (this.placeElement(element)) {
                this.placedElements.push(element);
                this.quadTree.insert(element);
            }
        }

        return {
            elements: this.placedElements,
            bounds: { width: this.config.width, height: this.config.height },
            success: this.placedElements.length > 0,
        };
    }

    private reset(): void {
        this.placedElements = [];
        this.quadTree.clear();
    }

    private normalizeFrequencies(wordFrequencies: WordFrequency[]): WordFrequency[] {
        if (wordFrequencies.length === 0) return [];

        const maxFreq = Math.max(...wordFrequencies.map((wf) => wf.frequency), 1);

        return wordFrequencies.map((wf) => ({
            ...wf,
            frequency: wf.frequency / maxFreq,
        }));
    }

    private createElements(wordFrequencies: WordFrequency[]): WordCloudElement[] {
        return wordFrequencies.map((wf, index) => {
            const fontSize = this.calculateFontSize(wf.frequency);
            const rotation = this.getRandomRotation();

            switch (wf.type || "text") {
                case "text":
                    return this.createTextElement(wf, fontSize, rotation, index);
                case "emoji":
                    return this.createEmojiElement(wf, fontSize, rotation, index);
                case "image":
                    return this.createImageElement(wf, fontSize, rotation, index);
                default:
                    return this.createTextElement(wf, fontSize, rotation, index);
            }
        });
    }

    private createTextElement(wf: WordFrequency, fontSize: number, rotation: number, index: number): TextElement {
        const { width, height } = this.measureText(wf.word, fontSize);

        return {
            id: `text-${index}`,
            type: "text",
            text: wf.word,
            x: 0,
            y: 0,
            width,
            height,
            rotation,
            frequency: wf.frequency,
            fontSize,
            fontFamily: "Arial",
            fontWeight: "normal",
            canColor: true,
        };
    }

    private createEmojiElement(wf: WordFrequency, fontSize: number, rotation: number, index: number): EmojiElement {
        return {
            id: `emoji-${index}`,
            type: "emoji",
            emoji: String(wf.metadata?.emoji ?? wf.word),
            x: 0,
            y: 0,
            width: fontSize,
            height: fontSize,
            rotation,
            frequency: wf.frequency,
            canColor: false,
        };
    }

    private createImageElement(wf: WordFrequency, fontSize: number, rotation: number, index: number): ImageElement {
        const size = fontSize;

        return {
            id: `image-${index}`,
            type: "image",
            src: String(wf.metadata?.src ?? ""),
            x: 0,
            y: 0,
            width: size,
            height: size,
            rotation,
            frequency: wf.frequency,
            canColor: false,
        };
    }

    private calculateFontSize(normalizedFrequency: number): number {
        const { minFontSize, maxFontSize } = this.config;
        return minFontSize + (maxFontSize - minFontSize) * normalizedFrequency;
    }

    private getRandomRotation(): number {
        const { rotations } = this.config;
        return rotations[Math.floor(Math.random() * rotations.length)];
    }

    private measureText(text: string, fontSize: number): { width: number; height: number } {
        const avgCharWidth = fontSize * 0.6;
        const width = text.length * avgCharWidth;
        const height = fontSize * 1.2;

        return { width, height };
    }

    private placeElement(element: WordCloudElement): boolean {
        const centerX = this.config.width / 2;
        const centerY = this.config.height / 2;

        for (let attempt = 0; attempt < this.config.maxAttempts; attempt++) {
            const position = this.getSpiralPosition(attempt, centerX, centerY);

            element.x = position.x - element.width / 2;
            element.y = position.y - element.height / 2;

            if (!this.isWithinBounds(element)) {
                continue;
            }

            if (this.mask && !this.isWithinMask(element)) {
                continue;
            }

            if (!this.quadTree.hasCollision(element)) {
                return true;
            }
        }

        return false;
    }

    private getSpiralPosition(step: number, centerX: number, centerY: number): { x: number; y: number } {
        const angle = step * 0.1;
        const radius = step * 2;

        if (this.config.spiral === "archimedean") {
            return {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle),
            };
        }

        const side = Math.floor(step / 4) + 1;
        const pos = step % 4;
        const offset = side * 10;

        switch (pos) {
            case 0:
                return { x: centerX + offset, y: centerY };
            case 1:
                return { x: centerX, y: centerY + offset };
            case 2:
                return { x: centerX - offset, y: centerY };
            default:
                return { x: centerX, y: centerY - offset };
        }
    }

    private isWithinBounds(element: WordCloudElement): boolean {
        return (
            element.x >= this.config.padding &&
            element.y >= this.config.padding &&
            element.x + element.width <= this.config.width - this.config.padding &&
            element.y + element.height <= this.config.height - this.config.padding
        );
    }

    private isWithinMask(element: WordCloudElement): boolean {
        if (!this.mask) return true;

        const { imageData, threshold } = this.mask;
        const centerX = Math.floor(element.x + element.width / 2);
        const centerY = Math.floor(element.y + element.height / 2);

        if (centerX < 0 || centerX >= imageData.width || centerY < 0 || centerY >= imageData.height) {
            return false;
        }

        const index = (centerY * imageData.width + centerX) * 4;
        const alpha = imageData.data[index + 3];

        return alpha > threshold;
    }

    getPlacedElements(): WordCloudElement[] {
        return [...this.placedElements];
    }
}
