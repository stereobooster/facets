import TrieMap from "mnemonist/trie-map.js";
import { SparseTypedFastBitSet } from "typedfastbitset";
import { InvertedIndexMaplike } from "./InvertedIndex";

export class ITrieMapIndex<K> extends InvertedIndexMaplike<K> {
  index: TrieMap<K, SparseTypedFastBitSet>;

  constructor() {
    super();
    this.index = new TrieMap();
  }

  like(prefix) {
    return this.index.find(prefix).reduce((p, [k, v]) => {
      p.union(v);
      return p;
    }, new SparseTypedFastBitSet());
  }

  topValuesLike(query) {
    return this.index
      .find(query)
      .map(([k, v]) => [k, v.size()] as const)
      .sort((a, b) => b[1] - a[1]);
  }
}
