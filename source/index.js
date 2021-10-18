import EventManager from "@/components/event-manager.js";
import WorkerManager from "@/components/worker-manager.js";
import Stream from "@/components/stream.js";
import generateTransferables from "@/components/generate-transferables.js";
import uuid from "@/components/uuid.js";

export default class Threadizer extends EventManager {
	#id = null;
	#application = null;
	#insideMainThread = false;
	#worker = null;
	constructor( application, extension, insideMainThread ){

		super();

		this.#id = `__threadizer_${ uuid() }`;

		return new Promise(async ( resolve )=>{

			if( application ){

				await this.compile(application, extension, insideMainThread);
				await this.run();

			}

			resolve(this);

		});

	}
	get isWorker(){

		return this.#worker instanceof Worker;

	}
	async compile( application, extension, insideMainThread = false ){

		this.#insideMainThread = !!insideMainThread;

		const tools = `{
			uuid: ${ uuid.toString() },
			generateTransferables: ${ generateTransferables.toString() }
		}`;

		if( !insideMainThread ){

			if( application instanceof Function ){

				application = `/* application */(${ application.toString() })(self)`;

			}
			else if( typeof application === "string" ){

				application = await fetch(application).then(response => response.text());

			}

			this.#application = `(function(){

				(${ WorkerManager })(self, ${ tools }, ${ extension }).then(function(){

					${ application }

				});

			})()`;

		}
		else {

			if( application instanceof Function ){

				application = `(${ application.toString() })(thread)`;

			}
			else if( typeof application === "string" ){

				application = await fetch(application).then(response => response.text());

			}

			this.#application = `window["${ this.#id }"] = function( thread ){

				var extension = ${ extension };

				if( extension instanceof Function ){

					extension(thread);

				}

				${ application }

				thread.worker = window["${ this.#id }"];

			};`;

		}

		return this.#application;

	}
	async run(){

		if( !this.#insideMainThread ){

			this.#worker = await new Promise(( resolve )=>{

				const blob = new Blob([this.#application], { type: "text/javascript" });

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

			eval(this.#application);

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

			if( this.isWorker ){

				const transferable = generateTransferables(data);

				this.#worker.postMessage({ type, data, id }, transferable);

			}
			else {

				this.dispatch(type, data, ( done = true )=>{

					this.dispatch(`transfer-answer-${ id }`, { done, id });

				});

			}

		});

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
