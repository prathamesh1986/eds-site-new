/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion.
 * Base block: accordion
 * Source: https://wknd-trendsetters.site/ (.faq-list)
 * Generated: 2026-08-27
 *
 * Structure (from block library description):
 *  - 2 columns, multiple rows.
 *  - Each subsequent row is an accordion item: [Title cell, Content cell].
 *
 * Source variation handled: FAQ items rendered as <details class="faq-item">
 * with <summary class="faq-question"> (question text in a <span>, plus an icon)
 * and <div class="faq-answer"> (the answer body).
 */
export default function parse(element, { document }) {
  // Each accordion item is a <details> element (fallback to direct children).
  const items = Array.from(element.querySelectorAll(':scope > details, :scope > .faq-item'));

  const cells = [];

  items.forEach((item) => {
    // Title: prefer the inner span text, fall back to the summary itself.
    const summary = item.querySelector('summary, .faq-question');
    const titleSpan = summary ? summary.querySelector('span') : null;
    const titleContent = titleSpan || summary || '';

    // Content: the answer body; fall back to any non-summary content.
    const answer = item.querySelector('.faq-answer, [class*="answer"]');
    const contentContent = answer || '';

    cells.push([titleContent, contentContent]);
  });

  // Empty-block guard: no items found, unwrap gracefully.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells });
  element.replaceWith(block);
}
