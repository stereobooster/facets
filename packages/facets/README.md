# Facets

> Facet - any of the definable aspects that make up a subject (as of contemplation) or an object (as of consideration)

- MVP
  - more tests
  - errors and warnings
- Post MVP
  - event dispatcher to allow async loading, async indexing
    - https://github.com/developit/mitt
  - facets optimization
    - single value columns filter
    - we can iterate over first page only
    - we can put selected values on top
    - for numeric facet for slider:
      - sort by value asc
      - don't care about selected values
  - memoization for consequent operations
    - search narrowing
    - pagination
    - sorting
  - highilght search results
  - search for facets
  - built-in prefix search based on TrieMap
  - through facet filter
  - sort by more than one column
  - web worker
  - date time columns
  - more than one level objects
- Other
  - [BFloat16 wasm](https://github.com/tc39/proposal-float16array/issues/7)
  - RoaringWasm, TrieMap
  - hierarchical filter with TrieMap and custom separator (`/` instead of `>`)
  - But it needs a way to get root level keys
  - preindexed data
