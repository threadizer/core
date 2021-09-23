import Threadizer from "@/index.js";

export default async ( unmount )=>{

	const thread = await new Threadizer(()=>{

		importScripts(location.origin + "/vendors/three.min.js");

		console.log(THREE);

		thread.transfer("complete");

	});

	thread.on("complete", ()=>{

		thread.destroy();

		unmount();

	});

	return {
		destroy: ()=>{

			thread.destroy();

		}
	};

};
