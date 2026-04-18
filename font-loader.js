/**
 * Lazy load fonts using the FontFace API and IntersectionObserver.
 * @author Andreas Nymark <andreas@nymark.co>
 * @license MIT
 * @version 1.2.0
 * @link https://github.com/andreasnymark/font-loader
 */

export const config = Object.assign( {
	eagerSelector: '[data-font-load="eager"]',
	lazySelector: '[data-font-load="lazy"]',
	metadataSelector: '#font-metadata',
	fontsLoadedClass: 'fonts-loaded',
	fontLoadedClass: 'font-loaded',
	rootMargin: '300px',
	threshold: 0,
	applyFont: false,
}, window.FontLoaderConfig || {} );

const metadataElement = document.querySelector( config.metadataSelector );
if ( ! metadataElement ) {
	console.warn( 'font-metadata element not found, font loading disabled' );
}

let fontMetadata = {};
if ( metadataElement ) {
	try {
		fontMetadata = JSON.parse( metadataElement.textContent );
	} catch ( err ) {
		console.error( 'Failed to parse font metadata:', err );
	}
}

const fontLoadPromises = new Map();

export function loadFont( fontFamily ) {
	if ( fontLoadPromises.has( fontFamily ) ) {
		return fontLoadPromises.get( fontFamily );
	}

	const fontData = fontMetadata[ fontFamily ];
	if ( ! fontData ) {
		console.warn( 'Font not found:', fontFamily );
		return Promise.resolve();
	}

	const promise = new FontFace(
		fontData.family,
		`url(${fontData.url})`,
		{
			weight: fontData.weight || 'normal',
			style: fontData.style || 'normal',
			stretch: fontData.stretch || 'normal',
		}
	)
	.load()
	.then( loadedFace => {
		document.fonts.add( loadedFace );
	})
	.catch( err => {
		console.error( 'Failed to load font:', fontData.name, err );
	});

	fontLoadPromises.set( fontFamily, promise );
	return promise;
}

const previewObserver = new IntersectionObserver(
	( entries ) => {
		entries.forEach( entry => {
			if ( entry.isIntersecting ) {
				const preview = entry.target;
				const fontFamily = preview.dataset.fontFamily;

				if ( fontFamily ) {
					loadFont( fontFamily ).then( () => {
						preview.classList.add( config.fontLoadedClass );
						if ( config.applyFont ) preview.style.fontFamily = `'${fontFamily}'`;
					});
				}

				previewObserver.unobserve( preview );
			}
		} );
	},{
		rootMargin: config.rootMargin,
		threshold: config.threshold
	}
);

function init() {
	document.querySelectorAll( config.eagerSelector ).forEach( preview => {
		const fontFamily = preview.dataset.fontFamily;
		if ( fontFamily ) {
			loadFont( fontFamily ).then( () => {
				preview.classList.add( config.fontsLoadedClass );
				if ( config.applyFont ) preview.style.fontFamily = `'${fontFamily}'`;
			});
		}
	});

	document.querySelectorAll( config.lazySelector ).forEach( preview => {
		previewObserver.observe( preview );
	});
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
