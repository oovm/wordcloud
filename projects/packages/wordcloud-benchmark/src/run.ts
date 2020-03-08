import { runLayoutBenchmarks } from "./bench-layout";
import { runRendererBenchmarks } from "./bench-renderer";
import { runTokenizerBenchmarks } from "./bench-tokenizer";

const iterations = Number.parseInt(process.env.BENCH_ITERATIONS ?? "5", 10);

console.log("wordcloud-benchmark");
console.log(`iterations=${iterations}`);
console.log("--- tokenizer ---");
await runTokenizerBenchmarks(iterations);
console.log("--- layout ---");
runLayoutBenchmarks(iterations);
console.log("--- renderer ---");
runRendererBenchmarks(iterations);
