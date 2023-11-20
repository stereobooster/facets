import { describe, it, expect } from "vitest";

import { readFileSync } from "node:fs";
import { Facets } from "../src/Facets";
import { TQuickscoreIndex } from "../src/TQuickscoreIndex";
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
  },
};

describe("Facets text search", () => {
  describe("without text and facets", () => {
    const t = new Facets({ schema, textIndex: TQuickscoreIndex }, items);

    it("returns results", () => {
      const result = t.search({ query: "Panoramic" });
      expect(result.pagination).toEqual({
        page: 0,
        perPage: 20,
        total: 24,
      });
      expect(result.items[0]).toEqual(items[1]);
    });
  });
});
