import Threadizer from "@/index.js";

export default async ( unmount )=>{

	const thread = await new Threadizer(()=>{

		self.on("setup", ({ detail: baseURL })=>{

			importScripts(baseURL + "/vendors/three.min.js");

			console.log(THREE);

			self.transfer("complete");

		});

	});

	thread.transfer("setup", window.location.href);

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
