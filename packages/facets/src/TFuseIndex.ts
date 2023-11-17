import Fuse, { IFuseOptions, FuseSearchOptions } from "fuse.js";
import { TextIndexBase, TextIndexBaseOptions, TextSearchOptions } from "./TextIndex";

export class TFuseIndex extends TextIndexBase {
  static usesAddAll = true;
  static requiresId = false;
  static usesPagination = false;

  #options: IFuseOptions<string>;
  #index: Fuse<any>;

  constructor({ fields }: TextIndexBaseOptions) {
    super({ fields });
    this.#options = {
      includeScore: true,
      keys: fields,
    };
  }

  addAll(items: any[]) {
    this.#index = new Fuse(items, this.#options);
  }

  search(query, options?: FuseSearchOptions & TextSearchOptions) {
    return this.#index.search(query, options).map((x) => x.refIndex);
  }
}
