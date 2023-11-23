# Memoization

- https://github.com/lukeed/tmp-cache
- https://github.com/lukeed/flru

## Option 1

```ts
const m = createMemo();

function something() {
  m((useMemo) => {
    // something
    const x = useMemo(() => {
      return value;
    }, [dep1, dep2]);
    // something
    const y = useMemo(() => {
      return value;
    }, [dep1, dep3]);
  });
}
```

But: [caller](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/caller) is deprecated so to use with different fucntions would need:

```ts
function something() {
  m("something", (useMemo) => {});
}

function other() {
  m("other", (useMemo) => {});
}
```

## Option 2

Preact [signals](https://preactjs.com/blog/signal-boosting/): `signal` + `computed`.
