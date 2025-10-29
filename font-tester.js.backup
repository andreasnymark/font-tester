// ============================================
// BASE COMPONENT - Shared functionality
// ============================================

/**
 * Base component providing shared functionality for font tester components
 * @extends HTMLElement
 */
class FontTesterBase extends HTMLElement {
  constructor() {
    super();
    this._eventHandlers = new Map();
  }

  /**
   * Emits a custom event from this component
   * @param {string} eventName - The name of the event
   * @param {Object} detail - Data to pass with the event
   */
  emit(eventName, detail) {
    this.dispatchEvent(new CustomEvent(eventName, {
      detail,
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Query selector within shadow root
   * @param {string} selector - CSS selector
   * @returns {Element|null} - Found element or null
   */
  query(selector) {
    return this.shadowRoot?.querySelector(selector) || null;
  }

  /**
   * Query all elements within shadow root
   * @param {string} selector - CSS selector
   * @returns {NodeList} - Found elements
   */
  queryAll(selector) {
    return this.shadowRoot?.querySelectorAll(selector) || [];
  }

  /**
   * Debounce function calls
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} - Debounced function
   */
  debounce(func, wait) {
    if (!this._debounceTimeouts) {
      this._debounceTimeouts = new Set();
    }

    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      if (this._debounceTimeouts) {
        this._debounceTimeouts.delete(timeout);
      }
      timeout = setTimeout(() => {
        func.apply(this, args);
        if (this._debounceTimeouts) {
          this._debounceTimeouts.delete(timeout);
        }
      }, wait);
      this._debounceTimeouts.add(timeout);
    };
  }

  /**
   * Sanitize HTML string to prevent XSS
   * @param {string} str - String to sanitize
   * @returns {string} - Sanitized string
   */
  sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }

  /**
   * Add tracked event listener for cleanup
   * @param {Element} element - Element to attach listener to
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @param {Object} options - Event options
   */
  addTrackedListener(element, event, handler, options) {
    if (!element) return;

    element.addEventListener(event, handler, options);

    if (!this._eventHandlers.has(element)) {
      this._eventHandlers.set(element, []);
    }
    this._eventHandlers.get(element).push({ event, handler, options });
  }

  /**
   * Remove all tracked event listeners
   */
  removeAllListeners() {
    this._eventHandlers.forEach((handlers, element) => {
      handlers.forEach(({ event, handler, options }) => {
        element.removeEventListener(event, handler, options);
      });
    });
    this._eventHandlers.clear();
  }

  /**
   * Cleanup method called when component is removed
   */
  disconnectedCallback() {
    this.removeAllListeners();

    // Clear all debounce timeouts
    if (this._debounceTimeouts) {
      this._debounceTimeouts.forEach(timeout => clearTimeout(timeout));
      this._debounceTimeouts.clear();
    }
  }
}

// ============================================
// FONT DISPLAY - The text preview area
// ============================================

/**
 * Component for displaying and previewing font text
 * @extends FontTesterBase
 */
class FontDisplay extends FontTesterBase {
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

// ============================================
// SAMPLE TEXT SELECTOR
// ============================================

/**
 * Component for selecting predefined text samples
 * @extends FontTesterBase
 */
class SampleTextSelector extends FontTesterBase {
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
        this.initialText = sampleElements[0].textContent.trim();

        // Only add samples with name attribute to the dropdown
        sampleElements.forEach(el => {
          const name = el.getAttribute('name');
          const text = el.textContent.trim();
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
          --select-bg: white;
          --select-border: #e0e0e0;
          --select-border-hover: #333;
          --select-border-radius: 4px;
          --select-padding: 8px 12px;
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

      <select aria-label="Select sample text">
        <option value="">Sample Texts</option>
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
          e.target.value = '';
        }
      };
      this.addTrackedListener(select, 'change', handler);
    }
  }
}

// ============================================
// TEXT CONTROLS - Edit, transform text
// ============================================

/**
 * Component for text editing and transformation controls
 * @extends FontTesterBase
 */
class TextControls extends FontTesterBase {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.attachListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          --control-bg: white;
          --control-bg-hover: #f5f5f5;
          --control-bg-active: #333;
          --control-border: #e0e0e0;
          --control-border-radius: 4px;
          --control-text: #000;
          --control-text-active: #fff;
          --control-gap: 10px;
        }

