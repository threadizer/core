import Threadizer from "@/index.js";

export default async ()=>{

	const thread = await new Threadizer(()=>{

		self.on("custom-event", ( event )=>{

			console.log(self, event.detail);

		});

	});

	const buffer = new ArrayBuffer(1000);

	thread.transfer("custom-event", buffer, [buffer]);

};
