import EventManager from "@/components/event-manager.js";
import WorkerManager from "@/components/worker-manager.js";
import Stream from "@/components/stream.js";
import Pool from "@/components/pool.js";
import generateTransferables from "@/tools/generate-transferables.js";
import uuid from "@/tools/uuid.js";

export { Stream, Pool };

const LIBRARIES = new Array();

export default class Threadizer extends EventManager {
	#id = null;
	#application = { source: null, extensions: [null], compiled: null };
	#insideMainThread = false;
	#worker = null;
	constructor( application, extension = null, insideMainThread = false ){

		super();

		this.#id = `__threadizer_${ uuid() }`;

		this.#insideMainThread = !!insideMainThread;

		this.#application.extensions.push(...LIBRARIES);

		return new Promise(async ( resolve )=>{

			if( application ){

				await this.compile(application, extension);
				await this.run();

			}

			resolve(this);

		});

	}
	get #isWorker(){

		return this.#worker instanceof Worker;

	}
	async compile( application, extension = null ){

		this.#application.source = application;

		this.#application.extensions[0] = extension;

		const tools = `{
			uuid: ${ uuid.toString() },
			generateTransferables: ${ generateTransferables.toString() }
		}`;

		const extensions = `[${ this.#application.extensions.filter(ext => ext).map(ext => ext?.toString()).join(",") }]`;

		if( !this.#insideMainThread ){

			if( this.#application.source instanceof Function ){

				this.#application.compiled = `/* application */(${ this.#application.source.toString() })(self)`;

			}
			else if( typeof this.#application.source === "string" ){

				this.#application.compiled = await fetch(this.#application.source).then(response => response.text());

			}

			this.#application.compiled = `(function(){

				(${ WorkerManager })(self, ${ tools }, ${ extensions }).then(function(){

					/* application */
					${ this.#application.compiled }

				});

			})()`;

		}
		else {

			if( this.#application.source instanceof Function ){

				this.#application.compiled = `(${ this.#application.source.toString() })(thread)`;

			}
			else if( typeof this.#application.source === "string" ){

				this.#application.compiled = await fetch(this.#application.source).then(response => response.text());

			}

			this.#application.compiled = `window["${ this.#id }"] = function( thread ){

				var extensions = ${ extensions };

				for( let extension of extensions ){

					extension(thread);

				}

				/* application */
				${ this.#application.compiled }

				thread.worker = window["${ this.#id }"];

			};`;

		}

		return this;

	}
	async run(){

		if( !this.#insideMainThread ){

			this.#worker = await new Promise(( resolve )=>{

				const blob = new Blob([this.#application.compiled], { type: "text/javascript" });

				const url = URL.createObjectURL(blob);

				const worker = new Worker(url);

				this.on("worker-ready", ()=>{

					URL.revokeObjectURL(url);

					resolve(worker);

				}, { once: true });

				worker.addEventListener("message", ( event )=>{

					const { type, data, id } = event.data;

					this.dispatch(type, data, ( done = true )=>{

						this.#worker.postMessage({ type: `transfer-answer-${ id }`, data: { done, id } });

					});

				});

			});

		}
		else {

			eval(this.#application.compiled);

			window[this.#id](this);

			delete window[this.#id];

		}

		return this;

	}
	transfer( type, data ){

		return new Promise(( resolve, reject )=>{

			const id = uuid();

			const hook = ({ detail: data })=>{

				this.off(`transfer-answer-${ id }`, hook);

				data !== false ? resolve(data) : reject();

			};

			this.on(`transfer-answer-${ id }`, hook);

			if( this.#isWorker ){

				const transferable = generateTransferables(data);

				this.#worker.postMessage({ type, data, id }, transferable);

			}
			else {

				this.dispatch(type, data, ( data )=>{

					this.dispatch(`transfer-answer-${ id }`, data);

				});

			}

		});

	}
	async clone(){

		return await new Threadizer(this.#application.source, this.#application.extension, this.#insideMainThread);

	}
	async close( maxTimeout = 3000 ){

		const closing = this.transfer("close");

		const timeout = new Promise(resolve => setTimeout(resolve, maxTimeout));

		await Promise.race(closing, timeout);

		this.destroy();
	
	}
	destroy(){

		this.#worker?.terminate();

		this.off();

		return this;

	}
	static async addLibrary( library ){

		if( library instanceof Function ){

			library = library.toString();

		}
		else {

			library = await fetch(library).then(response => response.text());

		}

		LIBRARIES.push(library);

		return Threadizer;

	}
	static createStream( data ){

		return new Stream(data);

	}
	static createPool( thread, count ){

		return new Pool(thread, count);

	}
}
