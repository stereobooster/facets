import { describe, it, expect } from "vitest";

import { readFileSync } from "node:fs";
import { Table } from "../src/Table";
// @ts-expect-error need node types
const items = JSON.parse(readFileSync("./tests/records.json")).slice(0, 40);

describe("Table", () => {
  describe("without query", () => {
    const t = new Table({}, items);

    it("returns results", () => {
      const result = t.search();
      expect(result.items.length).toEqual(20);
      expect(result.pagination).toEqual({
        page: 0,
        perPage: 20,
        total: 40,
      });
      expect(result.items[0]).toEqual(items[0]);
      expect(result.items[19]).toEqual(items[19]);
    });

    it("supports perPage", () => {
      const result = t.search({ perPage: 10 });
      expect(result.items.length).toEqual(10);
      expect(result.pagination).toEqual({
        page: 0,
        perPage: 10,
        total: 40,
      });
      expect(result.items[0]).toEqual(items[0]);
      expect(result.items[9]).toEqual(items[9]);
    });

    it("supports page", () => {
      const result = t.search({ page: 1 });
      expect(result.items.length).toEqual(20);
      expect(result.pagination).toEqual({
        page: 1,
        perPage: 20,
        total: 40,
      });
      expect(result.items[0]).toEqual(items[20]);
      expect(result.items[19]).toEqual(items[39]);
    });

    it("supports page overflow", () => {
      const result = t.search({ page: 2 });
      expect(result.items.length).toEqual(0);
      expect(result.pagination).toEqual({
        page: 2,
        perPage: 20,
        total: 40,
      });
    });

    it("sorts results as string asc", () => {
      const result = t.search({
        sort: { field: "price", order: "asc" },
        perPage: 40,
      });
      expect(result.items[0].price).toEqual(109.99);
      expect(result.items[39].price).toEqual(999.99);
    });

    it("sorts results as string desc", () => {
      const result = t.search({
        sort: { field: "price", order: "desc" },
        perPage: 40,
      });
      expect(result.items[0].price).toEqual(999.99);
      expect(result.items[39].price).toEqual(109.99);
    });

    it("sorts results as number asc", () => {
      const result = t.search({
        sort: { field: "price", order: "asc", type: "number" },
        perPage: 40,
      });
      expect(result.items[0].price).toEqual(2.99);
      expect(result.items[39].price).toEqual(999.99);
    });

    it("sorts results as number desc", () => {
      const result = t.search({
        sort: { field: "price", order: "desc", type: "number" },
        perPage: 40,
      });
      expect(result.items[0].price).toEqual(999.99);
      expect(result.items[39].price).toEqual(2.99);
    });
  });

});
