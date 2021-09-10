export default function( self ){

	return new Promise(( resolve )=>{

		const events = new Array();

		Object.assign(self, {
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
			transfer( type, data ){

				self.postMessage({ type, data }, data ? [data] : undefined);

			}
		});

		self.on("message", ( event )=>{

			const { type, data } = event.data;

			self.dispatch(type, { detail: data });

		});

		self.transfer("worker-ready");

		resolve(self);

	});

}
