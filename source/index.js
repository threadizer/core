import EventManager from "@/components/event-manager.js";
import WorkerManager from "@/components/worker-manager.js";
import Stream from "@/components/stream.js";
import traverse from "@/components/transverse/traverse.js";
import generateTransferables from "@/components/transverse/generate-transferables.js";
import generateStructure from "@/components/transverse/generate-structure.js";
import proxify from "@/components/transverse/proxify.js";
import uuid from "@/components/transverse/uuid.js";

export { Stream };

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
	get #isWorker(){

		return this.#worker instanceof Worker;

	}
	async compile( application, extension, insideMainThread = false ){

		this.#insideMainThread = !!insideMainThread;

		const tools = `{
			uuid: ${ uuid.toString() },
			traverse: ${ traverse.toString() },
			proxify: ${ proxify.toString() },
			generateTransferables: ${ generateTransferables.toString() },
			generateStructure: ${ generateStructure.toString() }
		}`;

		if( !insideMainThread ){

			if( application instanceof Function ){

				application = `(${ application.toString() })(self)`;

			}
			else if( typeof application === "string" ){

				application = await fetch(application).then(response => response.text());

			}

			this.#application = `(function(){

				(${ WorkerManager })(self, ${ tools }, ${ extension }).then(function(){

					/* application */
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

			if( this.#isWorker ){

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
	static async link( application ){

		const thread = await new Threadizer(application);

		const structure = await thread.transfer("link");

		// return proxify(structure.isClass ? class Link {} : {});
		return proxify(structure, {
			onGet: ( target )=>{

				// thread.transfer("link-get");

			},
			onSet: ( target, property, value )=>{

				console.log("MAIN SET", target, property, value);

				thread.transfer("link-set", { path: target.__path__, property, value });

			},
			onConstruct: ()=>{

			},
			onApply: ()=>{

			}
		});

	}
	static createStream( data ){

		return new Stream(data);

	}
}
