import Threadizer from "@/index.js";

export default async ( unmount )=>{

	const thread = await new Threadizer(()=>{

		self.on("encode", ({ detail, complete })=>{

			setTimeout(()=>{

				complete(self.btoa(detail));

			}, Math.random() * 1000);

		});

	});

	const pool = await Threadizer.createPool(thread);

	let done = 0;

	for( let index = 0, length = 100; index < length; index++ ){

		pool.transfer("encode", `${ index } Hello World!`).then(( output )=>{

			done++;

			console.log(done, index, output);

			if( done === length ){

				console.log("all done");

			}

		});

	}

	// unmount();

	return {
		destroy: ()=>{

			unmount();

		}
	};

};
