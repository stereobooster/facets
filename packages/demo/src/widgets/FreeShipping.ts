import { panel, toggleRefinement } from "instantsearch.js/es/widgets";

import { collapseButtonText } from "../templates/panel";

const freeShippingToggleRefinement = panel({
  templates: {
    header: (_, { html }) => html`Free shipping`,
    collapseButtonText,
  },
  collapsed: () => false,
})(toggleRefinement);

export const freeShipping = freeShippingToggleRefinement({
  container: '[data-widget="free-shipping"]',
  attribute: "free_shipping",
  templates: {
    // @ts-expect-error fix later
    labelText: (_, { html }) => html`Display only items with free shipping`,
  },
});
