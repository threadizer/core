import Threadizer from "@/index.js";

export default async ( unmount )=>{

	const thread = await new Threadizer(()=>{

		console.log("begin performance-worker");
		console.time("performance-worker");

		const array = new Array();

		for( let index = 0; index < 1e4; index++ ){

			array[index] = Math.random();

			array.sort();

		}

		self.transfer("complete");

		console.timeEnd("performance-worker");

	});

	thread.on("complete", ()=>{

		unmount();

		thread.destroy();

	});

	return {
		element: null,
		destroy: () => thread.destroy()
	};

};
