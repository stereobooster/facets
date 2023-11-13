import { SparseTypedFastBitSet } from "typedfastbitset";
import { InvertedIndex } from "./InvertedIndex";

export const union = (...args: SparseTypedFastBitSet[]) => {
  if (args.length === 0) new SparseTypedFastBitSet();
  if (args.length === 1) args[0];
  const [a, b, ...rest] = args;
  const result = a.new_union(b);
  rest.forEach((x) => result.union(x));
  return result;
};

export const intersection = (...args: SparseTypedFastBitSet[]) => {
  if (args.length === 0) new SparseTypedFastBitSet();
  if (args.length === 1) args[0];
  const [a, b, ...rest] = args;
  const result = a.new_intersection(b);
  rest.forEach((x) => result.intersection(x));
  return result as SparseTypedFastBitSet;
};

export const difference = (...args: SparseTypedFastBitSet[]) => {
  if (args.length === 0) new SparseTypedFastBitSet();
  if (args.length === 1) args[0];
  const [a, b, ...rest] = args;
  const result = a.new_difference(b);
  rest.forEach((x) => result.difference(x));
  return result as SparseTypedFastBitSet;
};

type SupportedColumnTypes = string | number | boolean;

export type FacetFilter = Record<
  string,
  SupportedColumnTypes | SupportedColumnTypes[]
>;

export type BoolFilter = OrFilter | AndFilter | EqFilter | NotFilter;

type EqFilter = {
  op: "eq";
  column: string;
  value: SupportedColumnTypes;
};
type OrFilter = {
  op: "or";
  val: BoolFilter[];
};
type AndFilter = {
  op: "and";
  val: BoolFilter[];
};
type NotFilter = {
  op: "not";
  val: BoolFilter;
};

export function facetFilterToBool(ff: FacetFilter): BoolFilter {
  return {
    op: "and",
    val: Object.entries(ff)
      .map(([column, value]) => {
        if (value === undefined) return;
        if (Array.isArray(value)) {
          if (value.length === 0) return;
          return {
            op: "or",
            val: value.map((x) => ({
              op: "eq",
              column,
              value: x,
            })),
          };
        } else {
          return {
            op: "eq",
            column,
            value,
          };
        }
      })
      .filter(Boolean) as BoolFilter[],
  };
}

type InvertedIndexes = Record<string, InvertedIndex>;

export function evalBool(
  indexes: InvertedIndexes,
  universe: SparseTypedFastBitSet,
  f: BoolFilter
) {
  function evalInternal(f: BoolFilter): SparseTypedFastBitSet {
    switch (f.op) {
      case "eq":
        return indexes[f.column].get(f.value);
      case "not":
        return difference(universe, evalInternal(f.val));
      case "or":
        return union(...f.val.map((x) => evalInternal(x)));
      case "and":
        return intersection(...f.val.map((x) => evalInternal(x)));
    }
  }

  return evalInternal(f);
}
