# Inverted index experiment

## TODO

- workspace
  - main package
    - MVP
      - [x] one level objects
      - [ ] filter by facets
      - [ ] text search
      - [ ] sort results by string column
      - [ ] sort results by numeric column
      - [ ] sort results by relevance
      - [ ] pagination
      - [ ] filter by callback (for numeric ranges)
      - [ ] facets
      - [ ] search for facets
      - [ ] sort facets (by frequency, etc.)
    - tests
    - typescript signature
    - Post MVP
      - filter by facet by numeric range
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
        - RoaringWasm and other TrieMaps
        - [BFloat16 wasm](https://github.com/tc39/proposal-float16array/issues/7)
  - InstantSearch adpater
    - https://github.com/unplatform-io/instantsearch-itemsjs-adapter/blob/main/src/adapter.ts
    - https://github.com/typesense/typesense-instantsearch-adapter/blob/master/src/TypesenseInstantsearchAdapter.js
  - demo
  - query string parser
