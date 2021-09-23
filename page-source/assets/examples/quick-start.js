import Threadizer from "@/index.js";

export default async ( unmount )=>{

	const thread = await new Threadizer(()=>{

		thread.on("custom-event", ( event )=>{

			console.log(thread, event.detail);

			thread.transfer("complete");

		});

	});

	const buffer = new ArrayBuffer(1000);

	thread.on("complete", ()=>{

		thread.destroy();

		unmount();

	});

	thread.transfer("custom-event", buffer, [buffer]);

	return {
		destroy: ()=>{

			thread.destroy();

		}
	};

};
