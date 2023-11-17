import { Hit, SearchResponse } from "@algolia/client-search";
import { SearchResults, Schema, Item } from "@stereobooster/facets";

export function adaptResponse<S extends Schema, I extends Item<S>>(
  response: SearchResults<S, I>,
  query: string,
  processingTimeMS: number
): SearchResponse<I> {
  const totalNumberOfPages = Math.ceil(
    response.pagination.total / response.pagination.perPage
  );

  return {
    hits: response.items.map(adaptHit),
    page: response.pagination.page,
    nbPages: totalNumberOfPages,
    hitsPerPage: response.pagination.perPage,
    nbHits: response.pagination.total,
    processingTimeMS: processingTimeMS,
    exhaustiveNbHits: true,
    query: query,
    params: "",
    facets: adaptFacets(response.facets),
    facets_stats: adaptFacetsStats(response.facets),
  };
}

export function adaptHit<I>(item: I): Hit<I> {
  return {
    // @ts-expect-error
    objectID: item.id,
    ...item,
    // _highlightResult: {}, // Highlighting not supported
  };
}

export function adaptFacets(
  itemsJsFacets
): Record<string, Record<string, number>> {
  const facetNames = Object.keys(itemsJsFacets);

  const instantsearchFacets = {};
  facetNames.forEach((name) => {
    instantsearchFacets[name] = {};

    itemsJsFacets[name].buckets.forEach(({ key, doc_count }) => {
      instantsearchFacets[name][key] = doc_count;
    });
  });

  return instantsearchFacets;
}

export function adaptFacetsStats(
  itemsJsFacetsStats: object
): Record<string, { min: number; max: number; avg: number; sum: number }> {
  const facetNames = Object.keys(itemsJsFacetsStats);
  const instantsearchFacetsStats = {};

  facetNames.forEach((name) => {
    if (itemsJsFacetsStats[name].facet_stats) {
      instantsearchFacetsStats[name] = itemsJsFacetsStats[name].facet_stats;
    }
  });

  return instantsearchFacetsStats;
}