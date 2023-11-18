import { MultipleQueriesQuery } from "@algolia/client-search";
import { Schema, SearchOptions } from "@stereobooster/facets";

export function adaptRequest<S extends Schema>(
  request: MultipleQueriesQuery
): SearchOptions<S> {
  // request.params.attributesToSnippet = ["description:10"]

  // Facet request:
  // facets: "price"
  // hitsPerPage: 0
  // ​maxValuesPerFacet: 10

  return {
    query: request.params?.query,
    page: request.params?.page,
    perPage: request.params?.hitsPerPage,
    sort: adaptSort(request.indexName),
    facetFilter: {
      ...adaptFacetFilters(request.params?.facetFilters as any),
      ...adaptNumericFilters(request.params?.numericFilters as any),
    } as any,
  };
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
  facetFilters: string | string[] | string[][] | undefined
) {
  const filter: Record<string, string[]> = Object.create(null);

  if (!facetFilters) return filter;
  if (typeof facetFilters === "string") {
    adaptFacetFilter(facetFilters, filter);
    return filter;
  }

  facetFilters.forEach((facets) => {
    if (Array.isArray(facets)) {
      facets.forEach((facet) => adaptFacetFilter(facet, filter));
    } else {
      adaptFacetFilter(facets, filter);
    }
  });

  return filter;
}

export function adaptFacetFilter(
  facet: string,
  filter: Record<string, string[]>
) {
  const facetRegex = new RegExp(/(.+)(:)(.+)/);
  const [, name, , value] = facet.match(facetRegex) || [];
  if (filter[name]) {
    filter[name].push(value);
  } else {
    filter[name] = [value];
  }
}

export function adaptNumericFilters(
  numericFilters: string | string[] | string[][] | undefined
) {
  const filter: Record<string, { from?: number; to?: number }> =
    Object.create(null);

  if (!numericFilters) return filter;
  if (typeof numericFilters === "string") {
    adaptNumericFilter(numericFilters, filter);
    return filter;
  }

  numericFilters.forEach((facets) => {
    if (Array.isArray(facets)) {
      facets.forEach((facet) => adaptNumericFilter(facet, filter));
    } else {
      adaptNumericFilter(facets, filter);
    }
  });

  return filter;
}

export function adaptNumericFilter(
  facet: string,
  filter: Record<string, { from?: number; to?: number }>
) {
  const numericRegex = new RegExp(/([^<=!>]+)(<|<=|=|!=|>|>=)(\d+)/);
  const [, field, operator, value] = facet.match(numericRegex) || [];

  if (!filter[field]) filter[field] = Object.create(null);

  switch (operator) {
    case "<":
    case "<=":
      filter[field].to = parseFloat(value);
      break;
    case ">":
    case ">=":
      filter[field].from = parseFloat(value);
      break;
    case "=":
    case "!=":
      throw new Error("Not implemented!");
  }
}
