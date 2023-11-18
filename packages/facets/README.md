# Facets

> Facet - any of the definable aspects that make up a subject (as of contemplation) or an object (as of consideration)

## TODO

- support highlight
  - [x] for TQuickscoreIndex
  - [ ] for TMinisearchIndex
  - [ ] for TFuseIndex
  - [ ] make it configurable so I can remove hardcode from `highlight` function
  - [ ] ability to disable it if it's not required
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
