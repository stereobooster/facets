import flexsearch, { SearchOptions } from "flexsearch";
// @ts-ignore
const { Document } = flexsearch;

import { TextIndexBase } from "./TextIndex";

export class TFlexsearchIndex extends TextIndexBase {
  static usesAddOne = true;
  static requiresId = false;
  static usesPagination = true;

  index: typeof Document;

  constructor(fields: string[]) {
    super();
    this.index = new Document({ index: fields, store: false });
  }

  addOne(id: number, item: any) {
    this.index.add(id, item);
  }

  search(query, options: SearchOptions & { offset?: number } = {}) {
    let { offset, limit, ...rest } = options;
    offset = offset || 0;
    limit = limit || 20;
    const results = this.index.search(query, {
      ...rest,
      offset: 0,
      limit: offset + limit,
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
      .slice(offset, offset + limit)
      .map((a) => a[0]);
  }
}
