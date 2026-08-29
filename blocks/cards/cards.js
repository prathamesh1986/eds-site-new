import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));

  // Split the article-card meta line ("Category Month DD") into a category
  // pill tag and a date, matching the source design. Only applies when the
  // card body has a title (article variant) and the meta ends with a date.
  ul.querySelectorAll('.cards-card-body').forEach((body) => {
    const meta = body.querySelector(':scope > p');
    if (!meta || !body.querySelector('h2, h3, h4, h5, h6')) return;
    const text = meta.textContent.trim();
    const match = text.match(/^(.*?)\s+([A-Z][a-z]+\.?\s+\d{1,2}(?:,\s*\d{4})?)$/);
    if (!match) return;
    meta.textContent = '';
    meta.classList.add('cards-card-meta');
    const [, category, dateText] = match;
    const tag = document.createElement('span');
    tag.className = 'cards-card-tag';
    tag.textContent = category;
    const date = document.createElement('span');
    date.className = 'cards-card-date';
    date.textContent = dateText;
    meta.append(tag, date);
  });

  block.replaceChildren(ul);
}
