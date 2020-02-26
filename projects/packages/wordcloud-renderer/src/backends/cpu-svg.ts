import type {
    EmojiElement,
    ImageElement,
    RenderBackend,
    RenderConfig,
    TextElement,
    WordCloudElement,
} from "@doki-land/wordcloud-core";
import { colorToString, pickElementColor } from "../color";

export class CpuSvgRenderBackend implements RenderBackend {
    readonly id = "cpu-svg" as const;
    private svg: SVGElement;
    private config: RenderConfig;

    constructor(svg: SVGElement, config: RenderConfig) {
        this.svg = svg;
        this.config = config;
    }

    clear(): void {
        this.svg.innerHTML = "";

        if (this.config.theme.backgroundColor) {
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("width", "100%");
            rect.setAttribute("height", "100%");
            rect.setAttribute("fill", colorToString(this.config.theme.backgroundColor));
            this.svg.appendChild(rect);
        }
    }

    drawElement(element: WordCloudElement): void {
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
    }

    getOutput(): SVGElement {
        return this.svg;
    }

    getImageData(): Promise<ImageData> {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        const svgData = new XMLSerializer().serializeToString(this.svg);
        const img = new Image();

        return new Promise<ImageData>((resolve) => {
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
            };
            img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
        });
    }

    private drawText(element: TextElement): void {
        const textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textEl.setAttribute("x", element.x.toString());
        textEl.setAttribute("y", (element.y + element.fontSize).toString());
        textEl.setAttribute("font-size", element.fontSize.toString());
        textEl.setAttribute("font-family", element.fontFamily);
        textEl.setAttribute("font-weight", element.fontWeight);

        if (element.rotation !== 0) {
            const centerX = element.x + element.width / 2;
            const centerY = element.y + element.height / 2;
            textEl.setAttribute("transform", `rotate(${element.rotation} ${centerX} ${centerY})`);
        }

        textEl.setAttribute("fill", colorToString(pickElementColor(element, this.config)));
        textEl.textContent = element.text;
        this.svg.appendChild(textEl);
    }

    private drawEmoji(element: EmojiElement): void {
        const textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textEl.setAttribute("x", element.x.toString());
        textEl.setAttribute("y", (element.y + element.height).toString());
        textEl.setAttribute("font-size", element.height.toString());

        if (element.rotation !== 0) {
            const centerX = element.x + element.width / 2;
            const centerY = element.y + element.height / 2;
            textEl.setAttribute("transform", `rotate(${element.rotation} ${centerX} ${centerY})`);
        }

        textEl.textContent = element.emoji;
        this.svg.appendChild(textEl);
    }

    private drawImage(element: ImageElement): void {
        const imageEl = document.createElementNS("http://www.w3.org/2000/svg", "image");
        imageEl.setAttribute("x", element.x.toString());
        imageEl.setAttribute("y", element.y.toString());
        imageEl.setAttribute("width", element.width.toString());
        imageEl.setAttribute("height", element.height.toString());
        imageEl.setAttribute("href", element.src);

        if (element.rotation !== 0) {
            const centerX = element.x + element.width / 2;
            const centerY = element.y + element.height / 2;
            imageEl.setAttribute("transform", `rotate(${element.rotation} ${centerX} ${centerY})`);
        }

        this.svg.appendChild(imageEl);
    }
}
