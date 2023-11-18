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

  constructor(opt: TextIndexBaseOptions) {}

  search(query: string, options?: TextSearchOptions): TextIndexBaseResults {
    throw new Error("not impelemted");
  }
  addAll(values: any[]): void {
    throw new Error("not impelemted");
  }
  addOne(id: number, value: any): void {
    throw new Error("not impelemted");
  }
  highlight(matches: Map<number, any>): (value: any) => Record<string, string> {
    throw new Error("not impelemted");
  }
}

export type TextIndex = typeof TextIndexBase;
