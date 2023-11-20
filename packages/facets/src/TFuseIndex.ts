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
  static requiresId = true;
  static usesPagination = false;
  static canHighlight = true;

  #options: IFuseOptions<string>;
  // @ts-expect-error it is assigned later
  #index: Fuse<any>;
  #idKey: string;

  constructor({ fields, idKey }: TextIndexBaseOptions) {
    super({ fields, idKey });
    this.#options = {
      keys: fields,
      includeMatches: true,
    };
    this.#idKey = idKey;
  }

  addAll(items: any[]) {
    this.#index = new Fuse(items, this.#options);
  }

  search(query: string, options?: FuseSearchOptions & TextSearchOptions) {
    const matches = new Map<number, ReadonlyArray<FuseResultMatch>>();
    return {
      ids: this.#index.search(query, options).map((x) => {
        matches.set(x.refIndex, x.matches!);
        return x.refIndex;
      }),
      matches,
    };
  }

  highlight(
    matches: Map<number, ReadonlyArray<FuseResultMatch>>,
    srtStart: string,
    srtEnd: string,
    subKey?: string
  ) {
    return (item: any) => {
      const id = item[this.#idKey];
      const match = matches.get(id)!;
      return match.reduce((res, matchItem) => {
        const str = item[matchItem.key!] as string;
        const parts: string[] = [];
        let start = 0;
        matchItem.indices.forEach((range) => {
          if (range[0] > start) parts.push(str.slice(start, range[0]));
          parts.push(srtStart);
          parts.push(str.slice(range[0], range[1]));
          parts.push(srtEnd);
          start = range[1];
        });
        if (start < str.length - 1)
          parts.push(str.slice(start, str.length - 1));

        res[matchItem.key!] = subKey
          ? {
              [subKey]: parts.join(""),
            }
          : parts.join("");
        return res;
      }, Object.create(null) as Record<string, any>);
    };
  }
}
