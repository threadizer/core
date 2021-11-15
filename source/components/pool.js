export default class Pool {
	#threads = new Array();
	#pending = new Array();
	constructor( thread, count = Infinity ){

		if( !isFinite(count) ){

			count = navigator.hardwareConcurrency || 8;

		}

		this.#threads.push({ thread, busy: false });

		return new Promise(async ( resolve )=>{

			for( let index = 1; index < count; index++ ){

				const clone = await thread.clone();

				this.#threads.push({ thread: clone, busy: false });

			}

			resolve(this);

		});

	}
	transfer( type, data ){

		return new Promise(( resolve )=>{

			this.#next(type, data, resolve);

		});

	}
	async #next( type, data, callback ){

		const available = this.#threads.find(({ busy }) => !busy);

		if( available ){

			available.busy = true;

			const output = await available.thread.transfer(type, data);

			available.busy = false;

			callback(output);

			if( this.#pending.length ){

				const { type, data, callback } = this.#pending.shift();

				this.#next(type, data, callback);

			}

		}
		else {

			this.#pending.push({ type, data, callback });

		}

	}
	clone(){

		return new Pool(this.#threads[0].thread, this.#threads.length);

	}
	destroy(){

		for( let { thread } of this.#threads ){

			thread.destroy();

		}

		this.#threads.length = 0;
		this.#pending.length = 0;

		return this;

	}
};
