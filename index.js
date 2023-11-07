import TrieMap from "mnemonist/trie-map.js";
import { SparseTypedFastBitSet } from "typedfastbitset";

import { readFileSync } from "node:fs";
const data = JSON.parse(readFileSync("./records.json"));

const iIndex = (items, keys) => {
  const indexes = {};
  keys.forEach((key) => (indexes[key] = new TrieMap()));
  items.forEach((item, i) => {
    keys.forEach((key) => {
      const index = indexes[key];
      const value = item[key];
      if (Array.isArray(value)) {
        value.forEach((v) => {
          if (!index.has(v)) index.set(v, new SparseTypedFastBitSet());
          index.get(v).add(i);
        });
      } else {
        if (!index.has(value)) index.set(value, new SparseTypedFastBitSet());
        index.get(value).add(i);
      }
    });
  });
  return indexes;
};

const i = iIndex(data, ["brand", "type", "categories"]);

const union = (a, b) => a.new_union(b);
const intersection = (a, b) => a.new_intersection(b);
const arr = (a) => a.array();

// const topValues = (index) =>
//   [...index.entries()].map(([k, v]) => [k, v.size]).sort((a, b) => b[1] - a[1]);

const eq = (index, value) => index.get(value);
const or = union;
const and = intersection;

const pa = (a) => console.log(arr(a));
pa(and(eq(i.categories, "Cell Phones"), eq(i.brand, "Apple")));
pa(or(eq(i.brand, "Samsung"), eq(i.brand, "Apple")));
