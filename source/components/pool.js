export default class Pool {
	#threads = new Array();
	#pending = new Array();
	constructor( thread, count = Infinity ){

		if( !isFinite(count) ){

			count = navigator.hardwareConcurrency || 8;

		}

		return new Promise(async ( resolve )=>{

			for( let index = 0; index < count; index++ ){

				const clone = await thread.clone();

				this.#threads.push({ thread: clone, busy: false });

			}

			resolve(this);

		});

	}
	async transfer( type, data ){

		const available = this.#threads.find(({ busy }) => !busy);

		if( available ){

			available.busy = true;

			await available.thread.transfer(type, data);

			available.busy = false;

			if( this.#pending.length ){

				const { type, data } = this.#pending.shift();

				this.transfer(type, data);

			}

		}
		else {

			this.#pending.push({ type, data });

		}

	}
	clone(){

		return new Pool(this.#threads[0].thread, this.#threads.length);

	}
};
