# facets-instantsearch demo

Demo of [`facets`](https://github.com/stereobooster/facets) + `facets-instantsearch`.

Copy paste of [instantsearch e-commerce example](https://github.com/algolia/instantsearch/tree/master/examples/js/e-commerce) with slight changes.

Data copied from [algolia/datasets](https://github.com/algolia/datasets/tree/master/ecommerce.)

## TODO

- [ ] filter out 0 frequency facets
- [ ] for prices I only need `min` and `max`, I don't need to intersect all facets
- [ ] move index to worker?

### Snippeting doesn't work

See: `helpers.snippet` in `Products.ts`.

It should cut first N words. It requires primitive tokenizer, plus it should try to show text with matched parts.

```js
request.params.attributesToSnippet = ["description:10"];
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
