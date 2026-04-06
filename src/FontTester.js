import { FontTesterBase } from './base.js';

/**
 * Main font tester component that orchestrates all sub-components
 * @extends FontTesterBase
 */
export class FontTester extends FontTesterBase {
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
      features: new Map()
    };
    this._lastControls = null;
  }

  static get observedAttributes() {
    return ['font-family', 'controls'];
  }

  connectedCallback() {
    this._lastControls = this.getAttribute('controls');
    this.render();
    this.attachListeners();

    // Wait for font-display to be defined before applying defaults
    customElements.whenDefined('font-display').then(() => {
      requestAnimationFrame(() => {
        this.applyInitialDefaults();
      });
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    const handlers = {
      'font-family': () => this.updateFontFamily(newValue),
      'controls': () => this.updateControls()
    };

    handlers[name]?.();
  }

  /**
   * Apply initial default values from attributes
   * Always applies defaults directly to display (StyleControls will sync with these values)
   */
  applyInitialDefaults() {
    const display = this.query('font-display');
    if (!display) {
      console.warn('FontDisplay not found when applying defaults');
      return;
    }

    // Apply font size default
    const fontSize = this.getAttribute('font-size');
    if (fontSize) {
      display.applyStyle('fontSize', fontSize);
      this.setState({ fontSize });
    }

    // Apply line height default
    const lineHeight = this.getAttribute('line-height');
    if (lineHeight) {
      display.applyStyle('lineHeight', lineHeight);
      this.setState({ lineHeight });
    }

    // Apply letter spacing default
    const letterSpacing = this.getAttribute('letter-spacing');
    if (letterSpacing) {
      display.applyStyle('letterSpacing', letterSpacing);
      this.setState({ letterSpacing });
    }

    // Apply text align default
    const textAlign = this.getAttribute('text-align');
    if (textAlign) {
      display.applyStyle('textAlign', textAlign);
      this.setState({ textAlign });
    }

    // Apply direction default
    const direction = this.getAttribute('direction');
    if (direction) {
      display.applyStyle('direction', direction);
      this.setState({ direction });
    }

    // Set initial text if sample-text-selector isn't rendered (e.g. no text-controls)
    if (!this.query('sample-text-selector')) {
      const firstSample = this.querySelector('sample-text');
      if (firstSample) {
        const text = firstSample.textContent.trim();
        display.setText(text);
        this.setState({ text });
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
        opentype: true,
        varAxes: true
      };
    }

    const controls = controlsAttr.split(',').map(s => s.trim());

    return {
      textControls: controls.includes('text-controls'),
      styleControls: controls.filter(c =>
        ['font-size', 'line-height', 'letter-spacing'].includes(c)
      ),
      fontStyle: controls.includes('font-style'),
      opentype: controls.includes('opentype'),
      varAxes: controls.includes('var-axes')
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
        }

        .container {
          display: flex;
          flex-direction: var(--container-direction, column);
          flex-wrap: wrap;
          max-width: var(--container-max-width, 1200px);
          margin: 0 auto;
          padding: var(--container-padding, 20px);
        }

        .section {
          flex: 1;
          margin-bottom: var(--section-gap, 30px);
          position: relative;
          z-index: 1;
        }

        [part="display-section"] { z-index: 0; }
        [part="controls-section"] { z-index: 2; }

        [part="style-controls-section"] {
          display: flex;
          flex-direction: column;
        }

        .controls-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: var(--control-gap, 10px);
        }

        .section:empty {
          display: none;
        }

        .hidden {
          display: none;
        }

      </style>

      <div class="container">
        ${(enabled.textControls || enabled.fontStyle || enabled.opentype) ? `
          <div class="section controls-row" part="controls-section">
            ${enabled.textControls ? `
              <text-controls part="text-controls"
                exportparts="button, uppercase-button, radio-group, direction-group, alignment-group, ltr-button, rtl-button, align-left-button, align-center-button, align-right-button">
              </text-controls>
              <sample-text-selector part="sample-text-selector" exportparts="select: sample-select"></sample-text-selector>
            ` : ''}
            ${enabled.fontStyle ? `<font-style-selector part="font-style-selector" exportparts="wrapper: style-wrapper, label: style-label, select: style-select"></font-style-selector>` : ''}
            ${enabled.opentype ? `<opentype-features part="opentype-features" exportparts="button, features-button, features-panel, features-list, feature-item, feature-switch"></opentype-features>` : ''}
          </div>
        ` : ''}

        ${enabled.varAxes ? `
          <div class="section" part="var-axes-section">
            <var-axes-controls part="var-axes-controls" exportparts="axes, axis-control, label, slider, value-display"></var-axes-controls>
          </div>
        ` : ''}

        ${enabled.styleControls.length > 0 ? `
          <div class="section" part="style-controls-section">
            <style-controls
              exportparts="controls, control-item, font-size-item, line-height-item, letter-spacing-item, label, font-size-label, line-height-label, letter-spacing-label, slider, font-size-slider, line-height-slider, letter-spacing-slider, value-display, font-size-value, line-height-value, letter-spacing-value"
              show="${enabled.styleControls.join(', ')}"
              ${this.hasAttribute('font-size') ? `font-size="${this.sanitizeHTML(this.getAttribute('font-size'))}"` : ''}
              ${this.hasAttribute('line-height') ? `line-height="${this.sanitizeHTML(this.getAttribute('line-height'))}"` : ''}
              ${this.hasAttribute('letter-spacing') ? `letter-spacing="${this.sanitizeHTML(this.getAttribute('letter-spacing'))}"` : ''}
            ></style-controls>
          </div>
        ` : ''}

        <div class="section" part="display-section">
          <font-display font-family="${fontFamily}"${this.hasAttribute('fit-width') ? ` fit-width="${this.sanitizeHTML(this.getAttribute('fit-width') || '')}"` : ''}></font-display>
        </div>

      </div>
    `;
  }

  attachListeners() {
    const display = this.query('font-display');
    if (!display) return;

    // Handle text controls
    const textTransformToggleHandler = (e) => {
      const transformValue = e.detail.uppercase ? 'uppercase' : 'none';
      display.applyStyle('textTransform', transformValue);
      this.setState({ textTransform: transformValue });
    };
    this.addTrackedListener(this.shadowRoot, 'text-transform-toggle', textTransformToggleHandler);

    const directionChangeHandler = (e) => {
      display.applyStyle('direction', e.detail.direction);
      this.setState({ direction: e.detail.direction });
    };
    this.addTrackedListener(this.shadowRoot, 'direction-change', directionChangeHandler);

    const alignChangeHandler = (e) => {
      display.applyStyle('textAlign', e.detail.align);
      this.setState({ textAlign: e.detail.align });
    };
    this.addTrackedListener(this.shadowRoot, 'align-change', alignChangeHandler);

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

    // Sync font-size slider when fit-width recalculates
    const fitWidthHandler = (e) => {
      this.query('style-controls')?.syncFontSize(e.detail.fontSize);
    };
    this.addTrackedListener(this.shadowRoot, 'fit-width-applied', fitWidthHandler);

    // Handle OpenType features
    const featuresChangeHandler = (e) => {
      display.applyStyle('fontFeatureSettings', e.detail.settings);
      this.setState({ fontFeatureSettings: e.detail.settings });
    };
    this.addTrackedListener(this.shadowRoot, 'features-change', featuresChangeHandler);

  }
}
