/**
 * Base component providing shared functionality for font tester components
 * @extends HTMLElement
 */
export class FontTesterBase extends HTMLElement {
  static _translations = null;
  static _translationsLoaded = false;
  static _translationsPromise = null;

  constructor() {
    super();
    this._eventHandlers = new Map();
  }

  /**
   * Initialize translations (call this before creating font-tester elements)
   * Only needed when loading from external file
   * @returns {Promise<void>}
   */
  static async initTranslations() {
    if (!this._translationsPromise) {
      this._translationsPromise = this.loadTranslations();
    }
    await this._translationsPromise;
  }

  /**
   * Load translations from script#font-tester-i18n in document
   * Supports both inline JSON and external file via data-src attribute
   * @returns {Promise<Object>} Translations object
   */
  static async loadTranslations() {
    if (this._translationsLoaded) {
      return this._translations;
    }

    const scriptElement = document.getElementById('font-tester-i18n');
    if (!scriptElement) {
      console.warn('Translation script#font-tester-i18n not found');
      this._translations = null;
      this._translationsLoaded = true;
      return this._translations;
    }

    // Check if loading from external file
    const externalSrc = scriptElement.getAttribute('data-src');
    if (externalSrc) {
      try {
        const response = await fetch(externalSrc);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        this._translations = await response.json();
      } catch (err) {
        console.error('Failed to load font-tester translations from', externalSrc, err);
        this._translations = null;
      }
    } else {
      // Load from inline content
      try {
        this._translations = JSON.parse(scriptElement.textContent);
      } catch (err) {
        console.error('Failed to parse font-tester translations:', err);
        this._translations = null;
      }
    }

    this._translationsLoaded = true;
    return this._translations;
  }

  /**
   * Get current language from font-tester lang attribute or document
   * @returns {string} Language code (e.g., 'en', 'sv')
   */
  getLanguage() {
    // Try to find font-tester parent
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

    // Check font-tester lang attribute
    if (fontTester && fontTester.hasAttribute('lang')) {
      return fontTester.getAttribute('lang');
    }

    // Fall back to document lang or 'en'
    return document.documentElement.lang || 'en';
  }

  /**
   * Get translated string (synchronous)
   * @param {string} key - Translation key (dot notation supported)
   * @param {string} fallback - Fallback text if translation not found
   * @returns {string} Translated text
   */
  t(key, fallback = '') {
    // If translations are already loaded, use them
    const translations = FontTesterBase._translations;

    // If not loaded yet and no external file, try loading inline synchronously
    if (!FontTesterBase._translationsLoaded) {
      const scriptElement = document.getElementById('font-tester-i18n');
      if (scriptElement && !scriptElement.getAttribute('data-src')) {
        // Only load inline JSON synchronously
        try {
          FontTesterBase._translations = JSON.parse(scriptElement.textContent);
          FontTesterBase._translationsLoaded = true;
        } catch (err) {
          console.error('Failed to parse inline translations:', err);
        }
      }
    }

    if (!FontTesterBase._translations) return fallback;

    const lang = this.getLanguage();
    const langTranslations = FontTesterBase._translations[lang] || FontTesterBase._translations['en'] || {};

    // Support dot notation like 'buttons.edit'
    const keys = key.split('.');
    let value = langTranslations;
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return fallback;
      }
    }

    return typeof value === 'string' ? value : fallback;
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
  }
}
