import MiniSearch, { SearchOptions } from "minisearch";
import { TextIndexBase, TextIndexBaseOptions, TextSearchOptions } from "./TextIndex";

export class TMinisearchIndex extends TextIndexBase {
  static usesAddAll = true;
  static requiresId = true;
  static usesPagination = false;

  #index: MiniSearch<any>;

  constructor({ fields }: TextIndexBaseOptions) {
    super({ fields });
    this.#index = new MiniSearch({
      fields,
      storeFields: [],
    });
  }

  addAll(items: any[]) {
    this.#index.addAll(items);
  }

  search(query, options?: SearchOptions & TextSearchOptions) {
    return this.#index.search(query, options).map((x) => x.id);
  }
}
