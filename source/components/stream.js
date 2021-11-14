export default class Stream {
	#data = null;
	#pipes = new Array();
	#auto = true;
	#running = false;
	constructor( data, auto = true ){

		this.#data = data;

		this.#auto = auto;

		return this;

	}
	pipe( destination ){

		const promise = new Promise(async ( resolve )=>{

			this.#createPipe(destination);

			if( this.#auto ){

				await this.run();

			}

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
	async run(){

		if( !this.#running && this.#pipes.length ){

			this.#running = true;

			const destination = this.#pipes.shift();

			this.#data = await destination.transfer("pipe", this.#data);

			this.#running = false;

			await this.run();

			return this.#data;

		}

	}
	async clone(){

		const clone = new Stream(this.#data, false);

		for( let pipe of this.#pipes ){

			const pipeClone = await pipe.clone();

			clone.pipe(pipeClone);

		}

		return clone;

	}
}
