# Inverted index experiment

## TODO

- workspace
  - main package
    - MVP
      - [x] one level objects
      - [ ] use one type of pagination everywhere: `page + perPgae` or `limit + offset`
      - [ ] filter by facets
      - [ ] text search
      - [ ] sort results by string column
        - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare
        - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
      - [ ] sort results by numeric column
      - [ ] sort results by relevance
      - [ ] pagination
      - [ ] filter by callback (for numeric ranges)
      - [ ] facets
        - sort facets by frequency, etc.
        - limit
    - tests
    - typescript signature
    - Post MVP
      - [ ] search for facets
        - pagination
      - built in prefix search based on TrieMap
        - through facet filter
      - memoization for consequent operations
        - search narrowing
        - pagination
        - sorting
      - filter by facet by numeric range
        - would allow better memoization
      - sort by more than one column
      - highilght search results
      - preindexed data
      - event dispatcher for async processing
      - web worker
      - date time columns
      - more than one level objects
      - autocomplete - what the sense if results are updated immediately?
    - Other
      - do we need shcema?
        - TrieMap only works for strings
        - by default JS sorts numbers as strings
        - natural sort (`["a100", "a11"].sort()`)
        - [BFloat16 wasm](https://github.com/tc39/proposal-float16array/issues/7)
      - RoaringWasm and other TrieMaps
      - hierarchical filter with TrieMap and custom separator (`/` instead of `>`)
        - But it needs a way to get root level keys
      - event dispatcher to allow async loading, async indexing
  - InstantSearch adpater
    - https://github.com/unplatform-io/instantsearch-itemsjs-adapter/blob/main/src/adapter.ts
    - https://github.com/typesense/typesense-instantsearch-adapter/blob/master/src/TypesenseInstantsearchAdapter.js
  - demo with table / cards
  - query string parser
  - demo with graph?

## Facet filter

### One value

```js
{
  strColumn: "x";
  numColumn: 1;
}
```

```sql
WHERE strColumn = "x" AND numColumn = 1
```

### N-values

```js
{
  strColumn: ["x", "y"],
  numColumn: [0, 1],
}
```

```sql
WHERE (strColumn = "x" OR strColumn = "y") AND (numColumn = 0 OR numColumn = 1)
```

### Prefix-value

```js
{
  strColumn: {
    prefix: "x",
  }
}
```

```sql
WHERE strColumn LIKE "x%"
```

Easy to do with **TrieMap**.

### Range-value

```js
{ numColumn: { from: 0, to: 1 } }
```

```sql
WHERE numColumn >= 0 AND numColumn <= 1
```

Also may work for dates

## Sort

### By string column

```js
sort: {
  column: "strColumn",
  order: "asc",
  type: "string",
  locale: "en", // optional
  options: { caseFirst: "upper" } // optional
}
```

```js
items.sort((a, b) =>
  a["strColumn"].localeCompare(b["strColumn"], "en", { caseFirst: "upper" })
);
```

### By numeric column

```js
sort: {
  column: "numColumn",
  order: "asc",
  type: "number"
}
```

```js
items.sort((a, b) => a["numColumn"] - b["numColumn"]);
```

### By boolean column

```js
sort: {
  column: "boolColumn",
  order: "asc",
  type: "boolean"
}
```

```js
items.sort((a, b) => {
  if (a === b) return 0;
  return a ? 1 : -1;
});
```

### Types

If we would use scheme, there would be no need to specify sorting type:

```js
sort: {
  column: "strColumn",
  order: "asc"
}
```

```sql
ORDER BY strColumn DESC
```

### NULLS FIRST or LAST

```js
sort: {
  column: "strColumn",
  order: "asc",
  nulls: "first"
}
```

```js
items.sort((a, b) => {
  if (a["numColumn"] == null && b["numColumn"] == null) return 0;
  if (a["numColumn"] == null) return -1;
  if (b["numColumn"] == null) return -1;
  return a["numColumn"] - b["numColumn"];
});
```

Note: `null == null` and `null == undefined`

### Sort by more than one column

```js
sort: [
  { column: "strColumn", order: "asc" },
  { column: "numColumn", order: "desc" },
];
```

OR

```js
sort: {
  strColumn: "asc",
  numColumn: "desc",
}
```

## Supported types

- string, number, boolean, null - are basic JSON types and they all can be supported
- arrays supported for filtering and faceting, but not for sorting
- supporting objects means supporting more tnan one level objects

**Other**:

- strings as dates
  - TrieMap for ISO-8601 fromat?
- numbers as dates
