import { TextIndex } from "./TextIndex";
import { InvertedIndex } from "./InvertedIndex";

type Facet = {
  [k: string]: {
    indexer: typeof InvertedIndex;
    limit?: number;
    sort?: string[];
  };
};

type TableOptions = {
  textSearch?: {
    searchableFields: string[];
    indexer: TextIndex;
  };
  facets?: Record<string, Facet>;
};

export class Table {
  constructor(options: TableOptions, data: any[] = []) {}

  replace(data: any[]) {}

  search(query: string, options?: any) {
    // filter by inverted index and boolean query
    // filter by full-text
    // filter by function
    //
  }
}
