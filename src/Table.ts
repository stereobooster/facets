import { SparseTypedFastBitSet } from "typedfastbitset";
import { TextIndex } from "./TextIndex";
import { FacetValue, InvertedIndex } from "./InvertedIndex";
import { IMapIndex } from "./IMapIndex";
import { NullsOrder, SortDirection, sort } from "./sort";
import { Pagination, paginate } from "./utils";

type SupportedFieldTypes = string | number | boolean | null;

type FacetFilter = Record<string, SupportedFieldTypes[]>;

type FacetFilterInternal = Record<
  string,
  {
    set: SparseTypedFastBitSet;
    selected: SupportedFieldTypes[];
  }
>;

type SortConfig = {
  /**
   * @default "last"
   */
  nulls?: NullsOrder;
  /**
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale
   */
  locale?: string | string[];
  /**
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator/Collator#options
   */
  options?: Intl.CollatorOptions;
};

type FacetSort = ["value" | "frequency", SortDirection];

type FacetConfig = {
  indexer?: typeof InvertedIndex;
  perPage?: number;
  /**
   * @default ["frequency", "desc"]
   */
  sort?: FacetSort;
  /**
   * @default true
   */
  showZeroes?: boolean;
  /**
   * @default false
   */
  selectedFirst?: boolean;
};

type FieldConfig = SortConfig & {
  type: "string" | "number" | "boolean";
  isArray?: boolean;
  facet?: boolean | FacetConfig;
  text?: boolean;
};

type Schema = Record<string, FieldConfig>;

type TableConfig = {
  schema: Schema;
  textIndex?: TextIndex;
  sortOptions?: SortConfig;
  // idKey?: string; - needs more work
};

export type SearchOptions<I = unknown> = {
  query?: string;
  page?: number;
  perPage?: number;
  sort?: [string, SortDirection];
  facetFilter?: FacetFilter;
  // filterBy?: <I>(item: I) => boolean; // eslint-disable-line no-unused-vars
};

type FacetStats = {
  min: number;
  max: number;
};

type FacetResult = {
  items: Array<[SupportedFieldTypes, number]>;
  pagination: Pagination;
  stats?: FacetStats;
};

export type SearchResults<I = unknown> = {
  items: I[];
  pagination: Pagination;
  facets: Record<string, FacetResult>;
};

export class Table {
  #items: any[];
  #universe: SparseTypedFastBitSet;
  #indexes: Record<string, InvertedIndex<SupportedFieldTypes>>;
  #options: TableConfig;
  #textIndex: InstanceType<TextIndex>;
  #fullFacets: Record<
    string,
    Array<[SupportedFieldTypes, number, SparseTypedFastBitSet]>
  >;

  constructor(options: TableConfig, items: any[] = []) {
    this.#options = options;
    this.update(items);
  }

  update(items: any[]) {
    this.#buildIndex(items);
  }

  search(options?: SearchOptions): SearchResults<any> {
    const { sortArr, textSearch, facetFilterInternal, facetSearch } =
      this.#preSearch(options);

    const facets = this.#getFacets(facetFilterInternal, textSearch);

    let resultArr: number[] | undefined;
    if (facetSearch && textSearch) {
      const resultSet = textSearch.new_intersection(facetSearch) as any;
      if (options?.sort) {
        resultArr = resultSet?.array();
      } else {
        resultArr = sortArr!.filter((x) => resultSet?.has(x));
      }
    } else if (facetSearch) {
      resultArr = facetSearch?.array();
    } else if (textSearch) {
      resultArr = sortArr;
    }

    let result = resultArr?.map((id) => this.#items[id]);

    if (options?.sort) {
      if (!result) {
        // because sort works in place
        result = [...this.#items];
      }
      result = result.sort(this.#sortForResults(options.sort));
    }

    if (!result) {
      result = this.#items;
    }

    return {
      ...paginate(result, options?.page, options?.perPage),
      facets,
    };
  }

  facet(filed: string, options?: SearchOptions): FacetResult {
    const { textSearch, facetFilterInternal } = this.#preSearch(options);
    return this.#getFacet(
      filed,
      facetFilterInternal,
      textSearch,
      options?.page,
      options?.perPage
    );
  }

  #preSearch(options?: SearchOptions) {
    let sortArr: Array<number> | undefined;
    let textSearch: SparseTypedFastBitSet | undefined = undefined;
    if (this.#textIndex && options?.query) {
      sortArr = this.#textIndex.search(options?.query, {
        perPage: this.#items.length,
      });
      textSearch = new SparseTypedFastBitSet(sortArr);
    }

