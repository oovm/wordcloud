import { type GenerateOptions, WordCloudGenerator } from "../index";
import type { LayoutConfig, WordFrequency } from "../types";

export const WORD_CLOUD_TAG = "word-cloud";

function parseNumber(value: string | null, fallback: number): number {
    if (!value) {
        return fallback;
    }
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function readWordsAttribute(raw: string | null): WordFrequency[] | undefined {
    if (!raw?.trim()) {
        return undefined;
    }
    try {
        const data = JSON.parse(raw) as unknown;
        if (!Array.isArray(data)) {
            return undefined;
        }
        return data
            .map((item) => {
                if (typeof item === "string") {
                    return { word: item, frequency: 1 };
                }
                if (typeof item === "object" && item !== null) {
                    const record = item as Record<string, unknown>;
                    const word = String(record.word ?? record.text ?? "");
                    const frequency = Number(record.frequency ?? record.count ?? 1);
                    if (!word) {
                        return undefined;
                    }
                    return { word, frequency: Number.isFinite(frequency) ? frequency : 1 };
                }
                return undefined;
            })
            .filter((item): item is WordFrequency => item !== undefined);
    } catch {
        return undefined;
    }
}

export class WordCloudCustomElement extends HTMLElement {
    static readonly observedAttributes = ["text", "words", "width", "height", "theme", "renderer", "progressive"];

    private generator: WordCloudGenerator | undefined;
    private surface: HTMLCanvasElement | SVGSVGElement | undefined;
    private mount: HTMLDivElement | undefined;

    connectedCallback(): void {
        if (!this.mount) {
            this.mount = document.createElement("div");
            this.mount.style.width = "100%";
            this.mount.style.height = "100%";
            this.mount.style.display = "block";
            this.append(this.mount);
        }
        this.renderCloud();
    }

    attributeChangedCallback(): void {
        if (this.isConnected) {
            this.renderCloud();
        }
    }

    setWords(words: WordFrequency[]): void {
        this.setAttribute("words", JSON.stringify(words));
        this.renderCloud(words);
    }

    setText(text: string): void {
        this.setAttribute("text", text);
        this.renderCloud();
    }

    private layoutConfig(): LayoutConfig {
        const width = parseNumber(this.getAttribute("width"), this.clientWidth || 640);
        const height = parseNumber(this.getAttribute("height"), this.clientHeight || 480);
        return WordCloudGenerator.createQuickConfig(width, height);
    }

    private renderCloud(wordsOverride?: WordFrequency[]): void {
        if (!this.mount) {
            return;
        }

        const width = parseNumber(this.getAttribute("width"), this.clientWidth || 640);
        const height = parseNumber(this.getAttribute("height"), this.clientHeight || 480);
        const rendererKind = this.getAttribute("renderer") === "svg" ? "svg" : "canvas";

        this.mount.replaceChildren();
        this.surface =
            rendererKind === "svg"
                ? document.createElementNS("http://www.w3.org/2000/svg", "svg")
                : document.createElement("canvas");

        this.surface.setAttribute("width", String(width));
        this.surface.setAttribute("height", String(height));
        if (this.surface instanceof HTMLCanvasElement) {
            this.surface.width = width;
            this.surface.height = height;
            this.surface.style.width = "100%";
            this.surface.style.height = "100%";
        } else {
            this.surface.style.width = "100%";
            this.surface.style.height = "100%";
        }
        this.mount.append(this.surface);

        this.generator = new WordCloudGenerator(this.layoutConfig());
        const options: GenerateOptions = {
            themeName: this.getAttribute("theme") ?? "classic",
            progressive: this.getAttribute("progressive") === "true",
        };

        const words = wordsOverride ?? readWordsAttribute(this.getAttribute("words"));
        const text = this.getAttribute("text");

        if (words && words.length > 0) {
            this.generator.generateFromWordFrequencies(words, this.surface, options);
            return;
        }

        if (text?.trim()) {
            this.generator.generateFromText(text, this.surface, options);
        }
    }
}

export function defineWordCloud(tagName: string = WORD_CLOUD_TAG): void {
    if (typeof customElements === "undefined") {
        return;
    }
    if (!customElements.get(tagName)) {
        customElements.define(tagName, WordCloudCustomElement);
    }
}
