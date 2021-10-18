console.log("Worker 'draw' started");

let canvas = null;
let context = null;

thread.on("pipe", ({ detail, complete })=>{

	if( !canvas && detail instanceof OffscreenCanvas ){

		canvas = detail;
		context = canvas.getContext("2d");

	}

	if( detail instanceof OffscreenCanvas ){

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
