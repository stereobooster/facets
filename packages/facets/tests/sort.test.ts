import { describe, it, expect } from "vitest";
import {
  sortBooleans,
  sortGeneral,
  sortNulls,
  sortNumbers,
  sortStrings,
} from "../src/sort";

describe("sort nulls", () => {
  it("nulls first", () => {
    expect([null, 1, null, 0].sort(sortNulls("first"))).toEqual([
      null,
      null,
      1,
      0,
    ]);
    // it always moves undefined to the end
    expect([undefined, 1, undefined, 0].sort(sortNulls("first"))).toEqual([
      1,
      0,
      undefined,
      undefined,
    ]);
  });

  it("nulls last", () => {
    expect([null, 1, null, 0].sort(sortNulls("last"))).toEqual([
      1,
      0,
      null,
      null,
    ]);
    expect([undefined, 1, undefined, 0].sort(sortNulls("last"))).toEqual([
      1,
      0,
      undefined,
      undefined,
    ]);
  });
});

describe("sort numbers", () => {
  it("ascending", () => {
    expect([1, 0, 2].sort(sortNumbers({ order: "asc" }))).toEqual([0, 1, 2]);
  });

  it("descending", () => {
    expect([1, 0, 2].sort(sortNumbers({ order: "desc" }))).toEqual([2, 1, 0]);
  });
});

describe("sort booleans", () => {
  it("ascending", () => {
    expect([false, true, false].sort(sortBooleans({ order: "asc" }))).toEqual([
      false,
      false,
      true,
    ]);
  });

  it("descending", () => {
    expect([false, true, false].sort(sortBooleans({ order: "desc" }))).toEqual([
      true,
      false,
      false,
    ]);
  });
});

describe("sort strings", () => {
  it("ascending", () => {
    expect(["b", "a", "c"].sort(sortStrings({ order: "asc" }))).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("descending", () => {
    expect(["b", "a", "c"].sort(sortStrings({ order: "desc" }))).toEqual([
      "c",
      "b",
      "a",
    ]);
  });

  describe("with locale", () => {
    it("ascending", () => {
      expect(
        ["b", "ä", "z"].sort(sortStrings({ order: "asc", locale: "en" }))
      ).toEqual(["ä", "b", "z"]);
      expect(
        ["b", "ä", "z"].sort(sortStrings({ order: "asc", locale: "sv" }))
      ).toEqual(["b", "z", "ä"]);
    });
  });

  describe("with wrong type", () => {
    it("throws error", () => {
      expect(() =>
        [null, "b", "a"].sort(sortStrings({ order: "asc" }))
      ).toThrowError();
      expect(() =>
        [[], "b", "a"].sort(sortStrings({ order: "asc" }))
      ).toThrowError();
      expect(() =>
        [{}, "b", "a"].sort(sortStrings({ order: "asc" }))
      ).toThrowError();
    });
  });
});

describe("general sort", () => {
  it("nulls last by default", () => {
    expect([null, "b", "a"].sort(sortGeneral({ order: "asc" }))).toEqual([
      "a",
      "b",
      null,
    ]);
  });

  it("falls back to string sorting", () => {
    expect(
      [null, "b", {}, "a", ["z"], [], true, 1].sort(
        sortGeneral({ order: "asc" })
      )
    ).toEqual([[], {}, 1, "a", "b", true, ["z"], null]);
  });

  describe("with wrong type", () => {
    it("string sorter throws an error", () => {
      expect(() =>
        [null, "b", {}, "a", ["z"], [], true, 1].sort(
          sortGeneral({ order: "asc", type: "string" })
        )
      ).toThrowError();
    });
  });
});
