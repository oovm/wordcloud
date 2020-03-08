/**
 * @doki-land/wordcloud — facade over core / loader / layout / renderer.
 */

export { WordCloudGenerator, createWordCloud, type GenerateOptions } from "./generator";
export { ThemeManager } from "./theme-manager";
export * from "./types";

export {
    WordCloudLoader,
    CSV_PARSER_ENGINES,
    TOKENIZER_ENGINES,
    createNaturalTokenizer,
    createNodejiebaTokenizer,
    defaultTokenizer,
    detectLanguage,
    loadFromCsv,
    loadFromCsvWithPapaparse,
    loadFromJson,
    loadFromText,
    type CsvLoadOptions,
    type CsvParser,
    type CsvParserEngineId,
    type JsonLoadOptions,
    type PapaparseCsvOptions,
    type Tokenizer,
    type TokenizerEngineId,
} from "@doki-land/wordcloud-loader";

export { LayoutEngine, QuadTree } from "@doki-land/wordcloud-layout";

export {
    CanvasWordCloudRenderer,
    CpuCanvasRenderBackend,
    CpuSvgRenderBackend,
    SVGWordCloudRenderer,
    WebGpuRenderBackend,
    WordCloudRenderer,
    createRenderBackend,
    registerRenderBackend,
    resolveRenderBackendId,
} from "@doki-land/wordcloud-renderer";

export type { RenderBackend, RenderBackendId, TokenizeOptions } from "@doki-land/wordcloud-core";

/** @deprecated Use `TokenizeOptions`. */
export type { AnalyzeOptions } from "@doki-land/wordcloud-core";
