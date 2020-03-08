const CHINESE_SEED =
    "词云可视化把关键词按频次映射为字号与颜色，常用于新闻摘要、舆情监测、产品评论和用户反馈分析。";
const ENGLISH_SEED =
    "Word clouds map term frequency to font size and color for exploratory text analysis, reporting, and dashboards.";

export type TextCorpusId = "chinese" | "english" | "mixed";

export function buildCorpus(kind: TextCorpusId, targetChars: number): string {
    const seed =
        kind === "chinese"
            ? CHINESE_SEED
            : kind === "english"
              ? ENGLISH_SEED
              : `${CHINESE_SEED} ${ENGLISH_SEED}`;

    if (seed.length >= targetChars) {
        return seed.slice(0, targetChars);
    }

    const repeats = Math.ceil(targetChars / seed.length);
    return seed.repeat(repeats).slice(0, targetChars);
}
