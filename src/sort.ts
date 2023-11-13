type NullsOrder = "first" | "last";

export function sortNulls(
  order: NullsOrder | undefined,
  cb?: (a: any, b: any) => number
) {
  const o = order === "first" ? -1 : 1;
  return (a: any, b: any) => {
    if (a == null && b == null) return 0;
    if (a == null) return o;
    if (b == null) return -1 * o;
    return cb ? cb(a, b) : 0;
  };
}

type SortDirection = "asc" | "desc";
type SortOptions = {
  order: SortDirection;
  /**
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale
   */
  locale?: string | string[];
  /**
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator/Collator#options
   */
  options?: Intl.CollatorOptions;
};

export function sortNumbers(opt: SortOptions) {
  const o = opt?.order === "desc" ? 1 : -1;
  return (a: any, b: any) => {
    return (b - a) * o;
  };
}

export function sortBooleans(opt: SortOptions) {
  const o = opt?.order === "desc" ? 1 : -1;
  return (a: any, b: any) => {
    if (a === b) return 0;
    return (a === true ? -1 : 1) * o;
  };
}

export function sortStrings(opt: SortOptions) {
  const o = opt?.order === "desc" ? 1 : -1;
  return (a: any, b: any) => {
    return b.localeCompare(a, opt?.locale, opt?.options) * o;
  };
}

export function sortStringsSoft(opt: SortOptions) {
  const o = opt?.order === "desc" ? 1 : -1;
  return (a: any, b: any) => {
    return `${b}`.localeCompare(`${a}`, opt?.locale, opt?.options) * o;
  };
}

type SortGeneralOptions = SortOptions & {
  type?: "number" | "string" | "boolean";
  /**
   * Be aware nulls first would still place undefined in the end of list
   * @default "last"
   */
  nulls?: NullsOrder;
};

/**
 * Other possible sorters are:
 * - string as number
 * - string as date
 */
const sorters = {
  string: sortStrings,
  number: sortNumbers,
  boolean: sortBooleans,
  default: sortStringsSoft,
};

export function sortGeneral(opt: SortGeneralOptions) {
  return sortNulls(opt?.nulls, sorters[opt.type || "default"](opt));
}
