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
    // indexName: request.indexName,
  };

  // request.indexName = "instant_search_price_desc"
  // request.params.maxValuesPerFacet = 10
  // request.params.attributesToSnippet = ["description:10"]
  // request.params.facetFilters = ["brand:Insignia™"]
  // request.params.numericFilters = ["price>=1741"]

  // Facet request:
  // facets: "price"
  // hitsPerPage: 0
  // ​maxValuesPerFacet: 10
  // ​page: 0

  // const facetFilters = request.params?.facetFilters;
  // const numericFilters = request.params?.numericFilters;
  // const sort = request.indexName; // IndexName will be assigned the SortBy value if selected.

  // if (numericFilters && numericFilters.length > 0) {
  //   const filters = adaptNumericFilters(numericFilters);
  //   response.filter = (item) => filters.every((filter) => filter(item));
  // }

  // if (facetFilters && facetFilters.length > 0) {
  //   response.filters = adaptFilters(facetFilters);
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

export function adaptFilters(instantsearchFacets) {
  let itemsJsFacets = {};
  if (Array.isArray(instantsearchFacets)) {
    instantsearchFacets.forEach((facets) => {
      if (Array.isArray(facets)) {
        facets.forEach((facet) => {
          itemsJsFacets = filterRegex(itemsJsFacets, facet);
        });
      } else {
        itemsJsFacets = filterRegex(itemsJsFacets, facets);
      }
    });
  } else {
    throw Error("request.params.facetFilters does not contain an array");
  }

  return itemsJsFacets;
}

export function filterRegex(itemsJsFacets, facet) {
  const facetRegex = new RegExp(/(.+)(:)(.+)/);
  const [, name, , value] = facet.match(facetRegex);
  if (itemsJsFacets[name]) {
    itemsJsFacets[name].push(value);
  } else {
    itemsJsFacets[name] = [value];
  }
  return itemsJsFacets;
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
