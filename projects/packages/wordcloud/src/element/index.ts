export { defineWordCloud, WORD_CLOUD_TAG, WordCloudCustomElement } from "./word-cloud";

import { defineWordCloud } from "./word-cloud";

export function registerWordCloud(): void {
    defineWordCloud();
}

registerWordCloud();
