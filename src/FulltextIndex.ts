export type FulltextOptions = {};

export interface FulltextIndex {
  search(query: string, options?: FulltextOptions): Array<number>;
}

export interface FulltextAllIndex extends FulltextIndex {
  addAll(values: any[]): void;
}

export interface FulltextOneIndex extends FulltextIndex {
  add(id: number, value: any): void;
}
