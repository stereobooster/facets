# Facets

> Facet - any of the definable aspects that make up a subject (as of contemplation) or an object (as of consideration)

## TODO

- highilght search results
- facet request
  - `facets: "price", hitsPerPage: 0, ​maxValuesPerFacet: 10`
- search for facets
- numeric filter
  - support `>` (not just `>=`), `<` (not just `<=`),
  - support multiple ranges e.g `[{ from, to }, { eq }, { neq }]`
- more tests
- errors and warnings
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
- built-in prefix search based on TrieMap
  - through facet filter?
- sort by more than one column
- Other
  - [BFloat16 wasm](https://github.com/tc39/proposal-float16array/issues/7)
  - RoaringWasm, TrieMap
  - hierarchical filter with TrieMap and custom separator (`/` instead of `>`)
    - But it needs a way to get root level keys
  - preindexed data
