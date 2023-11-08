import { create, insertMultiple, search as oramaSearch } from "@orama/orama";

import { readFileSync } from "node:fs";
const data = JSON.parse(readFileSync("./records.json"));
data.forEach((item, i) => {
  item.id = `${i}`;
});

const ftIndex = async (items, fields) => {
  const schema = fields.reduce((acc, field) => {
    acc[field] = "string";
    return acc;
  }, {});
  const index = await create({
    schema,
  });
  await insertMultiple(index, items);
  return index;
};

const index = await ftIndex(data, ["name", "brand", "description"]);

const search = async (index, query, options) => {
  const result = await oramaSearch(index, {
    ...options,
    term: query,
  });

  return result.hits.map((x) => parseInt(x.id, 10));
};

console.log(await search(index, "apple", { limit: 20 }));
