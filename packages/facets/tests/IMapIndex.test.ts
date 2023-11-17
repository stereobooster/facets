import { describe, it, expect } from "vitest";
import { IMapIndex } from "../src/IMapIndex";

describe("IMapIndex", () => {
  it("get", () => {
    const index = new IMapIndex();
    index.add("a", 0);
    index.add("b", 1);
    index.add("a", 2);
    index.add(null, 3);
    index.add(undefined, 4);
    index.add(false, 5);
    index.add(0, 6);
    index.add("", 7);
    expect(index.get("a").array()).toEqual([2, 0]);
    expect(index.get(null).array()).toEqual([4, 3]);
    expect(index.get(undefined).array()).toEqual([4, 3]);
    expect(index.get(false).array()).toEqual([5]);
    expect(index.get(0).array()).toEqual([6]);
    expect(index.get("").array()).toEqual([7]);
  });

  it("values", () => {
    const index = new IMapIndex();
    index.add("a", 0);
    index.add("b", 1);
    index.add("a", 2);
    index.add(null, 3);
    index.add(undefined, 4);
    index.add(false, 5);
    index.add(0, 6);
    index.add("", 7);
    expect(index.values().map(([x, y]) => [x, y])).toEqual([
      ["a", 2],
      ["b", 1],
      [null, 2],
      [false, 1],
      [0, 1],
      ["", 1],
    ]);
  });
});
