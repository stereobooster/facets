import Fuse, { IFuseOptions, FuseSearchOptions } from "fuse.js";
import { FulltextAllIndex } from "./FulltextIndex";

export class FtFuseIndex implements FulltextAllIndex {
  static requiresId = false;
  static usesAddAll = true;
  static usesPagination = false;

  options: IFuseOptions<string>;
  index: Fuse<any>;

  constructor(fields: string[]) {
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
