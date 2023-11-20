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
            index.config().idKey
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
              {
                field: querie.params.facetName,
                query: querie.params.facetQuery,
                perPage:
                  querie.params.maxFacetHits || querie.params.maxValuesPerFacet,
              },
              adaptRequest(querie.params as any, index.config().schema)
            )
            .items.map(
              ([value, count]) =>
                ({
                  value,
                  count,
                  highlighted: value,
                } as FacetHit)
            ),
        }))
      );
    },
  };
}
