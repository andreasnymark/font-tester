# Font Tester Internationalization (i18n)

## Overview

The font-tester web component now supports multiple languages through a global translations object. Translations can be loaded from either:
- **Inline JSON** in a `<script>` tag (no HTTP request)
- **External JSON file** (loaded via fetch)

Translations can be controlled per-component using the `lang` attribute.

## How It Works

1. **Global Translations**: Translations are defined once in a `<script id="font-tester-i18n">` tag (inline or external)
2. **Language Detection**: Each font-tester checks its own `lang` attribute, falling back to `document.lang` or `'en'`
3. **Component Translation**: All child components automatically use the parent font-tester's language
4. **Dot Notation**: Translation keys use dot notation (e.g., `textControls.editButton`)

## Setup Options

You can choose between inline JSON or external file:

### Option 1: Inline JSON (Recommended for small projects)

**Pros**: No HTTP request, works immediately, simple setup
**Cons**: Larger HTML file, not cacheable separately

Add a script tag with `id="font-tester-i18n"` and `type="application/json"`:

```html
<script id="font-tester-i18n" type="application/json">
{
  "en": {
    "textControls": {
      "uppercaseButton": "Uppercase"
    }
  },
  "sv": {
    "textControls": {
      "uppercaseButton": "Versaler"
    }
  }
}
</script>

<!-- Font tester will load translations automatically -->
<font-tester lang="en">...</font-tester>
```

### Option 2: External JSON File (Recommended for production)

**Pros**: Cacheable, smaller HTML, easier to manage translations
**Cons**: Requires HTTP request, needs initialization

**Step 1**: Create translation file (e.g., `/translations/font-tester-i18n.json`)

```json
{
  "en": {
    "textControls": { ... }
  },
  "sv": {
    "textControls": { ... }
  }
}
```

**Step 2**: Reference external file with `data-src` attribute

```html
<script id="font-tester-i18n" type="application/json" data-src="/translations/font-tester-i18n.json"></script>
```

**Step 3**: Initialize translations before font-tester renders

```html
<script type="module">
  import { initTranslations } from '/assets/scripts/font-tester.js';

  // Initialize translations from external file
  await initTranslations();

  // Now font-testers will render with proper translations
</script>

<font-tester lang="en">...</font-tester>
```

## Language Configuration

Use the `lang` attribute on the `<font-tester>` element:

```html
<!-- English -->
<font-tester lang="en">...</font-tester>

<!-- Swedish -->
<font-tester lang="sv">...</font-tester>
```

### Multiple Instances

You can have multiple font-testers with different languages on the same page (translations load once, used by all):

```html
<font-tester lang="en"><!-- English controls --></font-tester>
<font-tester lang="sv"><!-- Swedish controls --></font-tester>
<font-tester lang="de"><!-- German controls (if you add German translations) --></font-tester>
```

## Translation Keys Reference

### textControls

Controls for text editing, case, direction, and alignment:

```json
{
  "textControls": {
    "toolbarLabel": "Text controls",
    "uppercaseButton": "Uppercase",
    "uppercaseAriaLabel": "Toggle uppercase text",
    "directionGroupLabel": "Text direction",
    "ltrButton": "LTR",
    "ltrAriaLabel": "Left to right",
    "rtlButton": "RTL",
    "rtlAriaLabel": "Right to left",
    "alignmentGroupLabel": "Text alignment",
    "alignLeftButton": "Left",
    "alignLeftAriaLabel": "Align text left",
    "alignCenterButton": "Center",
    "alignCenterAriaLabel": "Align text center",
    "alignRightButton": "Right",
    "alignRightAriaLabel": "Align text right"
  }
}
```

### fontTester

Main component labels and OpenType features dialog:

```json
{
  "fontTester": {
    "openFeaturesButton": "OpenType Features",
    "openFeaturesAriaLabel": "Open OpenType features dialog",
    "dialogTitle": "OpenType Features",
    "closeDialogAriaLabel": "Close dialog"
  }
}
```

### sampleTextSelector

Sample text dropdown labels:

```json
{
  "sampleTextSelector": {
    "ariaLabel": "Select sample text",
    "placeholder": "Sample Texts"
  }
}
```

### fontStyleSelector

Font style (weight/italic) selector:

```json
{
  "fontStyleSelector": {
    "label": "Style",
    "ariaLabel": "Select font style"
  }
}
```

### styleControls

Typography control sliders:

```json
{
  "styleControls": {
    "fontSizeLabel": "Font Size",
    "lineHeightLabel": "Line Height",
    "letterSpacingLabel": "Letter Spacing"
  }
}
```

## Language Fallback

If a translation is not found:

1. Tries the specified language (e.g., `"sv"`)
2. Falls back to English (`"en"`)
3. Falls back to the hardcoded default in the component

## Adding New Languages

To add a new language (e.g., German):

1. Add a new language object to your translations script:

```json
{
  "en": { ... },
  "sv": { ... },
  "de": {
    "textControls": {
      "uppercaseButton": "Großbuchstaben"
    }
  }
}
```

2. Use it in your HTML:

```html
<font-tester lang="de">
  <!-- ... -->
</font-tester>
```

## Complete Example

See `font-tester-i18n-example.html` and `font-tester-i18n-example.json` for complete working examples with English and Swedish translations.

## Translation Structure

The full translation object structure is organized by component:

```
{
  "languageCode": {
    "componentName": {
      "elementKey": "Translated Text"
    }
  }
}
```

## Best Practices

### When to Use Inline JSON
- **Small projects** with 1-2 languages
- **Development/testing** environments
- When you want **zero latency** (no HTTP request)

### When to Use External File
- **Production** environments
- **Multiple languages** (3+)
- When translations are **frequently updated**
- When you want **browser caching** of translations
- When translations are **shared across pages**

## Important Notes

### Loading Behavior
- **Inline JSON**: Loaded synchronously, works immediately
- **External file**: Loaded asynchronously, requires `await initTranslations()`

### Caching
- External translation files can be cached by the browser
- Use cache-control headers on your JSON file for better performance:
  ```
  Cache-Control: public, max-age=3600
  ```

### Translation Keys
- All translation keys support dot notation (e.g., `t('textControls.editButton')`)
- ARIA labels are separate keys to allow for more descriptive screen reader text
- Missing translations won't break the component—they fall back to English or defaults
- The `lang` attribute is checked on every render, so you can dynamically change languages

### Performance
- Translations load once per page (shared across all font-tester instances)
- Inline: ~0ms load time
- External: Depends on network (typically 10-50ms on localhost, 50-200ms in production)
