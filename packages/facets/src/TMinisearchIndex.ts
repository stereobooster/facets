import MiniSearch, { MatchInfo, SearchOptions } from "minisearch";
import {
  TextIndexBase,
  TextIndexBaseOptions,
  TextSearchOptions,
} from "./TextIndex";

export class TMinisearchIndex extends TextIndexBase {
  static usesAddAll = true;
  static requiresId = true;
  static usesPagination = false;
  static canHighlight = false;

  #index: MiniSearch<any>;
  #idKey: string;

  constructor({ fields, idKey }: TextIndexBaseOptions) {
    super({ fields, idKey });
    this.#index = new MiniSearch({
      fields,
      storeFields: [],
    });
    this.#idKey = idKey;
  }

  addAll(items: any[]) {
    this.#index.addAll(items);
  }

  search(query, options?: SearchOptions & TextSearchOptions) {
    const matches = new Map<number, MatchInfo>();
    console.log()
    return {
      ids: this.#index.search(query, options).map((x) => {
        matches.set(x[this.#idKey], x.match);
        return x[this.#idKey];
      }),
      matches,
    };
  }

  // highlight(matches: Map<number, MatchInfo>) {
  //   throw new Error("not impelemted");
  // }
}
