import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** True when this module is the tsx/node entry script (works on Windows paths). */
export function isDirectRun(importMetaUrl: string): boolean {
    const entry = process.argv[1];
    if (!entry) {
        return false;
    }

    return resolve(fileURLToPath(importMetaUrl)) === resolve(entry);
}
