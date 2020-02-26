import type { Color, RenderConfig, WordCloudElement } from "@doki-land/wordcloud-core";

export function colorToString(color: Color): string {
    if (color.a !== undefined) {
        return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    }
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
}

export function pickElementColor(element: WordCloudElement, config: RenderConfig): Color {
    if (!element.canColor) {
        return { r: 0, g: 0, b: 0 };
    }

    if (config.useReferenceImage && config.referenceImage) {
        const { referenceImage } = config;
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
            a: referenceImage.data[index + 3] / 255,
        };
    }

    const colors = config.theme.colors;
    return colors[Math.floor(Math.random() * colors.length)];
}
