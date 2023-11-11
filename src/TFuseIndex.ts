import Fuse, { IFuseOptions, FuseSearchOptions } from "fuse.js";
import { TextIndexAll } from "./TextIndex";

export class TFuseIndex extends TextIndexAll {
  static requiresId = false;
  static usesPagination = false;

  options: IFuseOptions<string>;
  index: Fuse<any>;

  constructor(fields: string[]) {
    super();
    this.options = {
      includeScore: true,
      keys: fields,
    };
  }

  addAll(items: any[]) {
    this.index = new Fuse(items, this.options);
  }

  search(query, options?: FuseSearchOptions) {
    return this.index.search(query, options).map((x) => x.refIndex);
  }
}
