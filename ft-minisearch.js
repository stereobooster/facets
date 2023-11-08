import MiniSearch from "minisearch";

import { readFileSync } from "node:fs";
const data = JSON.parse(readFileSync("./records.json"));
data.forEach((item, i) => {
  item.id = i;
});

const ftIndex = (items, fields) => {
  const index = new MiniSearch({
    fields,
    storeFields: [],
  });
  index.addAll(items);
  return index;
};

const index = ftIndex(data, ["name", "brand", "description"]);

const search = (index, query, options) => {
  let { offset, limit, ...rest } = options;
  offset = offset || 0;
  limit = limit || 20;
  return index
    .search(query, rest)
    .slice(offset, offset + limit)
    .map((x) => x.id);
};

console.log(search(index, "apple", { limit: 20 }));
