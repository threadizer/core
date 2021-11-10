console.log("Job 'draw' started - worker", !!self.isWorker);

let canvas = null;
let context = null;

thread.on("pipe", ({ detail, complete })=>{

	if( detail instanceof self.OffscreenCanvas || (self.HTMLCanvasElement !== undefined && detail instanceof self.HTMLCanvasElement) ){

		if( !canvas ){

			canvas = detail;
			context = canvas.getContext("2d");

		}

		const text = thread.isWorker ? "OffscreenCanvas painted within a worker" : "OffscreenCanvas painted within main thread";

		context.fillRect(0, 0, canvas.width, canvas.height);

		Object.assign(context, {
			fillStyle: "#FFF",
			font: "13px sans-serif",
			textAlign: "center",
			textBaseline: "middle"
		});

		context.fillText(text, canvas.width / 2, canvas.height / 2, canvas.width);

	}
	else if( detail instanceof ImageData ){

		context.putImageData(detail, 0, 0);

	}

	const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

	complete(imageData);

});
