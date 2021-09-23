import EventManager from "@/components/event-manager.js";
import WorkerManager from "@/components/worker-manager.js";

export default class Threadizer extends EventManager {
	#id = null;
	#application = null;
	#insideMainThread = false;
	constructor( application, extension, insideMainThread ){

		super();

		this.#id = `__threadizer_${ Math.random().toString(36).substring(2, 15) }`;

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

		if( !insideMainThread ){

			if( application instanceof Function ){

				application = `(${ application.toString() })()`;

			}
			else if( typeof application === "string" ){

				application = await fetch(application).then(response => response.text());

			}

			this.#application = `(function(){

				(${ WorkerManager })(self, ${ extension }).then(function(){

					${ application }

				});

			})()`;

		}
		else {

			if( application instanceof Function ){

				application = `(${ application.toString() })()`;

			}
			else if( typeof application === "string" ){

				application = await fetch(application).then(response => response.text());

			}

			this.#application = `window.${ this.#id } = function( thread ){

				(${ extension })?.(thread);

				${ application }

				thread.worker = window.${ this.#id };

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

					const { type, data } = event.data;

					this.dispatch(type, { detail: data });

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
	transfer( type, data, transferable ){

		if( this.worker instanceof Worker ){

			this.worker.postMessage({ type, data }, transferable);

		}
		else {

			this.dispatch(type, { detail: data });

		}

		return this;

	}
	destroy(){

		this.worker?.terminate();

		this.off();

		return this;

	}
	#generateWorker( application ){

		return new Promise(( resolve )=>{

			const blob = new Blob([application], { type: "text/javascript" });

			const url = URL.createObjectURL(blob);

			const worker = new Worker(url);

			this.on("worker-ready", () => resolve(worker), { once: true });

			worker.addEventListener("message", ( event )=>{

				const { type, data } = event.data;

				this.dispatch(type, { detail: data });

			});

		});

	}
}
