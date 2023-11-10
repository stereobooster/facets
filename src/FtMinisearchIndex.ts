import MiniSearch, { SearchOptions } from "minisearch";
import { FulltextAllIndex } from "./FulltextIndex";

export class FtMinisearchIndex implements FulltextAllIndex {
  static requiresId = true;
  static usesAddAll = true;
  static usesPagination = false;

  index: MiniSearch<any>;

  constructor(fields: string[]) {
    const index = new MiniSearch({
      fields,
      storeFields: [],
    });
  }

  addAll(items: any[]) {
    this.index.addAll(items);
  }

  search(query, options?: SearchOptions) {
    return this.index.search(query, options).map((x) => x.id);
  }
}
