export type TextSearchOptions = {};
export type TextIndexBaseOptions = {
  fields: string[];
};

export class TextIndexBase {
  static usesAddOne = false;
  static usesAddAll = false;
  static requiresId = false;

  constructor(opt: TextIndexBaseOptions) {}

  search(query: string, options?: TextSearchOptions): Array<number> {
    throw new Error("not impelemted");
  }
  addAll(values: any[]): void {
    throw new Error("not impelemted");
  }
  addOne(id: number, value: any): void {
    throw new Error("not impelemted");
  }
}

export type TextIndex = typeof TextIndexBase;
