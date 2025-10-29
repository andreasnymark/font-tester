import { FontTesterBase } from '../base.js';

/**
 * Component for OpenType feature toggles
 * @extends FontTesterBase
 */
export class OpentypeFeatures extends FontTesterBase {
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
    this.emitInitialFeatureSettings();
  }

  /**
   * Emit initial feature settings on mount
   */
  emitInitialFeatureSettings() {
    if (this.features.length === 0) return;

    // Check if any features have defaults
    const hasDefaults = this.features.some(f => f.default);
    if (!hasDefaults) return;

    // Emit settings for all features (including defaults)
    const settings = this.features
      .map(f => `"${f.code}" ${f.default ? 1 : 0}`)
      .join(', ');

    this.emit('features-change', { settings });
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

      <div class="features-grid" id="featuresGrid" role="group" aria-label="OpenType features"></div>
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
