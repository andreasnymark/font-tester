/**
 * Base component providing shared functionality for font tester components
 * @extends HTMLElement
 */
export class FontTesterBase extends HTMLElement {
  constructor() {
    super();
    this._eventHandlers = new Map();
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
   * Debounce function calls
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} - Debounced function
   */
  debounce(func, wait) {
    if (!this._debounceTimeouts) {
      this._debounceTimeouts = new Set();
    }

    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      if (this._debounceTimeouts) {
        this._debounceTimeouts.delete(timeout);
      }
      timeout = setTimeout(() => {
        func.apply(this, args);
        if (this._debounceTimeouts) {
          this._debounceTimeouts.delete(timeout);
        }
      }, wait);
      this._debounceTimeouts.add(timeout);
    };
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

    // Clear all debounce timeouts
    if (this._debounceTimeouts) {
      this._debounceTimeouts.forEach(timeout => clearTimeout(timeout));
      this._debounceTimeouts.clear();
    }
  }
}
