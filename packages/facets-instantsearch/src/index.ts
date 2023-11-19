import {
  MultipleQueriesResponse,
  MultipleQueriesQuery,
  SearchOptions,
  SearchForFacetValuesQueryParams,
  SearchForFacetValuesResponse,
} from "@algolia/client-search";
import { FacetHit, SearchClient } from "instantsearch.js";

import { Facets, Schema, Item } from "@stereobooster/facets";
import { adaptResponse } from "./adaptResponse";
import { adaptRequest } from "./adaptRequest";

export function getSearchClient<S extends Schema, I extends Item<S>>(
  index: Facets<S, I>
): SearchClient {
  return {
    search: <TObject>(
      requests: readonly MultipleQueriesQuery[]
    ): Readonly<Promise<MultipleQueriesResponse<TObject>>> =>
      Promise.resolve({
        results: requests.map((request) =>
          adaptResponse(
            index.search(adaptRequest(request, index.config().schema)),
            request.params?.query || "",
            index.config().idKey,
          )
        ),
      }) as any,

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
              adaptRequest(
                { ...(querie.params as any), perPage: -1 },
                index.config().schema
              )
            )
            .items.filter(
              ([x]) =>
                x &&
                (x as string).toLowerCase().startsWith(querie.params.facetQuery)
            )
            .map(
              ([value, count]) =>
                ({
                  value,
                  highlighted: value,
                  count,
                } as FacetHit)
            ),
        }))
      );
    },
  };
}
