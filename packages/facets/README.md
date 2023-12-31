# Facets

**Facets** is a client-side (though you can run it on the server) faceted search engine.

> Facet - any of the definable aspects that make up a subject (as of contemplation) or an object (as of consideration)

**Facets** main purpose is to do the faceting aspect of the search. Text search is outsourced to other libraries, for example, you can use:

- [QuickScore](https://github.com/fwextensions/quick-score)
- [MiniSearch](https://github.com/lucaong/minisearch)
- [Fuse.js](https://github.com/krisk/fuse)
- [flexsearch](https://github.com/nextapps-de/flexsearch)
- and you can write an adapter for any other text search engine

The main secret ingredient is [TypedFastBitSet.js](https://github.com/lemire/TypedFastBitSet.js/) - a fast set data structure. Using it and standard `Map` allows us to build an inverted-index data structure. From there, it's a pretty straightforward implementation.

## Demo

It is easier to show than explain. [See online demo here](https://facets-demo.stereobooster.com/).

## Is it ready for production?

The demo works, as you can see, but beyond that, there was no exhaustive testing. There are still rough edges. API can change.

## TODO

- default values for facet by type
  - number
    - sort by value asc
    - `showZeroes=false`
- [initialization](/notes/initialization.md)
- [memoization](/notes/memoization.md)
- `​maxValuesPerFacet`
- `facets: "price"`
- numeric filter
  - support `>` (not just `>=`), `<` (not just `<=`)
  - support multiple ranges e.g `[{ from, to }, { eq }, { neq }]`
- more tests
- errors and warnings, for example
  - warn if people try to use text search without providing text index
- [benchmarks](https://github.com/tinylibs/tinybench)
  - performance seems to be good (except numeric range filter), but in order to be sure we need to do benchmark
- benchmark memory
  - https://www.valentinog.com/blog/node-usage/
  - I'm curious if using TrieMap would allow to save memory
