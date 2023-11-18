import { MultipleQueriesQuery } from "@algolia/client-search";
import { Schema, SearchOptions } from "@stereobooster/facets";

export function adaptRequest<S extends Schema>(
  request: MultipleQueriesQuery
): SearchOptions<S> {
  const response = {
    query: request.params?.query,
    page: request.params?.page,
    perPage: request.params?.hitsPerPage,
    sort: adaptSort(request.indexName),
    facetFilter: adaptFacetFilters(request.params?.facetFilters) as any,
  };

  // request.params.numericFilters = ["price>=1741"]
  // request.params.attributesToSnippet = ["description:10"]

  // Facet request:
  // facets: "price"
  // hitsPerPage: 0
  // ​maxValuesPerFacet: 10

  // const numericFilters = request.params?.numericFilters;
  // if (numericFilters && numericFilters.length > 0) {
  //   const filters = adaptNumericFilters(numericFilters);
  //   response.filter = (item) => filters.every((filter) => filter(item));
  // }

  return response;
}

export function adaptSort(indexName: string) {
  const parts = indexName.split("_");
  if (parts.length < 3) return;
  const field = parts[parts.length - 2];
  const order = parts[parts.length - 1];
  if (order !== "asc" && order !== "desc") return;
  return [field, order] as [string, "asc" | "desc"];
}

export function adaptFacetFilters(
  facetFilters:
    | string
    | readonly string[]
    | readonly (string | readonly string[])[]
    | undefined
) {
  if (!facetFilters) return;
  const filter: Record<string, string[]> = Object.create(null);

  if (typeof facetFilters === "string") {
    filterRegex(facetFilters, filter);
    return filter;
  }

  facetFilters.forEach((facets) => {
    if (Array.isArray(facets)) {
      facets.forEach((facet) => filterRegex(facet, filter));
    } else {
      filterRegex(facets as string, filter);
    }
  });

  return filter;
}

export function filterRegex(facet: string, filter: Record<string, string[]>) {
  const facetRegex = new RegExp(/(.+)(:)(.+)/);
  const [, name, , value] = facet.match(facetRegex) || [];
  if (filter[name]) {
    filter[name].push(value);
  } else {
    filter[name] = [value];
  }
}

export function parseRange(range) {
  /*
   * Group 1: Find chars, one or more, except values: "<, =, !, >".
   * Group 2: Find operator
   * Group 3: Find digits, one or more.
   */
  return range.match(new RegExp(/([^<=!>]+)(<|<=|=|!=|>|>=)(\d+)/));
}

export function adaptNumericFilters(ranges) {
  const filters = [] as Array<(x: any) => boolean>;

  ranges.map((range) => {
    // ['price<=10', 'price', '<=', '10']
    const [, field, operator, value] = parseRange(range);

    switch (operator) {
      case "<":
        filters.push((item) => item[field] < value);
        break;
      case "<=":
        filters.push((item) => item[field] <= value);
        break;
      case "=":
        filters.push((item) => item[field] == value); // Needs to be comparison operator "=="
        break;
      case "!=":
        filters.push((item) => item[field] != value);
        break;
      case ">":
        filters.push((item) => item[field] > value);
        break;
      case ">=":
        filters.push((item) => item[field] >= value);
        break;
    }
  });

  return filters;
}
