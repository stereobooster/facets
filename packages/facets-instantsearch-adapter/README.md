# facets-instantsearch-adapter

- https://github.com/unplatform-io/instantsearch-itemsjs-adapter/blob/main/src/adapter.ts
- https://github.com/typesense/typesense-instantsearch-adapter/blob/master/src/SearchRequestAdapter.js
  - https://github.com/typesense/typesense-instantsearch-adapter/blob/master/test/SearchRequestAdpater.test.js

## TODO

- microbundle
- demo project
- implement numeric facets filter `adaptNumericFilters`
- `adaptHit` requires id
- `parseRange` and `filterRegex` can be implemented with propper parser
  - https://www.algolia.com/doc/guides/managing-results/rules/merchandising-and-promoting/how-to/rules-query-parameters/
  - https://www.algolia.com/doc/api-reference/api-parameters/numericFilters/
  - https://www.algolia.com/doc/api-reference/api-parameters/facetFilters/
  - https://www.algolia.com/doc/api-reference/api-parameters/filters/
- `adaptFacets` maybe make an option to return it as Object instead of array in the Facets library itself
- `searchForFacetValues` maybe implement
