console.log("Worker 'draw' started");

thread.on("canvas", async ({ detail: canvas, complete })=>{

	console.log(self);

	const text = thread.isWorker ? "OffscreenCanvas painted within a worker" : "OffscreenCanvas painted within main thread";

	const context = canvas.getContext("2d");

	context.fillRect(0, 0, canvas.width, canvas.height);

	Object.assign(context, {
		fillStyle: "#FFF",
		font: "13px sans-serif",
		textAlign: "center",
		textBaseline: "middle"
	});

	context.fillText(text, canvas.width / 2, canvas.height / 2, canvas.width);

	await thread.transfer("rendered");

	complete();

});
