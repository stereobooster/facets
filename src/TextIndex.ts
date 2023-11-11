export type TextOptions = {};

export abstract class TextIndexBase {
  static usesAddOne = false;
  static usesAddAll = false;
  abstract search(query: string, options?: TextOptions): Array<number>;
}

export abstract class TextIndexAll extends TextIndexBase {
  static usesAddAll = true;
  abstract addAll(values: any[]): void;
}

export abstract class TextIndexOne extends TextIndexBase {
  static usesAddOne = true;
  abstract addOne(id: number, value: any): void;
}

export type TextIndex = typeof TextIndexAll | typeof TextIndexOne;
