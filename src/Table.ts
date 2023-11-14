import { TextIndex } from "./TextIndex";
import { InvertedIndex } from "./InvertedIndex";
import { SparseTypedFastBitSet } from "typedfastbitset";
import { FacetFilter, evalBool, facetFilterToBool } from "./boolean";
import { SortOptions, sort } from "./sort";
import { IMapIndex } from "./IMapIndex";

type Facet = {
  indexer?: typeof InvertedIndex;
  // page?: number;
  perPage?: number;
};

type TableOptions = {
  textSearch?: {
    searchableFields: string[];
    indexer: TextIndex;
  };
  facets?: Record<string, Facet>;
  // idKey?: string;
};

export type SearchOptions<I = unknown> = {
  query?: string;
  page?: number;
  perPage?: number;
  // TODO:
  // column name, direction
  // type: string | number
  // for string: locale, options (Collator)
  sort?: SortOptions;
  facetFilter?: FacetFilter;
  // filterBy?: <I>(item: I) => boolean; // eslint-disable-line no-unused-vars
};

export type SearchResults<I = unknown> = {
  pagination: {
    perPage: number;
    page: number;
    total: number;
  };
  items: I[];
  facets: Record<string, Array<[string, number]>>;
};

export class Table {
  #items: any[];
  // if id always number of row - map doesn't make sense,
  // because `#store.get(id)` is the same as `#items[id]`
  // #store: Map<number, any>;
  #universe: SparseTypedFastBitSet;
  #indexes: Record<string, InvertedIndex>;
  #options: TableOptions;
  #textIndex: InstanceType<TextIndex>;
  #facetMemo: Record<string, Array<[string, number]>>;

  constructor(options: TableOptions, items: any[] = []) {
    this.#options = options;
    this.update(items);
  }

  update(items: any[]) {
    this.#buildIndex(items);
  }

  search(options?: SearchOptions): SearchResults<any> {
    let resultSet: SparseTypedFastBitSet | undefined = undefined;
    let sortArr: Array<number> | undefined;

    if (this.#textIndex && options?.query) {
      // TODO: handle pagination - if there are no filters and sorting
      sortArr = this.#textIndex.search(options?.query);
      const filteredRows = new SparseTypedFastBitSet(sortArr);
      resultSet = resultSet
        ? // @ts-expect-error
          (resultSet.intersection(filteredRows) as SparseTypedFastBitSet)
        : filteredRows;
    }

    if (options?.facetFilter && Object.keys(options?.facetFilter).length > 0) {
      // Do I even need this culprit with boolean filters?
      const filteredRows = evalBool(
        this.#indexes,
        this.#universe,
        facetFilterToBool(options.facetFilter)
      );
      resultSet = resultSet
        ? (resultSet.intersection(filteredRows) as SparseTypedFastBitSet)
        : filteredRows;
    }

    let resultArr: number[] | undefined;

    if (!options?.sort && sortArr) {
      // sort by relevance - is there a better way?
      resultArr = sortArr.filter((x) => resultSet?.has(x));
    } else {
      resultArr = resultSet?.array();
    }

    let result = resultArr?.map((id) => this.#items[id]);

    // if (options?.filterBy) {
    //   if (!result) result = this.#items;
    //   result = result.filter(options?.filterBy);
    //   // resultSet = this requires id
    // }

    if (options?.sort) {
      if (!result) {
        // because sort works in place
        result = [...this.#items];
      }
      result = result.sort(sort(options.sort));
    }

    if (!result) {
      result = this.#items;
    }

    const facets = this.#getFacets(resultSet, options?.facetFilter);
    const page = options?.page || 0;
    const perPage = options?.perPage || 20;
    return {
      items: result.slice(page * perPage, (page + 1) * perPage),
      pagination: {
        perPage,
        page,
        total: result.length,
      },
      facets,
    };
  }

  // TODO facets:
  // - if number of items in result is small it is cheaper to build facets from scratch
  // - if number of values in facet is small it is easier to intersect result with facets
  // - if there is a filter by the facet it's much easier to build this facet
  //   - intersect only selected
  //   - everything else with 0
  // - sort facets. By default sorted by frequency
  #getFacets(resultSet?: SparseTypedFastBitSet, facetFilter?: FacetFilter) {
    const ff = this.#getFullFacets();
    return Object.keys(ff).reduce((res, facet) => {
      const perPage = this.#options.facets![facet].perPage || 20;
      res[facet] = ff[facet].slice(0, perPage);
      return res;
    }, {});
  }

  #getFullFacets() {
    if (!this.#facetMemo) {
      this.#facetMemo = Object.keys(this.#options.facets || {}).reduce(
        (res, facet) => {
          res[facet] = this.#indexes[facet].topValues();
          return res;
        },
        {}
      );
    }
    return this.#facetMemo;
  }

  #buildIndex(items: any[]) {
    this.#items = items;
    // this.#store = new Map();

    // In order to use custom id field need to pass it to textIndexClass
    // const idKey = this.#options.idKey || "id";
    const idKey = "id";
    const textIndexClass = this.#options.textSearch?.indexer;
    if (textIndexClass) {
      this.#textIndex = new textIndexClass(
        // @ts-ignore
        this.#options.textSearch?.searchableFields
      );
    }

    const facets = this.#options.facets || {};
    this.#indexes = {};
    Object.keys(facets).forEach(
      (key) => (this.#indexes[key] = new (facets[key].indexer || IMapIndex)())
    );

    this.#universe = new SparseTypedFastBitSet();
    if (items.length > 0) this.#universe.addRange(0, items.length - 1);

    items.forEach((item, id) => {
      if (textIndexClass?.requiresId) item[idKey] = id;
      // this.#store.set(id, item);
      // this.#universe.add(id);
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
