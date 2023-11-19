# Facet filter

## One value

```js
{
  strColumn: "x";
  numColumn: 1;
}
```

```sql
WHERE strColumn = "x" AND numColumn = 1
```

## N-values

```js
{
  strColumn: ["x", "y"],
  numColumn: [0, 1],
}
```

```sql
WHERE (strColumn = "x" OR strColumn = "y") AND (numColumn = 0 OR numColumn = 1)
```

## Prefix-value

```js
{
  strColumn: {
    prefix: "x",
  }
}
```

```sql
WHERE strColumn LIKE "x%"
```

Easy to do with **TrieMap**.

## Range-value

```js
{ numColumn: { from: 0, to: 1 } }
```

```sql
WHERE numColumn >= 0 AND numColumn <= 1
```

Also may work for dates
