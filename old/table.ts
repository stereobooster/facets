import { SparseTypedFastBitSet } from "typedfastbitset";

type TableOptions = {
  textSearch?: {
    searchableFields: string[];
    indexer: any;
  };
  facets?: Record<
    string,
    {
      indexer: any; // MapInvertedIndex | TrieMapInvertedIndex
      page_size?: number;
      sort?: string[];
    }
  >;
};

class Table {
  constructor(options, data = []) {}

  replace(data) {}

  search(query: string, options?: any) {
    // filter by inverted index and boolean query
    // filter by full-text
    // filter by function
    // 
  }
}

console.log(1);
