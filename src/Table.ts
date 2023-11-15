import { TextIndex } from "./TextIndex";
import { FacetValue, InvertedIndex } from "./InvertedIndex";
import { SparseTypedFastBitSet } from "typedfastbitset";
import {
  FacetFilter,
  SupportedColumnTypes,
  evalBool,
  facetFilterToBool,
} from "./boolean";
import { NullsOrder, SortDirection, sort } from "./sort";
import { IMapIndex } from "./IMapIndex";

type SortOptions = {
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

type Facet = {
  indexer?: typeof InvertedIndex;
  perPage?: number;
  /**
   * @default ["frequency", "desc"]
   */
  sort?: ["value" | "frequency", SortDirection];
  // TODO: selected first
  // TODO: option to filter out or left zeroes
};

type Column = SortOptions & {
  type: "string" | "number" | "boolean";
  isArray?: boolean;
  facet?: boolean | Facet;
  text?: boolean;
};

type Schema = Record<string, Column>;

type TableOptions = {
  schema: Schema;
  textIndex?: TextIndex;
  sortOptions?: SortOptions;
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
  items: Array<[SupportedColumnTypes, number]>;
  pagination: Pagination;
  stats?: FacetStats;
};

type Pagination = {
  perPage: number;
  page: number;
  total: number;
};

export type SearchResults<I = unknown> = {
  items: I[];
  pagination: Pagination;
  facets: Record<string, FacetResult>;
};

export class Table {
  #items: any[];
  #universe: SparseTypedFastBitSet;
  #indexes: Record<string, InvertedIndex<SupportedColumnTypes>>;
  #options: TableOptions;
  #textIndex: InstanceType<TextIndex>;
  #facetMemo: Record<
    string,
    Array<[SupportedColumnTypes, number, SparseTypedFastBitSet]>
  >;

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
      // TODO: handle pagination - if there are no filters and sorting and no facets
      sortArr = this.#textIndex.search(options?.query, {
        perPage: this.#items.length,
      });
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
      const [field, order] = options.sort;
      const sortOptions = {
        order,
        field,
        type: this.#options.schema[field].isArray
          ? undefined
          : this.#options.schema[field].type,
        locale:
          this.#options.sortOptions?.locale ||
          this.#options.schema[field].locale,
        nulls:
          this.#options.sortOptions?.nulls || this.#options.schema[field].nulls,
        options:
          this.#options.sortOptions?.options ||
          this.#options.schema[field].options,
      };
      result = result.sort(sort(sortOptions));
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
  // - facets should stay the same unless there are other facets or other filters
  // - if number of items in result is small it is cheaper to build facets from scratch
  // - sort facets. By default sorted by frequency
  #getFacets(resultSet?: SparseTypedFastBitSet, facetFilter?: FacetFilter) {
    const ff = this.#getFullFacets();
    return Object.keys(ff).reduce((res, facet) => {
      // @ts-expect-error fix later
      const perPage = this.#options.schema[facet].facet?.perPage || 20;
      let facetItems = ff[facet];
      if (
        facetFilter &&
        facetFilter[facet] &&
        !this.#options.schema[facet].isArray
      ) {
        const filter = facetFilter[facet];
        if (Array.isArray(filter)) {
          facetItems = facetItems.map(([x, y, z]) =>
            filter.includes(x) ? [x, y, z] : [x, 0, z]
          );
        } else {
          facetItems = facetItems.filter(([x, y, z]) =>
            x == filter ? [x, y, z] : [x, 0, z]
          );
        }
      }
      if (resultSet) {
        // TODO: we need to intersect only enough for the page
        facetItems = facetItems
          .map(([x, y, z]) => {
            if (y === 0) return [x, y, z] as FacetValue<SupportedColumnTypes>;
            const temp = z.new_intersection(resultSet);
            return [x, temp.size(), temp] as FacetValue<SupportedColumnTypes>;
          })
          .sort(this.#sortForFacet(facet));
      }
      let stats: FacetStats | undefined;
      if (this.#options.schema[facet].type === "number") {
        // if facet is sorted by value than `first` and `last` are `min` and `max`
        const values = [] as any[];
        facetItems.forEach(([x]) => {
          if (x != null) values.push(x);
        });
        stats = {
          min: Math.min(...values),
          max: Math.max(...values),
        };
      }
      res[facet] = {
        items: facetItems.slice(0, perPage).map(([x, y]) => [x, y]),
        pagination: {
          page: 0,
          perPage,
          // TODO: this will change depending on zeroes
          total: ff[facet].length,
        },
        stats,
      };
      return res;
    }, {} as Record<string, FacetResult>);
  }

  #getFullFacets() {
    if (!this.#facetMemo) {
      this.#facetMemo = Object.keys(this.#indexes).reduce((res, facet) => {
        res[facet] = this.#indexes[facet]
          .values()
          .sort(this.#sortForFacet(facet));
        return res;
      }, {} as Record<string, Array<FacetValue<SupportedColumnTypes>>>);
    }
    return this.#facetMemo;
  }

  #sortForFacet(facet: string) {
    // @ts-expect-error fix later
    const config = this.#options.schema[facet].facet?.sort || [
      "frequency",
      "desc",
    ];
    return sort({
      field: config[0] === "frequency" ? 1 : 0,
      order: config[1],
      type:
        config[0] === "frequency" ? "number" : this.#options.schema[facet].type,
    });
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
    Object.entries(this.#options.schema).forEach(([key, value]) => {
      if (!value.facet) return;
      // @ts-expect-error fix later
      this.#indexes[key] = new (value.facet?.indexer || IMapIndex)();
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
