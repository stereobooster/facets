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

import { Facets, Schema, TQuickscoreIndex } from "@stereobooster/facets";
import { getSearchClient } from "@stereobooster/facets-instantsearch";

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
    facet: true,
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
    facet: true,
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
// if there would be facets client as webworker e.g. asyncrhonious it would need separate adapter
const index = new Facets({ textIndex: TQuickscoreIndex, schema }, data);
const searchClient = getSearchClient(index);
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