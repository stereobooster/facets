import {
  MultipleQueriesResponse,
  MultipleQueriesQuery,
} from "@algolia/client-search";

import { Facets, Schema, Item, FacetsConfig, FacetResults } from "@stereobooster/facets";
import { adaptResponse } from "./adaptResponse";
import { adaptRequest } from "./adaptRequest";

export function getSearchClient<S extends Schema, I extends Item<S>>(
  newIndex: Facets<S, I>
) {
  return {
    search: (queries: MultipleQueriesQuery[]) =>
      performSearch(queries, newIndex),
    searchForFacetValues: () => {
      throw new Error("Not implemented");
    },
  };
}

export function createIndex<S extends Schema, I extends Item<S>>(
  config: FacetsConfig<S>,
  data: I[]
) {
  return new Facets(config, data);
}

export function performSearch<S extends Schema, I extends Item<S>>(
  requests: MultipleQueriesQuery[],
  index: Facets<S, I>
): Readonly<Promise<MultipleQueriesResponse<object>>> {
  let processingTimeMS = 0;
  const responses = requests.map((request) => {
    const adaptedRequest = adaptRequest(request);
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

    return adaptResponse(
      result,
      request.params?.query || "",
      processingTimeMS
    );
  });

  return Promise.resolve({ results: responses });
}
