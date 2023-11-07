import { readFileSync } from "node:fs";
const data = JSON.parse(readFileSync("./records.json"));

// os - old school
const osIndex = (items, keys) => {
  const indexes = {};
  keys.forEach((key) => (indexes[key] = Object.create(null)));
  items.forEach((item, i) => {
    keys.forEach((key) => {
      const index = indexes[key];
      const value = item[key];
      if (Array.isArray(value)) {
        value.forEach((v) => {
          if (!index[v]) index[v] = [];
          index[v].push(i);
        });
      } else {
        if (!index[value]) index[value] = [];
        index[value].push(i);
      }
    });
  });
  return indexes;
};

const i = osIndex(data, ["brand", "type", "categories"]);

const union = (a, b) => [...new Set([...a, ...b])];
const intersection = (a, b) => {
  b = new Set(b);
  return Array.from(a).filter((x) => b.has(x));
};

const topValues = (index) =>
  Object.values(index)
    .map(([k, v]) => [k, v.size])
    .sort((a, b) => b[1] - a[1]);

const or = union;
const and = intersection;
const eq = (index, value) => index[value];

console.log(and(eq(i.categories, "Cell Phones"), eq(i.brand, "Apple")));
console.log(or(eq(i.brand, "Samsung"), eq(i.brand, "Apple")));
