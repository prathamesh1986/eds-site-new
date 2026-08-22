import { getMetadata } from '../../scripts/aem.js';

/**
 * Turns a URL path segment into a readable label.
 * e.g. "our-adventures" -> "Our Adventures"
 * @param {string} segment path segment
 */
function labelize(segment) {
  return decodeURIComponent(segment)
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Builds the breadcrumb trail from the current URL path.
 * Home is always the first step; the current page (og:title) is the last and
 * is not linked. Intermediate path segments link to their own pages.
 * @returns {{ text: string, link?: string }[]}
 */
function buildTrail() {
  const trail = [{ text: 'Home', link: '/' }];
  const segments = window.location.pathname.split('/').filter((s) => s);

  segments.forEach((segment, i) => {
    const isLast = i === segments.length - 1;
    const link = `/${segments.slice(0, i + 1).join('/')}`;
    trail.push({
      text: isLast ? (getMetadata('og:title') || labelize(segment)) : labelize(segment),
      link: isLast ? undefined : link,
    });
  });

  return trail;
}

/**
 * loads and decorates the breadcrumb
 * @param {Element} block The breadcrumb block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  const trail = buildTrail();

  trail.forEach((step) => {
    const li = document.createElement('li');
    let wrap = li;
    if (step.link) {
      wrap = document.createElement('a');
      wrap.href = step.link;
      li.append(wrap);
    }
    const span = document.createElement('span');
    span.textContent = step.text;
    wrap.append(span);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
