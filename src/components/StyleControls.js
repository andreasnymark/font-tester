import { FontTesterBase } from '../base.js';

/**
 * Component for font style adjustment controls
 * @extends FontTesterBase
 */
export class StyleControls extends FontTesterBase {
  /**
   * Default control configurations
   * @static
   */
  static DEFAULT_CONTROLS = {
    'font-size': {
      id: 'fontSize',
      labelKey: 'styleControls.fontSizeLabel',
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
      labelKey: 'styleControls.lineHeightLabel',
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
      labelKey: 'styleControls.letterSpacingLabel',
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
    this.applyCustomDefaults();
    this.render();
    this.attachListeners();
    this.emitInitialValues();
  }

  /**
   * Apply custom default values from attributes
   */
  applyCustomDefaults() {
    // Font size
    const fontSize = this.getAttribute('font-size');
    if (fontSize && this.availableControls['font-size']) {
      const numericValue = parseFloat(fontSize);
      if (!isNaN(numericValue)) {
        this.availableControls['font-size'].value = numericValue;
      }
    }

    // Line height
    const lineHeight = this.getAttribute('line-height');
    if (lineHeight && this.availableControls['line-height']) {
      const numericValue = parseFloat(lineHeight);
      if (!isNaN(numericValue)) {
        this.availableControls['line-height'].value = numericValue;
      }
    }

    // Letter spacing
    const letterSpacing = this.getAttribute('letter-spacing');
    if (letterSpacing && this.availableControls['letter-spacing']) {
      const numericValue = parseFloat(letterSpacing);
      if (!isNaN(numericValue)) {
        this.availableControls['letter-spacing'].value = numericValue;
      }
    }
  }

  /**
   * Emit initial values on mount (only for controls without custom defaults)
   * FontTester will handle applying custom defaults
   */
  emitInitialValues() {
    const visibleControls = this.getVisibleControls();

    visibleControls.forEach(([key, control]) => {
      // Skip emitting if a custom default was provided for this control
      const hasCustomDefault =
        (key === 'font-size' && this.hasAttribute('font-size')) ||
        (key === 'line-height' && this.hasAttribute('line-height')) ||
        (key === 'letter-spacing' && this.hasAttribute('letter-spacing'));

      if (!hasCustomDefault) {
        this.emit('style-change', {
          property: control.property,
          value: control.value + control.unit
        });
      }
    });
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
        }

        .controls {
          display: grid;
          gap: var(--control-gap, 20px);
        }

        .control-row {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        label {
          font-size: 13px;
          font-weight: 500;
          color: var(--label-color, #333);
          min-width: 120px;
        }

        input[type="range"] {
          flex: 1;
          height: 4px;
          border-radius: 2px;
          background: var(--slider-bg, #e0e0e0);
          outline: none;
          -webkit-appearance: none;
        }

        input[type="range"]:focus {
          outline: 2px solid var(--slider-thumb-bg, #333);
          outline-offset: 2px;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--slider-thumb-bg, #333);
          cursor: pointer;
        }

        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--slider-thumb-bg, #333);
          cursor: pointer;
          border: none;
        }

        .value-display {
          font-size: 13px;
          font-weight: 500;
          color: var(--value-color, #666);
          min-width: 60px;
          text-align: right;
        }
      </style>

      <div class="controls" part="controls">
        ${visibleControls.map(([key, control]) => {
          const label = this.t(control.labelKey, control.label);
          return `
          <div class="control-row" data-control="${key}" part="control-row ${key}-row">
            <label for="${control.id}" part="label ${key}-label">${this.sanitizeHTML(label)}</label>
            <input type="range"
                   part="slider ${key}-slider"
                   id="${control.id}"
                   min="${control.min}"
                   max="${control.max}"
                   value="${control.value}"
                   step="${control.step}"
                   aria-label="${this.sanitizeHTML(label)}"
                   aria-valuemin="${control.min}"
                   aria-valuemax="${control.max}"
                   aria-valuenow="${control.value}"
                   role="slider">
            <span class="value-display"
                  part="value-display ${key}-value"
                  id="${control.id}Value"
                  aria-live="polite">${control.value}${control.unit}</span>
          </div>
        `;
        }).join('')}
      </div>
    `;
  }

  /**
   * Sync the font-size slider to an externally calculated value (e.g. from fit-width).
   * @param {number} value - Font size in px (numeric, no unit)
   */
  syncFontSize(value) {
    const slider = this.query('#fontSize');
    const display = this.query('#fontSizeValue');
    if (!slider || !display) return;
    const clamped = Math.min(Math.max(value, this.availableControls['font-size'].min), this.availableControls['font-size'].max);
    slider.value = clamped;
    slider.setAttribute('aria-valuenow', clamped);
    display.textContent = Math.round(clamped) + 'px';
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