        .controls {
          display: flex;
          gap: var(--control-gap);
          flex-wrap: wrap;
        }

        button {
          padding: 8px 16px;
          border: 1px solid var(--control-border);
          border-radius: var(--control-border-radius);
          background: var(--control-bg);
          color: var(--control-text);
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
        }

        button:hover:not(:disabled) {
          background: var(--control-bg-hover);
        }

        button:focus {
          outline: 2px solid var(--control-bg-active);
          outline-offset: 2px;
        }

        button.active {
          background: var(--control-bg-active);
          color: var(--control-text-active);
          border-color: var(--control-bg-active);
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      </style>

      <div class="controls" role="toolbar" aria-label="Text controls">
        <button id="editBtn" aria-pressed="false">Edit Text</button>
        <button id="uppercaseBtn">Uppercase</button>
        <button id="lowercaseBtn">Lowercase</button>
        <slot></slot>
      </div>
    `;
  }

  attachListeners() {
    const editBtn = this.query('#editBtn');
    const uppercaseBtn = this.query('#uppercaseBtn');
    const lowercaseBtn = this.query('#lowercaseBtn');

    if (editBtn) {
      const handler = (e) => {
        const btn = e.target;
        const isActive = btn.classList.toggle('active');
        btn.setAttribute('aria-pressed', isActive);
        this.emit('edit-toggle', { editing: isActive });
      };
      this.addTrackedListener(editBtn, 'click', handler);
    }

    if (uppercaseBtn) {
      const handler = () => {
        this.emit('transform', { type: 'uppercase' });
      };
      this.addTrackedListener(uppercaseBtn, 'click', handler);
    }

    if (lowercaseBtn) {
      const handler = () => {
        this.emit('transform', { type: 'lowercase' });
      };
      this.addTrackedListener(lowercaseBtn, 'click', handler);
    }
  }
}

// ============================================
// STYLE CONTROLS - Sliders for font properties
// ============================================

/**
 * Component for font style adjustment controls
 * @extends FontTesterBase
 */
class StyleControls extends FontTesterBase {
  /**
   * Default control configurations
   * @static
   */
  static DEFAULT_CONTROLS = {
    'font-size': {
      id: 'fontSize',
      label: 'Font Size',
      min: 12,
      max: 200,
      value: 48,
      step: 1,
      unit: 'px',
      property: 'fontSize'
    },
    'line-height': {
      id: 'lineHeight',
      label: 'Line Height',
      min: 0.8,
      max: 2.5,
      value: 1.4,
      step: 0.1,
      unit: '',
      property: 'lineHeight'
    },
    'letter-spacing': {
      id: 'letterSpacing',
      label: 'Letter Spacing',
      min: -0.1,
      max: 0.5,
      value: 0,
      step: 0.01,
      unit: 'em',
      property: 'letterSpacing'
    }
  };

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.availableControls = { ...StyleControls.DEFAULT_CONTROLS };
    this._lastShow = null;
  }

  static get observedAttributes() {
    return ['show'];
  }

  connectedCallback() {
    this.render();
    this.attachListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'show' && oldValue !== newValue && oldValue !== null) {
      this.updateControls();
    }
  }

  /**
   * Update controls without full re-render
   */
  updateControls() {
    const showAttr = this.getAttribute('show');

    // Skip if nothing changed
    if (this._lastShow === showAttr) return;

    this._lastShow = showAttr;
    const visibleControls = this.getVisibleControls();

    // If empty, just clear and return
    if (visibleControls.length === 0) {
      this.removeAllListeners();
      this.shadowRoot.innerHTML = '';
      return;
    }

    // Check if we have existing controls
    const existingControlsContainer = this.query('.controls');
    if (!existingControlsContainer) {
      // First render or complete rebuild needed
      this.removeAllListeners();
      this.render();
      this.attachListeners();
      return;
    }

    // Targeted update: show/hide control rows
    const allControls = Object.keys(this.availableControls);
    const visibleKeys = new Set(visibleControls.map(([key]) => key));

    allControls.forEach(key => {
      const row = this.query(`[data-control="${key}"]`);
      if (row) {
        row.style.display = visibleKeys.has(key) ? '' : 'none';
      }
    });

    // If controls don't exist, need full rebuild
    const needsRebuild = visibleControls.some(([key]) =>
      !this.query(`[data-control="${key}"]`)
    );

    if (needsRebuild) {
      this.removeAllListeners();
      this.render();
      this.attachListeners();
    }
  }

  /**
   * Get list of visible controls based on 'show' attribute
   * @returns {Array<[string, Object]>}
   */
  getVisibleControls() {
    const showAttr = this.getAttribute('show');

    // If no attribute specified, show all controls
    if (!showAttr) {
      return Object.entries(this.availableControls);
    }

    // If attribute specified, only show those controls
    const requestedControls = showAttr.split(',').map(s => s.trim());

    return Object.entries(this.availableControls)
      .filter(([key]) => requestedControls.includes(key));
  }

  render() {
    const visibleControls = this.getVisibleControls();

    // If no controls to show, don't render anything
    if (visibleControls.length === 0) {
      this.shadowRoot.innerHTML = '';
      return;
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          --control-gap: 20px;
          --label-color: #333;
          --slider-bg: #e0e0e0;
          --slider-thumb-bg: #333;
          --value-color: #666;
        }

        .controls {
          display: grid;
          gap: var(--control-gap);
        }

        .control-row {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        label {
          font-size: 13px;
          font-weight: 500;
          color: var(--label-color);
          min-width: 120px;
        }

        input[type="range"] {
          flex: 1;
          height: 4px;
          border-radius: 2px;
          background: var(--slider-bg);
          outline: none;
          -webkit-appearance: none;
        }

        input[type="range"]:focus {
          outline: 2px solid var(--slider-thumb-bg);
          outline-offset: 2px;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--slider-thumb-bg);
          cursor: pointer;
        }

        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--slider-thumb-bg);
          cursor: pointer;
          border: none;
        }

        .value-display {
          font-size: 13px;
          font-weight: 500;
          color: var(--value-color);
          min-width: 60px;
          text-align: right;
        }
      </style>

      <div class="controls">
        ${visibleControls.map(([key, control]) => `
          <div class="control-row" data-control="${key}">
            <label for="${control.id}">${this.sanitizeHTML(control.label)}</label>
            <input type="range"
                   id="${control.id}"
                   min="${control.min}"
                   max="${control.max}"
                   value="${control.value}"
                   step="${control.step}"
                   aria-label="${this.sanitizeHTML(control.label)}"
                   aria-valuemin="${control.min}"
                   aria-valuemax="${control.max}"
                   aria-valuenow="${control.value}"
                   role="slider">
            <span class="value-display"
                  id="${control.id}Value"
                  aria-live="polite">${control.value}${control.unit}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  attachListeners() {
    const visibleControls = this.getVisibleControls();

    visibleControls.forEach(([key, control]) => {
      const slider = this.query(`#${control.id}`);
      const display = this.query(`#${control.id}Value`);

      if (slider && display) {
        const handler = (e) => {
          const value = e.target.value;
          display.textContent = value + control.unit;
          slider.setAttribute('aria-valuenow', value);

          // Emit immediately for smooth updates (no debounce)
          this.emit('style-change', {
            property: control.property,
            value: value + control.unit
          });
        };

        this.addTrackedListener(slider, 'input', handler);
      }
    });
  }
}

// ============================================
// FONT STYLE SELECTOR
// ============================================

/**
 * Component for selecting font style/weight variants
 * @extends FontTesterBase
 */
class FontStyleSelector extends FontTesterBase {
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

// ============================================
// OPENTYPE FEATURES
// ============================================

/**
 * Component for OpenType feature toggles
 * @extends FontTesterBase
 */
class OpentypeFeatures extends FontTesterBase {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.features = [];
  }

