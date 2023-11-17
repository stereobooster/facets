import { InvertedIndexMaplike } from "./InvertedIndex";

export class IMapIndex<K> extends InvertedIndexMaplike<K> {
  constructor() {
    super();
    this.index = new Map();
  }
}
