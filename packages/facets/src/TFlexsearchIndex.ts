import { SearchOptions } from "flexsearch";
// @ts-expect-error
import Document from "flexsearch/dist/module/document";

import {
  TextIndexBase,
  TextIndexBaseOptions,
  TextSearchOptions,
} from "./TextIndex";

export class TFlexsearchIndex extends TextIndexBase {
  static usesAddOne = true;
  static requiresId = false;
  static usesPagination = true;
  static canHighlight = false;

  #index: typeof Document;

  constructor({ fields, idKey }: TextIndexBaseOptions) {
    super({ fields, idKey });
    this.#index = new Document({ index: fields, store: false });
  }

  addOne(id: number, item: any) {
    this.#index.add(id, item);
  }

  search(query: string, options?: SearchOptions & TextSearchOptions) {
    let { page, perPage, ...rest } = options || {};
    page = page || 0;
    perPage = perPage || 20;
    const results = this.#index.search(query, {
      ...rest,
      offset: 0,
      limit: perPage * (page + 1),
    }) as Array<{ result: number[] }>;
    if (results.length === 1)
      return {
        ids: results[0].result,
        matches: new Map<number, any>(),
      };

    const resultsByRelevance = new Map<number, number>();
    results.forEach(({ result }) => {
      const factor = 1;
      result.forEach((id, i) => {
        resultsByRelevance.set(
          id,
          (resultsByRelevance.get(id) || 0) + (i + 1) * factor
        );
      });
    });

    return {
      ids: [...resultsByRelevance.entries()]
        .sort((a, b) => a[1] - b[1])
        .slice(page * perPage, (page + 1) * perPage)
        .map((a) => a[0]),
      matches: new Map<number, any>(),
    };
  }
}
