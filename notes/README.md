# Inverted index experiment

## Idea

- diffrent type of indexes:
  - Inverted index based on Map
  - Inverted index based on TrieMap
  - Full-text index based on different implemntations, like MiniSearch, Fuse, Flexsearch etc.
    - except ids, it can return order of items (relevance)
    - except ids, it can return `matches` 
- ids from index can be returned as BitSet (preferable) or as array
- indexes can be combined with `union` (`or`), `intersection` (`and`)
- other features: 
  - `sort` - simple array sort
  - `filter` - simple array filter
  - pagination - simple array slice
- facets
  - categorical facets
    - collect all values, count, sort by frequency
  - numerical facets
    - min, max
- memoize one
  - should help with pagination and sorting
- schema to use different types for different indexes: number, string, string[]
  - id field
  - date fields
  - or rather put type in agregation
- query as object `(and (eq index field) (eq index field) (or ...))`

## TODO

- benchmark performance
  - https://benchmarkjs.com/
- benchmark memory
  - https://www.valentinog.com/blog/node-usage/

## data structure

- set of integers (BitSet, Roaring Bitmaps)
- sorted set
- bag of integers
  - https://sair.synerise.com/efficient-integer-pairs-hashing/ ?
- sorted bag

## Intro

Just some experiments with inverted index and related subjects.

In order to do inverted index we need two data structures:

- Dictionary
- Set

Options which I can think of:

- Old school JS
  - Dictionary - `{}`
  - Set - `[]`
- Modern JS
  - Dictionary - `Map`
  - Set - `Set`
    - Relate [missing set operations](https://exploringjs.com/impatient-js/ch_sets.html#missing-set-operations)
- Less naive approach
  - Dictionary - some kind of TrieMap
    - https://lucaong.github.io/minisearch/classes/SearchableMap_SearchableMap.SearchableMap.html
    - https://yomguithereal.github.io/mnemonist/trie-map
    - https://github.com/joshjung/trie-search
    - https://github.com/Sec-ant/trie-map
    - https://github.com/mattbierner/hamt
    - https://github.com/scttdavs/radix-trie
    - Relate https://towardsdatascience.com/the-pruning-radix-trie-a-radix-trie-on-steroids-412807f77abc
  - Set
    - https://github.com/lemire/FastBitSet.js/
    - https://github.com/lemire/TypedFastBitSet.js/
    - https://github.com/SalvatorePreviti/roaring-wasm

## What is inverted index good for

Let's say we have collection of documents, for example:

```js
const data = [
  { "country": "UK", "city": "London", ... },
  { "country": "US", "city": "Washington", ... },
  ...
]
```

And we want to filter this list based on some criteria, similar to SQL

```sql
select id from t where ...
```

For now let's focus on retrieving list of "ids" which in this case number of item in the array, so you can get items themselve:

```js
ids.map((id) => data[id]);
```

So inverted index can look like that:

```js
{
    "UK": [0, ...]
    "US": [1, ...]
}
```

### Example1

```sql
select id from t where country = 'UK'
```

Equivalent to retriving item from dictionary `O(1)`:

- Old school JS: `index["UK"]`
- Modern JS: `[...index.get("UK")]`

### Example2

```sql
select id from t where country = 'UK' and city = 'London'
```

Equivalent to retriving item from dictionary `O(1)` and intersecting sets `O(?)`:

- Old school JS: `intersection(index1["UK"], index2["London"])`
- Modern JS: `intersection(index1.get("UK"), index2.get("London"))`
- TypedFastBitSet: `index1.get("UK").new_intersection(index2.get("London"))`

### Example3

```sql
select id from t where country = 'UK' OR city = 'London'
```

Equivalent to retriving item from dictionary `O(1)` and union sets `O(?)`:

- Old school JS: `union(index1["UK"], index2["London"])`
- Modern JS: `union(index1.get("UK"), index2.get("London"))`
- TypedFastBitSet: `index1.get("UK").new_union(index2.get("London"))`

### Example 4

```sql
select * from t where country LIKE 'U%'
```

Equivalent to retriving item from trie `O(?)` for dictionary it would be `O(n)` operation