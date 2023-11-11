import { QuickScore } from "quick-score";

import { TextIndexBase } from "./TextIndex";

export class TQuickscore extends TextIndexBase {
  static usesAddAll = true;
  static requiresId = true;
  static usesPagination = false;

  fields: Array<string>;
  index: QuickScore<any>;

  constructor(fields: string[]) {
    super();
    this.fields = fields;
  }

  addAll(items: any[]) {
    this.index = new QuickScore(items, this.fields);
  }

  search(query) {
    return this.index.search(query).map((x) => x.item.id);
  }
}
