# Inverted index experiment

## TODO

- workspace
  - main package
    - MVP
      - [ ] filter by facets with null
      - [ ] sort results by relevance
      - [ ] text search
      - [ ] filter by callback (for numeric ranges)
      - [ ] facets
        - sort facets by frequency, etc.
        - facet after filter
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

## Supported types

- string, number, boolean, null - are basic JSON types and they all can be supported
- arrays supported for filtering and faceting, but not for sorting
- supporting objects means supporting more tnan one level objects

**Other**:

- strings as dates
  - TrieMap for ISO-8601 fromat?
- numbers as dates
