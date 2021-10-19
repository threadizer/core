export default class Stream {
	#data = null;
	#pipes = new Array();
	#running = false;
	constructor( data ){

		this.#data = data;

		return this;

	}
	pipe( destination ){

		const promise = new Promise(async ( resolve )=>{

			this.#createPipe(destination);

			await this.#run();

			resolve(this.#data);

		});

		promise.pipe = ( destination )=>{

			this.#createPipe(destination);

			return promise;

		};

		return promise;

	}
	#createPipe( destination ){

		this.#pipes.push(destination);

	}
	async #run(){

		if( !this.#running && this.#pipes.length ){

			this.#running = true;

			const destination = this.#pipes.shift();

			this.#data = await destination.transfer("pipe", this.#data);

			this.#running = false;

			await this.#run();

		}

	}
}
