import { Adapter } from "@/search";
import { Item, Schema, SearchResults } from "@stereobooster/facets";
import { useEffect, useState } from "react";

// small wrapper around adapter
export function useSearch<S extends Schema, I extends Item<S>>(
  adapter: Adapter<S, I>
) {
  const [result, setResult] = useState<SearchResults<S, I>>({
    items: [],
    facets: {} as any,
    pagination: {
      perPage: 0,
      page: 0,
      total: 0,
    },
  });

  useEffect(() => adapter.on("load", setResult), [adapter]);

  return result;
}
