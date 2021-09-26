export default class EventManager {
	#scope = null;
	#events = new Array();
	constructor( scope ){

		this.scope = scope;

		return this;

	}
	set scope( scope ){

		this.#scope = scope || this;

		this.off();

	}
	on( type, action, options = false ){

		if( type && action ){

			const event = {
				type: type,
				action: ( event )=>{

					action.call(this.#scope, event);

					if( options?.once ){

						this.off(type, action, options);

					}

				},
				originalAction: action,
				options: options
			};

			this.#events.push(event);

		}

		return this;

	}
	off( type, action, options ){

		for( let index = this.#events.length - 1; index >= 0; index-- ){

			let event = this.#events[index];

			// eslint-disable-next-line
			if( (type === event.type || type === undefined) && (action === event.originalAction || action === undefined) && (options == event.options || options === undefined) ){

				if( this.#scope.removeEventListener instanceof Function ){

					this.#scope.removeEventListener(event.type, event.action, event.options);

				}

				this.#events.splice(index, 1);

			}

		}

		return this;

	}
	dispatch( type, data, callback ){

		const customEvent = new CustomEvent(type, { detail: data });

		customEvent.complete = callback;

		for( let event of this.#events ){

			if( event.type === type ){

				event.action(customEvent);

			}

		}

		return this;

	}
}
