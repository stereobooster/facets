export type TextSearchOptions = {
  page?: number;
  perPage?: number;
};
export type TextIndexBaseOptions = {
  fields: string[];
  idKey: string;
};
export type TextIndexBaseResults = {
  ids: number[];
  matches: Map<number, any>;
};

export class TextIndexBase {
  static usesAddOne = false;
  static usesAddAll = false;
  static requiresId = false;
  static canHighlight = false;

  constructor(_opt: TextIndexBaseOptions) {}

  search(_query: string, _options?: TextSearchOptions): TextIndexBaseResults {
    throw new Error("not impelemted");
  }
  addAll(_values: any[]): void {
    throw new Error("not impelemted");
  }
  addOne(_id: number, _value: any): void {
    throw new Error("not impelemted");
  }
  highlight(_matches: Map<number, any>): (value: any) => Record<string, string> {
    throw new Error("not impelemted");
  }
}

export type TextIndex = typeof TextIndexBase;
