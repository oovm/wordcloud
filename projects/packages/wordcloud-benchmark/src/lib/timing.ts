export type BenchResult = {
    name: string;
    iterations: number;
    medianMs: number;
    minMs: number;
    maxMs: number;
};

export function median(values: number[]): number {
    if (values.length === 0) {
        return 0;
    }
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
        return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[mid];
}

export function bench(name: string, iterations: number, fn: () => void): BenchResult {
    const samples: number[] = [];

    for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        fn();
        samples.push(performance.now() - start);
    }

    return {
        name,
        iterations,
        medianMs: median(samples),
        minMs: Math.min(...samples),
        maxMs: Math.max(...samples),
    };
}

export function printResults(results: BenchResult[]): void {
    for (const result of results) {
        console.log(
            `${result.name}: median ${result.medianMs.toFixed(3)} ms ` +
                `(min ${result.minMs.toFixed(3)}, max ${result.maxMs.toFixed(3)}, n=${result.iterations})`,
        );
    }
}
