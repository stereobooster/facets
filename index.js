import { readFileSync } from "node:fs";
const data = JSON.parse(readFileSync("./records.json"));

// os - old school
const osIndex = (items, keys) => {
  const indexes = {};
  keys.forEach((key) => (indexes[key] = Object.create(null)));
  items.forEach((item, i) => {
    keys.forEach((key) => {
      const index = indexes[key];
      if (!index[item[key]]) index[item[key]] = [];
      index[item[key]].push(i);
    });
  });
  return indexes;
};

// n - naive
const nIndex = (items, keys) => {
  const indexes = {};
  keys.forEach((key) => (indexes[key] = new Map()));
  items.forEach((item, i) => {
    keys.forEach((key) => {
      const index = indexes[key];
      if (!index.has(item[key])) index.set(item[key], new Set());
      index.get(item[key]).add(i);
    });
  });
  return indexes;
};

// const indexes = osIndex(data, ["brand", "type"]);
// console.log(indexes.brand["Pogoplug"]);
// console.log(indexes.type["Online data backup"]);

const indexes = nIndex(data, ["brand", "type"]);
// get row numbers
// console.log(indexes.brand.get("Pogoplug"));
// console.log(indexes.type.get("Online data backup"));
// get all unique values
// console.log(indexes.brand.keys());
// get all unique values and count
// indexes.brand.forEach((v, k) => {
//     console.log(k, v.size)
// })
// get all unique values sorted by count
console.log(
  [...indexes.brand.entries()]
    .map(([k, v]) => [k, v.size])
    .sort((a, b) => b[1] - a[1])
);