  connectedCallback() {
    this.collectFeatures();
    this.detectFeatureSupport();
    this.render();
    this.attachListeners();
  }

  /**
   * Collect feature definitions from parent font-tester
   */
  collectFeatures() {
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

    // Collect opentype-feature elements from font-tester's light DOM
    if (fontTester) {
      const featureElements = fontTester.querySelectorAll('opentype-feature');

      if (featureElements.length > 0) {
        featureElements.forEach(el => {
          const code = el.getAttribute('code');
          const name = el.getAttribute('name') || code;
          const isDefault = el.hasAttribute('default');

          if (code) {
            this.features.push({
              code: code.trim(),
              name: name.trim(),
              default: isDefault
            });
          }
        });
        return;
      }
    }

    // If no features defined, component won't render (empty)
  }

  /**
   * Detect browser support for each OpenType feature
   */
  detectFeatureSupport() {
    this.features = this.features.map(feature => ({
      ...feature,
      supported: CSS.supports('font-feature-settings', `"${feature.code}"`)
    }));
  }

  render() {
    // Don't render anything if no features available
    if (this.features.length === 0) {
      this.shadowRoot.innerHTML = '';
      return;
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          --feature-bg: white;
          --feature-bg-hover: #f5f5f5;
          --feature-bg-active: #333;
          --feature-border: #e0e0e0;
          --feature-border-radius: 4px;
          --feature-text: #000;
          --feature-text-active: #fff;
          --feature-gap: 12px;
        }

        .section-title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 15px;
          color: var(--feature-text);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: var(--feature-gap);
        }

