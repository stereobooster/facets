import { SparseTypedFastBitSet } from "typedfastbitset";

export type FacetValue<K = unknown> = [K, number, SparseTypedFastBitSet];

export class InvertedIndex<K = unknown> {
  add(value: K, id: number): void {
    throw new Error("Not implemented");
  }
  get(value: K): SparseTypedFastBitSet {
    throw new Error("Not implemented");
  }
  topValues(): Array<FacetValue<K>> {
    throw new Error("Not implemented");
  }
}

interface Maplike<K, V> {
  get(key: K): V | undefined;
  has(key: K): boolean;
  set(key: K, value: V): this;
  entries(): IterableIterator<[K, V]>;
}

export class InvertedIndexMaplike<K = unknown> extends InvertedIndex<K> {
  index: Maplike<K, SparseTypedFastBitSet>;

  add(value: K, id: number) {
    if (!this.index.has(value))
      this.index.set(value, new SparseTypedFastBitSet());
    this.index.get(value)!.add(id);
  }

  get(value: K) {
    return this.index.get(value) || new SparseTypedFastBitSet();
  }

  topValues() {
    return [...this.index.entries()]
      .map(([k, v]) => [k, v.size(), v] as FacetValue<K>)
      .sort((a, b) => b[1] - a[1]);
  }
}