    const [facetFilterInternal, facetSearch] = this.#getFacetFilters(
      options?.facetFilter
    );

    return {
      sortArr,
      textSearch,
      facetFilterInternal,
      facetSearch,
    };
  }

  #getFacetFilters(facetFilter?: FacetFilter) {
    if (!facetFilter || Object.keys(facetFilter).length === 0)
      return [undefined, undefined];

    let filteredRows: SparseTypedFastBitSet | undefined;

    const facetFilterInternal = Object.entries(facetFilter).reduce(
      (res, [field, selected]) => {
        let set: SparseTypedFastBitSet | undefined;
        selected.forEach((filterValue) => {
          if (!set) {
            set =
              selected.length === 1
                ? this.#indexes[field].get(filterValue)
                : this.#indexes[field].get(filterValue).clone();
            return;
          }
          set.intersection(this.#indexes[field].get(filterValue));
        });
        if (!set) return res;

        if (!filteredRows) {
          filteredRows = set.clone();
        } else {
          filteredRows.intersection(set);
        }

        res[field] = {
          set,
          selected,
        };
        return res;
      },
      {} as FacetFilterInternal
    );

    return [facetFilterInternal, filteredRows] as const;
  }

  #getFacetSetExcept(
    field: string,
    facetFilter: FacetFilterInternal | undefined
  ) {
    if (!facetFilter) return;
    facetFilter = { ...facetFilter };
    delete facetFilter[field];

    const keys = Object.keys(facetFilter);
    let result: SparseTypedFastBitSet | undefined;
    keys.forEach((key) => {
      if (!result) {
        result =
          keys.length === 1
            ? facetFilter![key].set
            : facetFilter![key].set.clone();
        return;
      }
      result.intersection(facetFilter![key].set);
    });
    return result;
  }

  #getFacets(
    facetFilter: FacetFilterInternal | undefined,
    textSearch: SparseTypedFastBitSet | undefined
  ) {
    return Object.keys(this.#indexes).reduce((res, field) => {
      res[field] = this.#getFacet(field, facetFilter, textSearch);
      return res;
    }, {} as Record<string, FacetResult>);
  }

  #getFacet(
    field: string,
    facetFilter: FacetFilterInternal | undefined,
    textSearch: SparseTypedFastBitSet | undefined,
    page?: number,
    perPage?: number
  ) {
    const ff = this.#getFullFacets();

    page = page || 0;
    // @ts-expect-error fix later
    perPage = perPage || this.#options.schema[field].facet?.perPage || 20;
    // @ts-expect-error fix later
    const showZeroes = this.#options.schema[field].facet?.showZeroes || true;
    const selectedFirst =
      // @ts-expect-error fix later
      this.#options.schema[field].facet?.selectedFirst || false;

    const selected = facetFilter ? facetFilter[field]?.selected : [];

    const facetSearch = this.#getFacetSetExcept(field, facetFilter);
    let resultSet: SparseTypedFastBitSet | undefined = undefined;
    if (facetSearch && textSearch) {
      resultSet = facetSearch.new_intersection(textSearch) as any;
    } else if (facetSearch) {
      resultSet = facetSearch;
    } else if (textSearch) {
      resultSet = textSearch;
    }

    let newFacet = resultSet
      ? ff[field].map(([x, , z]) => {
          const zz = z.new_intersection(resultSet!);
          return [x, zz.size(), zz] as [
            SupportedFieldTypes,
            number,
            SparseTypedFastBitSet
          ];
        })
      : ff[field];

    if (resultSet && !showZeroes) {
      newFacet = newFacet.filter(([x, y]) => y !== 0 || selected.includes(x));
    }

    const sortConfig = this.#sortConfigForFacet(field);
    if (
      (resultSet && sortConfig[0] === "frequency") ||
      (selectedFirst && selected.length > 0)
    ) {
      newFacet.sort(
        this.#sortForFacet(field, selectedFirst ? selected : undefined)
      );
    }

    let stats: FacetStats | undefined;
    if (this.#options.schema[field].type === "number") {
      // if facet is sorted by value than `first` and `last` are `min` and `max`
      const values = [] as any[];
      newFacet.forEach(([x]) => {
        if (x != null) values.push(x);
      });
      stats = {
        min: Math.min(...values),
        max: Math.max(...values),
      };
    }

    return {
      ...paginate(newFacet, page, perPage, ([x, y]) => [x, y]),
      stats,
    } as FacetResult;
  }

  #getFullFacets() {
    if (!this.#fullFacets) {
      this.#fullFacets = Object.keys(this.#indexes).reduce((res, field) => {
        res[field] = this.#indexes[field]
          .values()
          .sort(this.#sortForFacet(field));
        return res;
      }, {} as Record<string, Array<FacetValue<SupportedFieldTypes>>>);
    }
    return this.#fullFacets;
  }

  #sortForResults([field, order]: [string, SortDirection]) {
    return sort({
      order,
      field,
      type: this.#options.schema[field].isArray
        ? undefined
        : this.#options.schema[field].type,
      locale:
        this.#options.sortOptions?.locale || this.#options.schema[field].locale,
      nulls:
        this.#options.sortOptions?.nulls || this.#options.schema[field].nulls,
      options:
        this.#options.sortOptions?.options ||
        this.#options.schema[field].options,
    });
  }

  #sortConfigForFacet(field: string): FacetSort {
    // @ts-expect-error fix later
    return this.#options.schema[field].facet?.sort || ["frequency", "desc"];
  }

  #sortForFacet(field: string, selected?: SupportedFieldTypes[]) {
    const config = this.#sortConfigForFacet(field);
    const defaultSort = sort({
      field: config[0] === "frequency" ? 1 : 0,
      order: config[1],
      type:
        config[0] === "frequency" ? "number" : this.#options.schema[field].type,
    });
    if (selected && selected.length > 0) {
      return (a: any, b: any) => {
        const aa = selected.includes(a[0]);
        const bb = selected.includes(b[0]);
        if (aa && bb) return defaultSort(a, b);
        if (!aa && !bb) return defaultSort(a, b);
        return aa ? 1 : -1;
      };
    }
    return defaultSort;
  }

  #buildIndex(items: any[]) {
    this.#items = items;

    // In order to use custom id field need to pass it to textIndexClass
    const idKey = "id"; //this.#options.idKey || "id";
    const searchableFields = Object.entries(this.#options.schema)
      .filter(([, value]) => value.text)
      .map(([key]) => key);

    const textIndexClass = this.#options.textIndex;
    if (textIndexClass) {
      this.#textIndex = new textIndexClass({ fields: searchableFields });
    }

    this.#indexes = {};
    Object.entries(this.#options.schema).forEach(([field, fieldConfig]) => {
      if (!fieldConfig.facet) return;
      // @ts-expect-error fix later
      this.#indexes[field] = new (fieldConfig.facet?.indexer || IMapIndex)();
    });

    this.#universe = new SparseTypedFastBitSet();
    if (items.length > 0) this.#universe.addRange(0, items.length - 1);

    items.forEach((item, id) => {
      if (textIndexClass?.requiresId) item[idKey] = id;
      if (textIndexClass?.usesAddOne) this.#textIndex.addOne(id, item);
      Object.entries(this.#indexes).forEach(([key, index]) => {
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
