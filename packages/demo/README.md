# facets-instantsearch demo

Copy paste of https://github.com/algolia/instantsearch/tree/master/examples/js/e-commerce with slight changes.

Data copied from https://github.com/algolia/datasets/tree/master/ecommerce.

## TODO

- [ ] fix "price" filter
- [ ] fix "free shiping" filter 
  - need to convert types `{ free_shipping: ["true"] }`
- [ ] implement search for brands filter
- [ ] fix "category" filter
  - support multi-level objects with "paths" e.g. `hierarchicalCategories.lvl0`
- [ ] fix `helpers.highlight` in `Products.ts`
- [ ] fix `helpers.snippet` in `Products.ts`
- [ ] move index to worker?
