import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Teaser block: a compact promo unit with an image alongside a title,
 * short description, and an optional call-to-action.
 *
 * Authoring contract (one row, two cells):
 *   | Teaser |            |
 *   | (image) | ### Title \n copy \n [CTA](link) |
 *
 * @param {Element} block The teaser block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      if (cell.children.length === 1 && cell.querySelector('picture')) {
        cell.className = 'teaser-image';
      } else {
        cell.className = 'teaser-body';
      }
    });
  });

  block.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]),
    );
  });
}
