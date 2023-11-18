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
  - InstantSearch sometimes makes requests like this `facets: "price", hitsPerPage: 0, ​maxValuesPerFacet: 10`
    - in this case there is no need to iterate over all facets
    - there is no need to sort results
    - it needs to respect `​maxValuesPerFacet`
- search for facets
  - right not search for facet is done outside. Making it inside would allow to do fewer intersections
  - plus it would open possibility to use to use TrieMap for search
- numeric filter
  - support `>` (not just `>=`), `<` (not just `<=`)
  - support multiple ranges e.g `[{ from, to }, { eq }, { neq }]`
- more tests
- errors and warnings, for example
  - warn if people try to use text search without providing text index
- event dispatcher to allow async loading, async indexing
  - https://github.com/developit/mitt
  - reconsider constructor
- [benchmarks](https://github.com/tinylibs/tinybench)
  - performance seems to be good (except numeric range filter), but in order to be sure we need to do benchmark
  - I interested if using TrieMap would allow to save memory

