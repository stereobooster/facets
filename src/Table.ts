import { TextIndex } from "./TextIndex";
import { InvertedIndex } from "./InvertedIndex";
import { SparseTypedFastBitSet } from "typedfastbitset";

type Facet = {
  indexer: typeof InvertedIndex;
  limit?: number;
  sort?: string[];
};

type TableOptions = {
  textSearch?: {
    searchableFields: string[];
    indexer: TextIndex;
  };
  facets?: Record<string, Facet>;
  idKey?: string;
};

export class Table {
  items: any[];
  universe: SparseTypedFastBitSet;
  indexes: Record<string, InvertedIndex>;
  options: TableOptions;
  textIndex: InstanceType<TextIndex>;

  constructor(options: TableOptions, items: any[] = []) {
    this.items = items;
    this.options = options;
    this.buildIndex();
  }

  replace(data: any[]) {}

  search(query: string, options?: any) {
    // filter by inverted index and boolean query
    // filter by full-text
    // filter by function
    //
  }

  buildIndex() {
    const textIndexClass = this.options.textSearch?.indexer;
    if (textIndexClass) {
      this.textIndex = new textIndexClass(
        // @ts-ignore
        this.options.textSearch?.searchableFields
      );
      if (textIndexClass.usesAddAll) this.textIndex.addAll(this.items);
    }

    const idKey = this.options.idKey || "id";
    this.universe = new SparseTypedFastBitSet();
    this.indexes = {};
    // Object.entries(facets).forEach(
    //   ([key, klass]) => (this.indexes[key] = new klass())
    // );
    this.items.forEach((item, i) => {
      this.universe.add(i);
      if (textIndexClass?.requiresId) item[idKey] = i;
      if (textIndexClass?.usesAddOne) this.textIndex.addOne(i, item);
      // Object.keys(facets).forEach((key) => {
      //   const index = indexes[key];
      //   const value = item[key];
      //   if (Array.isArray(value)) {
      //     value.forEach((v) => index.add(v, i));
      //   } else {
      //     index.add(value, i);
      //   }
      // });
    });
  }
}
