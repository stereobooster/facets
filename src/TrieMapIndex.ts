import TrieMap from "mnemonist/trie-map.js";
import { SparseTypedFastBitSet } from "typedfastbitset";
import { InvertedIndex } from "./InvertedIndex";

export class TrieMapIndex<K> implements InvertedIndex<K> {
  index: TrieMap<K, SparseTypedFastBitSet>;

  constructor() {
    this.index = new TrieMap();
  }

  add(value: K, id: number) {
    if (!this.index.has(value))
      this.index.set(value, new SparseTypedFastBitSet());
    this.index.get(value).add(id);
  }

  get(value: K) {
    return this.index.get(value) || new SparseTypedFastBitSet();
  }
}
