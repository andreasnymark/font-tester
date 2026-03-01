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
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: var(--feature-gap, 12px);
        }

        .feature-toggle {
          appearance: none;
          -webkit-appearance: none;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border: var(--feature-border-width, 1px) solid var(--feature-border, #e0e0e0);
          border-radius: var(--feature-border-radius, 4px);
          background: var(--feature-bg, white);
          color: var(--feature-text, #000);
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          font-family: inherit;
        }

        .feature-toggle:hover {
          background: var(--feature-bg-hover, #f5f5f5);
        }

        .feature-toggle:focus-visible {
          outline: 2px solid var(--feature-bg-active, #333);
          outline-offset: 2px;
        }

        .feature-toggle[aria-pressed="true"] {
          background: var(--feature-bg-active, #333);
          color: var(--feature-text-active, #fff);
          border-color: var(--feature-bg-active, #333);
        }

        .feature-toggle:disabled {
          opacity: 0.5;
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
          font-size: var(--feature-code-font-size, 11px);
          opacity: var(--feature-code-opacity, 0.6);
          font-family: monospace;
        }

        .feature-toggle[aria-pressed="true"] .feature-code {
          opacity: 0.8;
        }

        .feature-toggle .unsupported-badge {
          font-size: 10px;
          opacity: 0.5;
        }
      </style>

      <div class="features-grid" id="featuresGrid" part="features-grid" role="group" aria-label="OpenType features"></div>
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
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'feature-toggle';
      btn.setAttribute('part', 'feature-toggle');
      btn.setAttribute('aria-pressed', feature.default ? 'true' : 'false');
      btn.dataset.code = feature.code;
      if (feature.supported === false) btn.disabled = true;

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

      btn.appendChild(label);
      grid.appendChild(btn);
    });
  }

  attachListeners() {
    const grid = this.query('#featuresGrid');
    if (!grid) return;

    const clickHandler = (e) => {
      const btn = e.target.closest('.feature-toggle');
      if (!btn) return;

      const pressed = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', pressed ? 'false' : 'true');

      this.emitFeatureSettings();
    };

    this.addTrackedListener(grid, 'click', clickHandler);
  }

  /**
   * Emit current feature settings as CSS font-feature-settings string
   */
  emitFeatureSettings() {
    const buttons = this.queryAll('button[data-code]');
    const settings = Array.from(buttons)
      .map(btn => `"${btn.dataset.code}" ${btn.getAttribute('aria-pressed') === 'true' ? 1 : 0}`)
      .join(', ');

    this.emit('features-change', { settings });
  }
}
