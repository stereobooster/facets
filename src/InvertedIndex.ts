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
