import EventManager from "@/components/event-manager.js";
import WorkerManager from "@/components/worker-manager.js";

export default class Threadize extends EventManager {
	#originalApplication
	constructor( application ){

		super();

		return new Promise(async ( resolve )=>{

			if( application instanceof Function ){

				this.#originalApplication = `(${ application.toString() })()`;

			}
			else if( typeof application === "string" ){

				this.#originalApplication = await fetch(application).then(response => response.text());

			}

			this.worker = await this.#generateWorker(this.#originalApplication);

			resolve(this);

		});

	}
	transfer( type, data, transferable ){

		this.worker.postMessage({ type, data }, transferable);

	}
	reset(){

		this.destroy();

		this.#generateWorker(this.#originalApplication);

	}
	destroy(){

		this.worker?.terminate();

	}
	#generateWorker( application ){

		return new Promise(( resolve )=>{

			const compiledApplication = `(function(){

				(${ WorkerManager })(self).then(function(){

					${ application }

				});

			})()`;

			const blob = new Blob([compiledApplication], { type: "text/javascript" });

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
