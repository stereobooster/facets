import flexsearch, { SearchOptions } from "flexsearch";
// @ts-ignore
const { Document } = flexsearch;

import { TextIndexBase, TextIndexBaseOptions } from "./TextIndex";

export class TFlexsearchIndex extends TextIndexBase {
  static usesAddOne = true;
  static requiresId = false;
  static usesPagination = true;

  #index: typeof Document;

  constructor({ fields }: TextIndexBaseOptions) {
    super({ fields });
    this.#index = new Document({ index: fields, store: false });
  }

  addOne(id: number, item: any) {
    this.#index.add(id, item);
  }

  search(
    query,
    options: SearchOptions & { page?: number; perPage?: number } = {}
  ) {
    let { page, perPage, ...rest } = options;
    page = page || 0;
    perPage = perPage || 20;
    const results = this.#index.search(query, {
      ...rest,
      offset: 0,
      limit: perPage * (page + 1),
    });
    if (results.length === 1) return results[0].result;

    const resultsByRelevance = new Map();
    results.forEach(({ result }) => {
      const factor = 1;
      result.forEach((id, i) => {
        resultsByRelevance.set(
          id,
          (resultsByRelevance.get(id) || 0) + (i + 1) * factor
        );
      });
    });

    return [...resultsByRelevance.entries()]
      .sort((a, b) => a[1] - b[1])
      .slice(page * perPage, (page + 1) * perPage)
      .map((a) => a[0]);
  }
}
