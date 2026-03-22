# Font Tester CSS Customization Guide

## Overview

Two methods for styling font-tester:

1. **CSS Custom Properties** — set on `font-tester` directly; cascade through all shadow DOM boundaries into sub-components
2. **`::part()` Selectors** — target specific shadow DOM elements for structural overrides

### Important constraints

Sub-components (`font-display`, `style-controls`, etc.) live inside `font-tester`'s shadow DOM. Regular CSS descendant selectors (e.g. `font-tester font-display { }`) cannot reach them. Set all custom properties on `font-tester` itself — they cascade inward automatically.

`::part()` selectors only work for parts that are declared or forwarded (via `exportparts`) through `font-tester`'s shadow root. `font-display`, `style-controls`, `opentype-features`, and `var-axes-controls` do not export their inner parts — style those exclusively via custom properties.

---

## CSS Custom Properties

All properties are set on `font-tester`:

```css
font-tester {

  /* Layout */
  --container-max-width: 1200px;
  --container-padding: 20px;
  --section-gap: 30px;

  /* Display area */
  --display-bg: #ffffff;
  --display-border-color: #e0e0e0;
  --display-border-width: 1px;
  --display-border-radius: 8px;
  --display-padding: 40px;
  --display-min-height: 200px;

  /* Preview text */
  --text-color: #000000;
  --text-font-size: 48px;
  --text-font-weight: 400;
  --text-line-height: 1.4;
  --text-letter-spacing: 0em;
  /* --display-font-family is managed internally — do not override */

  /* Status indicators */
  --loading-color: #999;
  --error-color: #f00;

  /* Toggle buttons (text-controls) */
  --control-bg: white;
  --control-bg-hover: #f5f5f5;
  --control-bg-active: #333;
  --control-border: #e0e0e0;
  --control-border-width: 1px;
  --control-border-radius: 4px;
  --control-text: #000;
  --control-text-active: #fff;
  --control-gap: 10px;

  /* Sliders (style-controls) */
  --slider-bg: #e0e0e0;
  --slider-thumb-bg: #333;
  --label-color: #333;
  --value-color: #666;

  /* Dropdowns (sample-text-selector, font-style-selector) */
  --select-bg: white;
  --select-border: #e0e0e0;
  --select-border-width: 1px;
  --select-border-hover: #333;
  --select-border-radius: 4px;
  --select-padding: 8px 12px;
  --select-font-family: inherit;
  --select-font-size: 13px;
  --select-arrow: url("data:image/svg+xml,..."); /* SVG data URL */
  --select-arrow-position: right 12px center;

  /* OpenType feature toggles */
  --feature-bg: white;
  --feature-bg-hover: #f5f5f5;
  --feature-bg-active: #333;
  --feature-border: #e0e0e0;
  --feature-border-width: 1px;
  --feature-border-radius: 4px;
  --feature-text: #000;
  --feature-text-active: #fff;
  --feature-gap: 12px;
  --feature-code-font-size: 11px;
  --feature-code-opacity: 0.6;

  /* OpenType features trigger button */
  --btn-bg: white;
  --btn-bg-hover: #f5f5f5;
  --btn-border-color: #e0e0e0;
  --btn-border-radius: 4px;
  --btn-color: #000;
  --btn-font-size: 13px;

  /* OpenType features dialog */
  --dialog-border-color: #e0e0e0;
  --dialog-border-radius: 8px;
  --dialog-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  --dialog-backdrop-color: rgba(0, 0, 0, 0.3);
  --dialog-header-border-color: #e0e0e0;
  --dialog-close-color: #666;
}
```

---

## `::part()` Selectors

Only the parts listed below are reachable from an external stylesheet.

### Layout sections

The container is a flex column. Use `order` to reposition sections.

```css
font-tester::part(controls-section) { }
font-tester::part(style-controls-section) { }
font-tester::part(display-section) { }
font-tester::part(var-axes-section) { }

/* Example: move display above controls */
font-tester::part(display-section) { order: -1; }
```

### OpenType dialog

```css
font-tester::part(features-button) { }
font-tester::part(dialog) { }           /* background not settable via custom property */
font-tester::part(dialog-header) { }
font-tester::part(dialog-title) { }
font-tester::part(close-button) { }
```

### text-controls (exported via `exportparts`)

```css
font-tester::part(button) { }             /* all buttons */
font-tester::part(uppercase-button) { }
font-tester::part(direction-group) { }
font-tester::part(ltr-button) { }
font-tester::part(rtl-button) { }
font-tester::part(alignment-group) { }
font-tester::part(align-left-button) { }
font-tester::part(align-center-button) { }
font-tester::part(align-right-button) { }
```

### sample-text-selector (exported via `exportparts`)

```css
font-tester::part(sample-select) { }
```

### font-style-selector (exported via `exportparts`)

```css
font-tester::part(style-wrapper) { }
font-tester::part(style-label) { }
font-tester::part(style-select) { }
```

### style-controls (exported via `exportparts`)

```css
font-tester::part(controls) { }              /* the grid wrapper */

font-tester::part(control-item) { }          /* all items */
font-tester::part(font-size-item) { }
font-tester::part(line-height-item) { }
font-tester::part(letter-spacing-item) { }

font-tester::part(label) { }                 /* all labels */
font-tester::part(font-size-label) { }
font-tester::part(line-height-label) { }
font-tester::part(letter-spacing-label) { }

font-tester::part(slider) { }               /* all sliders */
font-tester::part(font-size-slider) { }
font-tester::part(line-height-slider) { }
font-tester::part(letter-spacing-slider) { }

font-tester::part(value-display) { }        /* all value readouts */
font-tester::part(font-size-value) { }
font-tester::part(line-height-value) { }
font-tester::part(letter-spacing-value) { }
```

Each `control-item` is `display: flex; align-items: center` by default. To stack label above slider:

```css
font-tester::part(control-item) {
  flex-direction: column;
  align-items: flex-start;
}
```

### var-axes-controls (exported via `exportparts`)

Generic parts only — per-axis parts (e.g. `wght-control`, `wght-slider`) are dynamic and not exported.

```css
font-tester::part(axes) { }          /* the flex wrapper */
font-tester::part(axis-control) { }  /* all axis items */
font-tester::part(label) { }         /* all labels */
font-tester::part(slider) { }        /* all sliders */
font-tester::part(value-display) { } /* all value readouts */
```

Note: `label`, `slider`, and `value-display` are shared part names with `style-controls` — selectors targeting them will apply to both.

### Not reachable via `::part()`

The following components do not export their inner parts. Style them via custom properties only:

- `font-display` — use `--display-*` and `--text-*` properties
- `opentype-features` — use `--feature-*` properties

---

## Dark theme

A ready-made dark theme is available in `font-tester-dark.css`. Apply the `.ft-dark` class:

```html
<link rel="stylesheet" href="font-tester-dark.css">
<font-tester class="ft-dark">...</font-tester>
```

---

## Section Reordering

```css
/* Move display to the top */
font-tester::part(display-section) { order: -1; }

/* Explicit order for all sections */
font-tester::part(display-section)       { order: 1; }
font-tester::part(controls-section)      { order: 2; }
font-tester::part(style-controls-section){ order: 3; }
```

---

## Responsive Design

```css
font-tester {
  --display-padding: 40px;
  --container-padding: 20px;
}

@media (max-width: 768px) {
  font-tester {
    --display-padding: 20px;
    --container-padding: 12px;
  }
}
```

---

## Browser Support

- **CSS Custom Properties**: All modern browsers
- **`::part()`**: Chrome/Edge 73+, Firefox 72+, Safari 13.1+
