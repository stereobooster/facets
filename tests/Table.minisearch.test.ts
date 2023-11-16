import { describe, it, expect } from "vitest";

import { readFileSync } from "node:fs";
import { Table } from "../src/Table";
import { TMinisearchIndex } from "../src/TMinisearchIndex";
// @ts-expect-error need node types
const items = JSON.parse(readFileSync("./tests/records.json")).slice(0, 40);
const schema = {
  name: {
    type: "string" as const,
    text: true,
  },
  description: {
    type: "string" as const,
    text: true,
  }
};

describe("Table text search", () => {
  describe("without text and facets", () => {
    const t = new Table({ schema, textIndex: TMinisearchIndex }, items);

    it("returns results", () => {
      const result = t.search({ query: "Panoramic" });
      expect(result.items.length).toEqual(1);
      expect(result.pagination).toEqual({
        page: 0,
        perPage: 20,
        total: 1,
      });
      expect(result.items[0]).toEqual(items[1]);
    });
  });
});
