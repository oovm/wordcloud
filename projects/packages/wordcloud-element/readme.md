# @doki-land/wordcloud-element

`<word-cloud>` custom element built on `@doki-land/wordcloud`.

```ts
import "@doki-land/wordcloud-element";
```

```html
<word-cloud
  text="hello world"
  width="640"
  height="480"
  theme="classic"
  renderer="canvas"
></word-cloud>
```

Manual registration:

```ts
import { defineWordCloud, registerWordCloud } from "@doki-land/wordcloud-element";

registerWordCloud();
// or defineWordCloud("my-word-cloud");
```

This package has `sideEffects: true` because it registers the custom element on import.
