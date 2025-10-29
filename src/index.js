// Import base class
export { FontTesterBase } from './base.js';

// Import all components
export { FontDisplay } from './components/FontDisplay.js';
export { SampleTextSelector } from './components/SampleTextSelector.js';
export { TextControls } from './components/TextControls.js';
export { StyleControls } from './components/StyleControls.js';
export { FontStyleSelector } from './components/FontStyleSelector.js';
export { OpentypeFeatures } from './components/OpentypeFeatures.js';

// Import marker elements
export { SampleText, OpentypeFeature, FontStyle } from './markers/index.js';

// Import main component
export { FontTester } from './FontTester.js';

// Register all custom elements
import { FontDisplay } from './components/FontDisplay.js';
import { SampleTextSelector } from './components/SampleTextSelector.js';
import { TextControls } from './components/TextControls.js';
import { StyleControls } from './components/StyleControls.js';
import { FontStyleSelector } from './components/FontStyleSelector.js';
import { OpentypeFeatures } from './components/OpentypeFeatures.js';
import { SampleText, OpentypeFeature, FontStyle } from './markers/index.js';
import { FontTester } from './FontTester.js';

// Register components
customElements.define('font-display', FontDisplay);
customElements.define('sample-text-selector', SampleTextSelector);
customElements.define('text-controls', TextControls);
customElements.define('style-controls', StyleControls);
customElements.define('font-style-selector', FontStyleSelector);
customElements.define('opentype-features', OpentypeFeatures);
customElements.define('font-tester', FontTester);

// Register marker elements
customElements.define('sample-text', SampleText);
customElements.define('opentype-feature', OpentypeFeature);
customElements.define('font-style', FontStyle);
