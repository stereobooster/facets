import instantsearch from "instantsearch.js";

import getRouting from "./routing";
import {
  brands,
  categories,
  clearFilters,
  clearFiltersEmptyResults,
  clearFiltersMobile,
  configuration,
  freeShipping,
  hitsPerPage,
  pagination,
  priceSlider,
  products,
  ratings,
  resultsNumberMobile,
  saveFiltersMobile,
  searchBox,
  sortBy,
} from "./widgets";

import { Schema, TQuickscoreIndex } from "@stereobooster/facets";

import {
  createIndex,
  getSearchClient,
} from "@stereobooster/facets-instantsearch";

const data = await fetch("/records.json").then((x) => x.json());

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
  type: {
    type: "string",
  },
  price: {
    type: "number",
    facet: true,
  },
  price_range: {
    type: "string",
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
  popularity: {
    type: "number",
  },
  rating: {
    type: "number",
    facet: true,
  },
  objectID: {
    type: "string",
  },
} satisfies Schema;

const index = createIndex({ textIndex: TQuickscoreIndex, schema }, data);
const searchClient = getSearchClient(index, schema);

const search = instantsearch({
  searchClient,
  indexName: "instant_search",
  routing: getRouting({ indexName: "instant_search" }),
  insights: false,
});

search.addWidgets([
  brands,
  categories,
  clearFilters,
  clearFiltersEmptyResults,
  clearFiltersMobile,
  configuration,
  freeShipping,
  hitsPerPage,
  pagination,
  priceSlider,
  products,
  ratings,
  resultsNumberMobile,
  saveFiltersMobile,
  searchBox,
  sortBy,
]);

export default search;
