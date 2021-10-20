import Threadizer from "@/index.js";

export default async ( code, unmount )=>{

	const thread = await new Threadizer(()=>{

		self.on("setup", ({ detail: { code, baseURL }, complete })=>{

			importScripts(baseURL + "index.js");

			/* eslint-disable */
			const Threadizer = self.Threadizer.default;

			eval(code);
			/* eslint-enable */

			complete();

		});

	});

	await thread.transfer("setup", { code, baseURL: window.location.href });

	thread.destroy();

	unmount();

	return {
		destroy: ()=>{

			thread.destroy();

		}
	};

};
