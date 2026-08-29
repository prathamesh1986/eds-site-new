/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import accordionParser from './parsers/accordion.js';
import cardsParser from './parsers/cards.js';
import columnsParser from './parsers/columns.js';
import heroParser from './parsers/hero.js';
import tabsTestimonialParser from './parsers/tabs-testimonial.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-trendsetters-cleanup.js';
import sectionsTransformer from './transformers/wknd-trendsetters-sections.js';

// PARSER REGISTRY
const parsers = {
  accordion: accordionParser,
  cards: cardsParser,
  columns: columnsParser,
  hero: heroParser,
  'tabs-testimonial': tabsTestimonialParser,
};

// PAGE TEMPLATE CONFIGURATION - embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'landing-page',
  description: 'Marketing landing layout: full-width hero followed by stacked content sections (text, imagery, CTAs).',
  urls: [
    'https://wknd-trendsetters.site/',
    'https://wknd-trendsetters.site/fashion-trends-of-the-season',
    'https://wknd-trendsetters.site/fashion-trends-young-adults',
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
    { name: 'section-gallery', instances: ['#main-content > section.section.secondary-section:nth-of-type(2)'], section: 'secondary' },
    {
      name: 'cards',
      instances: [
        '#main-content > section.section.secondary-section:nth-of-type(2) .grid-layout.desktop-4-column',
        '#main-content > section.section.secondary-section:nth-of-type(4) .grid-layout.desktop-4-column',
      ],
    },
    { name: 'tabs-testimonial', instances: ['.tabs-wrapper'] },
    { name: 'section-latest', instances: ['#main-content > section.section.secondary-section:nth-of-type(4)'], section: 'secondary' },
    { name: 'accordion', instances: ['.faq-list'] },
    { name: 'hero', instances: ['#main-content > section.section.inverse-section .grid-layout.desktop-1-column'] },
  ],
  sections: [
    { id: 'rc1', name: 'Hero header', selector: '#main-content > header.section.secondary-section', style: 'secondary', blocks: ['columns'], defaultContent: [] },
    { id: 'rc2', name: 'Featured case study', selector: '#main-content > section.section:nth-of-type(1)', style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'rc3', name: 'Style gallery', selector: '#main-content > section.section.secondary-section:nth-of-type(2)', style: 'secondary', blocks: ['cards'], defaultContent: [] },
    { id: 'rc4', name: 'Testimonials', selector: '#main-content > section.section:nth-of-type(3)', style: null, blocks: ['tabs-testimonial'], defaultContent: [] },
    { id: 'rc5', name: 'Latest articles', selector: '#main-content > section.section.secondary-section:nth-of-type(4)', style: 'secondary', blocks: ['cards'], defaultContent: [] },
    { id: 'rc6', name: 'FAQ', selector: '#main-content > section.section:nth-of-type(5)', style: null, blocks: ['accordion'], defaultContent: [] },
    { id: 'rc7', name: 'Closing CTA', selector: '#main-content > section.section.inverse-section', style: null, blocks: ['hero'], defaultContent: [] },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, then sections (only when 2+ sections)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook.
 */
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

/**
 * Find all blocks on the page based on the embedded template configuration.
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    // Skip section-* mapping entries — those are handled by the section transformer.
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

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block; skip elements already replaced by an earlier parser
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

    // 4. afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path (map root URL to /index to avoid empty-path crash)
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
