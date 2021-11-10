import Threadizer from "@/index.js";

console.log("Job main started - worker: ", !!self.isWorker);

thread.on("setup-canvas", async ({ detail: canvas, complete })=>{

	const stream = Threadizer.createStream(canvas);

	const drawThread = await new Threadizer(self.location.origin + "/draw.worker.js", null, !thread.isWorker);
	const invertThread = await new Threadizer(self.location.origin + "/invert.worker.js", null, !thread.isWorker);

	await stream.pipe(drawThread).pipe(invertThread).pipe(drawThread);

	complete();

});
