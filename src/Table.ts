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
    ids: SparseTypedFastBitSet;
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
  sortConfig?: SortConfig;
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
  // #universe: SparseTypedFastBitSet;
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
    const { sortByText, idsByText, facetFilterInternal, idsByFacet } =
      this.#searchAll(options);

    let ids: number[] | undefined;
    if (idsByFacet && idsByText) {
      const resultSet = idsByText.new_intersection(idsByFacet) as any;
      if (options?.sort) {
        ids = resultSet?.array();
      } else {
        ids = sortByText!.filter((x) => resultSet?.has(x));
      }
    } else if (idsByFacet) {
      ids = idsByFacet.array();
    } else if (idsByText) {
      ids = sortByText;
    }

    let items = ids?.map((id) => this.#items[id]);

    if (options?.sort) {
      if (!items) {
        // because sort works in place
        items = [...this.#items];
      }
      items = items.sort(this.#sortForResults(options.sort));
    }

    if (!items) {
      items = this.#items;
    }

    return {
      ...paginate(items, options?.page, options?.perPage),
      facets: this.#getFacets(facetFilterInternal, idsByText),
    };
  }

  facet(filed: string, options?: SearchOptions): FacetResult {
    const { idsByText, facetFilterInternal } = this.#searchAll(options);
    return this.#getFacet(
      filed,
      facetFilterInternal,
      idsByText,
      options?.page,
      options?.perPage
    );
  }

  #searchText(query: string | undefined) {
    let sortByText: Array<number> | undefined;
    let idsByText: SparseTypedFastBitSet | undefined = undefined;
    if (this.#textIndex && query) {
      sortByText = this.#textIndex.search(query, {
        perPage: this.#items.length,
      });
      idsByText = new SparseTypedFastBitSet(sortByText);
    }
    return { sortByText, idsByText };
  }

  #searchFacets(facetFilter: FacetFilter | undefined) {
    if (!facetFilter || Object.keys(facetFilter).length === 0)
      return { facetFilterInternal: undefined, idsByFacet: undefined };

    let idsByFacet: SparseTypedFastBitSet | undefined;

    const facetFilterInternal = Object.entries(facetFilter).reduce(
      (result, [field, selected]) => {
        let ids: SparseTypedFastBitSet | undefined;
        selected.forEach((filterValue) => {
          if (!ids) {
            ids =
              selected.length === 1
                ? this.#indexes[field].get(filterValue)
                : this.#indexes[field].get(filterValue).clone();
            return;
          }
          ids.intersection(this.#indexes[field].get(filterValue));
        });
        if (!ids) return result;

        if (!idsByFacet) {
          idsByFacet = ids.clone();
        } else {
          idsByFacet.intersection(ids);
        }

        result[field] = {
          ids,
          selected,
        };
        return result;
      },
      {} as FacetFilterInternal
    );

    return { facetFilterInternal, idsByFacet };
  }

  #searchAll(options?: SearchOptions) {
    return {
      ...this.#searchText(options?.query),
      ...this.#searchFacets(options?.facetFilter),
    };
  }

  #getFacetFilterIdsExcept(
    field: string,
    facetFilter: FacetFilterInternal | undefined
  ) {
    if (!facetFilter) return;
    facetFilter = { ...facetFilter };
    delete facetFilter[field];

    const fields = Object.keys(facetFilter);
    let ids: SparseTypedFastBitSet | undefined;
    fields.forEach((field) => {
      if (!ids) {
        ids =
          fields.length === 1
            ? facetFilter![field].ids
            : facetFilter![field].ids.clone();
        return;
      }
      ids.intersection(facetFilter![field].ids);
    });
    return ids;
  }

  #getFacets(
    facetFilter: FacetFilterInternal | undefined,
    textSearch: SparseTypedFastBitSet | undefined
  ) {
    return Object.keys(this.#indexes).reduce((result, field) => {
      result[field] = this.#getFacet(field, facetFilter, textSearch);
      return result;
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

    const facetSearch = this.#getFacetFilterIdsExcept(field, facetFilter);
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
      this.#fullFacets = Object.keys(this.#indexes).reduce((result, field) => {
        result[field] = this.#indexes[field]
          .values()
          .sort(this.#sortForFacet(field));
        return result;
      }, {} as Record<string, Array<FacetValue<SupportedFieldTypes>>>);
    }
    return this.#fullFacets;
  }

  #sortForResults([field, order]: [string, SortDirection]) {
    return sort({
      field,
      order,
      type: this.#options.schema[field].isArray
        ? undefined
        : this.#options.schema[field].type,
      locale:
        this.#options.sortConfig?.locale || this.#options.schema[field].locale,
      nulls:
        this.#options.sortConfig?.nulls || this.#options.schema[field].nulls,
      options:
        this.#options.sortConfig?.options ||
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

    // this.#universe = new SparseTypedFastBitSet();
    // if (items.length > 0) this.#universe.addRange(0, items.length - 1);

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
