import { QuickScore } from "quick-score";

import { FulltextAllIndex } from "./FulltextIndex";

export class FtFuseIndex implements FulltextAllIndex {
  static requiresId = true;
  static usesAddAll = true;
  static usesPagination = false;

  fields: Array<string>;
  index: QuickScore<any>;

  constructor(fields: string[]) {
    this.fields = fields;
  }

  addAll(items: any[]) {
    this.index = new QuickScore(items, this.fields);
  }

  search(query) {
    return this.index.search(query).map((x) => x.item.id);
  }
}
