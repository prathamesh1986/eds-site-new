/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-testimonial.
 * Base block: tabs
 * Source: https://wknd-trendsetters.site/ (.tabs-wrapper)
 * Generated: 2026-08-27
 *
 * Structure (from block library description):
 *  - 2 columns, multiple rows. First row is the block name.
 *  - Each subsequent row is one tab: [Tab Label cell, Tab Content cell].
 *
 * Source: testimonial tabs. Content panes live in .tabs-content > .tab-pane;
 * the corresponding tab labels live in .tab-menu > button.tab-menu-link.
 * Panes and menu buttons are matched by order. The menu button (avatar + name
 * + role) is used as the label cell; the pane grid is used as the content cell.
 */
export default function parse(element, { document }) {
  const panes = Array.from(element.querySelectorAll('.tabs-content > .tab-pane, .tab-pane'));
  const labels = Array.from(element.querySelectorAll('.tab-menu > .tab-menu-link, .tab-menu-link'));

  const cells = [];

  panes.forEach((pane, i) => {
    // Label: matching menu button content; fall back to the name in the pane.
    let label;
    if (labels[i]) {
      // Use the inner content wrapper of the button (avatar + name/role).
      label = labels[i].firstElementChild || labels[i];
    } else {
      label = pane.querySelector('strong') || '';
    }

    // Content: the full pane content (image + name + role + quote).
    const content = pane.firstElementChild || pane;

    cells.push([label, content]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-testimonial', cells });
  element.replaceWith(block);
}
