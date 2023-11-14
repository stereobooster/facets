import { describe, it, expect } from "vitest";

import { readFileSync } from "node:fs";
import { Table } from "../src/Table";
// @ts-expect-error need node types
const items = JSON.parse(readFileSync("./tests/records.json")).slice(0, 40);
const schema = {
  brand: {
    type: "string" as const,
    facet: true,
  },
  categories: {
    type: "string" as const,
    isArray: true,
    facet: { perPage: 100 },
  },
  price: {
    type: "number" as const,
    facet: true,
  },
  //   type: {
  //     type: "string",
  //   },
  //   popularity: {
  //     type: "number",
  //   },
  //   rating: {
  //     type: "number",
  //   },
};

describe("Table", () => {
  describe("without text and facets", () => {
    const t = new Table({ schema }, items);

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

    it("sorts results as number asc", () => {
      const result = t.search({
        sort: ["price", "asc"],
        perPage: 40,
      });
      expect(result.items[0].price).toEqual(2.99);
      expect(result.items[39].price).toEqual(999.99);
    });

    it("sorts results as number desc", () => {
      const result = t.search({
        sort: ["price", "desc"],
        perPage: 40,
      });
      expect(result.items[0].price).toEqual(999.99);
      expect(result.items[39].price).toEqual(2.99);
    });
  });

  describe("with facets", () => {
    const t = new Table({ schema }, items);

    it("filters by number facet", () => {
      const result = t.search({ facetFilter: { price: 14.95 } });
      expect(result.items[0].price).toEqual(14.95);
    });

    it("filters by string facet", () => {
      const categories = [
        "Cameras & Camcorders",
        "Digital Cameras",
        "Point & Shoot Cameras",
        "360 & Panoramic Cameras",
      ];
      let result = t.search({
        facetFilter: { categories: "Cameras & Camcorders" },
      });
      expect(result.items[0].categories).toEqual(categories);

      result = t.search({
        facetFilter: { categories: "360 & Panoramic Cameras" },
      });
      expect(result.items[0].categories).toEqual(categories);

      result = t.search({
        facetFilter: {
          categories: ["Digital Cameras", "Point & Shoot Cameras"],
        },
      });
      expect(result.items[0].categories).toEqual(categories);
    });

    it("returns facets", () => {
      const result = t.search({});
      expect(result.facets.brand.pagination.total).toEqual(6);
      expect(result.facets.brand.items.length).toEqual(6);

      expect(result.facets.categories.items.length).toEqual(30);
      expect(result.facets.categories.pagination.total).toEqual(30);
      expect(result.facets.categories.pagination.perPage).toEqual(100);

      expect(result.facets.price.items.length).toEqual(20);
      expect(result.facets.price.pagination.total).toEqual(29);
      expect(result.facets.price.pagination.perPage).toEqual(20);
    });

    it("calculates state for numeric facets", () => {
      const result = t.search({});
      expect(result.facets.price.stats).toEqual({
        min: 2.99,
        max: 999.99,
      });
    });

    it("returns facet sorted by frequency", () => {
      const result = t.search({});
      expect(result.facets.brand.items.length).toEqual(6);
      expect(result.facets.brand.items[0]).toEqual(["Acer", 23]);
      expect(result.facets.brand.items[5]).toEqual(["72-9301", 1]);
    });

    it("returns facet values for string column", () => {
      let result = t.search({
        facetFilter: { brand: "Acer" },
      });
      expect(result.items.length).toEqual(20);
      expect(result.facets.brand.items.filter(([, y]) => y > 0)).toEqual([["Acer", 23]]);
    });

    it("returns facet values for array column", () => {
      let result = t.search({
        facetFilter: { categories: "Cameras & Camcorders" },
      });
      expect(result.items.length).toEqual(1);
      expect(result.facets.categories.items.filter(([, y]) => y > 0)).toEqual([
        ["Cameras & Camcorders", 1],
        ["Digital Cameras", 1],
        ["Point & Shoot Cameras", 1],
        ["360 & Panoramic Cameras", 1],
      ]);
    });
  });
});
