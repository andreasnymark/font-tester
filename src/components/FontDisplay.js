import { FontTesterBase } from '../base.js';

/**
 * Component for displaying and previewing font text
 * @extends FontTesterBase
 */
export class FontDisplay extends FontTesterBase {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.loadFont();
  }

  /**
   * Load the font and show loading state
   * @returns {Promise<void>}
   */
  async loadFont() {
    const fontFamily = this.getAttribute('font-family') || 'system-ui';

    try {
      this.classList.add('loading');
      await document.fonts.load(`16px "${fontFamily}"`);
      this.classList.add('loaded');
      this.classList.remove('loading');
    } catch (err) {
      console.error('Font loading failed:', err);
      this.classList.add('error');
      this.classList.remove('loading');
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          --display-bg: #ffffff;
          --display-border: #e0e0e0;
          --display-border-radius: 8px;
          --display-padding: 40px;
          --text-color: #000000;
          --edit-border: #ccc;
          --edit-border-active: #333;
          --font-family: system-ui;
        }

        .display-area {
          background: var(--display-bg);
          border: 1px solid var(--display-border);
          border-radius: var(--display-border-radius);
          padding: var(--display-padding);
          min-height: 200px;
          position: relative;
        }

        .display-text {
          font-family: var(--font-family);
          font-size: 48px;
          font-weight: 400;
          line-height: 1.4;
          letter-spacing: 0em;
          color: var(--text-color);
          outline: none;
          word-wrap: break-word;
          font-feature-settings: normal;
        }

        .display-text[contenteditable="true"] {
          border: 2px dashed var(--edit-border);
          padding: 10px;
          border-radius: 4px;
        }

        .display-text[contenteditable="true"]:focus {
          border-color: var(--edit-border-active);
        }

        :host(.loading) .display-area::after {
          content: 'Loading font...';
          position: absolute;
          top: 10px;
          right: 10px;
          font-size: 12px;
          color: #999;
        }

        :host(.error) .display-area::after {
          content: 'Font loading failed';
          position: absolute;
          top: 10px;
          right: 10px;
          font-size: 12px;
          color: #f00;
        }
      </style>

      <div class="display-area">
        <div class="display-text"
             contenteditable="false"
             spellcheck="false"
             role="textbox"
             aria-label="Font preview text"
             aria-multiline="true"></div>
      </div>
    `;

    // Set font family via CSS custom property (safe from injection)
    const fontFamily = this.getAttribute('font-family') || 'system-ui';
    this.style.setProperty('--font-family', fontFamily);

    // Don't set any text here - let SampleTextSelector set the initial text
  }

  /**
   * Get the text display element
   * @returns {Element|null}
   * @throws {Error} If text element not found
   */
  get textElement() {
    const element = this.query('.display-text');
    if (!element) {
      console.error('Text element not found in FontDisplay');
    }
    return element;
  }

  /**
   * Set the display text
   * @param {string} text - Text to display
   */
  setText(text) {
    const element = this.textElement;
    if (element) {
      element.textContent = text;
      this.emit('text-changed', { text });
    }
  }

  /**
   * Get the current display text
   * @returns {string}
   */
  getText() {
    return this.textElement?.textContent || '';
  }

  /**
   * Toggle editable state
   * @param {boolean} editable - Whether text should be editable
   */
  setEditable(editable) {
    const element = this.textElement;
    if (element) {
      element.setAttribute('contenteditable', editable);
      element.setAttribute('aria-readonly', !editable);
    }
  }

  /**
   * Apply a style property to the text
   * @param {string} property - CSS property name
   * @param {string} value - CSS property value
   */
  applyStyle(property, value) {
    const element = this.textElement;
    if (element) {
      element.style[property] = value;
    }
  }
}
