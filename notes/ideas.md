# Unsorted ideas

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
  - preindexed data
- query string parser
- demo with graph?
- alternative solutions
  - test CSV instead of JSON (memory footprint)
  - memoize sort order in `TypedArray` (Int16)

## Hiearchical filter

InstantSearch uses following structure:

```js
"hierarchicalCategories": {
  "lvl0": "Cameras & Camcorders",
  "lvl1": "Cameras & Camcorders > Digital Cameras",
  "lvl2": "Cameras & Camcorders > Digital Cameras > Point & Shoot Cameras",
  "lvl3": "Cameras & Camcorders > Digital Cameras > Point & Shoot Cameras > 360 & Panoramic Cameras"
},
```

which is quite expensive to store in memory and clumsy to create. Easier format can be:

```js
"categories": ["Cameras & Camcorders", "Digital Cameras", "Point & Shoot Cameras", "360 & Panoramic Cameras"]
```

or

```js
"categories": "Cameras & Camcorders/Digital Cameras/Point & Shoot Cameras/360 & Panoramic Cameras"
```

Like path or URL.

This kind of data, where there is for sure a lot of repetative prefixes is a good candidate for TrieMap index. API can look something like this:

- `values()` return level 0 values, for example `[["Cameras & Camcorders", 100]]`
- `values("Cameras & Camcorders")` returns level 1 values for category `"Cameras & Camcorders"`, for example `[["Digital Cameras", 80], ["Other", 20]]`
- `values("Cameras & Camcorders", "Digital Cameras")` returns level 2 values etc...
