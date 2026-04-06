import { FontTesterBase } from '../base.js';

/**
 * Component for OpenType feature toggles.
 * Renders a trigger button that opens a popover with pill-style switch toggles.
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

    const hasDefaults = this.features.some(f => f.default);
    if (!hasDefaults) return;

    const settings = this.features
      .map(f => `"${f.code}" ${f.default ? 1 : 0}`)
      .join(', ');

    this.emit('features-change', { settings });
  }

  /**
   * Collect feature definitions from parent font-tester
   */
  collectFeatures() {
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
      }
    }
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
    if (this.features.length === 0) {
      this.shadowRoot.innerHTML = '';
      return;
    }

    const triggerLabel = this.sanitizeHTML(this.t('fontTester.openFeaturesButton', 'OpenType Features'));
    const triggerAriaLabel = this.sanitizeHTML(this.t('fontTester.openFeaturesAriaLabel', 'Open OpenType features'));
    const groupAriaLabel = this.sanitizeHTML(this.t('fontTester.featuresGroupLabel', 'OpenType features'));

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          position: relative;
        }

        /* ── Trigger button ── */

        #featuresBtn {
          padding: var(--feature-trigger-padding, 8px 16px);
          border: 1px solid var(--feature-trigger-border-color, #e0e0e0);
          border-radius: var(--feature-trigger-border-radius, 4px);
          background: var(--feature-trigger-bg, white);
          color: var(--feature-trigger-color, #000);
          cursor: pointer;
          font-size: var(--feature-trigger-font-size, 13px);
          font-family: inherit;
          transition: background 0.2s;
        }

        #featuresBtn:hover {
          background: var(--feature-trigger-bg-hover, #f5f5f5);
        }

        #featuresBtn:focus-visible {
          outline: 2px solid var(--feature-trigger-border-color, #e0e0e0);
          outline-offset: 2px;
        }

        /* ── Panel ── */

        .features-panel {
          display: none;
          position: absolute;
          top: calc(100% - 1px);
          right: 0;
          z-index: 100;
          padding: var(--popover-padding, 12px);
          border: 1px solid var(--popover-border-color, #e0e0e0);
          border-radius: var(--popover-border-radius, 8px);
          background: var(--popover-bg, white);
          box-shadow: var(--popover-shadow, 0 4px 12px rgba(0, 0, 0, 0.15));
          max-height: var(--popover-max-height, 400px);
          overflow-y: auto;
          min-width: var(--popover-min-width, 180px);
          max-width: var(--popover-max-width, 280px);
        }

        .features-panel.is-open {
          display: block;
        }

        /* ── Feature list ── */

        .features-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: var(--feature-gap, 2px);
        }

        /* ── Switch row ── */

        .feature-switch {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          width: 100%;
          padding: var(--feature-switch-padding, 6px 8px);
          border: none;
          border-radius: var(--feature-switch-border-radius, 4px);
          background: none;
          color: var(--feature-text, #000);
          cursor: pointer;
          font-size: var(--feature-font-size, 13px);
          font-family: inherit;
          text-align: left;
          transition: background 0.15s;
        }

        .feature-switch:hover {
          background: var(--feature-switch-bg-hover, #f5f5f5);
        }

        .feature-switch:focus-visible {
          outline: 2px solid var(--feature-trigger-border-color, #e0e0e0);
          outline-offset: 2px;
        }

        .feature-switch:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        /* ── Pill track ── */

        .switch {
          position: relative;
          width: var(--switch-track-width, 32px);
          height: var(--switch-track-height, 18px);
          border-radius: 999px;
          background: var(--switch-track-bg, #ccc);
          flex-shrink: 0;
          transition: background 0.2s;
          order: var(--switch-order, 0);
        }

        .switch-knob {
          position: absolute;
          top: 2px;
          left: 2px;
          width: calc(var(--switch-track-height, 18px) - 4px);
          height: calc(var(--switch-track-height, 18px) - 4px);
          border-radius: 50%;
          background: var(--switch-knob-bg, white);
          transition: transform 0.2s;
        }

        .feature-switch[aria-checked="true"] .switch {
          background: var(--switch-track-bg-on, var(--feature-bg-active, #333));
        }

        .feature-switch[aria-checked="true"] .switch-knob {
          transform: translateX(calc(var(--switch-track-width, 32px) - var(--switch-track-height, 18px)));
        }
      </style>

      <button id="featuresBtn" type="button" part="button features-button"
        aria-expanded="false" aria-controls="featuresPanel"
        aria-label="${triggerAriaLabel}">${triggerLabel}</button>

      <div id="featuresPanel" class="features-panel" part="features-panel">
        <ul class="features-list" part="features-list"
          role="group" aria-label="${groupAriaLabel}"></ul>
      </div>
    `;

    this.renderFeatures();
  }

  renderFeatures() {
    const list = this.query('.features-list');
    if (!list) return;

    this.features.forEach(feature => {
      const li = document.createElement('li');
      li.setAttribute('part', 'feature-item');

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'feature-switch';
      btn.setAttribute('part', 'feature-switch');
      btn.setAttribute('role', 'switch');
      btn.setAttribute('aria-checked', feature.default ? 'true' : 'false');
      btn.dataset.code = feature.code;
      if (feature.supported === false) btn.disabled = true;

      const nameSpan = document.createElement('span');
      nameSpan.textContent = feature.name;

      const track = document.createElement('span');
      track.className = 'switch';
      track.setAttribute('aria-hidden', 'true');

      const knob = document.createElement('span');
      knob.className = 'switch-knob';
      track.appendChild(knob);

      btn.appendChild(nameSpan);
      btn.appendChild(track);
      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  attachListeners() {
    const btn = this.query('#featuresBtn');
    const panel = this.query('.features-panel');

    this.addTrackedListener(btn, 'click', () => {
      const open = panel.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open);
    });

    this.addTrackedListener(document, 'click', (e) => {
      if (panel.classList.contains('is-open') && !e.composedPath().includes(this)) {
        panel.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    this.addTrackedListener(document, 'keydown', (e) => {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) {
        panel.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });

    const list = this.query('.features-list');
    if (!list) return;

    this.addTrackedListener(list, 'click', (e) => {
      const btn = e.target.closest('.feature-switch');
      if (!btn || btn.disabled) return;

      const checked = btn.getAttribute('aria-checked') === 'true';
      btn.setAttribute('aria-checked', checked ? 'false' : 'true');
      this.emitFeatureSettings();
    });
  }

  /**
   * Emit current feature settings as CSS font-feature-settings string
   */
  emitFeatureSettings() {
    const switches = this.queryAll('button[data-code]');
    const settings = Array.from(switches)
      .map(btn => `"${btn.dataset.code}" ${btn.getAttribute('aria-checked') === 'true' ? 1 : 0}`)
      .join(', ');

    this.emit('features-change', { settings });
  }
}
