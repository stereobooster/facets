# facets-instantsearch demo

Copy paste of https://github.com/algolia/instantsearch/tree/master/examples/js/e-commerce with slight changes.

Data copied from https://github.com/algolia/datasets/tree/master/ecommerce.

## TODO

- [ ] remove custom fonts
- [ ] use css from npm
- [ ] move index to worker?
- [ ] fix `helpers.snippet` in `Products.ts`

```js
request.params.attributesToSnippet = ["description:10"]
```

```json
{
  "_snippetResult": {
    "description": {
      "value": "Enjoy smart access to videos, games and apps with this …",
      "matchLevel": "none"
    }
  }
}
```
