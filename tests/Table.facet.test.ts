import { describe, it, expect } from "vitest";

import { Table } from "../src/Table";
const items = [
  { brand: "ba", category: null },
  { brand: "ba", category: ["ca"] },
  { brand: "bb", category: ["ca"] },
  { brand: "ba", category: ["cb"] },
  { brand: "ba", category: ["ca", "cb"] },
];

const schema = {
  brand: {
    type: "string" as const,
    facet: true,
  },
  category: {
    type: "string" as const,
    facet: true,
    isArray: true,
  },
};

describe("Table facets", () => {
  const t = new Table({ schema }, items);

  it("results without filter", () => {
    const result = t.search({});
    expect(result.facets.brand.pagination).toEqual({
      page: 0,
      perPage: 20,
      total: 2,
    });
    expect(result.facets.brand.items).toEqual([
      ["ba", 4],
      ["bb", 1],
    ]);
    expect(result.facets.category.pagination).toEqual({
      page: 0,
      perPage: 20,
      total: 3,
    });
    expect(result.facets.category.items).toEqual([
      ["ca", 3],
      ["cb", 2],
      [null, 1],
    ]);
  });

  it("results with filter", () => {
    const result = t.search({ facetFilter: { brand: ["ba"] } });
    expect(result.facets.brand.pagination).toEqual({
      page: 0,
      perPage: 20,
      total: 2,
    });
    expect(result.facets.brand.items).toEqual([
      ["ba", 4],
      ["bb", 1],
    ]);
    expect(result.facets.category.pagination).toEqual({
      page: 0,
      perPage: 20,
      total: 3,
    });
    expect(result.facets.category.items).toEqual([
      ["ca", 2],
      ["cb", 2],
      [null, 1],
    ]);
  });

  it("results with filter", () => {
    const result = t.search({ facetFilter: { brand: ["bb"] } });
    expect(result.facets.brand.pagination).toEqual({
      page: 0,
      perPage: 20,
      total: 2,
    });
    expect(result.facets.brand.items).toEqual([
      ["ba", 4],
      ["bb", 1],
    ]);
    expect(result.facets.category.pagination).toEqual({
      page: 0,
      perPage: 20,
      total: 3,
    });
    expect(result.facets.category.items).toEqual([
      ["ca", 1],
      ["cb", 0],
      [null, 0],
    ]);
  });

  it("results with filter", () => {
    const result = t.search({ facetFilter: { category: ["ca"] } });
    expect(result.facets.brand.pagination).toEqual({
      page: 0,
      perPage: 20,
      total: 2,
    });
    expect(result.facets.brand.items).toEqual([
      ["ba", 2],
      ["bb", 1],
    ]);
    expect(result.facets.category.pagination).toEqual({
      page: 0,
      perPage: 20,
      total: 3,
    });
    expect(result.facets.category.items).toEqual([
      ["ca", 3],
      ["cb", 2],
      [null, 1],
    ]);
  });

  it("results with filter", () => {
    const result = t.search({ facetFilter: { category: [null] } });
    expect(result.facets.brand.pagination).toEqual({
      page: 0,
      perPage: 20,
      total: 2,
    });
    expect(result.facets.brand.items).toEqual([
      ["ba", 1],
      ["bb", 0],
    ]);
    expect(result.facets.category.pagination).toEqual({
      page: 0,
      perPage: 20,
      total: 3,
    });
    expect(result.facets.category.items).toEqual([
      ["ca", 3],
      ["cb", 2],
      [null, 1],
    ]);
  });

  it("results with filter", () => {
    const result = t.search({
      facetFilter: { brand: ["ba"], category: ["ca"] },
    });
    expect(result.facets.brand.pagination).toEqual({
      page: 0,
      perPage: 20,
      total: 2,
    });
    expect(result.facets.brand.items).toEqual([
      ["ba", 2],
      ["bb", 1],
    ]);
    expect(result.facets.category.pagination).toEqual({
      page: 0,
      perPage: 20,
      total: 3,
    });
    expect(result.facets.category.items).toEqual([
      ["ca", 2],
      ["cb", 2],
      [null, 1],
    ]);
  });
  
});
