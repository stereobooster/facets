import { TextIndex } from "./TextIndex";
import { InvertedIndex } from "./InvertedIndex";
import { SparseTypedFastBitSet } from "typedfastbitset";

type Facet = {
  indexer: typeof InvertedIndex;
  limit?: number;
  sort?: string[];
};

type Filter = OrFilter | AndFilter | EqFilter | NotFilter;
type EqFilter = {
  op: "eq";
  column: string;
  value: string | number;
};
type OrFilter = {
  op: "or";
  val: [Filter, Filter];
};
type AndFilter = {
  op: "and";
  val: [Filter, Filter];
};
type NotFilter = {
  op: "not";
  val: Filter;
};

const difference = (a: SparseTypedFastBitSet, b: SparseTypedFastBitSet) =>
  a.new_difference(b);
const union = (a: SparseTypedFastBitSet, b: SparseTypedFastBitSet) =>
  a.new_union(b);
const intersection = (a: SparseTypedFastBitSet, b: SparseTypedFastBitSet) =>
  a.new_intersection(b);

type TableOptions = {
  textSearch?: {
    searchableFields: string[];
    indexer: TextIndex;
  };
  facets?: Record<string, Facet>;
  idKey?: string;
};

export type SearchOptions<I = unknown> = {
  query?: string;
  page?: number;
  per_page?: number;
  sort?: any;
  filters?: Record<string, Filter>;
  filterBy?: <I>(item: I) => boolean; // eslint-disable-line no-unused-vars
};

export type SearchResults<I = unknown> = {
  pagination: {
    perPage: number;
    page: number;
    total: number;
  };
  timings: {
    total: number;
    facets: number;
    search: number;
    sorting: number;
  };
  items: I[];
  facets: any;
};

export class Table {
  // #items: any[];
  #store: Map<number, any>;
  #universe: SparseTypedFastBitSet;
  #indexes: Record<string, InvertedIndex>;
  #options: TableOptions;
  #textIndex: InstanceType<TextIndex>;

  constructor(options: TableOptions, items: any[] = []) {
    this.#options = options;
    this.update(items);
  }

  update(items: any[]) {
    this.#buildIndex(items);
  }

  search(query: string, options?: any): SearchResults {
    let resultSet: SparseTypedFastBitSet | undefined = undefined;
    let sortArr: Array<number> | undefined;

    if (this.#textIndex && query) {
      sortArr = this.#textIndex.search(query, options);
      const filteredRows = new SparseTypedFastBitSet(sortArr);
      resultSet = resultSet
        ? // @ts-expect-error
          (resultSet.intersection(filteredRows) as SparseTypedFastBitSet)
        : filteredRows;
    }

    if (options.filter) {
      const filteredRows = this.#evalBool(options.filter);
      resultSet = resultSet
        ? (resultSet.intersection(filteredRows) as SparseTypedFastBitSet)
        : filteredRows;
    }

    const result = resultSet!.array().map((id) => this.#store.get(id));

    // filter by function
    // sort by function
    // pagination
    // facets

    return {
      items: result,
    } as any;
  }

  #evalBool(f: Filter): SparseTypedFastBitSet {
    switch (f.op) {
      case "eq":
        return this.#indexes[f.column].get(f.value);
      case "not":
        return difference(this.#universe, this.#evalBool(f.val)) as any;
      case "or":
        return union(this.#evalBool(f.val[0]), this.#evalBool(f.val[1]));
      case "and":
        return intersection(
          this.#evalBool(f.val[0]),
          this.#evalBool(f.val[1])
        ) as any;
    }
  }

  #buildIndex(items: any[]) {
    this.#store = new Map();
    const textIndexClass = this.#options.textSearch?.indexer;
    const facets = this.#options.facets || {};
    if (textIndexClass) {
      this.#textIndex = new textIndexClass(
        // @ts-ignore
        this.#options.textSearch?.searchableFields
      );
    }

    const idKey = this.#options.idKey || "id";
    this.#universe = new SparseTypedFastBitSet();
    this.#indexes = {};
    Object.keys(facets).forEach(
      (key) => (this.#indexes[key] = new facets[key].indexer())
    );
    items.forEach((item, id) => {
      if (textIndexClass?.requiresId) item[idKey] = id;
      this.#store.set(id, item);
      this.#universe.add(id);
      if (textIndexClass?.usesAddOne) this.#textIndex.addOne(id, item);
      Object.keys(facets).forEach((key) => {
        const index = this.#indexes[key];
        const value = item[key];
        if (Array.isArray(value)) {
          value.forEach((v) => index.add(v, id));
        } else {
          index.add(value, id);
        }
      });
    });

    // after adding ids to items
    if (textIndexClass?.usesAddAll) this.#textIndex.addAll(items);
  }
}
