import { SparseTypedFastBitSet } from "typedfastbitset";

export class InvertedIndex<K = unknown> {
  add(value: K, id: number): void {
    throw new Error("Not implemented");
  }
  get(value: K): SparseTypedFastBitSet {
    throw new Error("Not implemented");
  }
  topValues(): Array<[K, number]> {
    throw new Error("Not implemented");
  }
}

interface MapLike<K, V> {
  get(key: K): V | undefined;
  has(key: K): boolean;
  set(key: K, value: V): this;
  entries(): IterableIterator<[K, V]>;
}

export class InvertedIndexMaplike<K = unknown> extends InvertedIndex<K> {
  index: MapLike<K, SparseTypedFastBitSet>;

  add(value: K, id: number) {
    if (!this.index.has(value))
      this.index.set(value, new SparseTypedFastBitSet());
    this.index.get(value)!.add(id);
  }

  get(value: K) {
    return this.index.get(value) || new SparseTypedFastBitSet();
  }

  topValues() {
    // TOOD: memoize one
    // TOOD: sort options
    // TOOD: limit, offset
    return [...this.index.entries()]
      .map(([k, v]) => [k, v.size()] as [K, number])
      .sort((a, b) => b[1] - a[1]);
  }
}

export type Facets = {
  [k: string]: typeof InvertedIndex;
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