        .feature-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border: 1px solid var(--feature-border);
          border-radius: var(--feature-border-radius);
          background: var(--feature-bg);
          cursor: pointer;
          transition: all 0.2s;
          user-select: none;
        }

        .feature-toggle:hover {
          background: var(--feature-bg-hover);
        }

        .feature-toggle:focus-within {
          outline: 2px solid var(--feature-bg-active);
          outline-offset: 2px;
        }

        .feature-toggle.active {
          background: var(--feature-bg-active);
          color: var(--feature-text-active);
          border-color: var(--feature-bg-active);
        }

        .feature-toggle.unsupported {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .feature-toggle input {
          margin: 0;
          cursor: pointer;
        }

        .feature-toggle.unsupported input {
          cursor: not-allowed;
        }

        .feature-label {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }

        .feature-name {
          font-size: 13px;
          font-weight: 500;
        }

        .feature-code {
          font-size: 11px;
          opacity: 0.6;
          font-family: monospace;
        }

        .feature-toggle.active .feature-code {
          opacity: 0.8;
        }

        .feature-toggle .unsupported-badge {
          font-size: 10px;
          opacity: 0.5;
        }
      </style>

      <div>
        <div class="section-title">OpenType Features</div>
        <div class="features-grid" id="featuresGrid" role="group" aria-label="OpenType features"></div>
      </div>
    `;

    this.renderFeatures();
  }

  /**
   * Render individual feature toggles
   */
  renderFeatures() {
    const grid = this.query('#featuresGrid');
    if (!grid) return;

    this.features.forEach(feature => {
      const toggle = document.createElement('div');
      toggle.className = 'feature-toggle';
      if (feature.default) toggle.classList.add('active');
      if (feature.supported === false) toggle.classList.add('unsupported');
      toggle.setAttribute('role', 'checkbox');
      toggle.setAttribute('aria-checked', feature.default);
      toggle.setAttribute('tabindex', '0');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = feature.default;
      checkbox.dataset.code = feature.code;
      checkbox.setAttribute('aria-label', feature.name);
      checkbox.disabled = feature.supported === false;

      const label = document.createElement('div');
      label.className = 'feature-label';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'feature-name';
      nameSpan.textContent = feature.name;

      const codeSpan = document.createElement('span');
      codeSpan.className = 'feature-code';
      codeSpan.textContent = feature.code;

      label.appendChild(nameSpan);
      label.appendChild(codeSpan);

      if (feature.supported === false) {
        const badge = document.createElement('span');
        badge.className = 'unsupported-badge';
        badge.textContent = '(unsupported)';
        label.appendChild(badge);
      }

      toggle.appendChild(checkbox);
      toggle.appendChild(label);
      grid.appendChild(toggle);
    });
  }

  attachListeners() {
    const grid = this.query('#featuresGrid');
    if (!grid) return;

    const clickHandler = (e) => {
      const toggle = e.target.closest('.feature-toggle');
      if (!toggle || toggle.classList.contains('unsupported')) return;

      const checkbox = toggle.querySelector('input');
      if (!checkbox) return;

      if (e.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
      }
      toggle.classList.toggle('active', checkbox.checked);
      toggle.setAttribute('aria-checked', checkbox.checked);

      this.emitFeatureSettings();
    };

    const keyHandler = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        const toggle = e.target.closest('.feature-toggle');
        if (toggle) {
          toggle.click();
        }
      }
    };

    this.addTrackedListener(grid, 'click', clickHandler);
    this.addTrackedListener(grid, 'keydown', keyHandler);
  }

  /**
   * Emit current feature settings as CSS font-feature-settings string
   */
  emitFeatureSettings() {
    const checkboxes = this.queryAll('input[type="checkbox"]');
    const settings = Array.from(checkboxes)
      .map(cb => `"${cb.dataset.code}" ${cb.checked ? 1 : 0}`)
      .join(', ');

    this.emit('features-change', { settings });
  }
}

// ============================================
// MAIN CONTAINER - Orchestrates everything
// ============================================

/**
 * Main font tester component that orchestrates all sub-components
 * @extends FontTesterBase
 */
class FontTester extends FontTesterBase {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.state = {
      fontFamily: 'system-ui',
      fontSize: '48px',
      fontWeight: '400',
      lineHeight: '1.4',
      letterSpacing: '0em',
      text: 'The quick brown fox jumps over the lazy dog',
      features: new Map(),
      editing: false
    };
    this._lastControls = null;
  }

  static get observedAttributes() {
    return ['font-family', 'controls', 'editable'];
  }

  connectedCallback() {
    this._lastControls = this.getAttribute('controls');
    this.render();
    this.attachListeners();
    this.applyInitialEditable();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    const handlers = {
      'font-family': () => this.updateFontFamily(newValue),
      'controls': () => this.updateControls(),
      'editable': () => this.updateEditable(newValue)
    };

    handlers[name]?.();
  }

  /**
   * Apply initial editable state
   */
  applyInitialEditable() {
    const isEditable = this.hasAttribute('editable') &&
                       this.getAttribute('editable') !== 'false';

    const display = this.query('font-display');
    if (display) {
      display.setEditable(isEditable);
      this.setState({ editing: isEditable });
    }

    // Sync the Edit Text button state if it exists
    const textControls = this.query('text-controls');
    if (textControls) {
      const editBtn = textControls.shadowRoot?.querySelector('#editBtn');
      if (editBtn) {
        if (isEditable) {
          editBtn.classList.add('active');
        } else {
          editBtn.classList.remove('active');
        }
        editBtn.setAttribute('aria-pressed', isEditable);
      }
    }
  }

  /**
   * Update editable state
   * @param {string} value - New editable value
   */
  updateEditable(value) {
    const isEditable = value !== null && value !== 'false';
    const display = this.query('font-display');
    if (display) {
      display.setEditable(isEditable);
      this.setState({ editing: isEditable });
    }

    // Sync the Edit Text button state if it exists
    const textControls = this.query('text-controls');
    if (textControls) {
      const editBtn = textControls.shadowRoot?.querySelector('#editBtn');
      if (editBtn) {
        if (isEditable) {
          editBtn.classList.add('active');
        } else {
          editBtn.classList.remove('active');
        }
        editBtn.setAttribute('aria-pressed', isEditable);
      }
    }
  }

  /**
   * Update state and emit change event
   * @param {Object} updates - State updates
   */
  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.emit('state-change', this.state);
  }

  /**
   * Update font family without full re-render
   * @param {string} fontFamily - New font family
   */
  updateFontFamily(fontFamily) {
    const display = this.query('font-display');
    if (display) {
      display.setAttribute('font-family', fontFamily);
      this.setState({ fontFamily });
    }
  }

  /**
   * Update controls without full re-render
   */
  updateControls() {
    const controlsAttr = this.getAttribute('controls');

    // Skip if nothing changed
    if (this._lastControls === controlsAttr) return;

    this._lastControls = controlsAttr;

    // Full re-render needed for control changes
    this.removeAllListeners();
    this.render();
    this.attachListeners();
  }

  /**
   * Parse which features are enabled from controls attribute
   * @returns {Object} Enabled features configuration
   */
  getEnabledFeatures() {
    const controlsAttr = this.getAttribute('controls');

    // If no controls specified, show everything
    if (!controlsAttr) {
      return {
        textControls: true,
        styleControls: ['font-size', 'line-height', 'letter-spacing'],
        fontStyle: true,
        opentype: true
      };
    }

    const controls = controlsAttr.split(',').map(s => s.trim());

    return {
      textControls: controls.includes('text-controls'),
      styleControls: controls.filter(c =>
        ['font-size', 'line-height', 'letter-spacing'].includes(c)
      ),
      fontStyle: controls.includes('font-style'),
      opentype: controls.includes('opentype')
    };
  }

  render() {
    const fontFamily = this.sanitizeHTML(this.getAttribute('font-family') || 'system-ui');
    const enabled = this.getEnabledFeatures();

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: system-ui;
          --container-max-width: 1200px;
          --container-padding: 20px;
          --section-gap: 30px;
          --divider-color: #e0e0e0;
        }

        .container {
          max-width: var(--container-max-width);
          margin: 0 auto;
          padding: var(--container-padding);
        }

        .section {
          margin-bottom: var(--section-gap);
        }

        .section:empty {
          display: none;
        }

        .controls-section {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--divider-color);
        }

        .hidden {
          display: none;
        }
      </style>

      <div class="container">
        ${enabled.textControls ? `
          <div class="section">
            <text-controls>
              <sample-text-selector></sample-text-selector>
              ${enabled.fontStyle ? '<font-style-selector></font-style-selector>' : ''}
            </text-controls>
          </div>
        ` : enabled.fontStyle ? `
          <div class="section">
            <font-style-selector></font-style-selector>
          </div>
        ` : ''}

        <div class="section">
          <font-display font-family="${fontFamily}"></font-display>
        </div>

        ${enabled.styleControls.length > 0 ? `
          <div class="section">
            <style-controls show="${enabled.styleControls.join(', ')}"></style-controls>
          </div>
        ` : ''}

        ${enabled.opentype ? `
          <div class="controls-section">
            <opentype-features></opentype-features>
          </div>
        ` : ''}
      </div>
    `;
  }

