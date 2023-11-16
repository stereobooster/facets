export type Pagination = {
  perPage: number;
  page: number;
  total: number;
};

export function paginate<T, P>(
  items: T[],
  page: number | undefined,
  perPage: number | undefined,
  cb?: (i: T) => P
) {
  let p = page || 0;
  let pp = perPage || 20;

  if (pp === -1) {
    return {
      items: cb ? items.map(cb) : items,
      pagination: {
        perPage: items.length,
        page: 0,
        total: items.length,
      },
    };
  }

  return {
    items: cb
      ? items.slice(p * pp, (p + 1) * pp).map(cb)
      : items.slice(p * pp, (p + 1) * pp),
    pagination: {
      perPage: pp,
      page: p,
      total: items.length,
    },
  };
}
