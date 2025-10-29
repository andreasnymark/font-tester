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
      features: new Map(),
      editing: false
    };
    this._lastControls = null;
  }

  static get observedAttributes() {
    return ['font-family', 'controls', 'editable', 'default-font-size', 'default-line-height', 'default-letter-spacing'];
  }

  connectedCallback() {
    this._lastControls = this.getAttribute('controls');
    this.render();
    this.attachListeners();
    this.applyInitialEditable();

    // Defer defaults until next frame to ensure child components are fully initialized
    requestAnimationFrame(() => {
      this.applyInitialDefaults();
    });
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
    const fontSize = this.getAttribute('default-font-size');
    if (fontSize) {
      display.applyStyle('fontSize', fontSize);
      this.setState({ fontSize });
    }

    // Apply line height default
    const lineHeight = this.getAttribute('default-line-height');
    if (lineHeight) {
      display.applyStyle('lineHeight', lineHeight);
      this.setState({ lineHeight });
    }

    // Apply letter spacing default
    const letterSpacing = this.getAttribute('default-letter-spacing');
    if (letterSpacing) {
      display.applyStyle('letterSpacing', letterSpacing);
      this.setState({ letterSpacing });
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

        .features-btn {
          padding: 8px 16px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          background: white;
          color: #000;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
        }

        .features-btn:hover {
          background: #f5f5f5;
        }

        .features-btn:focus {
          outline: 2px solid #333;
          outline-offset: 2px;
        }

        dialog {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 0;
          max-width: 600px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          margin: 0;
        }

        dialog::backdrop {
          background: rgba(0, 0, 0, 0.3);
          z-index: 999;
        }

        .dialog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e0e0e0;
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
          color: #666;
          border-radius: 4px;
        }

        .close-btn:hover {
          background: #f5f5f5;
          color: #000;
        }

        .dialog-content {
          padding: 20px;
        }
      </style>

      <div class="container">
        ${enabled.textControls ? `
          <div class="section">
            <text-controls>
              <sample-text-selector></sample-text-selector>
              ${enabled.fontStyle ? '<font-style-selector></font-style-selector>' : ''}
              ${enabled.opentype ? '<button id="openFeaturesBtn" type="button" class="features-btn">OpenType Features</button>' : ''}
            </text-controls>
          </div>
        ` : enabled.fontStyle ? `
          <div class="section">
            <font-style-selector></font-style-selector>
            ${enabled.opentype ? '<button id="openFeaturesBtn" type="button" class="features-btn">OpenType Features</button>' : ''}
          </div>
        ` : enabled.opentype ? `
          <div class="section">
            <button id="openFeaturesBtn" type="button" class="features-btn">OpenType Features</button>
          </div>
        ` : ''}

        <div class="section">
          <font-display font-family="${fontFamily}"></font-display>
        </div>

        ${enabled.styleControls.length > 0 ? `
          <div class="section">
            <style-controls
              show="${enabled.styleControls.join(', ')}"
              ${this.hasAttribute('default-font-size') ? `default-font-size="${this.sanitizeHTML(this.getAttribute('default-font-size'))}"` : ''}
              ${this.hasAttribute('default-line-height') ? `default-line-height="${this.sanitizeHTML(this.getAttribute('default-line-height'))}"` : ''}
              ${this.hasAttribute('default-letter-spacing') ? `default-letter-spacing="${this.sanitizeHTML(this.getAttribute('default-letter-spacing'))}"` : ''}
            ></style-controls>
          </div>
        ` : ''}

        ${enabled.opentype ? `
          <dialog id="featuresDialog">
            <div class="dialog-header">
              <h3>OpenType Features</h3>
              <button id="closeFeaturesBtn" type="button" class="close-btn">✕</button>
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
    const editToggleHandler = (e) => {
      display.setEditable(e.detail.editing);
      this.setState({ editing: e.detail.editing });
    };
    this.addTrackedListener(this.shadowRoot, 'edit-toggle', editToggleHandler);

    const textTransformToggleHandler = (e) => {
      const transformValue = e.detail.uppercase ? 'uppercase' : 'none';
      display.applyStyle('textTransform', transformValue);
      this.setState({ textTransform: transformValue });
    };
    this.addTrackedListener(this.shadowRoot, 'text-transform-toggle', textTransformToggleHandler);

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
      };
      this.addTrackedListener(openFeaturesBtn, 'click', openHandler);
    }

    if (closeFeaturesBtn && featuresDialog) {
      const closeHandler = () => {
        featuresDialog.close();
      };
      this.addTrackedListener(closeFeaturesBtn, 'click', closeHandler);
    }
  }
}
