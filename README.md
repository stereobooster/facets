# Inverted index experiment

## TODO

- workspace
  - main package
    - MVP
      - [ ] facets
        - `null`, `undefined` in facets
      - [ ] sort results by relevance
      - [ ] filter by callback (for numeric ranges)
      - [ ] function to fetch more facets data (pagination)
    - Post MVP
      - typescript signature
      - mapPaginate - function to map item only enough to fill current page
      - search for facets
      - built-in prefix search based on TrieMap
        - through facet filter
      - memoization for consequent operations
        - `useMemo` - LRU
        - search narrowing
        - pagination
        - sorting
      - filter by facet by numeric range
        - would allow better memoization
      - sort by more than one column
      - highilght search results
      - event dispatcher to allow async loading, async indexing
      - web worker
      - date time columns
      - more than one level objects
    - Other
      - [BFloat16 wasm](https://github.com/tc39/proposal-float16array/issues/7)
      - RoaringWasm and other TrieMaps
      - hierarchical filter with TrieMap and custom separator (`/` instead of `>`)
        - But it needs a way to get root level keys
      - preindexed data
  - InstantSearch adpater
    - https://github.com/unplatform-io/instantsearch-itemsjs-adapter/blob/main/src/adapter.ts
    - https://github.com/typesense/typesense-instantsearch-adapter/blob/master/src/TypesenseInstantsearchAdapter.js
  - demo with table / cards
  - query string parser
  - demo with graph?
