export type TextOptions = {};

export interface TextIndex {
  search(query: string, options?: TextOptions): Array<number>;
}

export interface TextAllIndex extends TextIndex {
  addAll(values: any[]): void;
}

export interface TextOneIndex extends TextIndex {
  addOne(id: number, value: any): void;
}