  attachListeners() {
    const display = this.query('font-display');
    if (!display) return;

    // Handle text controls
    const editToggleHandler = (e) => {
      display.setEditable(e.detail.editing);
      this.setState({ editing: e.detail.editing });
    };
    this.addTrackedListener(this.shadowRoot, 'edit-toggle', editToggleHandler);

    const transformHandler = (e) => {
      const text = display.getText();
      const transformed = e.detail.type === 'uppercase'
        ? text.toUpperCase()
        : text.toLowerCase();
      display.setText(transformed);
      this.setState({ text: transformed });
    };
    this.addTrackedListener(this.shadowRoot, 'transform', transformHandler);

    // Handle sample text selection
    const sampleSelectedHandler = (e) => {
      display.setText(e.detail.text);
      this.setState({ text: e.detail.text });
    };
    this.addTrackedListener(this.shadowRoot, 'sample-selected', sampleSelectedHandler);

    // Handle style changes
    const styleChangeHandler = (e) => {
      display.applyStyle(e.detail.property, e.detail.value);
      this.setState({ [e.detail.property]: e.detail.value });
    };
    this.addTrackedListener(this.shadowRoot, 'style-change', styleChangeHandler);

    // Handle OpenType features
    const featuresChangeHandler = (e) => {
      display.applyStyle('fontFeatureSettings', e.detail.settings);
      this.setState({ fontFeatureSettings: e.detail.settings });
    };
    this.addTrackedListener(this.shadowRoot, 'features-change', featuresChangeHandler);
  }
}

