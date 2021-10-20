import Threadizer from "@/index.js";

export default async ( unmount )=>{

	const thread = await new Threadizer(()=>{

		self.on("setup", async ({ detail: baseURL, complete })=>{

			importScripts(baseURL + "index.js");

			await new self.Threadizer.default(()=>{

				console.log("subthread A ready");

			});

			await new self.Threadizer.default(()=>{

				console.log("subthread B ready");

			});

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
