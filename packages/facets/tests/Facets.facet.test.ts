import { describe, it, expect } from "vitest";

import { Facets } from "../src/Facets";
const items = [
  { brand: "ba", category: null, price: 2 },
  { brand: "ba", category: ["ca"], price: 10 },
  { brand: "bb", category: ["ca"], price: 100 },
  { brand: "ba", category: ["cb"], price: 10 },
  { brand: "ba", category: ["ca", "cb"], price: null },
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
  price: {
    type: "number" as const,
    facet: true,
  },
};

describe("Facets facets", () => {
  const t = new Facets({ schema }, items);

  it("results without filter", () => {
    const result = t.search({});
    expect(result.facets.brand.items).toEqual([
      ["ba", 4],
      ["bb", 1],
    ]);
    expect(result.facets.category.items).toEqual([
      ["ca", 3],
      ["cb", 2],
      [null, 1],
    ]);
  });

  it("results with filter", () => {
    const result = t.search({ facetFilter: { brand: ["ba"] } });
    expect(result.facets.brand.items).toEqual([
      ["ba", 4],
      ["bb", 1],
    ]);
    expect(result.facets.category.items).toEqual([
      ["ca", 2],
      ["cb", 2],
      [null, 1],
    ]);
  });

  it("results with filter", () => {
    const result = t.search({ facetFilter: { brand: ["bb"] } });
    expect(result.facets.brand.items).toEqual([
      ["ba", 4],
      ["bb", 1],
    ]);
    expect(result.facets.category.items).toEqual([
      ["ca", 1],
      ["cb", 0],
      [null, 0],
    ]);
  });

  it("results with filter", () => {
    const result = t.search({ facetFilter: { category: ["ca"] } });
    expect(result.facets.brand.items).toEqual([
      ["ba", 2],
      ["bb", 1],
    ]);
    expect(result.facets.category.items).toEqual([
      ["ca", 3],
      ["cb", 2],
      [null, 1],
    ]);
  });

  it("results with filter", () => {
    const result = t.search({ facetFilter: { category: [null] } });
    expect(result.facets.brand.items).toEqual([
      ["ba", 1],
      ["bb", 0],
    ]);
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
    expect(result.facets.brand.items).toEqual([
      ["ba", 2],
      ["bb", 1],
    ]);
    expect(result.facets.category.items).toEqual([
      ["ca", 2],
      ["cb", 2],
      [null, 1],
    ]);
  });

  it("results with number filter", () => {
    let result = t.search({
      facetFilter: { price: { from: 0, to: 50 } },
    });
    expect(result.items.map((x) => x.price)).toEqual([10, 2, 10]);
    expect(result.facets.brand.items).toEqual([
      ["ba", 3],
      ["bb", 0],
    ]);
    expect(result.facets.category.items).toEqual([
      ["ca", 1],
      ["cb", 1],
      [null, 1],
    ]);
  });
});
