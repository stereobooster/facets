# Facets monorepo

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="logo/logo-dark.svg">
    <img alt="" src="logo/logo.svg" width="200" height="200">
  </picture>
</p>

It is the monorepo repository:

- main package - [facets](/packages/facets/)
- [InstantSearch adapter for facets](/packages/facets-instantsearch/)
- and [demo site](/packages/demo/README.md)

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

[![Netlify Status](https://api.netlify.com/api/v1/badges/5a9cb813-8600-4486-b611-8c56015b759a/deploy-status)](https://app.netlify.com/sites/facets-demo/deploys)

It is easier to show than explain. [See online demo here](https://facets-demo.stereobooster.com/).

## Is it ready for production?

The demo works, as you can see, but beyond that, there was no exhaustive testing. There are still rough edges. API can change.

## Backstory

> [!WARNING]  
> Appearantly pagefind also supports [faceted search](https://pagefind.app/docs/js-api-filtering/) and [loading data from json](https://pagefind.app/docs/node-api/). I found out it only after implemented this library. I want to try it out

The library inspired by [ItemsJS](https://github.com/itemsapi/itemsjs). There are only three solutions that do faceted searches on the client-side:

- [Tanstack table](https://tanstack.com/table/). It is not a primary purpose of the library, though it's possible
- [Orama](https://docs.oramasearch.com/open-source/usage/search/facets). It is quite slow in my testing
- ItemsJS

Read [my article](https://stereobooster.com/posts/faceted-search/) for details.

Initially, I wanted to fork ItemsJS, but I thought - it would be easier to write a library from scratch.

## Development

```sh
pnpm i
pnpm run dev
```

## Logo

Logo by Pravin Unagar from <a href="https://thenounproject.com/browse/icons/term/trillion/" target="_blank" title="trillion Icons">Noun Project</a> (CC BY 3.0)

## TODO

- prettier, eslint
- add example to [faceted-search demo](https://github.com/stereobooster/faceted-search)
