export default function( self, extension ){

	self.thread = self;

	return new Promise(async ( resolve )=>{

		const events = new Array();

		Object.assign(self, {
			get isWorker(){

				return typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;

			},
			on( type, action ){

				if( !events.find(event => event.type === type && event.action === action) ){

					events.push({ type, action });

					self.addEventListener(type, action);

				}

			},
			off( type, action ){

				for( let index = events.length - 1; index >= 0; index-- ){

					const event = this.events[index];

					if( (event.type === type || type === undefined) && (event.action === action || action === undefined) ){

						self.removeEvent(type, action);

						events.splice(index, 1);

					}

				}

			},
			dispatch( type, options ){

				self.dispatchEvent(new CustomEvent(type, options));

			},
			transfer( type, data, transferable ){

				self.postMessage({ type, data }, transferable);

			}
		});

		self.on("message", ( event )=>{

			const { type, data } = event.data;

			self.dispatch(type, { detail: data });

		});

		const extending = extension?.(self);

		if( extending instanceof Promise ){

			await extending;

		}

		self.transfer("worker-ready");

		resolve(self);

	});

}
