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
        }

        .controls {
          display: flex;
          gap: var(--control-gap, 10px);
          flex-wrap: wrap;
        }

        button {
          padding: 8px 16px;
          border: var(--control-border-width, 1px) solid var(--control-border, #e0e0e0);
          border-radius: var(--control-border-radius, 4px);
          background: var(--control-bg, white);
          color: var(--control-text, #000);
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
        }

        button:hover:not(:disabled):not(.active) {
          background: var(--control-bg-hover, #f5f5f5);
        }

        button:focus-visible {
          outline: 2px solid var(--control-bg-active, #333);
          outline-offset: 2px;
        }

        button.active {
          background: var(--control-bg-active, #333);
          color: var(--control-text-active, #fff);
          border-color: var(--control-bg-active, #333);
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .radio-group {
          display: inline-flex;
          gap: 0;
        }

        .radio-group button {
          border-radius: 0;
        }

        .radio-group button:first-child {
          border-top-left-radius: var(--control-border-radius, 4px);
          border-bottom-left-radius: var(--control-border-radius, 4px);
        }

        .radio-group button:last-child {
          border-top-right-radius: var(--control-border-radius, 4px);
          border-bottom-right-radius: var(--control-border-radius, 4px);
        }

        .radio-group button:not(:last-child) {
          border-right: none;
        }
      </style>

      <div class="controls" part="toolbar" role="toolbar" aria-label="${this.t('textControls.toolbarLabel', 'Text controls')}">
        <button id="uppercaseBtn" part="button uppercase-button" aria-pressed="false" aria-label="${this.t('textControls.uppercaseAriaLabel', 'Toggle uppercase text')}">${this.t('textControls.uppercaseButton', 'Uppercase')}</button>

        <div role="radiogroup" aria-label="${this.t('textControls.directionGroupLabel', 'Text direction')}" class="radio-group" part="radio-group direction-group">
          <button id="ltrBtn" part="button radio-button ltr-button" role="radio" class="active" aria-checked="true" aria-label="${this.t('textControls.ltrAriaLabel', 'Left to right')}">${this.t('textControls.ltrButton', 'LTR')}</button>
          <button id="rtlBtn" part="button radio-button rtl-button" role="radio" aria-checked="false" aria-label="${this.t('textControls.rtlAriaLabel', 'Right to left')}">${this.t('textControls.rtlButton', 'RTL')}</button>
        </div>

        <div role="radiogroup" aria-label="${this.t('textControls.alignmentGroupLabel', 'Text alignment')}" class="radio-group" part="radio-group alignment-group">
          <button id="alignLeftBtn" part="button radio-button align-left-button" role="radio" class="active" aria-checked="true" aria-label="${this.t('textControls.alignLeftAriaLabel', 'Align text left')}">${this.t('textControls.alignLeftButton', 'Left')}</button>
          <button id="alignCenterBtn" part="button radio-button align-center-button" role="radio" aria-checked="false" aria-label="${this.t('textControls.alignCenterAriaLabel', 'Align text center')}">${this.t('textControls.alignCenterButton', 'Center')}</button>
          <button id="alignRightBtn" part="button radio-button align-right-button" role="radio" aria-checked="false" aria-label="${this.t('textControls.alignRightAriaLabel', 'Align text right')}">${this.t('textControls.alignRightButton', 'Right')}</button>
        </div>

      </div>
    `;
  }

  attachListeners() {
    const uppercaseBtn = this.query('#uppercaseBtn');
    const ltrBtn = this.query('#ltrBtn');
    const rtlBtn = this.query('#rtlBtn');
    const alignLeftBtn = this.query('#alignLeftBtn');
    const alignCenterBtn = this.query('#alignCenterBtn');
    const alignRightBtn = this.query('#alignRightBtn');

    if (uppercaseBtn) {
      const handler = (e) => {
        const btn = e.target;
        const isActive = btn.classList.toggle('active');
        btn.setAttribute('aria-pressed', isActive);
        this.emit('text-transform-toggle', { uppercase: isActive });
      };
      this.addTrackedListener(uppercaseBtn, 'click', handler);
    }

    if (ltrBtn && rtlBtn) {
      const ltrHandler = () => {
        ltrBtn.classList.add('active');
        rtlBtn.classList.remove('active');
        ltrBtn.setAttribute('aria-checked', 'true');
        rtlBtn.setAttribute('aria-checked', 'false');
        this.emit('direction-change', { direction: 'ltr' });
      };

      const rtlHandler = () => {
        rtlBtn.classList.add('active');
        ltrBtn.classList.remove('active');
        rtlBtn.setAttribute('aria-checked', 'true');
        ltrBtn.setAttribute('aria-checked', 'false');
        this.emit('direction-change', { direction: 'rtl' });
      };

      this.addTrackedListener(ltrBtn, 'click', ltrHandler);
      this.addTrackedListener(rtlBtn, 'click', rtlHandler);
    }

    if (alignLeftBtn && alignCenterBtn && alignRightBtn) {
      const alignLeftHandler = () => {
        alignLeftBtn.classList.add('active');
        alignCenterBtn.classList.remove('active');
        alignRightBtn.classList.remove('active');
        alignLeftBtn.setAttribute('aria-checked', 'true');
        alignCenterBtn.setAttribute('aria-checked', 'false');
        alignRightBtn.setAttribute('aria-checked', 'false');
        this.emit('align-change', { align: 'left' });
      };

      const alignCenterHandler = () => {
        alignCenterBtn.classList.add('active');
        alignLeftBtn.classList.remove('active');
        alignRightBtn.classList.remove('active');
        alignCenterBtn.setAttribute('aria-checked', 'true');
        alignLeftBtn.setAttribute('aria-checked', 'false');
        alignRightBtn.setAttribute('aria-checked', 'false');
        this.emit('align-change', { align: 'center' });
      };

      const alignRightHandler = () => {
        alignRightBtn.classList.add('active');
        alignLeftBtn.classList.remove('active');
        alignCenterBtn.classList.remove('active');
        alignRightBtn.setAttribute('aria-checked', 'true');
        alignLeftBtn.setAttribute('aria-checked', 'false');
        alignCenterBtn.setAttribute('aria-checked', 'false');
        this.emit('align-change', { align: 'right' });
      };

      this.addTrackedListener(alignLeftBtn, 'click', alignLeftHandler);
      this.addTrackedListener(alignCenterBtn, 'click', alignCenterHandler);
      this.addTrackedListener(alignRightBtn, 'click', alignRightHandler);
    }
  }
}
