# Lighthouse Reports — WKND Trendsetters Migration

Full Lighthouse reports (HTML + JSON) for the five migrated pages, captured against
the production environment `https://main--eds-site-new--prathamesh1986.aem.live`.

Profiles: **mobile** and **desktop**, categories: performance, accessibility,
best-practices, seo. Desktop reports use the `.desktop.report.*` suffix.

## Scores — mobile

| Page | Performance | Accessibility | Best Practices | SEO |
|------|:-----------:|:-------------:|:--------------:|:---:|
| `/` (home) | 98 | 100 | 96 | 69\* |
| `/blog` | 100 | 100 | 100 | 69\* |
| `/faq` | 100 | 100 | 100 | 69\* |
| `/fashion-trends-young-adults-casual-sport` | 94 | 100 | 100 | 69\* |
| `/blog/ace-pro-court-polo` | 99 | 100 | 96 | 69\* |

## Scores — desktop

| Page | Performance | Accessibility | Best Practices | SEO |
|------|:-----------:|:-------------:|:--------------:|:---:|
| `/` (home) | 100 | 100 | 96 | 69\* |
| `/blog` | 100 | 100 | 100 | 69\* |
| `/faq` | 100 | 100 | 100 | 69\* |
| `/fashion-trends-young-adults-casual-sport` | 100 | 100 | 100 | 69\* |
| `/blog/ace-pro-court-polo` | 99 | 100 | 96 | 69\* |

\* **SEO 69** is caused solely by the `x-robots-tag: noindex, nofollow` header that
the AEM `.aem.live` / `.aem.page` staging platform injects by design so that
pre-production content is not indexed. There is no `robots` meta tag in the site's
own markup — nothing to fix in code. On the public production domain this header is
not sent and SEO scores ~100.

## Files

Per page: `<name>.report.html` (human-readable) and `<name>.report.json` (raw).

## Regenerate

```bash
export CHROME_PATH="$(find /ms-playwright -name chrome -type f | head -1)"
BASE="https://main--eds-site-new--prathamesh1986.aem.live"
npx -y lighthouse "$BASE/" \
  --chrome-flags="--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage" \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=html --output=json --output-path=reports/lighthouse/index
# add --preset=desktop for the desktop profile (output-path .../index.desktop)
```

> Note: `reports/` is listed in `.hlxignore` so these files are kept in the repo for
> the record but are not served by Edge Delivery.
