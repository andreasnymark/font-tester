import { FontTesterBase } from '../base.js';

/**
 * Component for selecting predefined text samples
 * @extends FontTesterBase
 */
export class SampleTextSelector extends FontTesterBase {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.samples = new Map();
    this.initialText = null;
    this._rafId = null;
  }

  connectedCallback() {
    this.collectSamples();
    this.render();
    this.attachListeners();
    // Delay initial text setting to ensure parent listeners are attached
    this._rafId = requestAnimationFrame(() => {
      this.setInitialText();
      this._rafId = null;
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Cancel pending animation frame
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  /**
   * Process text to convert literal \n into actual newlines
   * @param {string} text - Raw text from HTML
   * @returns {string} Processed text with actual newlines
   */
  processText(text) {
    return text.replace(/\\n/g, '\n');
  }

  /**
   * Collect sample texts from parent or use defaults
   */
  collectSamples() {
    // Traverse up shadow DOM boundaries to find font-tester
    let node = this.getRootNode();
    let fontTester = null;

    // Keep going up through shadow roots until we find font-tester
    while (node) {
      if (node.host) {
        // Check if the host is font-tester
        if (node.host.tagName === 'FONT-TESTER') {
          fontTester = node.host;
          break;
        }
        // Otherwise continue up
        node = node.host.getRootNode();
      } else {
        break;
      }
    }

    // Collect sample-text elements from font-tester's light DOM
    if (fontTester) {
      const sampleElements = fontTester.querySelectorAll('sample-text');

      if (sampleElements.length > 0) {
        // First sample-text becomes the initial text (whether it has name or not)
        this.initialText = this.processText(sampleElements[0].textContent.trim());

        // Only add samples with name attribute to the dropdown
        sampleElements.forEach(el => {
          const name = el.getAttribute('name');
          const text = this.processText(el.textContent.trim());
          if (name && text) {
            this.samples.set(name, text);
          }
        });

        // Don't add defaults if custom samples exist
        return;
      }
    }

    // Add default samples if none provided
    this.samples.set('Pangram', 'The quick brown fox jumps over the lazy dog');
    this.samples.set('Alphabet', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ\nabcdefghijklmnopqrstuvwxyz');
    this.samples.set('Numbers', '0123456789 1/2 3/4');
    this.samples.set('Ligatures', 'fi fl ff ffi ffl fb fh fj fk ft');

    // Set initial text to first default
    this.initialText = 'The quick brown fox jumps over the lazy dog';
  }

  /**
   * Set the initial text in the font display
   */
  setInitialText() {
    if (this.initialText) {
      this.emit('sample-selected', { name: 'initial', text: this.initialText });

      // If the initial text matches one of the named samples, select it in the dropdown
      const select = this.query('select');
      if (select) {
        for (const [name, text] of this.samples.entries()) {
          if (text === this.initialText) {
            select.value = name;
            break;
          }
        }
      }
    }
  }

  render() {
    // Don't render if no samples in dropdown
    if (this.samples.size === 0) {
      this.shadowRoot.innerHTML = '';
      return;
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }

        select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          padding: var(--select-padding, 8px 12px);
          padding-right: 36px;
          border: var(--select-border-width, 1px) solid var(--select-border, #e0e0e0);
          border-radius: var(--select-border-radius, 4px);
          background: var(--select-bg, white);
          background-image: var(--select-arrow, url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E"));
          background-repeat: no-repeat;
          background-position: var(--select-arrow-position, right 12px center);
          font-family: var(--select-font-family, inherit);
          font-size: var(--select-font-size, 13px);
          cursor: pointer;
          min-width: 150px;
        }

        select:hover {
          border-color: var(--select-border-hover, #333);
        }

        select:focus {
          outline: 2px solid var(--select-border-hover, #333);
          outline-offset: 2px;
        }
      </style>

      <select part="select" aria-label="${this.t('sampleTextSelector.ariaLabel', 'Select sample text')}">
        <option value="">${this.t('sampleTextSelector.placeholder', 'Sample Texts')}</option>
        ${Array.from(this.samples.entries()).map(([name, text]) =>
          `<option value="${this.sanitizeHTML(name)}">${this.sanitizeHTML(name)}</option>`
        ).join('')}
      </select>
    `;
  }

  attachListeners() {
    const select = this.query('select');
    if (select) {
      const handler = (e) => {
        if (e.target.value) {
          const text = this.samples.get(e.target.value);
          this.emit('sample-selected', { name: e.target.value, text });
          // Keep the selected value to show which text is active
        }
      };
      this.addTrackedListener(select, 'change', handler);
    }
  }
}
