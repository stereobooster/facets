import { SparseTypedFastBitSet } from "typedfastbitset";
import { TextIndex } from "./TextIndex";
import { FacetValue, InvertedIndex } from "./InvertedIndex";
import { IMapIndex } from "./IMapIndex";
import { NullsOrder, SortDirection, sort } from "./sort";
import { Pagination, paginate } from "./utils";

type SupportedFieldTypes = string | number | boolean | null;

type FieldConfig = SortConfig & {
  type: "string" | "number" | "boolean";
  isArray?: boolean;
  facet?: boolean | FacetConfig;
  text?: boolean;
};

type Schema = Record<string, FieldConfig>;

type TableConfig<S extends Schema> = {
  schema: S;
  textIndex?: TextIndex;
  sortConfig?: SortConfig;
  // idKey?: string; - needs more work
};

type FacetFilter<S extends Schema> = {
  [K in keyof S]?: S[K]["type"] extends "string"
    ? Array<string | null>
    : S[K]["type"] extends "number"
    ? Array<number | null>
    : S[K]["type"] extends "boolean"
    ? Array<boolean | null>
    : never;
};

type Item<S extends Schema> = {
  [K in keyof S]?: S[K]["type"] extends "string"
    ? string | null | Array<string | null>
    : S[K]["type"] extends "number"
    ? number | null | Array<number | null>
    : S[K]["type"] extends "boolean"
    ? boolean | null | Array<boolean | null>
    : never;
};

type FacetStats = {
  min: number;
  max: number;
};

type FacetResult<T = SupportedFieldTypes> = {
  items: Array<[T | null, number]>;
  pagination: Pagination;
  stats: T extends number ? FacetStats : undefined;
};

type FacetResults<S extends Schema> = {
  [K in keyof S]: S[K]["type"] extends "string"
    ? FacetResult<string>
    : S[K]["type"] extends "number"
    ? FacetResult<number>
    : S[K]["type"] extends "boolean"
    ? FacetResult<boolean>
    : never;
};;

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

export type SearchOptions<S extends Schema> = {
  query?: string;
  page?: number;
  perPage?: number;
  sort?: [string, SortDirection];
  facetFilter?: FacetFilter<S>;
};

export type SearchResults<S extends Schema, I> = {
  items: I[];
  pagination: Pagination;
  facets: FacetResults<S>;
};

export class Table<S extends Schema, I extends Item<S>> {
  #items: I[];
  #indexes: Record<string, InvertedIndex<SupportedFieldTypes>>;
  #config: TableConfig<S>;
  #textIndex: InstanceType<TextIndex>;
  #fullFacets: Record<
    string,
    Array<[SupportedFieldTypes, number, SparseTypedFastBitSet]>
  >;

  constructor(config: TableConfig<S>, items: I[] = []) {
    this.#config = config;
    this.update(items);
  }

  update(items: any[]) {
    this.#buildIndex(items);
  }

  search(options?: SearchOptions<S>): SearchResults<S, I> {
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
      facets: this.#getFacets(facetFilterInternal, idsByText) as any,
    };
  }

  facet(filed: string, options?: SearchOptions<S>): FacetResult {
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

  #searchFacets(facetFilter: FacetFilter<S> | undefined) {
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

  #searchAll(options?: SearchOptions<S>) {
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
    perPage = perPage || this.#config.schema[field].facet?.perPage || 20;
    // @ts-expect-error fix later
    const showZeroes = this.#config.schema[field].facet?.showZeroes || true;
    const selectedFirst =
      // @ts-expect-error fix later
      this.#config.schema[field].facet?.selectedFirst || false;

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
    if (this.#config.schema[field].type === "number") {
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
      type: this.#config.schema[field].isArray
        ? undefined
        : this.#config.schema[field].type,
      locale:
        this.#config.sortConfig?.locale || this.#config.schema[field].locale,
      nulls: this.#config.sortConfig?.nulls || this.#config.schema[field].nulls,
      options:
        this.#config.sortConfig?.options || this.#config.schema[field].options,
    });
  }

  #sortConfigForFacet(field: string): FacetSort {
    // @ts-expect-error fix later
    return this.#config.schema[field].facet?.sort || ["frequency", "desc"];
  }

  #sortForFacet(field: string, selected?: SupportedFieldTypes[]) {
    const config = this.#sortConfigForFacet(field);
    const defaultSort = sort({
      field: config[0] === "frequency" ? 1 : 0,
      order: config[1],
      type:
        config[0] === "frequency" ? "number" : this.#config.schema[field].type,
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
    const searchableFields = Object.entries(this.#config.schema)
      .filter(([, value]) => value.text)
      .map(([key]) => key);

    const textIndexClass = this.#config.textIndex;
    if (textIndexClass) {
      this.#textIndex = new textIndexClass({ fields: searchableFields });
    }

    this.#indexes = {};
    Object.entries(this.#config.schema).forEach(([field, fieldConfig]) => {
      if (!fieldConfig.facet) return;
      // @ts-expect-error fix later
      this.#indexes[field] = new (fieldConfig.facet?.indexer || IMapIndex)();
    });

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
