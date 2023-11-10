import { SparseTypedFastBitSet } from "typedfastbitset";
import { MapIndex } from "./MapIndex";
import { TrieMapIndex } from "./TrieMapIndex";

export interface InvertedIndex<K = unknown> {
  add(value: K, id: number): void;
  get(value: K): SparseTypedFastBitSet;
}

type Facets = {
  [k: string]: typeof MapIndex | typeof TrieMapIndex;
};

type IndexStore<T extends Facets> = {
  [K in keyof T]: InvertedIndex;
};

type Filter = OrFilter | AndFilter | EqFilter | NotFilter;
type EqFilter = {
  op: "eq";
  column: string;
  value: string | number;
};
type OrFilter = {
  op: "or";
  val: [Filter, Filter];
};
type AndFilter = {
  op: "and";
  val: [Filter, Filter];
};
type NotFilter = {
  op: "not";
  val: Filter;
};

const difference = (a: SparseTypedFastBitSet, b: SparseTypedFastBitSet) =>
  a.new_difference(b);
const union = (a: SparseTypedFastBitSet, b: SparseTypedFastBitSet) =>
  a.new_union(b);
const intersection = (a: SparseTypedFastBitSet, b: SparseTypedFastBitSet) =>
  a.new_intersection(b);

export function evaluate(
  u: SparseTypedFastBitSet,
  s: IndexStore<any>,
  f: Filter
): SparseTypedFastBitSet {
  switch (f.op) {
    case "eq":
      return s[f.column].get(f.value);
    case "not":
      return difference(u, evaluate(u, s, f.val)) as any;
    case "or":
      return union(evaluate(u, s, f.val[0]), evaluate(u, s, f.val[1]));
    case "and":
      return intersection(
        evaluate(u, s, f.val[0]),
        evaluate(u, s, f.val[1])
      ) as any;
  }
}

export function buildIndex<T extends Facets>(
  items: any[],
  facets: T,
  idKey?: string
): [SparseTypedFastBitSet, IndexStore<T>] {
  const universe = new SparseTypedFastBitSet();
  const indexes: IndexStore<T> = {} as any;
  Object.entries(facets).forEach(
    ([key, klass]) => (indexes[key as keyof T] = new klass())
  );
  items.forEach((item, i) => {
    if (idKey) item[idKey] = i;
    universe.add(i);
    Object.keys(facets).forEach((key) => {
      const index = indexes[key];
      const value = item[key];
      if (Array.isArray(value)) {
        value.forEach((v) => index.add(v, i));
      } else {
        index.add(value, i);
      }
    });
  });
  return [universe, indexes];
}
