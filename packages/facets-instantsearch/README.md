# facets-instantsearch

InstantSearch.js adapter for facets

## TODO

- add tests
  - [SearchRequestAdpater.test.js](https://github.com/typesense/typesense-instantsearch-adapter/blob/master/test/SearchRequestAdpater.test.js)
  - https://www.algolia.com/doc/guides/managing-results/rules/merchandising-and-promoting/how-to/rules-query-parameters/
  - https://www.algolia.com/doc/api-reference/api-parameters/numericFilters/
  - https://www.algolia.com/doc/api-reference/api-parameters/facetFilters/
  - https://www.algolia.com/doc/api-reference/api-parameters/filters/
- `adaptHit` requires id
- `adaptFacets` maybe make an option to return it as Object instead of array in the Facets library itself
- update [readme](https://github.com/unplatform-io/instantsearch-itemsjs-adapter/blob/main/README.md)
- add `@stereobooster/facets` as peerDependency
- `processingTimeMS`
