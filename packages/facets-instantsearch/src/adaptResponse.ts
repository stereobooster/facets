import { Hit, SearchResponse } from "@algolia/client-search";
import { SearchResults, Schema, Item } from "@stereobooster/facets";

export function adaptResponse<S extends Schema, I extends Item<S>>(
  response: SearchResults<S, I>,
  query: string,
  idKey: string | undefined
): SearchResponse<I> {
  return {
    hits:
      idKey === "objectID"
        ? (response.items as any)
        : response.items.map(adaptHit<I>(idKey || "id")),
    page: response.pagination.page,
    hitsPerPage: response.pagination.perPage,
    nbHits: response.pagination.total,
    nbPages: Math.ceil(response.pagination.total / response.pagination.perPage),
    facets: adaptFacets(response.facets),
    facets_stats: adaptFacetsStats(response.facets),
    processingTimeMS: 0,
    query,
    exhaustiveNbHits: true,
    params: "",
  };
}

export function adaptHit<I>(key: string) {
  return (item: any): Hit<I> => ({
    objectID: item[key],
    ...item,
  });
}

export function adaptFacets(facets: any): Record<string, Record<string, number>> {
  const instantsearchFacets = Object.create(null);
  Object.keys(facets).forEach((field) => {
    instantsearchFacets[field] = Object.create(null);
    facets[field].items.forEach(([value, frequency]: [string, number]) => {
      instantsearchFacets[field][value] = frequency;
    });
  });

  return instantsearchFacets;
}

export function adaptFacetsStats(
  facets: any
): Record<string, { min: number; max: number; avg: number; sum: number }> {
  const instantsearchFacetsStats = Object.create(null);
  Object.keys(facets).forEach((field) => {
    if (facets[field].stats) {
      instantsearchFacetsStats[field] = facets[field].stats;
    }
  });

  return instantsearchFacetsStats;
}
