/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards.
 * Base block: cards
 * Source: https://wknd-trendsetters.site/ (.grid-layout.desktop-4-column)
 * Generated: 2026-08-27
 *
 * Structure (from block library description):
 *  - 2 columns, multiple rows. First row is the block name.
 *  - Each subsequent row is one card: [Image/Icon cell, Text cell].
 *  - Image cell mandatory; text cell holds optional title/description/CTA.
 *
 * Source variations handled:
 *  1. Style gallery: card = <div class="utility-aspect-1x1"> wrapping an <img>,
 *     no text content (text cell emitted empty to keep rows uniform).
 *  2. Article cards: card = <a class="article-card" href> wrapping an image
 *     (.article-card-image > img) and a body (.article-card-body) with meta
 *     (tag + date) and an <h3> heading. The card link is preserved as a CTA.
 */
export default function parse(element, { document }) {
  // Prefer explicit card elements when the source marks them with a card class
  // (e.g. .trend-card, .article-card). Each such element carries both the image
  // and its body, so this is robust to extra wrapper <div>s between the grid and
  // the cards. Do NOT filter on the presence of <img> here — images may be
  // lazy-loaded and absent at import time, which would wrongly discard every
  // card and collapse the grid into a single fallback row.
  let cardEls = Array.from(element.querySelectorAll('.trend-card, .article-card'));
  if (cardEls.length === 0) {
    cardEls = Array.from(element.querySelectorAll(':scope > div, :scope > a'));
  }

  // Collapse guard: sibling <a> cards without an explicit closing tag can be
  // auto-nested into a single anchor by the HTML parser, so the selector above
  // returns ONE element holding every card's image + body. Detect this (a single
  // matched card containing multiple card bodies/images) and rebuild the card
  // list from the repeating image+body pairs instead.
  if (cardEls.length === 1) {
    const bodies = cardEls[0].querySelectorAll('.trend-card-body, .article-card-body');
    const imgs = cardEls[0].querySelectorAll('img');
    if (bodies.length > 1 || imgs.length > 1) {
      const rebuilt = [];
      const bodyList = Array.from(bodies);
      const imgList = Array.from(imgs);
      const count = Math.max(bodyList.length, imgList.length);
      const href = cardEls[0].tagName === 'A' ? cardEls[0].getAttribute('href') : null;
      for (let i = 0; i < count; i += 1) {
        const synthetic = document.createElement('div');
        if (imgList[i]) synthetic.appendChild(imgList[i]);
        if (bodyList[i]) synthetic.appendChild(bodyList[i]);
        if (href) synthetic.dataset.cardHref = href;
        rebuilt.push(synthetic);
      }
      if (rebuilt.length > 1) cardEls = rebuilt;
    }
  }

  const cells = [];

  cardEls.forEach((card) => {
    // Image cell (mandatory): the card image or icon.
    const img = card.querySelector('img');
    if (!img) return; // not a card (mandatory image missing)

    // Text cell: heading, meta (tag/date), description, and CTA link if present.
    const textContent = [];

    // Meta line (tag, date, etc.) if present.
    const meta = card.querySelector('.article-card-meta, [class*="meta"]');
    if (meta) textContent.push(meta);

    // Standalone category tag (e.g. <span class="tag">Casual</span>) when there
    // is no combined meta row. Emitted as a paragraph so it survives as text.
    if (!meta) {
      const tag = card.querySelector('.tag, [class*="tag"]');
      if (tag && tag.textContent.trim()) {
        const tagP = document.createElement('p');
        tagP.textContent = tag.textContent.trim();
        textContent.push(tagP);
      }
    }

    // Heading. If the card itself is a link, wrap the heading text in that
    // link so the CTA is preserved without duplicating the heading text.
    const href = card.tagName === 'A'
      ? card.getAttribute('href')
      : (card.dataset ? card.dataset.cardHref : null);
    const heading = card.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) {
      if (href) {
        const link = document.createElement('a');
        link.setAttribute('href', href);
        while (heading.firstChild) link.appendChild(heading.firstChild);
        heading.appendChild(link);
      }
      textContent.push(heading);
    }

    // Any paragraphs (descriptions) that are not inside the meta block.
    card.querySelectorAll('p').forEach((p) => {
      if (!meta || !meta.contains(p)) textContent.push(p);
    });

    // If there is no heading but the card is a link, keep an inner link as CTA.
    if (!heading) {
      const innerLink = card.querySelector('a[href]');
      if (innerLink) textContent.push(innerLink);
    }

    cells.push([img, textContent.length ? textContent : '']);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
