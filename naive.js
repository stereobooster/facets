import { readFileSync } from "node:fs";
const data = JSON.parse(readFileSync("./records.json"));

// n - naive
const nIndex = (items, keys) => {
  const indexes = {};
  keys.forEach((key) => (indexes[key] = new Map()));
  items.forEach((item, i) => {
    keys.forEach((key) => {
      const index = indexes[key];
      const value = item[key];
      if (Array.isArray(value)) {
        value.forEach((v) => {
          if (!index.has(v)) index.set(v, new Set());
          index.get(v).add(i);
        });
      } else {
        if (!index.has(value)) index.set(value, new Set());
        index.get(value).add(i);
      }
    });
  });
  return indexes;
};

const i = nIndex(data, ["brand", "type", "categories"]);

// https://exploringjs.com/impatient-js/ch_sets.html#missing-set-operations
const union = (a, b) => new Set([...a, ...b]);
const intersection = (a, b) => new Set(Array.from(a).filter((x) => b.has(x)));

const topValues = (index) =>
  [...index.entries()].map(([k, v]) => [k, v.size]).sort((a, b) => b[1] - a[1]);

const or = union;
const and = intersection;
const eq = (index, value) => index.get(value);

console.log(and(eq(i.categories, "Cell Phones"), eq(i.brand, "Apple")));
console.log(or(eq(i.brand, "Samsung"), eq(i.brand, "Apple")));
