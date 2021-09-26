import EventManager from "@/components/event-manager.js";
import WorkerManager from "@/components/worker-manager.js";
import traverse from "@/components/traverse.js";
import uuid from "@/components/uuid.js";

export default class Threadizer extends EventManager {
	#id = null;
	#application = null;
	#insideMainThread = false;
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

		return this.worker instanceof Worker;

	}
	async compile( application, extension, insideMainThread = false ){

		this.#insideMainThread = !!insideMainThread;

		const tools = `{
			uuid: ${ uuid.toString() },
			traverse: ${ traverse.toString() }
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

			this.worker = await new Promise(( resolve )=>{

				const blob = new Blob([this.#application], { type: "text/javascript" });

				const url = URL.createObjectURL(blob);

				const worker = new Worker(url);

				this.on("worker-ready", () => resolve(worker), { once: true });

				worker.addEventListener("message", ( event )=>{

					const { type, data, id } = event.data;

					this.dispatch(type, data, ( done = true )=>{

						this.worker.postMessage({ type: "transfer-answer", data: { done, id } });

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

				if( data.id === id ){

					this.off("transfer-answer", hook);

					data.done ? resolve() : reject();

				}

			};

			this.on("transfer-answer", hook);

			if( this.isWorker ){

				const transferable = new Array();

				traverse(data, ( value )=>{

					if( value instanceof window.ArrayBuffer || value instanceof window.MessagePort || value instanceof window.ImageBitmap || value instanceof window.OffscreenCanvas ){

						transferable.push(value);

					}

				});

				this.worker.postMessage({ type, data, id }, transferable);

			}
			else {

				this.dispatch(type, data, ( done = true )=>{

					this.dispatch("transfer-answer", { done, id });

				});

			}

		});

	}
	destroy(){

		this.worker?.terminate();

		this.off();

		return this;

	}
}
