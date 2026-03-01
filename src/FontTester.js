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

          /* Button (OpenType features trigger) */
          --btn-bg: white;
          --btn-bg-hover: #f5f5f5;
          --btn-border-color: #e0e0e0;
          --btn-border-radius: 4px;
          --btn-color: #000;
          --btn-font-size: 13px;

          /* Dialog */
          --dialog-border-color: #e0e0e0;
          --dialog-border-radius: 8px;
          --dialog-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          --dialog-backdrop-color: rgba(0, 0, 0, 0.3);
          --dialog-header-border-color: #e0e0e0;
          --dialog-close-color: #666;
        }

        .container {
          display: flex;
          flex-direction: column;
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

        .hidden {
          display: none;
        }

        .features-btn {
          padding: 8px 16px;
          border: 1px solid var(--btn-border-color);
          border-radius: var(--btn-border-radius);
          background: var(--btn-bg);
          color: var(--btn-color);
          cursor: pointer;
          font-size: var(--btn-font-size);
          transition: all 0.2s;
        }

        .features-btn:hover {
          background: var(--btn-bg-hover);
        }

        .features-btn:focus {
          outline: 2px solid var(--btn-border-color);
          outline-offset: 2px;
        }

        dialog {
          border: 1px solid var(--dialog-border-color);
          border-radius: var(--dialog-border-radius);
          padding: 0;
          max-width: 600px;
          box-shadow: var(--dialog-shadow);
          z-index: 1000;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          margin: 0;
        }

        dialog::backdrop {
          background: var(--dialog-backdrop-color);
          z-index: 999;
        }

        .dialog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid var(--dialog-header-border-color);
        }

        .dialog-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          padding: 4px 8px;
          color: var(--dialog-close-color);
          border-radius: 4px;
        }

        .close-btn:hover {
          background: var(--btn-bg-hover);
          color: var(--btn-color);
        }

        .dialog-content {
          padding: 20px;
        }
      </style>

      <div class="container">
        ${enabled.textControls ? `
          <div class="section" part="controls-section">
            <text-controls>
              <sample-text-selector></sample-text-selector>
              ${enabled.fontStyle ? '<font-style-selector></font-style-selector>' : ''}
              ${enabled.opentype ? `<button id="openFeaturesBtn" type="button" class="features-btn" part="features-button" aria-label="${this.sanitizeHTML(this.t('fontTester.openFeaturesAriaLabel', 'Open OpenType features dialog'))}">${this.sanitizeHTML(this.t('fontTester.openFeaturesButton', 'OpenType Features'))}</button>` : ''}
            </text-controls>
          </div>
        ` : enabled.fontStyle ? `
          <div class="section" part="controls-section">
            <font-style-selector></font-style-selector>
            ${enabled.opentype ? `<button id="openFeaturesBtn" type="button" class="features-btn" part="features-button" aria-label="${this.sanitizeHTML(this.t('fontTester.openFeaturesAriaLabel', 'Open OpenType features dialog'))}">${this.sanitizeHTML(this.t('fontTester.openFeaturesButton', 'OpenType Features'))}</button>` : ''}
          </div>
        ` : enabled.opentype ? `
          <div class="section" part="controls-section">
            <button id="openFeaturesBtn" type="button" class="features-btn" part="features-button" aria-label="${this.sanitizeHTML(this.t('fontTester.openFeaturesAriaLabel', 'Open OpenType features dialog'))}">${this.sanitizeHTML(this.t('fontTester.openFeaturesButton', 'OpenType Features'))}</button>
          </div>
        ` : ''}

        ${enabled.styleControls.length > 0 ? `
          <div class="section" part="style-controls-section">
            <style-controls
              show="${enabled.styleControls.join(', ')}"
              ${this.hasAttribute('font-size') ? `font-size="${this.sanitizeHTML(this.getAttribute('font-size'))}"` : ''}
              ${this.hasAttribute('line-height') ? `line-height="${this.sanitizeHTML(this.getAttribute('line-height'))}"` : ''}
              ${this.hasAttribute('letter-spacing') ? `letter-spacing="${this.sanitizeHTML(this.getAttribute('letter-spacing'))}"` : ''}
            ></style-controls>
          </div>
        ` : ''}

        <div class="section" part="display-section">
          <font-display font-family="${fontFamily}"></font-display>
        </div>

        ${enabled.opentype ? `
          <dialog id="featuresDialog" part="dialog" aria-labelledby="dialogTitle">
            <div class="dialog-header" part="dialog-header">
              <h3 id="dialogTitle" part="dialog-title">${this.sanitizeHTML(this.t('fontTester.dialogTitle', 'OpenType Features'))}</h3>
              <button id="closeFeaturesBtn" type="button" class="close-btn" part="close-button" aria-label="${this.sanitizeHTML(this.t('fontTester.closeDialogAriaLabel', 'Close dialog'))}">✕</button>
            </div>
            <div class="dialog-content">
              <opentype-features></opentype-features>
            </div>
          </dialog>
        ` : ''}
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

    // Handle OpenType features
    const featuresChangeHandler = (e) => {
      display.applyStyle('fontFeatureSettings', e.detail.settings);
      this.setState({ fontFeatureSettings: e.detail.settings });
    };
    this.addTrackedListener(this.shadowRoot, 'features-change', featuresChangeHandler);

    // Handle OpenType features dialog
    const openFeaturesBtn = this.query('#openFeaturesBtn');
    const closeFeaturesBtn = this.query('#closeFeaturesBtn');
    const featuresDialog = this.query('#featuresDialog');

    if (openFeaturesBtn && featuresDialog) {
      const openHandler = () => {
        featuresDialog.show(); // Use show() for modeless dialog

        // Focus the close button for keyboard accessibility
        requestAnimationFrame(() => {
          closeFeaturesBtn?.focus();
        });
      };
      this.addTrackedListener(openFeaturesBtn, 'click', openHandler);
    }

    if (closeFeaturesBtn && featuresDialog) {
      const closeHandler = () => {
        featuresDialog.close();

        // Return focus to the button that opened the dialog
        openFeaturesBtn?.focus();
      };
      this.addTrackedListener(closeFeaturesBtn, 'click', closeHandler);

      // Close on Escape key (native dialog already does this, but also return focus)
      const dialogCloseHandler = () => {
        openFeaturesBtn?.focus();
      };
      this.addTrackedListener(featuresDialog, 'close', dialogCloseHandler);
    }
  }
}
