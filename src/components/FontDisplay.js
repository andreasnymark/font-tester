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

  static get observedAttributes() {
    return ['font-family', 'fit-width'];
  }

  connectedCallback() {
    this.render();
    if (this.hasAttribute('fit-width')) {
      document.fonts.ready.then(() => requestAnimationFrame(() => this.recalcFitWidth()));
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'font-family') {
      this.style.setProperty('--display-font-family', newValue || 'system-ui');
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .display-area {
          background: var(--display-bg, #ffffff);
          border: var(--display-border-width, 1px) solid var(--display-border-color, #e0e0e0);
          border-radius: var(--display-border-radius, 8px);
          padding: var(--display-padding, 40px);
          min-height: var(--display-min-height, 200px);
          position: relative;
        }

        .display-text {
          font-family: var(--display-font-family, system-ui);
          font-size: var(--text-font-size, 48px);
          font-weight: var(--text-font-weight, 400);
          line-height: var(--text-line-height, 1.4);
          letter-spacing: var(--text-letter-spacing, 0em);
          color: var(--text-color, #000000);
          outline: none;
          word-break: break-all;
          white-space: pre-wrap;
          font-feature-settings: normal;
          text-box-trim: both;
          text-box-edge: cap alphabetic;
        }

:host(.loading) .display-area::after {
          content: 'Loading font...';
          position: absolute;
          top: 10px;
          right: 10px;
          font-size: 12px;
          color: var(--loading-color, #999);
        }

        :host(.error) .display-area::after {
          content: 'Font loading failed';
          position: absolute;
          top: 10px;
          right: 10px;
          font-size: 12px;
          color: var(--error-color, #f00);
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      </style>

      <div class="display-area" part="display-area">
        <div class="display-text"
             part="display-text"
             contenteditable="true"
             spellcheck="false"
             role="textbox"
             aria-label="Font preview text"
             aria-multiline="true"></div>
        <div class="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>
      </div>
    `;

    // Don't set font-family here - let font-loader.js set it when in viewport
    // This prevents fonts from downloading before they're needed
    this.style.setProperty('--display-font-family', this.getAttribute('font-family') || 'system-ui');

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
   * Apply a style property to the text
   * @param {string} property - CSS property name
   * @param {string} value - CSS property value
   */
  applyStyle(property, value) {
    if (property === 'fontSize' && this._fitWidthApplied) {
      this._fitWidthDisabled = true;
    }

    const element = this.textElement;
    if (element) {
      const kebab = property.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
      element.style.setProperty(kebab, value);

      // Announce style changes to screen readers for major changes
      const announceable = ['fontSize', 'fontWeight', 'fontFamily'];
      if (announceable.includes(property)) {
        this.announceChange(`${property} changed to ${value}`);
      }
    }
  }

  /**
   * Recalculate font size to fill the display area width.
   * Called on fonts ready and after each font load when fit-width is set.
   */
  recalcFitWidth() {
    const mode = this.getAttribute('fit-width');
    if (mode === null) return;
    if (mode === 'once' && this._fitWidthDone) return;
    if (mode !== 'once' && this._fitWidthDisabled) return;
    const el = this.textElement;
    const area = this.query('.display-area');
    if (!el || !area) return;

    const cs = getComputedStyle(area);
    const containerWidth = area.clientWidth
      - parseFloat(cs.paddingLeft)
      - parseFloat(cs.paddingRight);

    el.style.display = 'inline-block';
    el.style.whiteSpace = 'nowrap';
    el.style.wordBreak = 'normal';
    const textWidth = el.getBoundingClientRect().width;
    el.style.display = '';
    el.style.whiteSpace = '';
    el.style.wordBreak = '';

    if (!textWidth || !containerWidth) return;

    const currentSize = parseFloat(getComputedStyle(el).fontSize);
    const newSize = ((containerWidth - 2) / textWidth) * currentSize;
    el.style.setProperty('font-size', newSize.toFixed(2) + 'px');
    this.emit('fit-width-applied', { fontSize: newSize });
    if (mode === 'once') this._fitWidthDone = true;
    else this._fitWidthApplied = true;
  }

  /**
   * Announce a change to screen readers
   * @param {string} message - Message to announce
   */
  announceChange(message) {
    const liveRegion = this.query('.sr-only[role="status"]');
    if (liveRegion) {
      liveRegion.textContent = message;
      // Clear after announcement
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  }
}
