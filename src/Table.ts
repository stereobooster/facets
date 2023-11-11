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

export class Table {
  #items: any[];
  #universe: SparseTypedFastBitSet;
  #indexes: Record<string, InvertedIndex>;
  #options: TableOptions;
  #textIndex: InstanceType<TextIndex>;

  constructor(options: TableOptions, items: any[] = []) {
    this.#options = options;
    this.update(items);
  }

  update(items: any[]) {
    this.#items = items;
    this.#buildIndex();
  }

  search(query: string, options?: any) {
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

    // filter by function
    // sort by function
    // pagination
    // facets
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

  #buildIndex() {
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
    this.#items.forEach((item, i) => {
      this.#universe.add(i);
      if (textIndexClass?.requiresId) item[idKey] = i;
      if (textIndexClass?.usesAddOne) this.#textIndex.addOne(i, item);
      Object.keys(facets).forEach((key) => {
        const index = this.#indexes[key];
        const value = item[key];
        if (Array.isArray(value)) {
          value.forEach((v) => index.add(v, i));
        } else {
          index.add(value, i);
        }
      });
    });

    // after adding ids to items
    if (textIndexClass?.usesAddAll) this.#textIndex.addAll(this.#items);
  }
}
