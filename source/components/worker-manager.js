export default function WorkerManager( self, tools, extension ){

	Object.assign(self, { thread: self }, tools);

	return new Promise(async ( resolve )=>{

		const events = new Array();
		const linked = {
			registered: false,
			source: null,
			isClass: false,
			// instance: null,
			callable: null,
			answer: null
		};

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

				event.complete = ( data = null )=>{

					const transferable = generateTransferables(data);

					self.postMessage({ type: `transfer-answer-${ id }`, data }, transferable);

				};

				self.dispatchEvent(event);

			},
			transfer( type, data ){

				return new Promise(( resolve, reject )=>{

					const id = uuid();

					const transferable = generateTransferables(data);

					const hook = ({ detail: data })=>{

						this.off(`transfer-answer-${ id }`, hook);

						data !== false ? resolve(data) : reject();

					};

					this.on(`transfer-answer-${ id }`, hook);

					self.postMessage({ type, data, id }, transferable);

				});

			},
			link( source ){

				if( !linked.registered ){

					const structure = proxify(generateStructure(source), {
						onGet( value ){

							console.log("WORKER get", value);

						}
					});

					Object.assign(linked, {
						registered: true,
						isClass: !!source.prototype?.constructor,
						source,
						structure
					});

					linked.answer?.(linked.structure);

					return structure;

				}
				else {

					throw new Error("Cannot register a link more than once per worker.");

				}

			}
		});

		self.on("message", ( event )=>{

			const { type, data, id } = event.data;

			self.dispatch(type, data, id);

		});

		self.on("link", ({ complete })=>{

			console.log("link request");

			if( linked.registered ){

				complete(linked.structure);

			}
			else {

				linked.answer = complete;

			}

		}, { once: true });

		self.on("link-get", ({ detail, complete })=>{

			console.log("LINK GET", detail);

		});

		self.on("link-set", ({ detail: { path, property, value }, complete })=>{

			// const { path, property, value } = detail;

			let target = linked.source;

			for( let key of path ){

				target = target[key];

			}

			target[property] = value;

			complete(linked.structure);

			console.log("LINK SET", "ONTO", target);

		});

		if( extension instanceof Function ){

			await extension(self);

		}

		self.transfer("worker-ready");

		resolve(self);

	});

};
