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

  render() {
    // Don't render if no styles available
    if (this.styles.length === 0) {
      this.shadowRoot.innerHTML = '';
      return;
    }

    const defaultStyle = this.styles.find(s => s.default) || this.styles[0];

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          --select-bg: white;
          --select-border: #e0e0e0;
          --select-border-hover: #333;
          --select-border-radius: 4px;
          --select-padding: 8px 12px;
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
          padding: var(--select-padding);
          border: 1px solid var(--select-border);
          border-radius: var(--select-border-radius);
          background: var(--select-bg);
          font-size: 13px;
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

      <div class="control-wrapper">
        <label for="fontStyleSelect">Style</label>
        <select id="fontStyleSelect" aria-label="Select font style">
          ${this.styles.map(style => `
            <option value="${style.weight},${style.style},${style.family || ''}" ${style.default ? 'selected' : ''}>
              ${this.sanitizeHTML(style.name)}
            </option>
          `).join('')}
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

      // Emit initial style
      if (select.value) {
        const [weight, style, family] = select.value.split(',');
        requestAnimationFrame(() => {
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
        });
      }
    }
  }
}
