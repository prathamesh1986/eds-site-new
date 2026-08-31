/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns.
 * Base block: columns
 * Source: https://wknd-trendsetters.site/ (.grid-layout.tablet-1-column)
 * Generated: 2026-08-27
 *
 * Structure (from block library description):
 *  - Multiple columns / rows. First row is the block name.
 *  - The number of columns is based on how content is visually grouped.
 *  - Each cell can contain text, images, or other inline elements.
 *
 * Source variations handled:
 *  1. Hero header: two columns — a text block (heading, subheading, buttons)
 *     and an image group (nested grid of <img>).
 *  2. Featured case study: two columns — an image column and a text column
 *     (breadcrumbs, heading, author meta).
 * Each direct child of the grid maps to one column cell in a single row.
 */
export default function parse(element, { document }) {
  // Each direct child is a visual column.
  const columns = Array.from(element.children).filter(
    (child) => child.textContent.trim() !== '' || child.querySelector('img'),
  );

  // Empty-block guard.
  if (columns.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  // Single content row with one cell per column.
  cells.push(columns);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
