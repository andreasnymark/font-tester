# Font Tester CSS Customization Guide

## Overview

Two methods for styling font-tester:

1. **CSS Custom Properties** — colors, sizes, spacing; set on `font-tester` and they cascade through all shadow DOM boundaries into sub-components
2. **`::part()` Selectors** — target specific shadow DOM elements for structural overrides

> **Note:** Sub-components (`font-display`, `text-controls`, etc.) live inside `font-tester`'s shadow DOM and cannot be targeted with regular CSS selectors. Set all custom properties on `font-tester` itself — they cascade inward. `::part()` selectors do not pierce nested shadow roots; target the inner component directly (e.g. `font-tester font-display::part(display-area)`, not `font-tester::part(display-area)`).

---

## CSS Custom Properties

### `font-tester`

Layout, the OpenType Features button, and the features dialog.

```css
font-tester {
  /* Layout */
  --container-max-width: 1200px;
  --container-padding: 20px;
  --section-gap: 30px;
  --divider-color: #e0e0e0;

  /* OpenType Features button */
  --btn-bg: white;
  --btn-bg-hover: #f5f5f5;
  --btn-border-color: #e0e0e0;
  --btn-border-radius: 4px;
  --btn-color: #000;
  --btn-font-size: 13px;

  /* OpenType Features dialog */
  --dialog-border-color: #e0e0e0;
  --dialog-border-radius: 8px;
  --dialog-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  --dialog-backdrop-color: rgba(0, 0, 0, 0.3);
  --dialog-header-border-color: #e0e0e0;
  --dialog-close-color: #666;
}
```

### `font-display`

The text preview area.

```css
font-tester {
  /* Display area */
  --display-bg: #ffffff;
  --display-border-color: #e0e0e0;
  --display-border-width: 1px;
  --display-border-radius: 8px;
  --display-padding: 40px;
  --display-min-height: 200px;

  /* Text */
  --text-color: #000000;
  --text-font-size: 48px;
  --text-font-weight: 400;
  --text-line-height: 1.4;
  --text-letter-spacing: 0em;

  /* Status indicators */
  --loading-color: #999;
  --error-color: #f00;
}
```

> `--display-font-family` is managed internally — do not override it.

### `text-controls`

Toggle buttons (uppercase, direction, alignment).

```css
font-tester {
  --control-bg: white;
  --control-bg-hover: #f5f5f5;
  --control-bg-active: #333;
  --control-text: #000;
  --control-text-active: #fff;
  --control-border: #e0e0e0;
  --control-border-width: 1px;
  --control-border-radius: 4px;
  --control-gap: 10px;
}
```

### `style-controls`

Font size, line height, letter spacing sliders.

```css
font-tester {
  --slider-bg: #e0e0e0;
  --slider-thumb-bg: #333;
  --label-color: #333;
  --value-color: #666;
  --control-gap: 20px;
}
```

### `sample-text-selector` and `font-style-selector`

Both dropdowns share the same `--select-*` surface.

```css
font-tester {
  --select-bg: white;
  --select-border: #e0e0e0;
  --select-border-width: 1px;
  --select-border-hover: #333;
  --select-border-radius: 4px;
  --select-padding: 8px 12px;
  --select-font-family: inherit;
  --select-font-size: 13px;
  /* Custom dropdown arrow (SVG data URL or none) */
  --select-arrow: url("data:image/svg+xml,...");
  --select-arrow-position: right 12px center;
}
```

### `opentype-features`

Feature toggles are `<button type="button" aria-pressed>` elements. Active state is driven by `aria-pressed="true"`; unsupported features use the native `disabled` attribute.

```css
font-tester {
  --feature-bg: white;
  --feature-bg-hover: #f5f5f5;
  --feature-bg-active: #333;   /* background when aria-pressed="true" */
  --feature-text: #000;
  --feature-text-active: #fff; /* text color when aria-pressed="true" */
  --feature-border: #e0e0e0;
  --feature-border-width: 1px;
  --feature-border-radius: 4px;
  --feature-gap: 12px;
  --feature-code-font-size: 11px;
  --feature-code-opacity: 0.6;
}
```

---

## `::part()` Selectors

### `font-tester` — layout sections

The container is a flex column. Use `order` to reposition sections.

```css
/* Default order: controls-section(1), style-controls-section(2), display-section(3) */
font-tester::part(controls-section) { }
font-tester::part(style-controls-section) { }
font-tester::part(display-section) { }

/* Example: move display above the sliders */
font-tester::part(display-section) { order: -1; }
```

### `font-tester` — OpenType dialog

```css
font-tester::part(features-button) { font-weight: 600; }
font-tester::part(dialog) { max-width: 800px; }
font-tester::part(dialog-header) { background: #f5f5f5; }
font-tester::part(dialog-title) { font-size: 14px; }
font-tester::part(close-button) { font-size: 18px; }
```

### `font-display`

```css
font-tester font-display::part(display-area) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid #000;
}

font-tester font-display::part(display-text) {
  font-variant-numeric: tabular-nums;
}
```

### `text-controls`

