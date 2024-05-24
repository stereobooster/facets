import mitt, { Emitter, Handler } from "mitt";
import {
  Facets,
  Item,
  Schema,
  SearchOptions,
  SearchResults,
  TQuickscoreIndex,
} from "@stereobooster/facets";

/**
 * states like in network request https://tanstack.com/query/latest/docs/framework/react/overview
 * pending, error, success
 */
export type EventHandlers<S extends Schema, I extends Item<S>> = {
  load: SearchResults<S, I>;
};

export class Adapter<
  S extends Schema,
  I extends Item<S> = Item<S>,
  E extends EventHandlers<S, I> = EventHandlers<S, I>
> {
  private emitter: Emitter<E>;
  private index: Facets<S, I>;
  // @ts-expect-error xxx
  private current: SearchResults<S, I>;

  constructor(index: Facets<S, I>) {
    this.emitter = mitt<E>();
    this.index = index;

    setTimeout(() => {
      this.current = this.index.search();
      this.emitter.emit("load", this.current);
    }, 0);
  }

  search(options?: SearchOptions<S>) {
    this.current = this.index.search(options);
    this.emitter.emit("load", this.current);
    return this.current;
  }

  on<Key extends keyof E = keyof E>(type: Key, handler: Handler<E[Key]>) {
    if (this.current && type === "load") {
      // @ts-expect-error xxx
      handler(this.current);
    }
    this.emitter.on(type, handler);
    return () => this.emitter.off(type, handler);
  }

  off<Key extends keyof E = keyof E>(type: Key, handler: Handler<E[Key]>) {
    this.emitter.off(type, handler);
  }
}

const schema = {
  name: {
    type: "string",
    text: true,
  },
  description: {
    type: "string",
    text: true,
  },
  brand: {
    type: "string",
    facet: true,
  },
  categories: {
    type: "string",
    isArray: true,
    facet: true,
  },
  "hierarchicalCategories.lvl0": {
    type: "string",
    facet: true,
    isObject: true,
  },
  "hierarchicalCategories.lvl1": {
    type: "string",
    facet: true,
    isObject: true,
  },
  // "hierarchicalCategories.lvl2": {
  //   type: "string",
  //   facet: true,
  //   isObject: true,
  // },
  // "hierarchicalCategories.lvl3": {
  //   type: "string",
  //   facet: true,
  //   isObject: true,
  // },
  price: {
    type: "number",
    facet: {
      showZeroes: false,
    },
  },
  image: {
    type: "string",
  },
  url: {
    type: "string",
  },
  free_shipping: {
    type: "boolean",
    facet: true,
  },
  rating: {
    type: "number",
    facet: {
      showZeroes: true,
    },
  },
  // TODO: sort by popularity by default?
  popularity: {
    type: "number",
  },
  // type: {
  //   type: "string",
  // },
  // price_range: {
  //   type: "string",
  // },
  // objectID: {
  //   type: "string",
  // },
} satisfies Schema;

const data = await fetch("/records.json").then((x) => x.json());

const index = new Facets(
  { textIndex: TQuickscoreIndex, schema, idKey: "objectID" },
  data
);

export const adapter = new Adapter(index);
