# Sort

### By string column

```js
sort: {
  column: "strColumn",
  order: "asc",
  type: "string",
  locale: "en", // optional
  options: { caseFirst: "upper" } // optional
}
```

```js
items.sort((a, b) =>
  a["strColumn"].localeCompare(b["strColumn"], "en", { caseFirst: "upper" })
);
```

### By numeric column

```js
sort: {
  column: "numColumn",
  order: "asc",
  type: "number"
}
```

```js
items.sort((a, b) => a["numColumn"] - b["numColumn"]);
```

### By boolean column

```js
sort: {
  column: "boolColumn",
  order: "asc",
  type: "boolean"
}
```

```js
items.sort((a, b) => {
  if (a === b) return 0;
  return a ? 1 : -1;
});
```

### Types

If we would use scheme, there would be no need to specify sorting type:

```js
sort: {
  column: "strColumn",
  order: "asc"
}
```

```sql
ORDER BY strColumn DESC
```

### NULLS FIRST or LAST

```js
sort: {
  column: "strColumn",
  order: "asc",
  nulls: "first"
}
```

```js
items.sort((a, b) => {
  if (a["numColumn"] == null && b["numColumn"] == null) return 0;
  if (a["numColumn"] == null) return -1;
  if (b["numColumn"] == null) return -1;
  return a["numColumn"] - b["numColumn"];
});
```

Note: `null == null` and `null == undefined`

### Sort by more than one column

```js
sort: [
  { column: "strColumn", order: "asc" },
  { column: "numColumn", order: "desc" },
];
```

or

```js
sort: [["strColumn", "asc"], ["numColumn", "desc"]],
```

**Note**: this is bad idea, because order matters

```js
sort: {
  strColumn: "asc",
  numColumn: "desc",
}
```

### Other types

- string as date
  - works for ISO-8601 dates out of box
- string as number
  - as trivial as `parseFloat`
  - `NaN` should be treated as null?
- no sense to support non-JSON types
