import MiniSearch, { MatchInfo, SearchOptions } from "minisearch";
import {
  TextIndexBase,
  TextIndexBaseOptions,
  TextSearchOptions,
} from "./TextIndex";

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function patternRegexp(string: string) {
  return new RegExp(escapeRegExp(string), "gi");
}

export class TMinisearchIndex extends TextIndexBase {
  static usesAddAll = true;
  static requiresId = true;
  static usesPagination = false;
  static canHighlight = true;

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

  search(query: string, options?: SearchOptions & TextSearchOptions) {
    const matches = new Map<number, MatchInfo>();
    return {
      ids: this.#index.search(query, options).map((x) => {
        matches.set(x[this.#idKey], x.match);
        return x[this.#idKey];
      }),
      matches,
    };
  }

  highlight(
    matches: Map<number, MatchInfo>,
    srtStart: string,
    srtEnd: string,
    subKey?: string
  ) {
    return (value: any) => {
      const id = value[this.#idKey];
      const match = matches.get(id)!;
      return Object.keys(match).reduce((res, matchedWord) => {
        const matchedRegexp = patternRegexp(matchedWord);
        match[matchedWord].forEach((field) => {
          if (subKey) {
            res[field] = {
              [subKey]: (
                (res[field] && res[field][subKey]) ||
                value[field]
              ).replace(matchedRegexp, `${srtStart}$&${srtEnd}`),
            };
          } else {
            res[field] = (res[field] || value[field]).replace(
              matchedRegexp,
              `${srtStart}$&${srtEnd}`
            );
          }
        });
        return res;
      }, Object.create(null) as Record<string, any>);
    };
  }
}
