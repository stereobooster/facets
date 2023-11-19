import { QuickScore, RangeTuple, ScoredObject } from "quick-score";

import { TextIndexBase, TextIndexBaseOptions } from "./TextIndex";

export class TQuickscoreIndex extends TextIndexBase {
  static usesAddAll = true;
  static requiresId = true;
  static usesPagination = false;
  static canHighlight = true;

  #fields: Array<string>;
  // @ts-expect-error it is assigned later
  #index: QuickScore<any>;
  #idKey: string;

  constructor({ fields, idKey }: TextIndexBaseOptions) {
    super({ fields, idKey });
    this.#fields = fields;
    this.#idKey = idKey;
  }

  addAll(items: any[]) {
    this.#index = new QuickScore(items, this.#fields);
  }

  search(query: string) {
    const matches = new Map<number, Record<string, RangeTuple[]>>();
    return {
      ids: (this.#index.search(query) as ScoredObject<any>[]).map((x) => {
        matches.set(x.item[this.#idKey], x.matches);
        return x.item[this.#idKey];
      }),
      matches,
    };
  }

  highlight(matches: Map<number, Record<string, RangeTuple[]>>) {
    return (value: any) => {
      const id = value[this.#idKey];
      const match = matches.get(id)!;
      return Object.keys(match).reduce((res, key) => {
        // TODO: this should be configurable
        const srtStart = "__ais-highlight__";
        const srtEnd = "__/ais-highlight__";

        const str = value[key] as string;
        const parts: string[] = [];
        let start = 0;
        match[key].forEach((range) => {
          if (range[0] > start) parts.push(str.slice(start, range[0]));
          parts.push(srtStart);
          parts.push(str.slice(range[0], range[1]));
          parts.push(srtEnd);
          start = range[1];
        });
        if (start < str.length - 1)
          parts.push(str.slice(start, str.length - 1));

        // TODO: for now using InstantSearch/Algolia convention
        res[key] = {
          value: parts.join(""),
          // matchLevel: "full",
          // fullyHighlighted: false,
          // matchedWords: [],
        };
        return res;
      }, Object.create(null));
    };
  }
}
