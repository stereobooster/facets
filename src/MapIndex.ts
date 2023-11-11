import { InvertedIndexMaplike } from "./InvertedIndex";

export class MapIndex<K> extends InvertedIndexMaplike<K> {
  constructor() {
    super();
    this.index = new Map();
  }
}
