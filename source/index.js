import EventManager from "@/components/event-manager.js";
import WorkerManager from "@/components/worker-manager.js";

export default class Threadizer extends EventManager {
	#application = null;
	constructor( application, extension ){

		super();

		return new Promise(async ( resolve )=>{

			if( application ){

				await this.compile(application, extension);
				await this.run();

			}

			resolve(this);

		});

	}
	async compile( application, extension ){

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

		return this.#application;

	}
	async run( application = this.#application ){

		this.worker = await this.#generateWorker(application);

		return this;

	}
	transfer( type, data, transferable ){

		this.worker.postMessage({ type, data }, transferable);

		return this;

	}
	destroy(){

		this.worker?.terminate();

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

		return this;

	}
}
