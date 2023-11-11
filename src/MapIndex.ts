import { SparseTypedFastBitSet } from "typedfastbitset";
import { InvertedIndex } from "./InvertedIndex";

export class MapIndex<K> extends InvertedIndex<K> {
  index: Map<K, SparseTypedFastBitSet>;

  constructor() {
    super();
    this.index = new Map();
  }

  add(value: K, id: number) {
    if (!this.index.has(value))
      this.index.set(value, new SparseTypedFastBitSet());
    this.index.get(value)!.add(id);
  }

  get(value: K) {
    return this.index.get(value) || new SparseTypedFastBitSet();
  }
}
