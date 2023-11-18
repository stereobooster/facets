import Fuse, {
  IFuseOptions,
  FuseSearchOptions,
  FuseResultMatch,
} from "fuse.js";
import {
  TextIndexBase,
  TextIndexBaseOptions,
  TextSearchOptions,
} from "./TextIndex";

export class TFuseIndex extends TextIndexBase {
  static usesAddAll = true;
  static requiresId = false;
  static usesPagination = false;
  static canHighlight = false;

  #options: IFuseOptions<string>;
  #index: Fuse<any>;

  constructor({ fields, idKey }: TextIndexBaseOptions) {
    super({ fields, idKey });
    this.#options = {
      keys: fields,
      includeMatches: true,
    };
  }

  addAll(items: any[]) {
    this.#index = new Fuse(items, this.#options);
  }

  search(query, options?: FuseSearchOptions & TextSearchOptions) {
    const matches = new Map<number, ReadonlyArray<FuseResultMatch>>();
    return {
      ids: this.#index.search(query, options).map((x) => {
        matches.set(x.refIndex, x.matches!);
        return x.refIndex;
      }),
      matches,
    };
  }

  // highlight(matches: Map<number, ReadonlyArray<FuseResultMatch>>) {
  //   const match = matches.get(id)!;
  //   throw new Error("not impelemted");
  // }
}
