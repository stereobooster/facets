# Opinated review of full-text and fuzzy JS search engines

This is review with one specific use case in mind:

- you have JS list of objects (list of tuples would woek is well)
- it will not mutate (but can be appended)
- you want to do full-text search across several fileds in objects

So data can look like this:

```js
[
  { title: "Matrix", description: "...", year: 1999, category: [...] },
  { title: "Matrix 2", description: "...", year: 2003, category: [...] },
]
```

There is no specific need for `id`, because we can use position in array as `id`. It is immutable list anyway.

How do I imagine API:

```js
const index = createIndex(data, {
  searchableFields: ["title", "description", "category"],
});
```

or

```js
const index = createIndex({
  searchableFields: ["title", "description", "category"],
});
data.forEach((item, i) => index.add(i, item));
```

It doesn't have to be precise. For example, there can be options for stemming, language weights for fields etc., but this is irrelevant.

And search would be like this:

```js
const ids = index.search("query", { offset: 0, limit: 20 });
```

Again details can very, for example it can be `page` and `per_page`. What is important it should return list of `ids` sorted by relevance.

## Fast disqualification

- [pagefind](https://pagefind.app/docs/running-pagefind/) specifically tailored for webpages, not JS lists
- [lunr](https://github.com/olivernn/lunr.js) - unmaintained (last comit 3 years ago) and distributed as UMD
- [stork](https://stork-search.net/) - deprecated
- [orama](https://github.com/oramasearch/orama) - it supports only string `ids`. I could map it to numbers, but way to much trouble

## Candidates

- [x] [fusejs](https://www.fusejs.io/examples.html#search-object-array) - it would be nice if there was an option to return `ids` only
- [x] [minisearch](https://github.com/lucaong/minisearch#basic-usage) - it seems it requires `id` in the object (can do workaround though)
- [x] [flexsearch](https://github.com/nextapps-de/flexsearch) - maybe I don't get it, but [there is no way to search over multiple fields and return single result](https://github.com/nextapps-de/flexsearch/discussions/293)
- [uFuzzy](https://github.com/leeoniya/uFuzzy) - supports only one field, which gives the same problem as in `flexsearch`
- [others](https://github.com/leeoniya/uFuzzy#benchmark)
