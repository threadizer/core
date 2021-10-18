export default class Stream {
	#data = null;
	#pipes = new Array();
	#running = false;
	constructor( data ){

		this.#data = data;

		return this;

	}
	pipe( destination ){

		this.#pipes.push(destination);

		this.#run();

		return this;

	}
	async #run(){

		if( !this.#running && this.#pipes.length ){

			this.#running = true;

			const thread = this.#pipes.shift();

			this.#data = await thread.transfer("pipe", this.#data);

			this.#running = false;

			this.#run();

		}

		return this;

	}
}
