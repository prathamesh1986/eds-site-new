# Banner

A full-bleed banner that overlays a title on a background image. Ships with a
default **blue** look and `light` / `dark` variants.

## Authoring

A block is authored as a table. The first row holds the block name; each
following row is one part of the block. For Banner, provide an **image** and a
**title** (both optional, any order).

### Default (blue)

| Banner                          |
| ------------------------------- |
| ![](https://picsum.photos/2000/600) |
| ## Welcome to Our Site          |

- Row 1: block name `Banner`.
- Row 2: the background image.
- Row 3: the title. Use a heading style (e.g. Heading 2). Plain text also works —
  the block promotes it to an `<h2>` automatically.

### Variants

Add the variant in parentheses next to the block name:

| Banner (dark)          |
| ---------------------- |
| ## Dark Variant Banner |

- `Banner (dark)` → dark treatment
- `Banner (light)` → light treatment

The image row is optional. A variant with only a title renders the solid color
treatment.

## Content contract

The decorator (`banner.js`) looks for:

- the first `<picture>` in the block → rendered as an optimized, full-bleed
  background image.
- the first heading (`h1`–`h6`) → the overlaid title. If no heading is authored,
  the first non-empty text cell is promoted to an `<h2>`.

## Styling

Colors are driven by three custom properties on `.banner`, so variants only
re-point them:

| Property           | Default (blue) |
| ------------------ | -------------- |
| `--banner-bg`      | `#3b63fb`      |
| `--banner-bg-dark` | `#1d3ecf`      |
| `--banner-fg`      | `#fff`         |

In the default look the gradient is blended over the image (`mix-blend-mode:
multiply`) to keep the title readable. Responsive: `min-height` 220px on mobile,
300px from 900px up.
