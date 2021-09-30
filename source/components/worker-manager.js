export default function( self, tools, extension ){

	Object.assign(self, { thread: self }, tools);

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

					const event = events[index];

					if( (event.type === type || type === undefined) && (event.action === action || action === undefined) ){

						self.removeEventListener(type, action);

						events.splice(index, 1);

					}

				}

			},
			dispatch( type, data, id ){

				const event = new CustomEvent(type, { detail: data });

				event.complete = ( done = true )=>{

					self.postMessage({ type: "transfer-answer", data: { done, id } });

				};

				self.dispatchEvent(event);

			},
			transfer( type, data ){

				return new Promise(( resolve, reject )=>{

					const id = uuid();

					const transferable = new Array();

					traverse(data, ( value )=>{

						if( isTransferable(value) ){

							self.transferable.push(value);

						}

					});

					const hook = ({ detail: data })=>{

						if( data.id === id ){

							self.off("transfer-answer", hook);

							data.done ? resolve() : reject();

						}

					};

					self.on("transfer-answer", hook);

					self.postMessage({ type, data, id }, transferable);

				});

			},
			isTransferable( value ){

				try {

					return value instanceof window.ArrayBuffer || value instanceof window.MessagePort || value instanceof window.ImageBitmap || value instanceof window.OffscreenCanvas;

				}
				catch( error ){

					return false;

				}

			}
		});

		self.on("message", ( event )=>{

			const { type, data, id } = event.data;

			self.dispatch(type, data, id);

		});

		if( extension instanceof Function ){

			await extension(self);

		}

		self.transfer("worker-ready");

		resolve(self);

	});

};
