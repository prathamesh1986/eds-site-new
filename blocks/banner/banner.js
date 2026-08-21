import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Authoring contract for the banner block:
 *   Row 1: background image
 *   Row 2: title text (a heading or plain text)
 *
 * Both parts are optional and may be authored in either order. The block
 * renders the image as a full-bleed background with the title overlaid.
 *
 * Variants (added as block options next to "banner"):
 *   - default: blue look
 *   - light / dark: alternate color treatments
 *
 * @param {Element} block The banner block element
 */
export default function decorate(block) {
  const picture = block.querySelector('picture');
  let heading = block.querySelector('h1, h2, h3, h4, h5, h6');

  // fall back to the first non-empty text cell if no heading was authored
  if (!heading) {
    const textCell = [...block.querySelectorAll('div')]
      .find((div) => !div.querySelector('picture') && div.textContent.trim());
    if (textCell) {
      heading = document.createElement('h2');
      heading.textContent = textCell.textContent.trim();
    }
  }

  const content = document.createElement('div');
  content.className = 'banner-content';

  if (picture) {
    const img = picture.querySelector('img');
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '2000' }]);
    optimized.classList.add('banner-image');
    content.append(optimized);
  }

  const title = document.createElement('div');
  title.className = 'banner-title';
  if (heading) title.append(heading);
  content.append(title);

  block.replaceChildren(content);
}
