import { FontTesterBase } from '../base.js';

/**
 * Component for selecting font style/weight variants
 * @extends FontTesterBase
 */
export class FontStyleSelector extends FontTesterBase {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.styles = [];
    this.fontTester = null;
  }

  connectedCallback() {
    this.collectStyles();
    this.render();
    this.attachListeners();
  }

  /**
   * Collect font style definitions from parent font-tester
   */
  collectStyles() {
    // Traverse up shadow DOM boundaries to find font-tester
    let node = this.getRootNode();
    let fontTester = null;

    while (node) {
      if (node.host) {
        if (node.host.tagName === 'FONT-TESTER') {
          fontTester = node.host;
          break;
        }
        node = node.host.getRootNode();
      } else {
        break;
      }
    }

    // Store reference to font-tester
    this.fontTester = fontTester;

    // Collect font-style elements from font-tester's light DOM
    if (fontTester) {
      const styleElements = fontTester.querySelectorAll('font-style');

      if (styleElements.length > 0) {
        styleElements.forEach(el => {
          const name = el.getAttribute('name');
          const weight = el.getAttribute('weight') || '400';
          const style = el.getAttribute('style') || 'normal';
          const family = el.getAttribute('family');
          const isDefault = el.hasAttribute('default');

          if (name) {
            this.styles.push({
              name: name.trim(),
              weight: weight.trim(),
              style: style.trim(),
              family: family ? family.trim() : null,
              default: isDefault
            });
          }
        });
      }
    }

    // If no styles defined, component won't render
  }

  /**
   * Determine which style should be selected based on font-tester's font-family attribute
   */
  getSelectedStyle() {
    if (!this.fontTester) return this.styles[0];

    const fontFamily = this.fontTester.getAttribute('font-family')?.replace(/^['"]|['"]$/g, '');
    
    if (fontFamily) {
      const matchingStyle = this.styles.find(s => s.family === fontFamily);
      if (matchingStyle) return matchingStyle;
    }

    return this.styles.find(s => s.default) || this.styles[0];
  }

  render() {
    // Don't render if no styles available
    if (this.styles.length === 0) {
      this.shadowRoot.innerHTML = '';
      return;
    }

    const selectedStyle = this.getSelectedStyle();

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          --select-bg: white;
          --select-border: #e0e0e0;
          --select-border-width: 1px;
          --select-border-hover: #333;
          --select-border-radius: 4px;
          --select-padding: 8px 12px;
          --select-font-family: inherit;
          --select-font-size: 13px;
          --select-arrow: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
          --select-arrow-position: right 12px center;
        }

        .control-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        label {
          font-size: 13px;
          font-weight: 500;
          color: #333;
        }

        select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          padding: var(--select-padding);
          padding-right: 36px;
          border: var(--select-border-width) solid var(--select-border);
          border-radius: var(--select-border-radius);
          background: var(--select-bg);
          background-image: var(--select-arrow);
          background-repeat: no-repeat;
          background-position: var(--select-arrow-position);
          font-family: var(--select-font-family);
          font-size: var(--select-font-size);
          cursor: pointer;
          min-width: 150px;
        }

        select:hover {
          border-color: var(--select-border-hover);
        }

        select:focus {
          outline: 2px solid var(--select-border-hover);
          outline-offset: 2px;
        }
      </style>

      <div class="control-wrapper" part="wrapper">
        <label for="fontStyleSelect" part="label">${this.t('fontStyleSelector.label', 'Style')}</label>
        <select id="fontStyleSelect" part="select" aria-label="${this.t('fontStyleSelector.ariaLabel', 'Select font style')}">
          ${this.styles.map(style => {
            const isSelected = style === selectedStyle;
            return `
            <option value="${style.weight},${style.style},${style.family || ''}" ${isSelected ? 'selected' : ''}>
              ${this.sanitizeHTML(style.name)}
            </option>
            `;
          }).join('')}
        </select>
      </div>
    `;
  }

  attachListeners() {
    const select = this.query('#fontStyleSelect');
    if (select) {
      const handler = (e) => {
        const [weight, style, family] = e.target.value.split(',');

        // Emit font-family change first if family is specified
        if (family) {
          this.emit('style-change', {
            property: 'fontFamily',
            value: family
          });
        }

        this.emit('style-change', {
          property: 'fontWeight',
          value: weight
        });
        this.emit('style-change', {
          property: 'fontStyle',
          value: style
        });
      };
      this.addTrackedListener(select, 'change', handler);

      // Don't emit initial style - let font-loader handle it when tester enters viewport
      // This prevents fonts from loading before they're needed
    }
  }
}
