import { stats } from "instantsearch.js/es/widgets";

export const saveFiltersMobile = stats({
  container: '[data-widget="save-filters-mobile"]',
  templates: {
    text: (_, { html }) => html`
      <button class="button button-primary">
        See {{#helpers.formatNumber}}{{nbHits}}{{/helpers.formatNumber}} results
      </button>
    `,
  },
});
