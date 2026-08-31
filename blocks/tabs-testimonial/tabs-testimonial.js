// eslint-disable-next-line import/no-unresolved
import { toClassName } from '../../scripts/aem.js';

/**
 * Testimonial tab switcher.
 * Each authored row = one testimonial: cell 1 (avatar + name + role) becomes a
 * tab-menu button, cell 2 (photo + name + role + quote) becomes the tab panel.
 * The active panel is shown above the avatar tab row; clicking an avatar switches.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-testimonial-list';
  tablist.setAttribute('role', 'tablist');

  const tabs = [...block.children].map((child) => child.firstElementChild);
  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);

    // decorate tabpanel (the row div, minus the tab source cell)
    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-testimonial-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // build tab button (avatar + name/role info)
    const button = document.createElement('button');
    button.className = 'tabs-testimonial-tab';
    button.id = `tab-${id}`;
    button.innerHTML = tab.innerHTML;
    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');

    // structure the tab: avatar + stacked info (name + role)
    const btnParts = [...button.children];
    const avatarPart = btnParts.find((p) => p.querySelector('picture, img'));
    if (avatarPart) avatarPart.classList.add('tabs-testimonial-tab-avatar');
    const infoParts = btnParts.filter((p) => p !== avatarPart);
    if (infoParts.length) {
      const info = document.createElement('span');
      info.className = 'tabs-testimonial-tab-info';
      infoParts.forEach((p) => info.append(p));
      button.append(info);
    }

    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });
    tablist.append(button);
    tab.remove();

    // structure the remaining panel content: image cell + text content group
    const content = tabpanel.firstElementChild;
    if (content) {
      content.classList.add('tabs-testimonial-panel-inner');
      const parts = [...content.children];
      const imagePart = parts.find((p) => p.querySelector('picture, img'));
      if (imagePart) imagePart.classList.add('tabs-testimonial-panel-image');
      const textParts = parts.filter((p) => p !== imagePart);
      if (textParts.length) {
        const textWrap = document.createElement('div');
        textWrap.className = 'tabs-testimonial-panel-content';
        textParts.forEach((p, idx) => {
          // last paragraph is the quote
          if (idx === textParts.length - 1) p.classList.add('tabs-testimonial-quote');
          textWrap.append(p);
        });
        content.append(textWrap);
      }
    }
  });

  // panels remain first (active testimonial on top), avatar tab row appended below
  block.append(tablist);
}
