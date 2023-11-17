import { SparseTypedFastBitSet } from "typedfastbitset";

export type FacetValue<K = unknown> = [K, number, SparseTypedFastBitSet];

export class InvertedIndex<K = unknown> {
  add(value: K, id: number): void {
    throw new Error("Not implemented");
  }
  get(value: K): SparseTypedFastBitSet {
    throw new Error("Not implemented");
  }
  values(): Array<FacetValue<K>> {
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
    if (value === undefined) value = null as any;
    if (!this.index.has(value))
      this.index.set(value, new SparseTypedFastBitSet());
    this.index.get(value)!.add(id);
  }

  get(value: K) {
    if (value === undefined) value = null as any;
    return this.index.get(value) || new SparseTypedFastBitSet();
  }

  values() {
    return [...this.index.entries()].map(
      ([k, v]) => [k, v.size(), v] as FacetValue<K>
    );
  }
}
