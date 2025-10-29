import { FontTesterBase } from '../base.js';

/**
 * Component for text editing and transformation controls
 * @extends FontTesterBase
 */
export class TextControls extends FontTesterBase {
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
        <button id="uppercaseBtn" aria-pressed="false">Uppercase</button>
        <slot></slot>
      </div>
    `;
  }

  attachListeners() {
    const editBtn = this.query('#editBtn');
    const uppercaseBtn = this.query('#uppercaseBtn');

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
      const handler = (e) => {
        const btn = e.target;
        const isActive = btn.classList.toggle('active');
        btn.setAttribute('aria-pressed', isActive);
        this.emit('text-transform-toggle', { uppercase: isActive });
      };
      this.addTrackedListener(uppercaseBtn, 'click', handler);
    }
  }
}
