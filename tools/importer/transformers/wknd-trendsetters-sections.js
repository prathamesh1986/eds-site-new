/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: wknd-trendsetters section breaks + section metadata.
 *
 * Consumes payload.template.sections (DOM-verified selectors from page analysis).
 * Inserts an <hr> before every section except the first, and a "Section Metadata"
 * block (style: secondary) after each section that carries a style.
 *
 * Sections with style on the landing-page template: rc1, rc3, rc5 (grey secondary
 * background). rc7 (inverse-section) intentionally has NO style — the dark full-bleed
 * background is the hero block's own design, not section container styling.
 *
 * Break insertion happens in beforeTransform (while every section element still
 * exists, before block parsers replace them); metadata insertion happens in
 * afterTransform anchored to a marker <hr>. See generate-import-transformer.md.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

export default function transform(hookName, element, payload) {
  const sections = (payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    // Insert breaks now, before parsers can replace any section element.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no break, no metadata needed
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue; // selector didn't match on this page — skip, never guess a replacement

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Parsers have now run and may have replaced section elements. Anchor each
    // styled section's Section Metadata block to whichever still exists: the
    // marker <hr> placed above, or (first section, no marker inserted) the
    // original element itself.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || element.querySelector(section.selector);
      if (!anchor) continue; // neither survived — selector didn't match post-parse; skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never gets a real leading break
      }
    }
  }
}
