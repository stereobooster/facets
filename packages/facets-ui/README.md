# Facets UI

Idea is to build general UI widgets for faceted search, so it can be used either with Facets (this monorepo) or [pagefind](https://github.com/CloudCannon/pagefind/discussions/512).

Pagefind promises to build modular UI. So far it is implemented with raw DOM and ES classes see, for example, [FilterPills](https://github.com/CloudCannon/pagefind/blob/main/pagefind_ui/modular/components/filterPills.js).

I wrote adapters for InstantSearch for both Pagefind and Facets. I don't like it. It requires a lot of boilerplate, hard to customize, hard to extend. It [uses Preact](https://github.com/algolia/instantsearch/blob/master/packages/instantsearch.js/package.json).

There are other open-source libraries for the task. See [this list](https://stereobooster.com/posts/faceted-search/#ui). But I feel like it would be easier to build one from scratch than try adapt others.

I want to take some open-source headless components (with a11y). See [list here](https://stereobooster.com/posts/components-for-web/#headless-components). Probably Tailwind CSS.

I would like to avoid "heavy" React. There are libraries that can be used cross-framework. I will try it. But for PoC will use React.

## Architecture

```mermaid
flowchart LR
  widgets -- 1 --> adpater --2--> sc
  sc[search client] --3--> adpater --4--> widgets
```

**Main use case**:

- user changes something in widget
- (1) widget calls adapter
- (2) adpter calls search client, stores new state, etc
- (3) search client returns result to adapter
- (4) adapter calls event listeners
- widget reacts to events from adapter

**Search client** - can be Pagefind, Facets or client for any other search engine, like meilisearch, typesense etc.

**Adapter** - responsible for storing state (maybe mirror it in search url), adpating request / response for search client. Important: it will provide event listeners, so that widgets can be attached. For example, pagefind provides events for:

- `instance.on("results"`
- `instance.on("filters"`
- `instance.on("loading"`
- `instance.on("search"`

**Widgets** - self contained UI components that can be composed into full faceted search UI. For example,

- search bar
- search results
  - cards
  - table
- checkboxes with count (basic facet filter)
- slider with two knobs
- tree
- calendar
- pagination
- sorting dropdown
- etc.

In [faceted-search](https://github.com/stereobooster/faceted-search) React hook which wraps `useReactTable` serves as adapter.

### Adapter

For events (and state) I can use:

- [mitt](https://github.com/developit/mitt/)
- [signals](https://github.com/preactjs/signals)
- [Zustand, Jotai, Valtio](https://react-community-tools-practices-cheatsheet.netlify.app/state-management/poimandres/)

Let's start with event emitter (`mitt`).

We need to store

- query / UI state
- response / facets + items
- multiple searches / debouncing input
- states: pending / success / error
