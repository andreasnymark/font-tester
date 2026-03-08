import { FontTesterBase } from '../base.js';

export class VarAxesControls extends FontTesterBase {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.axes = [];
	}

	connectedCallback() {
		this.collectAxes();
		this.render();
		this.attachListeners();
		this.emitInitialValues();
	}

	collectAxes() {
		let node = this.getRootNode();
		let fontTester = null;

		while ( node ) {
			if ( node.host ) {
				if ( node.host.tagName === 'FONT-TESTER' ) {
					fontTester = node.host;
					break;
				}
				node = node.host.getRootNode();
			} else {
				break;
			}
		}

		if ( ! fontTester ) return;

		fontTester.querySelectorAll( 'font-variation-axis' ).forEach( el => {
			const tag = el.getAttribute( 'tag' );
			if ( ! tag ) return;

			const min = parseFloat( el.getAttribute( 'min' ) ?? 0 );

			this.axes.push( {
				tag: tag.trim(),
				name: el.getAttribute( 'name' ) || tag.trim(),
				min,
				max: parseFloat( el.getAttribute( 'max' ) ?? 1000 ),
				default: parseFloat( el.getAttribute( 'default' ) ?? min ),
				step: parseFloat( el.getAttribute( 'step' ) ?? 1 )
			} );
		} );
	}

	buildVariationSettings() {
		const sliders = this.queryAll( 'input[data-tag]' );
		if ( sliders && sliders.length > 0 ) {
			return Array.from( sliders )
				.map( s => `'${s.dataset.tag}' ${s.value}` )
				.join( ', ' );
		}
		return this.axes.map( a => `'${a.tag}' ${a.default}` ).join( ', ' );
	}

	emitInitialValues() {
		if ( this.axes.length === 0 ) return;
		this.emit( 'style-change', {
			property: 'fontVariationSettings',
			value: this.buildVariationSettings()
		} );
	}

	render() {
		if ( this.axes.length === 0 ) {
			this.shadowRoot.innerHTML = '';
			return;
		}

		this.shadowRoot.innerHTML = `
			<style>
				:host {
					display: block;
				}

				.axes {
					display: flex;
					flex-wrap: wrap;
					gap: var(--axis-gap, 20px);
				}

				.axis-control {
					display: flex;
					align-items: center;
					gap: 10px;
					flex: 1 1 var(--axis-flex-basis, 180px);
				}

				label {
					font-size: 13px;
					font-weight: 500;
					color: var(--label-color, #333);
					min-width: 80px;
					white-space: nowrap;
				}

				input[type="range"] {
					flex: 1;
					height: 4px;
					border-radius: 2px;
					background: var(--slider-bg, #e0e0e0);
					outline: none;
					-webkit-appearance: none;
				}

				input[type="range"]:focus {
					outline: 2px solid var(--slider-thumb-bg, #333);
					outline-offset: 2px;
				}

				input[type="range"]::-webkit-slider-thumb {
					-webkit-appearance: none;
					width: 16px;
					height: 16px;
					border-radius: 50%;
					background: var(--slider-thumb-bg, #333);
					cursor: pointer;
				}

				input[type="range"]::-moz-range-thumb {
					width: 16px;
					height: 16px;
					border-radius: 50%;
					background: var(--slider-thumb-bg, #333);
					cursor: pointer;
					border: none;
				}

				.value-display {
					font-size: 13px;
					font-weight: 500;
					color: var(--value-color, #666);
					min-width: 40px;
					text-align: right;
				}
			</style>

			<div class="axes" part="axes">
				${this.axes.map( axis => `
					<div class="axis-control" part="axis-control ${axis.tag}-control">
						<label for="axis-${axis.tag}" part="label ${axis.tag}-label">${this.sanitizeHTML( axis.name )}</label>
						<input type="range"
						       part="slider ${axis.tag}-slider"
						       id="axis-${axis.tag}"
						       data-tag="${axis.tag}"
						       min="${axis.min}"
						       max="${axis.max}"
						       value="${axis.default}"
						       step="${axis.step}"
						       aria-label="${this.sanitizeHTML( axis.name )}"
						       aria-valuemin="${axis.min}"
						       aria-valuemax="${axis.max}"
						       aria-valuenow="${axis.default}"
						       role="slider">
						<span class="value-display"
						      part="value-display ${axis.tag}-value"
						      id="axis-${axis.tag}-value"
						      aria-live="polite">${axis.default}</span>
					</div>
				` ).join( '' )}
			</div>
		`;
	}

	attachListeners() {
		this.axes.forEach( axis => {
			const slider = this.query( `#axis-${axis.tag}` );
			const display = this.query( `#axis-${axis.tag}-value` );
			if ( ! slider || ! display ) return;

			const handler = ( e ) => {
				const value = e.target.value;
				display.textContent = value;
				slider.setAttribute( 'aria-valuenow', value );
				this.emit( 'style-change', {
					property: 'fontVariationSettings',
					value: this.buildVariationSettings()
				} );
			};

			this.addTrackedListener( slider, 'input', handler );
		} );
	}
}
