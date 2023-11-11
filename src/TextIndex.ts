export type TextOptions = {};

export class TextIndexBase {
  static usesAddOne = false;
  static usesAddAll = false;
  static requiresId = false;

  search(query: string, options?: TextOptions): Array<number> {
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
