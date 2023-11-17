import { QuickScore } from "quick-score";

import { TextIndexBase, TextIndexBaseOptions } from "./TextIndex";

export class TQuickscoreIndex extends TextIndexBase {
  static usesAddAll = true;
  static requiresId = true;
  static usesPagination = false;

  #fields: Array<string>;
  #index: QuickScore<any>;

  constructor({ fields }: TextIndexBaseOptions) {
    super({ fields });
    this.#fields = fields;
  }

  addAll(items: any[]) {
    this.#index = new QuickScore(items, this.#fields);
  }

  search(query) {
    return this.#index.search(query).map((x) => x.item.id);
  }
}
