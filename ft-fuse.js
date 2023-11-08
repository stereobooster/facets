import Fuse from "fuse.js";

import { readFileSync } from "node:fs";
const data = JSON.parse(readFileSync("./records.json"));

const ftIndex = (items, fields) => {
  return new Fuse(items, {
    includeScore: true,
    keys: fields,
  });
};

const index = ftIndex(data, ["name", "brand", "description"]);

const search = (index, query, options) => {
  return index.search(query, options).map((x) => x.refIndex);
};

console.log(search(index, "apple", { limit: 20 }));

// const sortFn = (a, b) =>
//   a.score === b.score ? (a.idx < b.idx ? -1 : 1) : a.score < b.score ? -1 : 1;

// function computeScore(results, ignoreFieldNorm) {
//   results.forEach((result) => {
//     let totalScore = 1;

//     result.matches.forEach(({ key, norm, score }) => {
//       const weight = key ? key.weight : null;

//       totalScore *= Math.pow(
//         score === 0 && weight ? Number.EPSILON : score,
//         (weight || 1) * (ignoreFieldNorm ? 1 : norm)
//       );
//     });

//     result.score = totalScore;
//   });
// }

// const search2 = (index, query, options = {}) => {
//   const limit = options.limit || 20;
//   const result = index._searchObjectList(query);
//   computeScore(result);
//   return result
//     .sort(sortFn)
//     .map((x) => x.idx)
//     .slice(0, limit);
// };

// console.log(search2(index, "apple", { limit: 20 }));
