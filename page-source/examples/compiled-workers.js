import Threadizer from "@/index.js";

export default async ( unmount )=>{

	const thread = await new Threadizer(()=>{

		self.on("setup", ({ detail: baseURL, complete })=>{

			importScripts(baseURL + "three.min.js");

			console.log(THREE);

			complete();

		});

	});

	await thread.transfer("setup", window.location.href);

	thread.destroy();

	unmount();

	return {
		destroy: ()=>{

			thread.destroy();

		}
	};

};
