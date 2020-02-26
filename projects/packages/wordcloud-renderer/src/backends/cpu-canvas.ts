import type {
    EmojiElement,
    ImageElement,
    RenderBackend,
    RenderConfig,
    TextElement,
    WordCloudElement,
} from "@doki-land/wordcloud-core";
import { colorToString, pickElementColor } from "../color";

export class CpuCanvasRenderBackend implements RenderBackend {
    readonly id = "cpu-canvas" as const;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private config: RenderConfig;

    constructor(canvas: HTMLCanvasElement, config: RenderConfig) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.config = config;
    }

    clear(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.config.theme.backgroundColor) {
            this.ctx.fillStyle = colorToString(this.config.theme.backgroundColor);
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    drawElement(element: WordCloudElement): void {
        this.ctx.save();

        if (element.rotation !== 0) {
            const centerX = element.x + element.width / 2;
            const centerY = element.y + element.height / 2;
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate((element.rotation * Math.PI) / 180);
            this.ctx.translate(-centerX, -centerY);
        }

        switch (element.type) {
            case "text":
                this.drawText(element as TextElement);
                break;
            case "emoji":
                this.drawEmoji(element as EmojiElement);
                break;
            case "image":
                this.drawImage(element as ImageElement);
                break;
        }

        this.ctx.restore();
    }

    getOutput(): HTMLCanvasElement {
        return this.canvas;
    }

    getImageData(): ImageData {
        return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    private drawText(element: TextElement): void {
        this.ctx.font = `${element.fontWeight} ${element.fontSize}px ${element.fontFamily}`;
        this.ctx.textBaseline = "top";
        this.ctx.fillStyle = colorToString(pickElementColor(element, this.config));
        this.ctx.fillText(element.text, element.x, element.y);
    }

    private drawEmoji(element: EmojiElement): void {
        this.ctx.font = `${element.height}px Arial`;
        this.ctx.textBaseline = "top";
        this.ctx.fillText(element.emoji, element.x, element.y);
    }

    private drawImage(element: ImageElement): void {
        const img = new Image();
        img.onload = () => {
            this.ctx.drawImage(img, element.x, element.y, element.width, element.height);
        };
        img.src = element.src;
    }
}
