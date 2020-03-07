/** Built-in tokenizer — zero native deps, browser-safe. */
export type TokenizerEngineId = "builtin" | "nodejieba" | "natural";

/** Built-in line split CSV parser vs Papa Parse header-aware parser. */
export type CsvParserEngineId = "builtin" | "papaparse";

export type LoaderRuntime = "browser" | "node" | "universal";

export interface TokenizerEngineMeta {
    id: TokenizerEngineId;
    label: string;
    description: string;
    runtime: LoaderRuntime;
}

export interface CsvParserEngineMeta {
    id: CsvParserEngineId;
    label: string;
    description: string;
    runtime: LoaderRuntime;
}

export const TOKENIZER_ENGINES: readonly TokenizerEngineMeta[] = [
    {
        id: "builtin",
        label: "内置分词",
        description: "正则 + 停用词，零依赖，浏览器可用",
        runtime: "universal",
    },
    {
        id: "nodejieba",
        label: "nodejieba",
        description: "中文结巴分词，Node 原生模块（浏览器需自行提供 wasm 垫片）",
        runtime: "node",
    },
    {
        id: "natural",
        label: "natural",
        description: "natural WordTokenizer，适合英文与混合文本",
        runtime: "universal",
    },
];

export const CSV_PARSER_ENGINES: readonly CsvParserEngineMeta[] = [
    {
        id: "builtin",
        label: "内置 CSV",
        description: "按列下标解析，轻量无依赖",
        runtime: "universal",
    },
    {
        id: "papaparse",
        label: "Papa Parse",
        description: "表头列名解析（word/text、frequency/count）",
        runtime: "universal",
    },
];
