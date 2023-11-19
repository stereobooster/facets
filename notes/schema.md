# Schema

- facets
  - `isArray` - take into account co-occuring values
  - `number` - calculate `min` and `max`
- sorting
  - `isArray` - use general sort algorithm
- other
  - TrieMap would work only for strings
  - hierarchical filter

## Type

```ts
type ColumnType =
  | "string"
  | "number"
  | "boolean"
  | "string[]"
  | "number[]"
  | "boolean[]";
```

alternatively:

```ts
type ColumnType = {
  type: "string" | "number" | "boolean";
  isArray?: boolean;
};
```

## Search

```ts
type Column = {
  facet?: boolean;
  text?: boolean;
  index?: InvertedIndex;
};
```

alternatively:

```ts
type Column = {
  facet?: {
    sort: string[];
    perPage: number;
  };
};
```

## Sort

```ts
type Column = {
  nulls?: NullsOrder;
  /**
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale
   */
  locale?: string | string[];
  /**
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator/Collator#options
   */
  options?: Intl.CollatorOptions;
};
```

alternatively: one cofig for sorting for all columns instead of per each column
