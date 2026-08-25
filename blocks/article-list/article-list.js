import { createOptimizedPicture, readBlockConfig } from '../../scripts/aem.js';

/**
 * Article List block.
 * Fetches a query index (default `/query-index.json`) and renders the pages as
 * a dynamic list of cards (image, title, description) linking to each path.
 *
 * Optional config rows (key | value):
 *   | source | /query-index.json |   data source (a published index or sheet)
 *   | filter | /blog             |   only include pages whose path starts with this
 *   | limit  | 6                 |   cap the number of items rendered
 *
 * @param {Element} block The article-list block element
 */
export default async function decorate(block) {
  const config = readBlockConfig(block);
  const source = config.source || '/query-index.json';
  const { filter } = config;
  const limit = config.limit ? parseInt(config.limit, 10) : undefined;

  block.textContent = '';

  let items = [];
  try {
    const resp = await fetch(source);
    if (resp.ok) {
      const json = await resp.json();
      items = json.data || [];
    }
  } catch {
    items = [];
  }

  // keep real content pages only, then apply optional path filter / limit
  items = items.filter((item) => item.path && item.title);
  if (filter) items = items.filter((item) => item.path.startsWith(filter));
  if (limit && limit > 0) items = items.slice(0, limit);

  const ul = document.createElement('ul');
  ul.className = 'article-list-items';

  items.forEach((item) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.className = 'article-list-link';
    link.href = item.path;

    if (item.image) {
      const picture = createOptimizedPicture(item.image, item.title, false, [{ width: '750' }]);
      picture.classList.add('article-list-image');
      link.append(picture);
    }

    const body = document.createElement('div');
    body.className = 'article-list-body';

    const title = document.createElement('h3');
    title.textContent = item.title;
    body.append(title);

    if (item.description) {
      const desc = document.createElement('p');
      desc.textContent = item.description;
      body.append(desc);
    }

    link.append(body);
    li.append(link);
    ul.append(li);
  });

  block.append(ul);
}
