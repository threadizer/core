import Threadizer from "@/index.js";

export default async ( unmount )=>{

	const thread = await new Threadizer(()=>{

		self.on("custom-event", ( event )=>{

			console.log(self, event.detail);

			event.complete();

		});

	});

	const buffer = new ArrayBuffer(1000);

	await thread.transfer("custom-event", buffer, [buffer]);

	thread.destroy();

	unmount();

	return {
		destroy: ()=>{

			thread.destroy();

		}
	};

};
