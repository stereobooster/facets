# Initialization API

## Current

Currently initialization looks like this:

```ts
import {
  createIndex,
  getSearchClient,
} from "@stereobooster/facets-instantsearch";

const schema = {
  /* ... */
} satisfies Schema;

const data = await fetch("/records.json").then((x) => x.json());
const index = new Facets({ textIndex: TQuickscoreIndex, schema }, data);
const searchClient = getSearchClient(index, schema);

const search = instantsearch({
  searchClient,
  indexName: "instant_search",
  routing: getRouting({ indexName: "instant_search" }),
  insights: false,
});
```

Which means that UI will not be drawn until:

- data loads
- index for facets is builded
- index for text is builded

## Alternative solution

```ts
const index = new Facets({ textIndex: TQuickscoreIndex, schema });
const searchClient = getSearchClient(index);
const search = instantsearch({ searchClient /* ... */ });

index.on((event) => {
  // redraw UI
});
fetch("/records.json")
  .then((x) => x.json())
  .then((data) => index.load(data));
```

- UI can be drawn immediately
- As soon as data load we can show results, if there are no filters (which can come from routing)
- As soon as index for facets is builded we can draw refining widgets
- As soon as index for text is builded - system is fully finctional

The only downside is that without second argument in constructor TS would not be able to identify parametric type for `I` (from `Facets<S extends Schema, I extends Item<S>>`). As workraound user can provide it manually:

```ts
const index = new Facets<typeof schema, Item>({
  textIndex: TQuickscoreIndex,
  schema,
});
```

Or add support for promises

```ts
class Facets<S extends Schema, I extends Item<S>> {
  constructor(config: FacetsConfig<S>, items: I[] | Promise<I[]> = []) {}
}
```

### Thoughts

In order to do this we need small simplest emitter, for example [mitt](https://github.com/developit/mitt).

Do I need both types of loading:

- `load` default asynchronous
  - shall it return promise?
- `loadSync`

In order to unblock main thread during asynchronous loading I need something like `setImmediate`:

- See https://stackoverflow.com/a/19907559/1190041
- [Appearantly it is deprecated now](https://developer.mozilla.org/en-US/docs/Web/API/Window/setImmediate)
- https://www.npmjs.com/package/queue-microtask
- Maybe good old `setTimeout(0)`?

Or simply promises?

```ts
function load(data) {
  this.emit("data");
  const facetIndex = new Promise((resolve) => {
    // ...
    this.emit("facets");
    resolve();
  });
  const textIndex = new Promise((resolve) => {
    // ...
    this.emit("text");
    resolve();
  });
  return Promise.all([facetIndex, textIndex]);
}
```

### Related

Other option would be to move everything in web worker

- Do I need in this case do fetch in the worker itself? To not pass all data between worker and main thread?
- I can try to build facet index and text index in parallel - in separate workers
- all APIs would become asynchronous
