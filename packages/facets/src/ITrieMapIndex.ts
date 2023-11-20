// import TrieMap from "mnemonist/trie-map.js";
// import { SparseTypedFastBitSet } from "typedfastbitset";
// import { InvertedIndexMaplike } from "./InvertedIndex";

// export class ITrieMapIndex<K> extends InvertedIndexMaplike<K> {
//   index: TrieMap<K, SparseTypedFastBitSet>;

//   constructor() {
//     super();
//     this.index = new TrieMap();
//   }

//   like(prefix: K) {
//     return this.index
//       .find(prefix)
//       .reduce((p, [_, v]) => p.union(v), new SparseTypedFastBitSet());
//   }
// }
