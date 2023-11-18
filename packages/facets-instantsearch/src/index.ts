import {
  MultipleQueriesResponse,
  MultipleQueriesQuery,
  SearchOptions,
  SearchForFacetValuesQueryParams,
  SearchForFacetValuesResponse,
} from "@algolia/client-search";
import { FacetHit, SearchClient } from "instantsearch.js";

import {
  Facets,
  Schema,
  Item,
  FacetsConfig,
  FacetResults,
} from "@stereobooster/facets";
import { adaptResponse } from "./adaptResponse";
import { adaptRequest } from "./adaptRequest";

export function getSearchClient<S extends Schema, I extends Item<S>>(
  index: Facets<S, I>,
  schema: S
): SearchClient {
  return {
    search: <TObject>(
      queries: readonly MultipleQueriesQuery[]
    ): Readonly<Promise<MultipleQueriesResponse<TObject>>> =>
      performSearch(queries, index, schema),
    searchForFacetValues: (
      queries: ReadonlyArray<{
        readonly indexName: string;
        readonly params: SearchForFacetValuesQueryParams & SearchOptions;
      }>
    ): Readonly<Promise<readonly SearchForFacetValuesResponse[]>> => {
      // This is quite primitive implementation. Better would be to use TrieMap
      return Promise.resolve(
        queries.map((querie) => ({
          exhaustiveFacetsCount: true,
          facetHits: index
            .facet(
              querie.params.facetName,
              adaptRequest({ ...(querie.params as any), perPage: -1 }, schema)
            )
            .items.filter(
              ([x]) =>
                x &&
                (x as string).toLowerCase().startsWith(querie.params.facetQuery)
            )
            .map(([value, count]) => ({
              value,
              highlighted: value,
              count,
            } as FacetHit)),
        }))
      );
    },
  };
}

export function createIndex<S extends Schema, I extends Item<S>>(
  config: FacetsConfig<S>,
  data: I[]
) {
  return new Facets(config, data);
}

export function performSearch<S extends Schema, I extends Item<S>, TObject>(
  requests: readonly MultipleQueriesQuery[],
  index: Facets<S, I>,
  schema: S
): Readonly<Promise<MultipleQueriesResponse<TObject>>> {
  let processingTimeMS = 0;
  const responses = requests.map((request) => {
    const adaptedRequest = adaptRequest(request, schema);
    const result = index.search(adaptedRequest);

    // processingTimeMS = processingTimeMS + itemsJsRes.timings.total;

    // Are there any aggregations?
    if (result.facets) {
      // Only copy the requested aggregations
      const filteredAggregations: FacetResults<S> = {} as any;
      Object.keys(result.facets).forEach((aggregationName) => {
        if (request.params?.facets?.includes(aggregationName)) {
          // @ts-expect-error
          filteredAggregations[aggregationName] =
            result.facets[aggregationName];
        }
      });

      result.facets = filteredAggregations;
    }

    return adaptResponse(result, request.params?.query || "", processingTimeMS);
  });

  return Promise.resolve({ results: responses }) as any;
}
