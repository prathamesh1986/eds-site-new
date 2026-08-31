/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: wknd-trendsetters site-wide cleanup.
 *
 * Removes non-authorable site chrome so the import contains only page-level
 * authorable content. All selectors verified by reading migration-work/cleaned.html:
 *   - a.skip-link                   (line 1) accessibility skip link
 *   - div.navbar                    (line 1) top navigation bar + mega menu
 *   - footer.footer.inverse-footer  (line 98) global site footer
 *
 * NOTE: <header class="section secondary-section"> lives INSIDE <main id="main-content">
 * and is authorable section 1 (the columns hero header) — do NOT remove bare `header`.
 * The `.breadcrumbs` in section 2 is authored default content — do NOT remove it.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    // Non-authorable global chrome (does not affect block parsing).
    WebImporter.DOMUtils.remove(element, [
      'a.skip-link',
      'div.navbar',
      'footer.footer.inverse-footer',
    ]);
  }
}