// ============================================
// MARKER ELEMENTS
// ============================================

/**
 * Marker element for defining custom sample texts
 * Content is read by SampleTextSelector component
 * @extends HTMLElement
 */
class SampleText extends HTMLElement {
  // Just a marker element, content is read by SampleTextSelector
}

/**
 * Marker element for defining OpenType features
 * Attributes are read by OpentypeFeatures component
 * @extends HTMLElement
 */
class OpentypeFeature extends HTMLElement {
  // Just a marker element, attributes are read by OpentypeFeatures
}

/**
 * Marker element for defining font styles/weights
 * Attributes are read by FontStyleSelector component
 * @extends HTMLElement
 */
class FontStyle extends HTMLElement {
  // Just a marker element, attributes are read by FontStyleSelector
}

// ============================================
// REGISTER ALL COMPONENTS
// ============================================
customElements.define('font-display', FontDisplay);
customElements.define('sample-text-selector', SampleTextSelector);
customElements.define('text-controls', TextControls);
customElements.define('style-controls', StyleControls);
customElements.define('font-style-selector', FontStyleSelector);
customElements.define('opentype-features', OpentypeFeatures);
customElements.define('font-tester', FontTester);
customElements.define('sample-text', SampleText);
customElements.define('opentype-feature', OpentypeFeature);
customElements.define('font-style', FontStyle);
