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

const u = new SparseTypedFastBitSet();
data.forEach((item, i) => u.add(i));

const i = iIndex(data, ["brand", "type", "categories"]);

const union = (a, b) => a.new_union(b);
const intersection = (a, b) => a.new_intersection(b);
const difference = (a, b) => a.new_difference(b);
const arr = (a) => a.array();

const not = (a) => difference(u, a);
const or = union;
const and = intersection;
const eq = (index, value) => index.get(value);
const neq = (index, value) => not(eq(index, value));

const pick = (fields, o) => fields.map((field) => o[field]);

const select = (fields, from, where) => {
  if (Array.isArray(fields)) {
    return arr(where).map((i) => pick(fields, from[i]));
  } else if (typeof fields === "string") {
    return arr(where).map((i) => from[i][fields]);
  } else {
    return arr(where).map((i) => from[i]);
  }
};

console.log(select("name", data, eq(i.brand, "Samsung")));
