# WKND Trendsetters — Page & Layout Discovery Plan

## Objective
Discover every page on `https://wknd-trendsetters.site/` and identify the distinct layouts (page templates) used across the site, so we have a complete map of the site's structure to guide any future migration or authoring work.

## Approach
This is a two-part effort: **URL discovery** (find all pages) followed by **template cataloging** (group pages that share the same layout/structure into reusable templates). We'll rely on the site catalog workflow, which chains these steps together.

1. **URL Discovery** — Pull the full list of pages, preferring the site's `sitemap.xml`, falling back to crawling internal links if no sitemap exists.
2. **Page Sampling & Analysis** — Fetch and analyze representative pages to understand their section/block structure.
3. **Template Grouping** — Cluster pages with similar structure into named layouts (e.g., Home, Article/Blog, Product/Listing, Landing, Generic Content).
4. **Catalog Output** — Produce a site catalog that lists every URL, its assigned template, and a description of each layout's structure.

## Checklist
- [ ] Confirm the site is reachable and check for `sitemap.xml`
- [ ] Discover all page URLs (sitemap first, crawl as fallback)
- [ ] Deduplicate and organize the URL list
- [ ] Analyze a sample of pages to identify section and block structure
- [ ] Group pages into distinct layouts / page templates
- [ ] Name and describe each layout (structure, sections, block types)
- [ ] Produce the site catalog mapping every URL → template
- [ ] Summarize findings: total page count, number of distinct layouts, and notable pages

## Deliverable
A site catalog report containing:
- The complete list of discovered pages
- The set of distinct layouts/templates found
- A description of each layout and which pages belong to it

## Notes
- This is a **read-only discovery** effort — no content import, migration, or code changes are performed at this stage.
- Execution requires **Execute mode**; this plan is prepared in Plan mode and awaits approval to run.
