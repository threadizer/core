import EventManager from "@/components/event-manager.js";
import WorkerManager from "@/components/worker-manager.js";
import Stream from "@/components/stream.js";
import generateTransferables from "@/components/generate-transferables.js";
import uuid from "@/components/uuid.js";

export { Stream };

export default class Threadizer extends EventManager {
	#id = null;
	#application = { source: null, extension: null, compiled: null };
	#insideMainThread = false;
	#worker = null;
	constructor( application, extension, insideMainThread = false ){

		super();

		this.#id = `__threadizer_${ uuid() }`;

		this.#insideMainThread = !!insideMainThread;

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
	async compile( application, extension ){

		this.#application.source = application;
		this.#application.extension = extension;

		const tools = `{
			uuid: ${ uuid.toString() },
			generateTransferables: ${ generateTransferables.toString() }
		}`;

		if( !this.#insideMainThread ){

			if( this.#application.source instanceof Function ){

				this.#application.compiled = `/* application */(${ this.#application.source.toString() })(self)`;

			}
			else if( typeof this.#application.source === "string" ){

				this.#application.compiled = await fetch(this.#application.source).then(response => response.text());

			}

			this.#application.compiled = `(function(){

				(${ WorkerManager })(self, ${ tools }, ${ extension }).then(function(){

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

				var extension = ${ extension };

				if( extension instanceof Function ){

					extension(thread);

				}

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
	static createStream( data ){

		return new Stream(data);

	}
}
