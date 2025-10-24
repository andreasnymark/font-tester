# Readme

> 🚧 **Early work in progress.**

Interactive web component for testing fonts. Built around how [Fountain](https://fountain.nymarktype.co) will use it, without any dependencies. Heavy use of AI so far to lay out the groundwork. 

## What it does

- Live text preview
- Custom specimen
- Opentype features
- Adjustable size/styles/spacing (probably)
- Works as a web component

## Usage

```html
<font-tester editable="false" font-family="'nunito-extralight'" controls="text-controls,font-size,opentype,font-style,line-height">
	<font-style name="Nunito ExtraLight" family="nunito-extralight" weight="" style=""></font-style>
	<font-style name="Nunito ExtraLight Italic" family="nunito-extralightitalic" weight="" style=""></font-style>
	<font-style name="Nunito Light" family="nunito-light" weight="" style=""></font-style>
	…
	<opentype-feature code="dlig" name="Discretionary Ligatures"></opentype-feature>
	<opentype-feature code="smcp" name="Small Caps"></opentype-feature>
	<opentype-feature code="kern" name="Kerning" default></opentype-feature>
	…
	<sample-text>This is by default visible, and not in the select.</sample-text><!-- Default text, add name parameter to add in select -->
	<sample-text name="ABCabc">ABCabc</sample-text>
	<sample-text name="The Quick">The Quick Brown Fox</sample-text>
</font-tester>
```

## Roadmap

- [ ] Module imports
- [ ] Better base design for controls using slots
- [ ] CSS vars for custom design
- [ ] Simplify further, 1400 lines of code :grimacing:

## Why?

A simple way to preview and test fonts, intended for [Fountain](https://fountain.nymarktype.co), a type foundry e-commerce platform. But it’ll work anywhere. 


## License

MIT

---

*This is very much a work in progress. Things will change.*