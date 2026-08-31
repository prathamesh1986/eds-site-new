/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsParser from './parsers/cards.js';
import columnsParser from './parsers/columns.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-trendsetters-cleanup.js';
import sectionsTransformer from './transformers/wknd-trendsetters-sections.js';

// PARSER REGISTRY
const parsers = {
  cards: cardsParser,
  columns: columnsParser,
};

// PAGE TEMPLATE CONFIGURATION - embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'listing-page',
  description: 'Index/listing layout: hero header followed by grouped listing sections.',
  urls: [
    'https://wknd-trendsetters.site/blog',
    'https://wknd-trendsetters.site/case-studies',
    'https://wknd-trendsetters.site/fashion-insights',
  ],
  blocks: [
    { name: 'section-hero-header', instances: ['#main-content > header.section.secondary-section'], section: 'secondary' },
    {
      name: 'columns',
      instances: [
        '#main-content > header.section.secondary-section .grid-layout.tablet-1-column',
        '#main-content > section.section:nth-of-type(1) .grid-layout.tablet-1-column',
      ],
    },
    { name: 'section-articles', instances: ['#articles'], section: 'secondary' },
    { name: 'cards', instances: ['#articles .grid-layout.desktop-4-column'] },
    { name: 'section-subscribe', instances: ['#main-content > section.section.accent-section'], section: 'accent' },
  ],
  sections: [
    { id: 'ls1', name: 'Blog hero header', selector: '#main-content > header.section.secondary-section', style: 'secondary', blocks: ['columns'], defaultContent: [] },
    { id: 'ls2', name: 'Featured article', selector: '#main-content > section.section:nth-of-type(1)', style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'ls3', name: 'Latest articles grid', selector: '#articles', style: 'secondary', blocks: ['cards'], defaultContent: [] },
    { id: 'ls4', name: 'Closing subscribe CTA', selector: '#main-content > section.section.accent-section', style: 'accent', blocks: [], defaultContent: ['#main-content > section.section.accent-section h2', '#main-content > section.section.accent-section p'] },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    if (blockDef.name.startsWith('section-')) return;
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name, selector, element, section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
