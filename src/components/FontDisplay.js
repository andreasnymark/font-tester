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
    return ['font-family'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    this.style.setProperty('--display-font-family', newValue || 'system-ui');
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          /* Display area styling */
          --display-bg: #ffffff;
          --display-border-color: #e0e0e0;
          --display-border-width: 1px;
          --display-border-radius: 8px;
          --display-padding: 40px;
          --display-min-height: 200px;

          /* Text styling */
          --text-color: #000000;
          --text-font-size: 48px;
          --text-font-weight: 400;
          --text-line-height: 1.4;
          --text-letter-spacing: 0em;
          --display-font-family: system-ui;

          /* Status states */
          --loading-color: #999;
          --error-color: #f00;
        }

        .display-area {
          background: var(--display-bg);
          border: var(--display-border-width) solid var(--display-border-color);
          border-radius: var(--display-border-radius);
          padding: var(--display-padding);
          min-height: var(--display-min-height);
          position: relative;
        }

        .display-text {
          font-family: var(--display-font-family);
          font-size: var(--text-font-size);
          font-weight: var(--text-font-weight);
          line-height: var(--text-line-height);
          letter-spacing: var(--text-letter-spacing);
          color: var(--text-color);
          outline: none;
          word-wrap: break-word;
          white-space: pre-wrap;
          font-feature-settings: normal;
        }

:host(.loading) .display-area::after {
          content: 'Loading font...';
          position: absolute;
          top: 10px;
          right: 10px;
          font-size: 12px;
          color: var(--loading-color);
        }

        :host(.error) .display-area::after {
          content: 'Font loading failed';
          position: absolute;
          top: 10px;
          right: 10px;
          font-size: 12px;
          color: var(--error-color);
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
    const element = this.textElement;
    if (element) {
      element.style[property] = value;

      // Announce style changes to screen readers for major changes
      const announceable = ['fontSize', 'fontWeight', 'fontFamily'];
      if (announceable.includes(property)) {
        this.announceChange(`${property} changed to ${value}`);
      }
    }
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
