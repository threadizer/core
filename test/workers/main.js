import Threadizer from "@/index.js";

thread.on("setup-canvas", async ({ detail: canvas, complete })=>{

	const stream = Threadizer.createStream(canvas);

	const drawThread = await new Threadizer(self.location.origin + "/draw.worker.js");
	const invertThread = await new Threadizer(self.location.origin + "/invert.worker.js");

	stream.pipe(drawThread).pipe(invertThread).pipe(drawThread);

	complete();

});
