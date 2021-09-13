import EventManager from "@/components/event-manager.js";
import WorkerManager from "@/components/worker-manager.js";

export default class Threadizer extends EventManager {
	constructor( application ){

		super();

		return new Promise(async ( resolve )=>{

			if( application ){

				application = await Threadizer.generateApplicationString(application);

				await this.setApplication(application);

			}

			resolve(this);

		});

	}
	async setApplication( application ){

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

		return this;

	}
	static async generateApplicationString( application ){

		if( application instanceof Function ){

			return `(${ application.toString() })()`;

		}
		else if( typeof application === "string" ){

			return await fetch(application).then(response => response.text());

		}

	}
}