```css
font-tester text-controls::part(toolbar) { gap: 20px; }

/* All buttons */
font-tester text-controls::part(button) { font-weight: 600; }

/* Individual buttons */
font-tester text-controls::part(uppercase-button) { }
font-tester text-controls::part(ltr-button) { }
font-tester text-controls::part(rtl-button) { }
font-tester text-controls::part(align-left-button) { }
font-tester text-controls::part(align-center-button) { }
font-tester text-controls::part(align-right-button) { }

/* Radio groups */
font-tester text-controls::part(radio-group) { border-radius: 6px; overflow: hidden; }
font-tester text-controls::part(radio-button) { min-width: 50px; }
```

### `style-controls`

```css
font-tester style-controls::part(controls) { gap: 30px; }

/* All rows */
font-tester style-controls::part(control-row) { padding: 10px; }

/* Specific rows */
font-tester style-controls::part(font-size-row) { }
font-tester style-controls::part(line-height-row) { }
font-tester style-controls::part(letter-spacing-row) { }

/* Labels */
font-tester style-controls::part(label) { font-weight: 700; }
font-tester style-controls::part(font-size-label) { }
font-tester style-controls::part(line-height-label) { }
font-tester style-controls::part(letter-spacing-label) { }

/* Sliders */
font-tester style-controls::part(slider) { height: 6px; }
font-tester style-controls::part(font-size-slider) { }
font-tester style-controls::part(line-height-slider) { }
font-tester style-controls::part(letter-spacing-slider) { }

/* Value displays */
font-tester style-controls::part(value-display) { font-weight: 700; }
```

### `sample-text-selector`

```css
font-tester sample-text-selector::part(select) {
  font-size: 16px;
  border: 2px solid #333;
}
```

### `font-style-selector`

```css
font-tester font-style-selector::part(wrapper) { gap: 15px; }
font-tester font-style-selector::part(label) { font-weight: 700; }
font-tester font-style-selector::part(select) { font-size: 16px; }
```

### `opentype-features`

Each toggle is a `<button>`, so standard pseudo-classes work directly on the part:

```css
font-tester opentype-features::part(features-grid) {
  grid-template-columns: repeat(3, 1fr);
}

font-tester opentype-features::part(feature-toggle) {
  padding: 12px 16px;
}

font-tester opentype-features::part(feature-toggle):disabled {
  /* unsupported features */
}
```

---

## Complete Example: Dark Theme

```html
<style>
  .dark-theme {
    /* Display */
    --display-bg: #1a1a1a;
    --display-border-color: #333;
    --text-color: #fff;

    /* Buttons (text-controls) */
    --control-bg: #2a2a2a;
    --control-bg-hover: #3a3a3a;
    --control-bg-active: #0066cc;
    --control-text: #fff;
    --control-border: #444;

    /* Sliders */
    --slider-bg: #333;
    --slider-thumb-bg: #0066cc;
    --label-color: #ccc;
    --value-color: #999;

    /* Dropdowns */
    --select-bg: #2a2a2a;
    --select-border: #444;

    /* OpenType features */
    --feature-bg: #2a2a2a;
    --feature-bg-hover: #3a3a3a;
    --feature-bg-active: #0066cc;
    --feature-border: #444;

    /* OpenType button */
    --btn-bg: #2a2a2a;
    --btn-border-color: #444;
    --btn-color: #fff;

    /* Dialog */
    --dialog-border-color: #444;
    --dialog-close-color: #ccc;
  }

  .dark-theme font-tester font-display::part(display-area) {
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  }
</style>

<font-tester class="dark-theme">
  <!-- ... -->
</font-tester>
```

## Complete Example: Minimal Style

```html
<style>
  .minimal {
    --display-bg: transparent;
    --display-border-width: 0;
    --display-padding: 20px;
    --display-border-radius: 0;

    --control-bg: transparent;
    --control-bg-hover: rgba(0, 0, 0, 0.05);
    --control-bg-active: black;
    --control-border: black;
    --control-border-radius: 0;

    --slider-bg: #ddd;
    --slider-thumb-bg: black;
  }

  .minimal font-tester font-display::part(display-text) {
    border-bottom: 2px solid #000;
    padding-bottom: 20px;
  }
</style>

<font-tester class="minimal">
  <!-- ... -->
</font-tester>
```

## Section Reordering

The `.container` inside `font-tester` is a flex column. Use `order` on the section parts to reposition them:

```css
/* Move display to the top */
font-tester::part(display-section) { order: -1; }

/* Or set explicit order for all three */
font-tester::part(display-section)       { order: 1; }
font-tester::part(controls-section)      { order: 2; }
font-tester::part(style-controls-section){ order: 3; }
```

## Responsive Design

```css
font-tester {
  --display-padding: 40px;
}

@media (max-width: 768px) {
  font-tester {
    --display-padding: 20px;
    --container-padding: 12px;
  }
}
```

## Browser Support

- **CSS Custom Properties**: All modern browsers
- **`::part()`**: Chrome/Edge 73+, Firefox 72+, Safari 13.1+
