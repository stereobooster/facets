import flexsearch from "flexsearch";
const { Document } = flexsearch;

import { readFileSync } from "node:fs";
const data = JSON.parse(readFileSync("./records.json"));

const ftIndex = (items, fields) => {
  const document = new Document({ index: fields, store: false });
  items.forEach((item, i) => document.add(i, item));
  return document;
};

const index = ftIndex(data, ["name", "brand", "description"]);

// https://github.com/nextapps-de/flexsearch/discussions/293
// How to get one result set instead of one per each field?
const search = (index, query, options = {}) => {
  let { boostFactors, offset, limit, ...rest } = options;
  offset = offset || 0;
  limit = limit || 20;
  const results = index.search(query, {
    ...rest,
    offset: 0,
    limit: offset + limit,
  });
  if (results.length === 1) return results[0].result;

  boostFactors = boostFactors || {};
  const resultsByRelevance = new Map();
  results.forEach(({ field, result }) => {
    const factor = boostFactors[field] || 1;
    result.forEach((id, i) => {
      resultsByRelevance.set(
        id,
        (resultsByRelevance.get(id) || 0) + (i + 1) * factor
      );
    });
  });

  return [...resultsByRelevance.entries()]
    .sort((a, b) => a[1] - b[1])
    .slice(offset, offset + limit)
    .map((a) => a[0]);
};

console.log(search(index, "apple", { boostFactors: { description: 0.7 } }));

// const searchNaive = (index, query, options = {}) => {
//   let { limit, ...rest } = options;
//   limit = limit || 20;
//   const results = index.search(query, {
//     ...rest,
//     limit,
//   });
//   if (results.length === 1) return results[0].result;
//   return [
//     ...new Set(results.reduce((acc, val) => acc.concat(val.result), [])),
//   ].slice(0, limit);
// };

// console.log(searchNaive(index, "apple"));

// const searchNaive2 = (index, query, options = {}) => {
//   let { limit, ...rest } = options;
//   limit = limit || 20;
//   const results = index.search(query, {
//     ...rest,
//     limit,
//   });
//   if (results.length === 1) return results[0].result;

//   const combinedResult = new Set();
//   for (let i = 0; i < limit; i++) {
//     results.forEach(({ result }) => {
//       if (result[i] !== undefined) combinedResult.add(result[i]);
//     });
//     if (combinedResult.size >= limit) break;
//   }

//   return [...combinedResult];
// };

// console.log(searchNaive2(index, "apple"));
