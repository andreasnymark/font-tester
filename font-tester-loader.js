/**
 * font-tester integration for font-loader.
 * @author Andreas Nymark <andreas@nymark.co>
 * @license MIT
 * @link https://github.com/andreasnymark/font-tester
 */

import { loadFont, config as loaderConfig } from 'font-loader';

const config = Object.assign( {
	fontTesterSelector: 'font-tester',
	fontDisplaySelector: 'font-display',
	fontFamilyProperty: '--display-font-family',
	requiresAllWeightsAttr: 'requiresAllWeights',
	fontFamilyAttr: 'font-family',
	styleChangeEvent: 'style-change',
	selectSelector: 'select',
}, window.FontTesterLoaderConfig || {} );

const loadedFontTesters = new WeakSet();

function loadAllFontsForTester( fontTester ) {
	if ( loadedFontTesters.has( fontTester ) ) {
		return Promise.resolve();
	}

	const fontStyles = fontTester.querySelectorAll( 'font-style' );
	const families = Array.from( fontStyles )
		.map( el => el.getAttribute( 'family' ) )
		.filter( Boolean );

	loadedFontTesters.add( fontTester );
	return Promise.all( families.map( loadFont ) ).then( () => {
		fontTester.classList.add( loaderConfig.fontsLoadedClass );
	});
}

const initializedLazyTesters = new WeakSet();
const fontTesterCurrentFont = new WeakMap();

const fontTesterObserver = new IntersectionObserver(
	( entries ) => {
		entries.forEach( entry => {
			if ( entry.isIntersecting ) {
				if ( ! initializedLazyTesters.has( entry.target ) ) {
					initializedLazyTesters.add( entry.target );

					const fontFamily = entry.target.getAttribute( config.fontFamilyAttr );

					if ( fontFamily ) {
						loadFont( fontFamily ).then( () => {
							const fontDisplay = entry.target.shadowRoot?.querySelector( config.fontDisplaySelector );
							if ( fontDisplay ) {
								fontDisplay.style.setProperty( config.fontFamilyProperty, fontFamily );
								fontTesterCurrentFont.set( entry.target, fontFamily );
								delete fontDisplay._fitWidthDone;
								requestAnimationFrame( () => fontDisplay.recalcFitWidth?.() );
							}
						});
					}
				}
			}
		});
	},
	{
		rootMargin: loaderConfig.rootMargin,
		threshold: loaderConfig.threshold
	}
);

function handleWeightsInteraction( e ) {
	if ( ! e.target?.closest ) return;
	if ( e.target.closest( config.selectSelector ) ) return;

	const fontTester = e.target.closest( config.fontTesterSelector );
	if ( fontTester?.dataset[ config.requiresAllWeightsAttr ] === 'true' ) {
		loadAllFontsForTester( fontTester );
	}
}

document.addEventListener( 'click', handleWeightsInteraction, true );
document.addEventListener( 'focus', handleWeightsInteraction, true );

document.addEventListener( config.styleChangeEvent, ( e ) => {
	if ( e.detail.property !== 'fontFamily' ) return;

	const fontTester = e.target?.closest?.( config.fontTesterSelector );
	if ( ! fontTester ) return;
	if ( fontTester.dataset[ config.requiresAllWeightsAttr ] === 'true' ) return;

	if ( ! initializedLazyTesters.has( fontTester ) ) {
		return;
	}

	const currentFont = fontTesterCurrentFont.get( fontTester );
	if ( currentFont === e.detail.value ) {
		return;
	}

	loadFont( e.detail.value ).then( () => {
		const fontDisplay = fontTester.shadowRoot?.querySelector( config.fontDisplaySelector );
		if ( fontDisplay && e.detail.value ) {
			fontDisplay.style.setProperty( config.fontFamilyProperty, e.detail.value );
			fontTesterCurrentFont.set( fontTester, e.detail.value );
			requestAnimationFrame( () => fontDisplay.recalcFitWidth?.() );
		}
	});
}, true );

function init() {
	document.querySelectorAll( config.fontTesterSelector ).forEach( tester => {
		if ( tester.dataset.fontFamily ) {
			fontTesterObserver.observe( tester );
		}
	});
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
