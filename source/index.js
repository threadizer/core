import EventManager from "@/components/event-manager.js";
import WorkerManager from "@/components/worker-manager.js";

export default class Threadize extends EventManager {
	#originalApplication
	constructor( application ){

		super();

		return new Promise(async ( resolve )=>{

			this.#originalApplication = application;

			this.worker = await this.#generateWorker(application);

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

				(${ WorkerManager })(self).then(${ application });

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
