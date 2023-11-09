import { QuickScore } from "quick-score";

import { readFileSync } from "node:fs";
const data = JSON.parse(readFileSync("./records.json"));
data.forEach((item, i) => {
  item.id = i;
});

const ftIndex = (items, fields) => {
  return new QuickScore(items, fields);
};

const index = ftIndex(data, ["name", "brand", "description"]);

const search = (index, query, options) => {
  let { offset, limit } = options;
  offset = offset || 0;
  limit = limit || 20;
  return index
    .search(query)
    .slice(offset, offset + limit)
    .map((x) => x.item.id);
};

console.log(search(index, "apple", { limit: 20 }));
