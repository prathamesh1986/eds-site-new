/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero.
 * Base block: hero
 * Source: https://wknd-trendsetters.site/ (.grid-layout.desktop-1-column, inverse section)
 * Generated: 2026-08-27
 *
 * Structure (from block library description):
 *  - 1 column, 3 rows. First row is the block name.
 *  - Row 2 (single cell): Background Image (optional).
 *  - Row 3 (single cell): Title (heading), Subheading, Call-to-Action (optional).
 *
 * Source: closing CTA banner — a background <img class="cover-image"> with an
 * overlaid card-body containing an <h2>, a subheading <p>, and a button group.
 */
export default function parse(element, { document }) {
  // Background image (optional).
  const bgImage = element.querySelector('img[class*="cover"], img[class*="background"], img');

  // Text content: heading, subheading, CTAs.
  const heading = element.querySelector('h1, h2, h3, .h1-heading, [class*="heading"]');
  const subheading = element.querySelector('p.subheading, .subheading, p');
  const ctaLinks = Array.from(element.querySelectorAll('.button-group a, a.button'));

  // Empty-block guard.
  if (!heading && !subheading && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image.
  cells.push([bgImage || '']);

  // Row 3: text content (single cell holding all elements).
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (subheading) contentCell.push(subheading);
  contentCell.push(...ctaLinks);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
