export default function( self, tools, extensions ){

	const isWorker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;

	Object.assign(self, { tools: tools });

	return new Promise(async ( resolve )=>{

		const events = new Array();

		if( isWorker ){

			Object.assign(self, {
				get isWorker(){

					return isWorker;

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

					event.complete = ( data = null )=>{

						const transferable = tools.generateTransferables(data);

						self.postMessage({ type: `transfer-answer-${ id }`, data }, transferable);

					};

					self.dispatchEvent(event);

				},
				transfer( type, data ){

					return new Promise(( resolve, reject )=>{

						const id = tools.uuid();

						const transferable = tools.generateTransferables(data);

						const hook = ({ detail: data })=>{

							this.off(`transfer-answer-${ id }`, hook);

							data !== false ? resolve(data) : reject();

						};

						this.on(`transfer-answer-${ id }`, hook);

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

		}

		for( let extension of extensions ){

			await extension(self);

		}

		if( self.isWorker ){

			self.on("message", ( event )=>{

				const { type, data, id } = event.data;

				self.dispatch(type, data, id);

			});

		}

		self.transfer("worker-ready");

		resolve(self);

	});

};
